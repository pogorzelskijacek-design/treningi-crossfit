import type { SessionFocus, WorkoutLog } from '@/domain';
import { LOOKBACK_SESSIONS } from '../constants';

/** Most-recent-first completed sessions whose focuses include `focus`. */
export function getRecentSessionsByFocus(
  history: WorkoutLog[],
  focus: SessionFocus,
  limit: number = LOOKBACK_SESSIONS
): WorkoutLog[] {
  return [...history]
    .filter((log) => log.completed && log.focuses?.includes(focus))
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, limit);
}

/** Most-recent-first completed sessions sharing at least one focus with `focuses`. */
export function getRecentSessionsSharingFocus(
  history: WorkoutLog[],
  focuses: SessionFocus[],
  limit: number = LOOKBACK_SESSIONS
): WorkoutLog[] {
  return [...history]
    .filter((log) => log.completed && log.focuses?.some((f) => focuses.includes(f)))
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
