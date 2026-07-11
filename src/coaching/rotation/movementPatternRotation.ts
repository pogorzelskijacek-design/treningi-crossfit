import type { Exercise, MovementPattern, WorkoutLog, WorkoutSectionType } from '@/domain';

const RECENCY_WINDOW = 3;

/**
 * Movement patterns used in the given section across the last few sessions
 * (most-recent-first input, but order doesn't matter here — we just need the
 * set). Used to softly de-prioritize repeats, not hard-exclude them.
 */
export function getRecentlyUsedPatterns(
  recentSessions: WorkoutLog[],
  sectionType: WorkoutSectionType,
  exerciseLibrary: Exercise[]
): Set<MovementPattern> {
  const patterns = new Set<MovementPattern>();
  const exerciseById = new Map(exerciseLibrary.map((e) => [e.id, e]));

  for (const log of recentSessions.slice(0, RECENCY_WINDOW)) {
    for (const logged of log.loggedExercises) {
      if (logged.sectionType !== sectionType) continue;
      const exercise = exerciseById.get(logged.exerciseId);
      exercise?.movementPattern.forEach((p) => patterns.add(p));
    }
  }

  return patterns;
}
