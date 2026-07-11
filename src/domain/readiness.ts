import type { TrainingDay } from './trainingDay';

export interface ReadinessCheckin {
  id: string;
  date: string;
  day: TrainingDay;
  /** 1-10, how energetic the athlete feels right now. */
  energy: number;
  /** 1-10, subjective recovery/readiness to train. */
  recovery: number;
  sleepHours: number;
  /** 1-10 overall soreness; higher = more sore. */
  soreness: number;
  /** Free text describing sore areas, pain, or injuries. */
  painOrInjuries: string;
  previousWorkoutCompleted: boolean;
  notes?: string;
}
