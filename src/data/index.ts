import type { Exercise } from '@/domain';
import { BARBELL_EXERCISES } from './exerciseLibrary.barbell';
import { DUMBBELL_EXERCISES, KETTLEBELL_EXERCISES } from './exerciseLibrary.dumbbellKettlebell';
import { STRONGMAN_EXERCISES, MACHINE_EXERCISES } from './exerciseLibrary.strongmanMachine';
import { BODYWEIGHT_EXERCISES } from './exerciseLibrary.bodyweight';
import { GYMNASTICS_EXERCISES } from './exerciseLibrary.gymnastics';
import { CONDITIONING_EXERCISES, MOBILITY_EXERCISES } from './exerciseLibrary.conditioningMobility';

export const EXERCISE_LIBRARY: Exercise[] = [
  ...BARBELL_EXERCISES,
  ...DUMBBELL_EXERCISES,
  ...KETTLEBELL_EXERCISES,
  ...STRONGMAN_EXERCISES,
  ...MACHINE_EXERCISES,
  ...BODYWEIGHT_EXERCISES,
  ...GYMNASTICS_EXERCISES,
  ...CONDITIONING_EXERCISES,
  ...MOBILITY_EXERCISES,
];

const EXERCISE_BY_ID = new Map(EXERCISE_LIBRARY.map((exercise) => [exercise.id, exercise]));

export function getExerciseById(id: string): Exercise | undefined {
  return EXERCISE_BY_ID.get(id);
}

export function getExerciseName(id: string): string {
  return EXERCISE_BY_ID.get(id)?.name ?? id;
}

export * from './workingWeights';
