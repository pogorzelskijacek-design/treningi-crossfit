import { describe, expect, it } from 'vitest';
import type { MovementPattern } from '@/domain';
import { generateWorkout } from './programmingRules';
import { EXERCISE_LIBRARY, getExerciseById, resolveWorkingWeight } from '@/data';
import { LOWER_OLYMPIC, UPPER_GYM, makeCheckin, makeProfile, makeCompletedLog } from './testFixtures';

const SKILL_ONLY_IDS = new Set(EXERCISE_LIBRARY.filter((e) => e.skillOnly).map((e) => e.id));
const LOWER_BODY_PATTERNS: MovementPattern[] = ['squat', 'hinge', 'lunge'];

describe('generateWorkout', () => {
  it('is deterministic for identical inputs', () => {
    const checkin = makeCheckin(LOWER_OLYMPIC);
    const profile = makeProfile();
    const a = generateWorkout(LOWER_OLYMPIC, checkin, [], [], profile, EXERCISE_LIBRARY, { idFactory: () => 'x' });
    const b = generateWorkout(LOWER_OLYMPIC, checkin, [], [], profile, EXERCISE_LIBRARY, { idFactory: () => 'x' });
    expect(a).toEqual(b);
  });

  it('keeps skill-only movements out of every section except Skill', () => {
    const profile = makeProfile();
    for (const focuses of [LOWER_OLYMPIC, UPPER_GYM]) {
      const workout = generateWorkout(focuses, makeCheckin(focuses), [], [], profile, EXERCISE_LIBRARY);
      const { skill, ...rest } = workout.sections;
      for (const section of Object.values(rest)) {
        for (const item of section.items) {
          expect(SKILL_ONLY_IDS.has(item.exerciseId)).toBe(false);
        }
      }
    }
  });

  it('programs an Olympic skill block when the Olympic focus is picked', () => {
    const workout = generateWorkout(LOWER_OLYMPIC, makeCheckin(LOWER_OLYMPIC), [], [], makeProfile(), EXERCISE_LIBRARY);
    expect(workout.focus).toMatch(/Lower/i);
    expect(workout.olympicLiftProgression).toBeDefined();
    expect(workout.sections.skill.title).toMatch(/Olympic/i);
  });

  it('uses a gymnastics skill (no Olympic lift) for an Upper + Gymnastics day', () => {
    const workout = generateWorkout(UPPER_GYM, makeCheckin(UPPER_GYM), [], [], makeProfile(), EXERCISE_LIBRARY);
    expect(workout.focus).toMatch(/Upper/i);
    expect(workout.olympicLiftProgression).toBeUndefined();
    expect(workout.sections.skill.title).toMatch(/Gymnastics/i);
  });

  it('keeps an upper-focus Strength block off lower-body patterns', () => {
    const workout = generateWorkout(UPPER_GYM, makeCheckin(UPPER_GYM), [], [], makeProfile(), EXERCISE_LIBRARY);
    for (const item of workout.sections.strength.items) {
      const exercise = getExerciseById(item.exerciseId);
      expect(exercise?.movementPattern.some((p) => LOWER_BODY_PATTERNS.includes(p))).toBe(false);
    }
  });

  it('keeps a lower-focus Strength block on lower-body patterns', () => {
    const workout = generateWorkout(['lower'], makeCheckin(['lower']), [], [], makeProfile(), EXERCISE_LIBRARY);
    const ex = getExerciseById(workout.sections.strength.items[0]?.exerciseId ?? '');
    expect(ex?.movementPattern.some((p) => LOWER_BODY_PATTERNS.includes(p))).toBe(true);
  });

  it('combines focuses: Olympic + Gymnastics gets an Olympic skill and a valid session', () => {
    const focuses = ['olympic', 'gymnastics', 'core'] as const;
    const workout = generateWorkout([...focuses], makeCheckin([...focuses]), [], [], makeProfile(), EXERCISE_LIBRARY);
    expect(workout.sections.skill.title).toMatch(/Olympic/i);
    expect(workout.olympicLiftProgression).toBeDefined();
    expect(workout.sections.wod.items.length).toBeGreaterThan(0);
  });

  it('handles a focus set with no strength focus without crashing', () => {
    const focuses = ['conditioning', 'core'] as const;
    const workout = generateWorkout([...focuses], makeCheckin([...focuses]), [], [], makeProfile(), EXERCISE_LIBRARY);
    expect(workout.sections.skill.items.length).toBe(0); // no olympic/gymnastics skill
    expect(workout.sections.strength.items.length).toBeGreaterThan(0); // still a default strength lift
    expect(workout.sections.wod.items.length).toBeGreaterThan(0);
  });

  it('lands close to the ~60 minute target', () => {
    const workout = generateWorkout(LOWER_OLYMPIC, makeCheckin(LOWER_OLYMPIC), [], [], makeProfile(), EXERCISE_LIBRARY);
    expect(workout.estimatedDurationMinutes).toBeGreaterThanOrEqual(40);
    expect(workout.estimatedDurationMinutes).toBeLessThanOrEqual(80);
  });

  it('explains itself with a non-empty rationale', () => {
    const workout = generateWorkout(LOWER_OLYMPIC, makeCheckin(LOWER_OLYMPIC), [], [], makeProfile(), EXERCISE_LIBRARY);
    expect(workout.rationale.length).toBeGreaterThan(0);
  });

  it('does not fill a WOD with repeated identical movement patterns', () => {
    const workout = generateWorkout(LOWER_OLYMPIC, makeCheckin(LOWER_OLYMPIC), [], [], makeProfile(), EXERCISE_LIBRARY);
    const primaryPatterns = workout.sections.wod.items.map(
      (item) => getExerciseById(item.exerciseId)?.movementPattern[0]
    );
    expect(new Set(primaryPatterns).size).toBeGreaterThan(1);
  });

  it('reduces the Olympic lift skill volume when fatigue is high', () => {
    const fresh = generateWorkout(
      LOWER_OLYMPIC,
      makeCheckin(LOWER_OLYMPIC, { energy: 7, recovery: 7, soreness: 3 }),
      [],
      [],
      makeProfile(),
      EXERCISE_LIBRARY
    );
    const fatigued = generateWorkout(
      LOWER_OLYMPIC,
      makeCheckin(LOWER_OLYMPIC, { energy: 2, recovery: 2, soreness: 9 }),
      [],
      [],
      makeProfile(),
      EXERCISE_LIBRARY
    );
    expect(fatigued.sections.skill.items[0].sets ?? 0).toBeLessThan(fresh.sections.skill.items[0].sets ?? 0);
  });

  it('caps heavy lower-body WOD loading after a completed prior session', () => {
    const workout = generateWorkout(
      LOWER_OLYMPIC,
      makeCheckin(LOWER_OLYMPIC, { previousWorkoutCompleted: true }),
      [],
      [],
      makeProfile(),
      EXERCISE_LIBRARY
    );
    for (const item of workout.sections.wod.items) {
      expect(getExerciseById(item.exerciseId)?.category).not.toBe('barbell');
    }
    expect(workout.appliedRules.some((r) => r.startsWith('post-hyrox'))).toBe(true);
  });

  it('rotates the Olympic lift progression across consecutive Olympic sessions', () => {
    const first = generateWorkout(LOWER_OLYMPIC, makeCheckin(LOWER_OLYMPIC), [], [], makeProfile(), EXERCISE_LIBRARY);
    const history = [
      makeCompletedLog(LOWER_OLYMPIC, '2026-07-07', { olympicLiftProgression: first.olympicLiftProgression }),
    ];
    const second = generateWorkout(LOWER_OLYMPIC, makeCheckin(LOWER_OLYMPIC), history, [], makeProfile(), EXERCISE_LIBRARY);
    expect(second.olympicLiftProgression).not.toBe(first.olympicLiftProgression);
  });

  it('prescribes a concrete Strength weight from the profile working weight', () => {
    const workout = generateWorkout(['lower'], makeCheckin(['lower']), [], [], makeProfile(), EXERCISE_LIBRARY);
    const strength = workout.sections.strength.items[0];
    const base = resolveWorkingWeight(strength.exerciseId, makeProfile());
    expect(base).toBeGreaterThan(0);
    expect(strength.prescribedWeightKg).toBe(base);
  });

  it('prescribes lighter loads when readiness is poor', () => {
    const fresh = generateWorkout(['lower'], makeCheckin(['lower']), [], [], makeProfile(), EXERCISE_LIBRARY)
      .sections.strength.items[0];
    const tired = generateWorkout(
      ['lower'],
      makeCheckin(['lower'], { energy: 2, recovery: 2, sleepHours: 4, soreness: 8 }),
      [],
      [],
      makeProfile(),
      EXERCISE_LIBRARY
    ).sections.strength.items.find((i) => i.exerciseId === fresh.exerciseId);
    expect(tired?.prescribedWeightKg).toBeLessThan(fresh.prescribedWeightKg!);
  });
});
