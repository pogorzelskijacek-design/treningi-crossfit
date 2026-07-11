import type { OlympicLiftProgression, UserProfile } from '@/domain';

/**
 * Built-in baseline *working* weights (kg) per exercise id — the load an
 * advanced ~93kg athlete would use for quality strength work (roughly
 * 70–80% intensity), NOT a 1-rep max. The athlete overrides any of these in
 * their profile (`profile.workingWeights`); the engine uses the resolved
 * value as the default prescribed load and applies readiness + progression on
 * top. Dumbbell/kettlebell values are per implement (per hand).
 */
export const DEFAULT_WORKING_WEIGHTS: Record<string, number> = {
  // Barbell — squat & hinge
  'back-squat': 110,
  'front-squat': 90,
  'overhead-squat': 55,
  deadlift: 130,
  'sumo-deadlift': 130,
  'romanian-deadlift': 100,
  'good-morning': 60,
  'box-squat': 100,
  'deficit-deadlift': 110,
  // Barbell — press & pull
  thruster: 60,
  'push-press': 70,
  'push-jerk': 75,
  'split-jerk': 80,
  'strict-press': 55,
  'bench-press': 90,
  'incline-bench-press': 75,
  'barbell-row': 75,
  // Barbell — clean family
  'power-clean': 75,
  'squat-clean': 80,
  'hang-clean': 70,
  'clean-pull': 95,
  'muscle-clean': 55,
  // Dumbbell (per hand)
  'devil-press': 22,
  'dumbbell-snatch': 30,
  'dumbbell-clean': 26,
  'dumbbell-thruster': 22,
  'dumbbell-walking-lunge': 26,
  'dumbbell-bench-press': 34,
  'dumbbell-incline-bench-press': 30,
  'single-arm-dumbbell-row': 36,
  'dumbbell-push-press': 26,
  'dumbbell-front-squat': 28,
  'dumbbell-romanian-deadlift': 32,
  'renegade-row': 22,
  // Kettlebell (per implement)
  'kettlebell-swing-russian': 32,
  'kettlebell-swing-american': 28,
  'kettlebell-clean': 24,
  'kettlebell-snatch': 24,
  'turkish-get-up': 24,
  'kettlebell-goblet-squat': 32,
  'kettlebell-clean-and-jerk': 24,
  'kettlebell-front-rack-lunge': 20,
  'kettlebell-single-arm-row': 28,
};

/** The clean-family lift the Olympic technique block scales its load from. */
const OLYMPIC_BASE_LIFT_ID = 'power-clean';

/**
 * Working weight for each Olympic technique progression, expressed as a
 * fraction of the athlete's power-clean working weight. Reflects how heavy
 * each variation runs (a Clean Deadlift is heavier than a full clean; a Tall
 * or Muscle Clean is deliberately light and fast). Technique work stays sub-
 * maximal per the athlete's priority on movement quality over load.
 */
export const OLYMPIC_PROGRESSION_WEIGHT_FACTORS: Record<OlympicLiftProgression, number> = {
  HighHangPowerClean: 0.55,
  HangPowerClean: 0.65,
  HangClean: 0.7,
  TallClean: 0.45,
  MuscleClean: 0.5,
  CleanPull: 1.05,
  CleanDeadlift: 1.15,
  PauseClean: 0.7,
  TempoClean: 0.65,
  FrontSquat: 1.1,
  CleanComplex: 0.75,
};

export function roundToStep(weight: number, step = 2.5): number {
  return Math.round(weight / step) * step;
}

/** Resolves an exercise's baseline working weight: profile override → built-in default → undefined. */
export function resolveWorkingWeight(exerciseId: string, profile: UserProfile): number | undefined {
  const override = profile.workingWeights?.[exerciseId];
  if (override != null && override > 0) return override;
  return DEFAULT_WORKING_WEIGHTS[exerciseId];
}

/** Resolves the technique-block working weight for an Olympic progression from the power-clean base. */
export function resolveOlympicWorkingWeight(
  progression: OlympicLiftProgression,
  profile: UserProfile
): number | undefined {
  const base = resolveWorkingWeight(OLYMPIC_BASE_LIFT_ID, profile);
  if (base == null) return undefined;
  return roundToStep(base * OLYMPIC_PROGRESSION_WEIGHT_FACTORS[progression]);
}

/** Curated lifts surfaced in the profile "Working weights" editor, grouped for readability. */
export interface ReferenceLiftGroup {
  title: string;
  exerciseIds: string[];
}

export const REFERENCE_LIFT_GROUPS: ReferenceLiftGroup[] = [
  {
    title: 'Squat & hinge',
    exerciseIds: ['back-squat', 'front-squat', 'overhead-squat', 'deadlift', 'romanian-deadlift'],
  },
  {
    title: 'Press & pull',
    exerciseIds: ['bench-press', 'strict-press', 'push-press', 'push-jerk', 'barbell-row'],
  },
  {
    title: 'Clean family',
    exerciseIds: ['power-clean', 'squat-clean', 'hang-clean', 'clean-pull'],
  },
  {
    title: 'Dumbbell (per hand)',
    exerciseIds: [
      'dumbbell-bench-press',
      'single-arm-dumbbell-row',
      'dumbbell-push-press',
      'dumbbell-walking-lunge',
    ],
  },
];
