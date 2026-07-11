import type { WorkoutSectionType } from './exercise';
import type { OlympicLiftProgression, TrainingDay, WodFormat } from './trainingDay';

export interface WorkoutSectionItem {
  exerciseId: string;
  exerciseName: string;
  prescription: string;
  sets?: number;
  reps?: string;
  /** Numeric rep target used to pre-fill the log (from the lower bound of `reps`). */
  targetReps?: number;
  /** Concrete prescribed load in kg, computed from the athlete's working weight, readiness and progression. Absent for bodyweight/machine work. */
  prescribedWeightKg?: number;
  /** For dumbbell/kettlebell items, the prescribed weight is per implement (per hand). */
  weightPerHand?: boolean;
  loadNote?: string;
  notes?: string;
}

export interface WorkoutSection {
  type: WorkoutSectionType;
  title: string;
  items: WorkoutSectionItem[];
  wodFormat?: WodFormat;
  timeCapMinutes?: number;
}

export interface LoadAdjustment {
  volumeMultiplier: number;
  intensityMultiplier: number;
}

export interface GeneratedWorkout {
  id: string;
  day: TrainingDay;
  date: string;
  focus: string;
  olympicLiftProgression?: OlympicLiftProgression;
  sections: {
    warmup: WorkoutSection;
    skill: WorkoutSection;
    strength: WorkoutSection;
    wod: WorkoutSection;
    accessories: WorkoutSection;
    cooldown: WorkoutSection;
  };
  rationale: string;
  appliedRules: string[];
  /** Raw multipliers applied this session, kept structured so the weekly load-balance rule can inspect prior sessions without parsing rationale text. */
  loadAdjustment: LoadAdjustment;
  readinessCheckinId?: string;
  estimatedDurationMinutes: number;
}
