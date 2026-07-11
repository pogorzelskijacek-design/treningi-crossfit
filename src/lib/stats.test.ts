import { describe, expect, it } from 'vitest';
import type { WorkoutLog } from '@/domain';
import { computeStats, computeWeekStreak, sessionTrend } from './stats';

function log(date: string, overrides: Partial<WorkoutLog> = {}): WorkoutLog {
  return {
    id: date,
    generatedWorkoutId: 'g',
    day: 'tuesday',
    date,
    completed: true,
    loggedExercises: [
      {
        exerciseId: 'back-squat',
        exerciseName: 'Back Squat',
        sectionType: 'strength',
        sets: [{ setNumber: 1, reps: 5, weightKg: 100, completed: true }],
      },
    ],
    ...overrides,
  };
}

describe('computeWeekStreak', () => {
  it('is zero with no history', () => {
    expect(computeWeekStreak([], '2026-07-10')).toBe(0);
  });

  it('counts consecutive training weeks', () => {
    // 2026-07-10 is a Friday; prior Tuesdays across three consecutive weeks.
    const history = [log('2026-07-07'), log('2026-06-30'), log('2026-06-23')];
    expect(computeWeekStreak(history, '2026-07-10')).toBe(3);
  });

  it('does not break the streak just because the current week is still empty', () => {
    const history = [log('2026-07-01'), log('2026-06-24')];
    // Current week (of 2026-07-10) has no workout yet, but the two prior weeks do.
    expect(computeWeekStreak(history, '2026-07-10')).toBe(2);
  });

  it('breaks the streak on a gap week', () => {
    const history = [log('2026-07-07'), log('2026-06-16')]; // skips the week of 2026-06-23/30
    expect(computeWeekStreak(history, '2026-07-10')).toBe(1);
  });
});

describe('computeStats', () => {
  it('sums weekly volume only for the current week', () => {
    const history = [
      log('2026-07-07', { overallRpe: 8 }), // this week (Mon 2026-07-06 start)
      log('2026-06-30', { overallRpe: 6 }), // last week
    ];
    const stats = computeStats(history, '2026-07-10');
    expect(stats.totalWorkouts).toBe(2);
    expect(stats.weeklyVolumeKg).toBe(500); // one session: 5 reps * 100kg
    expect(stats.averageRpe).toBe(7);
  });
});

describe('sessionTrend', () => {
  it('returns points oldest-first', () => {
    const points = sessionTrend([log('2026-07-07'), log('2026-06-30')]);
    expect(points.map((p) => p.date)).toEqual(['2026-06-30', '2026-07-07']);
  });
});
