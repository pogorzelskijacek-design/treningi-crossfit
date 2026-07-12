import { describe, expect, it } from 'vitest';
import { computeFatigueScore, fatigueAdjustment } from './fatigueAdjustment';
import { makeCheckin } from '../testFixtures';

describe('computeFatigueScore', () => {
  it('is low when energy and recovery are high and soreness is minimal', () => {
    const score = computeFatigueScore(makeCheckin(['lower'], { energy: 9, recovery: 9, soreness: 1 }));
    expect(score).toBeLessThan(3);
  });

  it('is high when energy and recovery are low and soreness is high', () => {
    const score = computeFatigueScore(makeCheckin(['lower'], { energy: 2, recovery: 2, soreness: 9 }));
    expect(score).toBeGreaterThanOrEqual(7);
  });
});

describe('fatigueAdjustment', () => {
  it('cuts volume 25-40% when fatigue is high, and never touches intensity for fatigue alone', () => {
    const checkin = makeCheckin(['lower'], { energy: 2, recovery: 2, soreness: 9, sleepHours: 8 });
    const result = fatigueAdjustment(checkin);
    expect(result.volumeMultiplier).toBeGreaterThanOrEqual(0.6);
    expect(result.volumeMultiplier).toBeLessThanOrEqual(0.75);
    expect(result.intensityMultiplier).toBe(1);
    expect(result.traces.some((t) => t.rule === 'fatigue')).toBe(true);
  });

  it('caps intensity on poor sleep without touching volume', () => {
    const checkin = makeCheckin(['lower'], { energy: 7, recovery: 7, soreness: 2, sleepHours: 5 });
    const result = fatigueAdjustment(checkin);
    expect(result.intensityMultiplier).toBeLessThan(1);
    expect(result.volumeMultiplier).toBe(1);
  });

  it('nudges intensity up slightly on excellent recovery, and leaves volume untouched', () => {
    const checkin = makeCheckin(['lower'], { energy: 9, recovery: 9, soreness: 1, sleepHours: 8 });
    const result = fatigueAdjustment(checkin);
    expect(result.intensityMultiplier).toBeGreaterThan(1);
    expect(result.volumeMultiplier).toBe(1);
  });

  it('never reduces volume and increases intensity from the same low-fatigue-but-tired inputs', () => {
    // High fatigue AND poor sleep together should still only ever move volume down and intensity down, never up.
    const checkin = makeCheckin(['lower'], { energy: 2, recovery: 2, soreness: 9, sleepHours: 4 });
    const result = fatigueAdjustment(checkin);
    expect(result.volumeMultiplier).toBeLessThan(1);
    expect(result.intensityMultiplier).toBeLessThanOrEqual(1);
  });

  it('is a no-op with neutral, middling readiness', () => {
    const checkin = makeCheckin(['lower'], { energy: 6, recovery: 6, soreness: 4, sleepHours: 7 });
    const result = fatigueAdjustment(checkin);
    expect(result.volumeMultiplier).toBe(1);
    expect(result.intensityMultiplier).toBe(1);
    expect(result.traces).toHaveLength(0);
  });
});
