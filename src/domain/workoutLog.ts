import type { WorkoutSectionType } from './exercise';
import type { TrainingDay, WodFormat } from './trainingDay';
import type { LoadAdjustment } from './workout';

export interface LoggedSet {
  setNumber: number;
  reps?: number;
  weightKg?: number;
  rpe?: number;
  completed: boolean;
}

export interface LoggedExercise {
  exerciseId: string;
  exerciseName: string;
  sectionType: WorkoutSectionType;
  sets: LoggedSet[];
  /** 1-5, self-rated technique quality (most relevant for Olympic lifts). */
  techniqueRating?: number;
  notes?: string;
}

export interface WorkoutLog {
  id: string;
  generatedWorkoutId: string;
  day: TrainingDay;
  date: string;
  loggedExercises: LoggedExercise[];
  wodFormat?: WodFormat;
  /** Copied from the GeneratedWorkout at log time, so weekly load-balancing can inspect this week's history without a separate lookup. */
  loadAdjustment?: LoadAdjustment;
  /** Free-form WOD result, e.g. "12:34" or "8 rounds + 4 reps". */
  wodScore?: string;
  overallRpe?: number;
  notes?: string;
  completed: boolean;
}
