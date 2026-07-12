import type { GeneratedWorkout } from './workout';
import type { WorkoutLog } from './workoutLog';
import type { ReadinessCheckin } from './readiness';
import { focusesFromLegacyDay, type SessionFocus, type TrainingDay } from './trainingDay';

/** Records written before multi-focus stored a `day` token instead of `focuses`. */
type LegacyWithDay = { day?: TrainingDay; focuses?: SessionFocus[] };

function ensureFocuses<T extends LegacyWithDay>(record: T): SessionFocus[] {
  if (Array.isArray(record.focuses) && record.focuses.length > 0) return record.focuses;
  return focusesFromLegacyDay(record.day);
}

/** Normalizes a stored generated workout (adds `focuses` derived from a legacy `day`). */
export function normalizeGeneratedWorkout(raw: GeneratedWorkout & LegacyWithDay): GeneratedWorkout {
  return { ...raw, focuses: ensureFocuses(raw) };
}

/** Normalizes a stored workout log (adds `focuses` derived from a legacy `day`). */
export function normalizeWorkoutLog(raw: WorkoutLog & LegacyWithDay): WorkoutLog {
  return { ...raw, focuses: ensureFocuses(raw) };
}

/** Normalizes a stored readiness check-in. */
export function normalizeReadinessCheckin(raw: ReadinessCheckin & LegacyWithDay): ReadinessCheckin {
  return { ...raw, focuses: ensureFocuses(raw) };
}
