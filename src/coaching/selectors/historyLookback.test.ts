import { describe, expect, it } from 'vitest';
import { getRecentSessionsByDay } from './historyLookback';
import { makeCompletedLog } from '../testFixtures';

describe('getRecentSessionsByDay', () => {
  it('keeps Tuesday and Thursday history independent', () => {
    const history = [
      makeCompletedLog('tuesday', '2026-07-07'),
      makeCompletedLog('thursday', '2026-07-09'),
      makeCompletedLog('tuesday', '2026-06-30'),
    ];
    const tuesdays = getRecentSessionsByDay(history, 'tuesday');
    expect(tuesdays).toHaveLength(2);
    expect(tuesdays.every((log) => log.day === 'tuesday')).toBe(true);
  });

  it('sorts most-recent-first', () => {
    const history = [
      makeCompletedLog('tuesday', '2026-06-23'),
      makeCompletedLog('tuesday', '2026-07-07'),
      makeCompletedLog('tuesday', '2026-06-30'),
    ];
    const result = getRecentSessionsByDay(history, 'tuesday');
    expect(result.map((log) => log.date)).toEqual(['2026-07-07', '2026-06-30', '2026-06-23']);
  });

  it('excludes uncompleted sessions', () => {
    const incomplete = { ...makeCompletedLog('tuesday', '2026-07-07'), completed: false };
    const result = getRecentSessionsByDay([incomplete], 'tuesday');
    expect(result).toHaveLength(0);
  });

  it('respects the limit', () => {
    const history = Array.from({ length: 10 }, (_, i) => makeCompletedLog('tuesday', `2026-0${(i % 9) + 1}-01`));
    expect(getRecentSessionsByDay(history, 'tuesday', 3)).toHaveLength(3);
  });
});
