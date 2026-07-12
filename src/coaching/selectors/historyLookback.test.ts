import { describe, expect, it } from 'vitest';
import type { WorkoutLog } from '@/domain';
import { getRecentSessionsByFocus, getRecentSessionsSharingFocus } from './historyLookback';
import { LOWER_OLYMPIC, UPPER_GYM, makeCompletedLog } from '../testFixtures';

describe('getRecentSessionsByFocus', () => {
  it('filters to sessions that include the focus', () => {
    const history = [
      makeCompletedLog(LOWER_OLYMPIC, '2026-07-07'),
      makeCompletedLog(UPPER_GYM, '2026-07-09'),
      makeCompletedLog(['lower', 'conditioning'], '2026-06-30'),
    ];
    const lower = getRecentSessionsByFocus(history, 'lower');
    expect(lower).toHaveLength(2);
    expect(lower.every((log: WorkoutLog) => log.focuses.includes('lower'))).toBe(true);
  });

  it('sorts most-recent-first', () => {
    const history = [
      makeCompletedLog(LOWER_OLYMPIC, '2026-06-23'),
      makeCompletedLog(LOWER_OLYMPIC, '2026-07-07'),
      makeCompletedLog(LOWER_OLYMPIC, '2026-06-30'),
    ];
    const result = getRecentSessionsByFocus(history, 'olympic');
    expect(result.map((log: WorkoutLog) => log.date)).toEqual(['2026-07-07', '2026-06-30', '2026-06-23']);
  });

  it('excludes uncompleted sessions', () => {
    const incomplete = { ...makeCompletedLog(LOWER_OLYMPIC, '2026-07-07'), completed: false };
    expect(getRecentSessionsByFocus([incomplete], 'lower')).toHaveLength(0);
  });

  it('respects the limit', () => {
    const history = Array.from({ length: 10 }, (_, i) => makeCompletedLog(LOWER_OLYMPIC, `2026-0${(i % 9) + 1}-01`));
    expect(getRecentSessionsByFocus(history, 'lower', 3)).toHaveLength(3);
  });
});

describe('getRecentSessionsSharingFocus', () => {
  it('matches sessions that share at least one focus', () => {
    const history = [
      makeCompletedLog(LOWER_OLYMPIC, '2026-07-07'),
      makeCompletedLog(UPPER_GYM, '2026-07-09'),
    ];
    expect(getRecentSessionsSharingFocus(history, ['gymnastics'])).toHaveLength(1);
    expect(getRecentSessionsSharingFocus(history, ['lower', 'upper'])).toHaveLength(2);
  });
});
