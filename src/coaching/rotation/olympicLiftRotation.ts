import type { OlympicLiftProgression, WorkoutLog } from '@/domain';
import { pickLeastRecentlyUsed } from './leastRecentlyUsed';
import { OLYMPIC_LIFT_ROTATION } from './rotationLists';

/** @param recentTuesdaySessions Most-recent-first completed Tuesday sessions. */
export function pickNextOlympicLift(recentTuesdaySessions: WorkoutLog[]): OlympicLiftProgression {
  return pickLeastRecentlyUsed(OLYMPIC_LIFT_ROTATION, (progression) => {
    const index = recentTuesdaySessions.findIndex((log) =>
      log.loggedExercises.some((e) => e.exerciseId === progression)
    );
    return index === -1 ? Infinity : index;
  });
}
