import { describe, expect, it } from 'vitest';
import { pickNextOlympicLift } from './olympicLiftRotation';
import { OLYMPIC_LIFT_ROTATION } from './rotationLists';
import { makeCompletedLog } from '../testFixtures';

describe('pickNextOlympicLift', () => {
  it('picks the first rotation entry when there is no history', () => {
    expect(pickNextOlympicLift([])).toBe(OLYMPIC_LIFT_ROTATION[0]);
  });

  it('does not repeat the most recently used progression while others remain untried', () => {
    const history = [makeCompletedLog(['lower', 'olympic'],'2026-07-07', { olympicLiftProgression: OLYMPIC_LIFT_ROTATION[0] })];
    const next = pickNextOlympicLift(history);
    expect(next).not.toBe(OLYMPIC_LIFT_ROTATION[0]);
  });

  it('cycles back to the least recently used lift once every lift has been tried', () => {
    // Most-recent-first history using every lift except the last one in rotation order.
    const history = OLYMPIC_LIFT_ROTATION.slice(0, -1)
      .map((progression, i) => makeCompletedLog(['lower', 'olympic'],`2026-06-${10 + i}`, { olympicLiftProgression: progression }))
      .reverse();
    const next = pickNextOlympicLift(history);
    expect(next).toBe(OLYMPIC_LIFT_ROTATION[OLYMPIC_LIFT_ROTATION.length - 1]);
  });

  it('is deterministic for identical inputs', () => {
    const history = [makeCompletedLog(['lower', 'olympic'],'2026-07-07', { olympicLiftProgression: 'HangClean' })];
    expect(pickNextOlympicLift(history)).toBe(pickNextOlympicLift(history));
  });
});
