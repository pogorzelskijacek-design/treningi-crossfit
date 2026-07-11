import { describe, expect, it } from 'vitest';
import { DEFAULT_PROFILE } from '@/domain';
import {
  DEFAULT_WORKING_WEIGHTS,
  resolveOlympicWorkingWeight,
  resolveWorkingWeight,
  roundToStep,
} from './workingWeights';

describe('resolveWorkingWeight', () => {
  it('falls back to the built-in default', () => {
    expect(resolveWorkingWeight('back-squat', DEFAULT_PROFILE)).toBe(DEFAULT_WORKING_WEIGHTS['back-squat']);
  });

  it('lets a profile override win', () => {
    const profile = { ...DEFAULT_PROFILE, workingWeights: { 'back-squat': 140 } };
    expect(resolveWorkingWeight('back-squat', profile)).toBe(140);
  });

  it('returns undefined for exercises without a load (bodyweight/machine)', () => {
    expect(resolveWorkingWeight('burpee', DEFAULT_PROFILE)).toBeUndefined();
  });

  it('tolerates a legacy profile missing the workingWeights map', () => {
    const legacy = { ...DEFAULT_PROFILE } as { workingWeights?: Record<string, number> };
    delete legacy.workingWeights;
    expect(resolveWorkingWeight('deadlift', legacy as typeof DEFAULT_PROFILE)).toBe(
      DEFAULT_WORKING_WEIGHTS['deadlift']
    );
  });
});

describe('resolveOlympicWorkingWeight', () => {
  it('scales the power-clean base by the progression factor and rounds to 2.5kg', () => {
    // power-clean default 75kg × CleanDeadlift 1.15 = 86.25 → rounded 87.5
    expect(resolveOlympicWorkingWeight('CleanDeadlift', DEFAULT_PROFILE)).toBe(87.5);
  });

  it('tracks a profile override of the power clean', () => {
    const profile = { ...DEFAULT_PROFILE, workingWeights: { 'power-clean': 100 } };
    // 100 × HangPowerClean 0.65 = 65
    expect(resolveOlympicWorkingWeight('HangPowerClean', profile)).toBe(65);
  });
});

describe('roundToStep', () => {
  it('rounds to the nearest 2.5 by default', () => {
    expect(roundToStep(86.25)).toBe(87.5);
    expect(roundToStep(61.2)).toBe(60);
  });
});
