import type {
  OlympicLiftProgression,
  ReadinessCheckin,
  TrainingDay,
  UserProfile,
  WodFormat,
  WorkoutLog,
} from '@/domain';
import { DEFAULT_PROFILE } from '@/domain';

let counter = 0;
function nextId(prefix: string): string {
  counter += 1;
  return `${prefix}-${counter}`;
}

export function makeCompletedLog(
  day: TrainingDay,
  date: string,
  options: {
    olympicLiftProgression?: OlympicLiftProgression;
    wodFormat?: WodFormat;
    loadAdjustment?: { volumeMultiplier: number; intensityMultiplier: number };
  } = {}
): WorkoutLog {
  return {
    id: nextId('log'),
    generatedWorkoutId: nextId('gen'),
    day,
    date,
    completed: true,
    wodFormat: options.wodFormat,
    loadAdjustment: options.loadAdjustment,
    loggedExercises: options.olympicLiftProgression
      ? [
          {
            exerciseId: options.olympicLiftProgression,
            exerciseName: options.olympicLiftProgression,
            sectionType: 'skill',
            sets: [{ setNumber: 1, reps: 3, weightKg: 60, rpe: 7, completed: true }],
            techniqueRating: 4,
          },
        ]
      : [],
  };
}

export function makeCheckin(day: TrainingDay, overrides: Partial<ReadinessCheckin> = {}): ReadinessCheckin {
  return {
    id: nextId('checkin'),
    date: '2026-07-14',
    day,
    energy: 7,
    recovery: 7,
    sleepHours: 7.5,
    soreness: 3,
    painOrInjuries: '',
    previousWorkoutCompleted: true,
    ...overrides,
  };
}

export function makeProfile(overrides: Partial<UserProfile> = {}): UserProfile {
  return { ...DEFAULT_PROFILE, ...overrides };
}
