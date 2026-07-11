import type { WorkoutLog } from '@/domain';
import type { RuleTrace, VolumeIntensityAdjustment } from '../types';

function startOfIsoWeek(dateIso: string): number {
  const date = new Date(dateIso);
  const day = date.getDay();
  const diffToMonday = (day + 6) % 7;
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() - diffToMonday);
  return date.getTime();
}

function isSameIsoWeek(a: string, b: string): boolean {
  return startOfIsoWeek(a) === startOfIsoWeek(b);
}

/**
 * Volume never increases in this engine (see fatigueAdjustment), only intensity
 * can go above 1.0 (excellent recovery). So "never increase volume and intensity
 * in the same week" reduces to: don't stack a second intensity bump onto a week
 * that already had one — clamp it back to neutral even if today's readiness
 * alone would justify another bump. Only logged (completed) sessions count,
 * consistent with how the rest of the engine reads history.
 */
export function applyWeeklyLoadBalance(
  adjustment: VolumeIntensityAdjustment,
  date: string,
  history: WorkoutLog[]
): VolumeIntensityAdjustment {
  const alreadyIncreasedThisWeek = history.some(
    (log) =>
      log.completed &&
      log.loadAdjustment &&
      isSameIsoWeek(log.date, date) &&
      log.loadAdjustment.intensityMultiplier > 1
  );

  if (!alreadyIncreasedThisWeek || adjustment.intensityMultiplier <= 1) {
    return adjustment;
  }

  const traces: RuleTrace[] = [
    ...adjustment.traces,
    {
      rule: 'weekly-load-balance',
      effect:
        'Intensity was already increased earlier this week, so today’s bump is held at neutral to avoid stacking increases.',
    },
  ];

  return { ...adjustment, intensityMultiplier: 1, traces };
}
