import type { WodFormat, WorkoutLog } from '@/domain';
import { pickLeastRecentlyUsed } from './leastRecentlyUsed';
import { WOD_FORMAT_ROTATION } from './rotationLists';

/**
 * @param recentSessionsThisDay Most-recent-first completed sessions for THIS
 * weekday only (Tuesday or Thursday), so the two days rotate independently
 * and don't starve each other.
 */
export function pickNextWodFormat(recentSessionsThisDay: WorkoutLog[]): WodFormat {
  return pickLeastRecentlyUsed(WOD_FORMAT_ROTATION, (format) => {
    const index = recentSessionsThisDay.findIndex((log) => log.wodFormat === format);
    return index === -1 ? Infinity : index;
  });
}
