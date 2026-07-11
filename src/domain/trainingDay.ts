export type TrainingDay = 'tuesday' | 'thursday';

export type WodFormat =
  | 'AMRAP'
  | 'EMOM'
  | 'ForTime'
  | 'Chipper'
  | 'Ladder'
  | 'DeathBy'
  | 'Intervals'
  | 'Tabata';

export const WOD_FORMAT_LABELS: Record<WodFormat, string> = {
  AMRAP: 'AMRAP',
  EMOM: 'EMOM',
  ForTime: 'For Time',
  Chipper: 'Chipper',
  Ladder: 'Ladder',
  DeathBy: 'Death By',
  Intervals: 'Intervals',
  Tabata: 'Tabata',
};

export type OlympicLiftProgression =
  | 'HighHangPowerClean'
  | 'HangPowerClean'
  | 'HangClean'
  | 'TallClean'
  | 'MuscleClean'
  | 'CleanPull'
  | 'CleanDeadlift'
  | 'PauseClean'
  | 'TempoClean'
  | 'FrontSquat'
  | 'CleanComplex';

export const OLYMPIC_LIFT_LABELS: Record<OlympicLiftProgression, string> = {
  HighHangPowerClean: 'High Hang Power Clean',
  HangPowerClean: 'Hang Power Clean',
  HangClean: 'Hang Clean',
  TallClean: 'Tall Clean',
  MuscleClean: 'Muscle Clean',
  CleanPull: 'Clean Pull',
  CleanDeadlift: 'Clean Deadlift',
  PauseClean: 'Pause Clean',
  TempoClean: 'Tempo Clean',
  FrontSquat: 'Front Squat',
  CleanComplex: 'Clean Complex (Power Clean + Front Squat)',
};
