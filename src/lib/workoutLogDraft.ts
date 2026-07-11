import type { GeneratedWorkout, LoggedExercise, LoggedSet, WorkoutLog, WorkoutSectionItem } from '@/domain';
import { newId } from './id';

/** Sections that get logged set-by-set. WOD is captured via wodScore; warmup/cooldown aren't logged. */
const LOGGED_SECTIONS = ['skill', 'strength', 'accessories'] as const;

/**
 * A prescribed set, pre-marked completed with the prescribed reps and weight —
 * so the default action is a one-tap "done as prescribed" confirmation and the
 * athlete only edits the exercises where reality differed.
 */
function prescribedSet(setNumber: number, item: WorkoutSectionItem): LoggedSet {
  return {
    setNumber,
    reps: item.targetReps,
    weightKg: item.prescribedWeightKg,
    completed: true,
  };
}

/**
 * Pre-populates an editable WorkoutLog from a generated workout, assuming the
 * session was completed as prescribed. The athlete confirms, or adjusts only
 * the exercises that differed.
 */
export function buildDraftLog(workout: GeneratedWorkout): WorkoutLog {
  const loggedExercises: LoggedExercise[] = [];

  for (const sectionType of LOGGED_SECTIONS) {
    const section = workout.sections[sectionType];
    for (const item of section.items) {
      const setCount = Math.max(1, item.sets ?? (sectionType === 'accessories' ? 3 : 5));
      loggedExercises.push({
        exerciseId: item.exerciseId,
        exerciseName: item.exerciseName,
        sectionType,
        sets: Array.from({ length: setCount }, (_, i) => prescribedSet(i + 1, item)),
      });
    }
  }

  return {
    id: newId(),
    generatedWorkoutId: workout.id,
    day: workout.day,
    date: workout.date,
    loggedExercises,
    wodFormat: workout.sections.wod.wodFormat,
    loadAdjustment: workout.loadAdjustment,
    completed: true,
  };
}
