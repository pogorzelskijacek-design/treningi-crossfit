export type StandardPrType =
  | 'BackSquat'
  | 'FrontSquat'
  | 'Deadlift'
  | 'BenchPress'
  | 'StrictPress'
  | 'PushPress'
  | 'PowerClean'
  | 'SquatClean'
  | 'Thruster';

export const STANDARD_PR_LABELS: Record<StandardPrType, string> = {
  BackSquat: 'Back Squat',
  FrontSquat: 'Front Squat',
  Deadlift: 'Deadlift',
  BenchPress: 'Bench Press',
  StrictPress: 'Strict Press',
  PushPress: 'Push Press',
  PowerClean: 'Power Clean',
  SquatClean: 'Squat Clean',
  Thruster: 'Thruster',
};

export const STANDARD_PR_TYPES = Object.keys(STANDARD_PR_LABELS) as StandardPrType[];

export interface PersonalRecord {
  id: string;
  /** One of StandardPrType, or a free-form label when isCustom is true. */
  type: StandardPrType | string;
  label: string;
  isCustom: boolean;
  valueKg?: number;
  valueTime?: string;
  reps?: number;
  date: string;
  workoutLogId?: string;
  notes?: string;
}
