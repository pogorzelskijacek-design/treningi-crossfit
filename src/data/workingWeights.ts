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
  // Extended barbell / olympic
  'clean-and-jerk': 80,
  'power-clean-and-jerk': 75,
  'power-snatch': 60,
  'floor-press': 80,
  'close-grip-bench-press': 75,
  'z-press': 45,
  'snatch-grip-deadlift': 110,
  'pendlay-row': 70,
  'front-rack-barbell-lunge': 60,
  'back-rack-barbell-lunge': 70,
  'overhead-barbell-lunge': 40,
  'pause-back-squat': 100,
  'tempo-front-squat': 80,
  'zercher-squat': 85,
  'barbell-hip-thrust': 100,
  'bradford-press': 40,
  // Extended dumbbell (per hand)
  'dumbbell-push-jerk': 24,
  'dumbbell-power-clean': 24,
  'dumbbell-hang-clean': 24,
  'dumbbell-clean-and-jerk': 22,
  'dumbbell-overhead-squat': 22,
  'dumbbell-goblet-squat': 30,
  'dumbbell-step-up': 22,
  'dumbbell-box-step-over': 22,
  'dumbbell-bulgarian-split-squat': 20,
  'dumbbell-single-leg-rdl': 20,
  'dumbbell-floor-press': 30,
  'dumbbell-bicep-curl': 15,
  'dumbbell-hammer-curl': 15,
  'dumbbell-skullcrusher': 12,
  'gorilla-row': 28,
  'dumbbell-farmers-carry': 34,
  // Extended kettlebell (per implement)
  'kettlebell-thruster': 24,
  'kettlebell-push-press': 24,
  'kettlebell-deadlift': 32,
  'kettlebell-goblet-lunge': 24,
  'kettlebell-windmill': 16,
  'kettlebell-suitcase-carry': 32,
  'kettlebell-overhead-carry': 24,
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
