import { describe, expect, it } from 'vitest';
import type { WorkoutLog } from '@/domain';
import { progressLoad, parseTargetReps } from './prescriptionHelpers';

function logWith(exerciseId: string, weightKg: number, opts: { rpe?: number; technique?: number; completed?: boolean }): WorkoutLog {
  return {
    id: 'l',
    generatedWorkoutId: 'g',
    day: 'tuesday',
    date: '2026-07-07',
    completed: true,
    loggedExercises: [
      {
        exerciseId,
        exerciseName: exerciseId,
        sectionType: 'strength',
        techniqueRating: opts.technique,
        sets: [{ setNumber: 1, reps: 5, weightKg, rpe: opts.rpe, completed: opts.completed ?? true }],
      },
    ],
  };
}

describe('parseTargetReps', () => {
  it('takes the lower bound of a range', () => {
    expect(parseTargetReps('8-12')).toBe(8);
    expect(parseTargetReps('5')).toBe(5);
    expect(parseTargetReps('AMRAP')).toBeUndefined();
    expect(parseTargetReps(undefined)).toBeUndefined();
  });
});

describe('progressLoad', () => {
  it('prescribes the working weight at neutral readiness with no history', () => {
    expect(progressLoad('back-squat', 100, 2.5, 1, []).weightKg).toBe(100);
  });

  it('scales down with a low intensity multiplier', () => {
    expect(progressLoad('back-squat', 100, 2.5, 0.85, []).weightKg).toBe(85);
  });

  it('adds one step after a cleanly completed session', () => {
    const history = [logWith('back-squat', 100, { rpe: 7 })];
    const result = progressLoad('back-squat', 100, 2.5, 1, history);
    expect(result.weightKg).toBe(102.5);
    expect(result.note).toMatch(/\+2.5 kg/);
  });

  it('holds load when the last session was maxed out (high RPE)', () => {
    const history = [logWith('back-squat', 100, { rpe: 10 })];
    expect(progressLoad('back-squat', 100, 2.5, 1, history).weightKg).toBe(100);
  });

  it('holds Olympic load when technique was poor even if completed', () => {
    const history = [logWith('HangPowerClean', 60, { rpe: 6, technique: 2 })];
    expect(progressLoad('HangPowerClean', 60, 2.5, 1, history).weightKg).toBe(60);
  });

  it('progresses Olympic load when technique and effort were both solid', () => {
    const history = [logWith('HangPowerClean', 60, { rpe: 6, technique: 5 })];
    expect(progressLoad('HangPowerClean', 60, 2.5, 1, history).weightKg).toBe(62.5);
  });

  it('never drops below the profile working weight even after a hard session', () => {
    const history = [logWith('back-squat', 90, { rpe: 10 })]; // did less than working weight
    expect(progressLoad('back-squat', 100, 2.5, 1, history).weightKg).toBe(100);
  });
});
