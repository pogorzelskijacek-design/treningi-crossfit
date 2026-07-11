import type { StandardPrType } from '@/domain';

/** Maps loggable exercise IDs (and Olympic progression ids) to the standard PR they count toward. */
export const EXERCISE_ID_TO_PR_TYPE: Record<string, StandardPrType> = {
  'back-squat': 'BackSquat',
  'front-squat': 'FrontSquat',
  FrontSquat: 'FrontSquat',
  deadlift: 'Deadlift',
  'bench-press': 'BenchPress',
  'strict-press': 'StrictPress',
  'push-press': 'PushPress',
  'power-clean': 'PowerClean',
  'squat-clean': 'SquatClean',
  thruster: 'Thruster',
};

export function prTypeForExerciseId(exerciseId: string): StandardPrType | undefined {
  return EXERCISE_ID_TO_PR_TYPE[exerciseId];
}
