import type { ReadinessCheckin } from '@/domain';
import type { VolumeIntensityAdjustment } from '../types';

/**
 * 0-10 composite fatigue score from low energy, low recovery, and soreness.
 * Higher means more fatigued.
 */
export function computeFatigueScore(checkin: ReadinessCheckin): number {
  const energyFatigue = 10 - checkin.energy;
  const recoveryFatigue = 10 - checkin.recovery;
  return Math.round((energyFatigue + recoveryFatigue + checkin.soreness) / 3);
}

/**
 * Translates today's readiness check-in into volume/intensity multipliers:
 * - fatigue >= 7/10 cuts volume 25-40% (worse fatigue -> bigger cut)
 * - under 6h sleep caps intensity
 * - excellent energy + recovery nudges intensity up slightly (never volume)
 */
export function fatigueAdjustment(checkin: ReadinessCheckin): VolumeIntensityAdjustment {
  const traces: VolumeIntensityAdjustment['traces'] = [];
  let volumeMultiplier = 1;
  let intensityMultiplier = 1;

  const fatigueScore = computeFatigueScore(checkin);
  if (fatigueScore >= 7) {
    const severity = Math.min(1, (fatigueScore - 7) / 3);
    const reduction = 0.25 + severity * 0.15;
    volumeMultiplier *= 1 - reduction;
    traces.push({
      rule: 'fatigue',
      effect: `High fatigue (energy ${checkin.energy}/10, recovery ${checkin.recovery}/10, soreness ${checkin.soreness}/10) — volume reduced ~${Math.round(reduction * 100)}%.`,
    });
  }

  if (checkin.sleepHours < 6) {
    intensityMultiplier *= 0.85;
    traces.push({
      rule: 'sleep',
      effect: `Only ${checkin.sleepHours}h of sleep — intensity capped to protect bar speed and joints.`,
    });
  }

  if (fatigueScore < 7 && checkin.energy >= 8 && checkin.recovery >= 8) {
    intensityMultiplier *= 1.08;
    traces.push({
      rule: 'excellent-recovery',
      effect: `Energy and recovery are both high (${checkin.energy}/10, ${checkin.recovery}/10) — intensity nudged up slightly.`,
    });
  }

  return { volumeMultiplier, intensityMultiplier, traces };
}
