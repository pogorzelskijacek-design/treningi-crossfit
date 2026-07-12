/** Legacy two-template token, kept only for migrating old stored records. */
export type TrainingDay = 'tuesday' | 'thursday';

/** A granular training focus. A generated day carries one or more of these. */
export type SessionFocus =
  | 'olympic'
  | 'lower'
  | 'upper'
  | 'gymnastics'
  | 'conditioning'
  | 'endurance'
  | 'core'
  | 'strongman';

export const SESSION_FOCUS_ORDER: SessionFocus[] = [
  'olympic',
  'lower',
  'upper',
  'gymnastics',
  'conditioning',
  'endurance',
  'core',
  'strongman',
];

export const SESSION_FOCUS_LABELS: Record<SessionFocus, string> = {
  olympic: 'Olympic Lifting',
  lower: 'Lower Body',
  upper: 'Upper Body',
  gymnastics: 'Gymnastics',
  conditioning: 'Conditioning',
  endurance: 'Endurance',
  core: 'Core & Midline',
  strongman: 'Strongman',
};

export const SESSION_FOCUS_SHORT: Record<SessionFocus, string> = {
  olympic: 'Olympic',
  lower: 'Lower',
  upper: 'Upper',
  gymnastics: 'Gymnastics',
  conditioning: 'Conditioning',
  endurance: 'Endurance',
  core: 'Core',
  strongman: 'Strongman',
};

/** Compact human label for a set of focuses, e.g. "Olympic + Gymnastics + Core". */
export function focusesLabel(focuses: SessionFocus[] | undefined): string {
  if (!focuses || focuses.length === 0) return 'Full Session';
  return SESSION_FOCUS_ORDER.filter((f) => focuses.includes(f))
    .map((f) => SESSION_FOCUS_SHORT[f])
    .join(' + ');
}

/** Stable string signature for a focus set (used for the indexed `day` column). */
export function focusesSignature(focuses: SessionFocus[]): string {
  return [...focuses].sort().join('+') || 'none';
}

/** Derives focuses from a legacy `day` token so old records keep working. */
export function focusesFromLegacyDay(day: TrainingDay | undefined): SessionFocus[] {
  return day === 'thursday' ? ['upper', 'gymnastics'] : ['lower', 'olympic'];
}

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
