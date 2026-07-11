import type { TrainingDay, WorkoutLog } from '@/domain';
import { LOOKBACK_SESSIONS } from '../constants';

/** Most-recent-first sessions matching the given weekday, capped at `limit`. */
export function getRecentSessionsByDay(
  history: WorkoutLog[],
  day: TrainingDay,
  limit: number = LOOKBACK_SESSIONS
): WorkoutLog[] {
  return [...history]
    .filter((log) => log.day === day && log.completed)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, limit);
}

/** All completed sessions within the last `days` calendar days of `referenceDateIso`. */
export function getSessionsWithinDays(
  history: WorkoutLog[],
  referenceDateIso: string,
  days: number
): WorkoutLog[] {
  const reference = new Date(referenceDateIso).getTime();
  const windowMs = days * 24 * 60 * 60 * 1000;
  return history.filter((log) => {
    if (!log.completed) return false;
    const logTime = new Date(log.date).getTime();
    return reference - logTime >= 0 && reference - logTime < windowMs;
  });
}
