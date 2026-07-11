import type { OlympicLiftProgression, WodFormat } from '@/domain';

/** Fixed order only matters for breaking ties between equally-stale options. */
export const OLYMPIC_LIFT_ROTATION: OlympicLiftProgression[] = [
  'HighHangPowerClean',
  'HangPowerClean',
  'HangClean',
  'TallClean',
  'MuscleClean',
  'CleanPull',
  'CleanDeadlift',
  'PauseClean',
  'TempoClean',
  'FrontSquat',
  'CleanComplex',
];

export const WOD_FORMAT_ROTATION: WodFormat[] = [
  'AMRAP',
  'EMOM',
  'ForTime',
  'Chipper',
  'Ladder',
  'DeathBy',
  'Intervals',
  'Tabata',
];
