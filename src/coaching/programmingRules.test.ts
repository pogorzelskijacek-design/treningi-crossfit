import { describe, expect, it } from 'vitest';
import type { MovementPattern } from '@/domain';
import { generateWorkout } from './programmingRules';
import { EXERCISE_LIBRARY, getExerciseById, resolveWorkingWeight } from '@/data';
import { makeCheckin, makeProfile, makeCompletedLog } from './testFixtures';

const SKILL_ONLY_IDS = new Set(EXERCISE_LIBRARY.filter((e) => e.skillOnly).map((e) => e.id));

const LOWER_BODY_PATTERNS: MovementPattern[] = ['squat', 'hinge', 'lunge'];

describe('generateWorkout', () => {
  it('is deterministic for identical inputs', () => {
    const checkin = makeCheckin('tuesday');
    const profile = makeProfile();
    const a = generateWorkout('tuesday', checkin, [], [], profile, EXERCISE_LIBRARY, { idFactory: () => 'fixed-id' });
    const b = generateWorkout('tuesday', checkin, [], [], profile, EXERCISE_LIBRARY, { idFactory: () => 'fixed-id' });
    expect(a).toEqual(b);
  });

  it('keeps skill-only movements (Handstand Walk, Bar Muscle-Up, Snatch) out of every section except Skill', () => {
    const profile = makeProfile();
    for (const day of ['tuesday', 'thursday'] as const) {
      const workout = generateWorkout(day, makeCheckin(day), [], [], profile, EXERCISE_LIBRARY);
      const { skill, ...rest } = workout.sections;
      for (const section of Object.values(rest)) {
        for (const item of section.items) {
          expect(SKILL_ONLY_IDS.has(item.exerciseId)).toBe(false);
        }
      }
    }
  });

  it('sets the Tuesday focus to lower body + Olympic lifting and picks a lift progression', () => {
    const workout = generateWorkout('tuesday', makeCheckin('tuesday'), [], [], makeProfile(), EXERCISE_LIBRARY);
    expect(workout.focus).toMatch(/Lower Body/i);
    expect(workout.olympicLiftProgression).toBeDefined();
  });

  it('sets the Thursday focus to upper body + gymnastics with no Olympic lift progression', () => {
    const workout = generateWorkout('thursday', makeCheckin('thursday'), [], [], makeProfile(), EXERCISE_LIBRARY);
    expect(workout.focus).toMatch(/Upper Body/i);
    expect(workout.olympicLiftProgression).toBeUndefined();
  });

  it('lands close to the ~60 minute target', () => {
    const workout = generateWorkout('tuesday', makeCheckin('tuesday'), [], [], makeProfile(), EXERCISE_LIBRARY);
    expect(workout.estimatedDurationMinutes).toBeGreaterThanOrEqual(45);
    expect(workout.estimatedDurationMinutes).toBeLessThanOrEqual(75);
  });

  it('explains itself with a non-empty rationale', () => {
    const workout = generateWorkout('tuesday', makeCheckin('tuesday'), [], [], makeProfile(), EXERCISE_LIBRARY);
    expect(workout.rationale.length).toBeGreaterThan(0);
  });

  it("keeps Thursday's Strength block off lower-body (squat/hinge/lunge) patterns", () => {
    const workout = generateWorkout('thursday', makeCheckin('thursday'), [], [], makeProfile(), EXERCISE_LIBRARY);
    for (const item of workout.sections.strength.items) {
      const exercise = getExerciseById(item.exerciseId);
      expect(exercise?.movementPattern.some((p) => LOWER_BODY_PATTERNS.includes(p))).toBe(false);
    }
  });

  it('does not fill a WOD with repeated identical movement patterns', () => {
    const workout = generateWorkout('tuesday', makeCheckin('tuesday'), [], [], makeProfile(), EXERCISE_LIBRARY);
    const primaryPatterns = workout.sections.wod.items.map(
      (item) => getExerciseById(item.exerciseId)?.movementPattern[0]
    );
    const distinct = new Set(primaryPatterns);
    expect(distinct.size).toBeGreaterThan(1);
  });

  it('reduces the Olympic lift skill volume when fatigue is high', () => {
    const fresh = generateWorkout(
      'tuesday',
      makeCheckin('tuesday', { energy: 7, recovery: 7, soreness: 3 }),
      [],
      [],
      makeProfile(),
      EXERCISE_LIBRARY
    );
    const fatigued = generateWorkout(
      'tuesday',
      makeCheckin('tuesday', { energy: 2, recovery: 2, soreness: 9 }),
      [],
      [],
      makeProfile(),
      EXERCISE_LIBRARY
    );
    expect(fatigued.sections.skill.items[0].sets ?? 0).toBeLessThan(fresh.sections.skill.items[0].sets ?? 0);
  });

  it('caps heavy lower-body loading in the Tuesday WOD after a completed Hyrox class', () => {
    const workout = generateWorkout(
      'tuesday',
      makeCheckin('tuesday', { previousWorkoutCompleted: true }),
      [],
      [],
      makeProfile(),
      EXERCISE_LIBRARY
    );
    // Post-Hyrox rule restricts the WOD to conditioning-friendly categories — no barbell.
    for (const item of workout.sections.wod.items) {
      const exercise = getExerciseById(item.exerciseId);
      expect(exercise?.category).not.toBe('barbell');
    }
    expect(workout.appliedRules.some((r) => r.startsWith('post-hyrox'))).toBe(true);
  });

  it('rotates the Olympic lift progression across consecutive Tuesdays', () => {
    const first = generateWorkout('tuesday', makeCheckin('tuesday'), [], [], makeProfile(), EXERCISE_LIBRARY);
    const historyAfterFirst = [
      makeCompletedLog('tuesday', '2026-07-07', { olympicLiftProgression: first.olympicLiftProgression }),
    ];
    const second = generateWorkout('tuesday', makeCheckin('tuesday'), historyAfterFirst, [], makeProfile(), EXERCISE_LIBRARY);
    expect(second.olympicLiftProgression).not.toBe(first.olympicLiftProgression);
  });

  it('prescribes a concrete weight for the Strength lift, from the profile working weight', () => {
    const workout = generateWorkout('tuesday', makeCheckin('tuesday'), [], [], makeProfile(), EXERCISE_LIBRARY);
    const strength = workout.sections.strength.items[0];
    const base = resolveWorkingWeight(strength.exerciseId, makeProfile());
    expect(base).toBeGreaterThan(0);
    // At neutral readiness the prescription equals the working weight.
    expect(strength.prescribedWeightKg).toBe(base);
  });

  it('prescribes lighter loads when readiness is poor', () => {
    const strengthId = generateWorkout('tuesday', makeCheckin('tuesday'), [], [], makeProfile(), EXERCISE_LIBRARY)
      .sections.strength.items[0];
    const tired = generateWorkout(
      'tuesday',
      makeCheckin('tuesday', { energy: 2, recovery: 2, sleepHours: 4, soreness: 8 }),
      [],
      [],
      makeProfile(),
      EXERCISE_LIBRARY
    ).sections.strength.items.find((i) => i.exerciseId === strengthId.exerciseId);
    expect(tired?.prescribedWeightKg).toBeLessThan(strengthId.prescribedWeightKg!);
  });

});
