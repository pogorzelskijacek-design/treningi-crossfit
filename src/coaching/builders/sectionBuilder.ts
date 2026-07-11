import type {
  Exercise,
  ExerciseCategory,
  MovementPattern,
  OlympicLiftProgression,
  TrainingDay,
  UserProfile,
  WodFormat,
  WorkoutLog,
  WorkoutSection,
} from '@/domain';
import { OLYMPIC_LIFT_LABELS } from '@/domain';
import type { WorkoutSectionItem } from '@/domain';
import { resolveOlympicWorkingWeight } from '@/data';
import type { SorenessExclusions, VolumeIntensityAdjustment } from '../types';
import type { PostHyroxResult } from '../rules/postHyroxRule';
import type { LiftProgressionSuggestion } from '../rules/liftProgression';
import { filterExercises, pickExercisesForSection } from '../selectors/exerciseSelectors';
import {
  parseTargetReps,
  progressLoad,
  resolvePrescribedLoad,
  scaleMinutes,
  scaleSets,
  toSectionItem,
  wodBaseMinutes,
} from './prescriptionHelpers';
import { SECTION_MINUTES } from '../constants';

function preferPatterns(candidates: Exercise[], patterns: MovementPattern[], minCount = 3): Exercise[] {
  const biased = candidates.filter((c) => c.movementPattern.some((p) => patterns.includes(p)));
  return biased.length >= minCount ? biased : candidates;
}

export interface SectionBuilderInput {
  day: TrainingDay;
  exerciseLibrary: Exercise[];
  profile: UserProfile;
  recentSessionsThisDay: WorkoutLog[];
  /** Full log history (all days), used to progress load off proven results. */
  history: WorkoutLog[];
  adjustment: VolumeIntensityAdjustment;
  soreness: SorenessExclusions;
  postHyrox: PostHyroxResult;
  olympicLiftProgression?: OlympicLiftProgression;
  liftProgressionSuggestion?: LiftProgressionSuggestion;
  wodFormat: WodFormat;
}

/**
 * Builds a section item, attaching a concrete prescribed weight when the
 * exercise is loaded (barbell/dumbbell/kettlebell with a known working weight).
 * Bodyweight/machine items fall back to a qualitative load note.
 */
function loadedItem(
  exercise: Exercise,
  prescription: string,
  opts: { sets?: number; reps?: string },
  input: SectionBuilderInput
): WorkoutSectionItem {
  const load = resolvePrescribedLoad(exercise, input.profile, input.adjustment.intensityMultiplier, input.history);
  const item = toSectionItem(exercise, prescription, {
    sets: opts.sets,
    reps: opts.reps,
    targetReps: parseTargetReps(opts.reps),
  });
  if (load.weightKg != null) {
    item.prescribedWeightKg = load.weightKg;
    item.weightPerHand = load.weightPerHand;
    item.loadNote = load.note;
  }
  return item;
}

const LOWER_BODY_PATTERNS: MovementPattern[] = ['squat', 'hinge', 'lunge', 'jump', 'carry'];
const UPPER_BODY_PATTERNS: MovementPattern[] = [
  'push_horizontal',
  'push_vertical',
  'pull_horizontal',
  'pull_vertical',
  'gymnastics_pull',
  'gymnastics_push',
];
const CORE_PATTERNS: MovementPattern[] = ['core_flexion', 'core_rotation', 'core_anti_extension'];

export function buildSections(input: SectionBuilderInput): {
  warmup: WorkoutSection;
  skill: WorkoutSection;
  strength: WorkoutSection;
  wod: WorkoutSection;
  accessories: WorkoutSection;
  cooldown: WorkoutSection;
} {
  return {
    warmup: buildWarmup(input),
    skill: buildSkill(input),
    strength: buildStrength(input),
    wod: buildWod(input),
    accessories: buildAccessories(input),
    cooldown: buildCooldown(input),
  };
}

function baseFilterOptions(input: SectionBuilderInput) {
  return {
    availableEquipment: input.profile.availableEquipment,
    excludedMuscles: input.soreness.excludedMuscles,
    excludedPatterns: input.soreness.excludedPatterns,
  };
}

function buildWarmup(input: SectionBuilderInput): WorkoutSection {
  const { day, exerciseLibrary, recentSessionsThisDay } = input;
  const candidates = filterExercises(exerciseLibrary, {
    section: 'warmup',
    ...baseFilterOptions(input),
  });
  const biasPatterns = day === 'tuesday' ? LOWER_BODY_PATTERNS : UPPER_BODY_PATTERNS;
  const pool = preferPatterns(candidates, biasPatterns);
  const picks = pickExercisesForSection(pool, 'warmup', recentSessionsThisDay, exerciseLibrary, 4);

  return {
    type: 'warmup',
    title: 'Warm-up',
    timeCapMinutes: SECTION_MINUTES.warmup,
    items: picks.map((ex) => toSectionItem(ex, '2 rounds x 8-10 reps (or ~30-45s), easy and controlled')),
  };
}

function buildSkill(input: SectionBuilderInput): WorkoutSection {
  const { day, exerciseLibrary, recentSessionsThisDay, adjustment, olympicLiftProgression, liftProgressionSuggestion } =
    input;

  if (day === 'tuesday' && olympicLiftProgression) {
    const sets = scaleSets(6, adjustment.volumeMultiplier, 3);
    const label = OLYMPIC_LIFT_LABELS[olympicLiftProgression];
    const baseWeight = resolveOlympicWorkingWeight(olympicLiftProgression, input.profile);
    const prescribedWeightKg =
      baseWeight != null
        ? progressLoad(olympicLiftProgression, baseWeight, 2.5, adjustment.intensityMultiplier, input.history).weightKg
        : undefined;
    return {
      type: 'skill',
      title: 'Skill — Olympic Lifting',
      items: [
        {
          exerciseId: olympicLiftProgression,
          exerciseName: label,
          prescription: `${sets} sets x 2-3 reps — technical work, not max effort`,
          sets,
          reps: '2-3',
          targetReps: 3,
          prescribedWeightKg,
          loadNote: liftProgressionSuggestion?.loadNote,
          notes: 'Focus: bar path, timing, receiving position — not maximum weight.',
        },
      ],
      timeCapMinutes: SECTION_MINUTES.skill.tuesday,
    };
  }

  const candidates = filterExercises(exerciseLibrary, {
    section: 'skill',
    categories: ['gymnastics'],
    ...baseFilterOptions(input),
  });
  const picks = pickExercisesForSection(candidates, 'skill', recentSessionsThisDay, exerciseLibrary, 1);

  return {
    type: 'skill',
    title: 'Skill — Gymnastics',
    items: picks.map((ex) =>
      toSectionItem(ex, '4-5 sets, technical focus over fatigue', {
        notes: ex.skillOnly ? 'Optional practice — only as much as feels clean and controlled.' : undefined,
      })
    ),
    timeCapMinutes: SECTION_MINUTES.skill.thursday,
  };
}

function buildStrength(input: SectionBuilderInput): WorkoutSection {
  const { day, exerciseLibrary, recentSessionsThisDay, adjustment } = input;
  const base = baseFilterOptions(input);
  // Hard exclusion here (not just a soft preference): the spec is explicit that
  // Tuesday's Strength block is lower body and Thursday's is upper body, so a
  // squat-pattern lift like Thruster must never fill Thursday's Strength slot.
  const opposingPatterns = day === 'tuesday' ? UPPER_BODY_PATTERNS : LOWER_BODY_PATTERNS;

  const candidates = filterExercises(exerciseLibrary, {
    section: 'strength',
    categories: day === 'tuesday' ? ['barbell', 'olympic_lifting'] : ['barbell', 'dumbbell'],
    ...base,
    excludedPatterns: [...base.excludedPatterns, ...opposingPatterns],
  });
  const picks = pickExercisesForSection(candidates, 'strength', recentSessionsThisDay, exerciseLibrary, 1);

  const sets = scaleSets(5, adjustment.volumeMultiplier, 3);

  return {
    type: 'strength',
    title: 'Strength',
    timeCapMinutes: SECTION_MINUTES.strength[day],
    items: picks.map((ex) => loadedItem(ex, `${sets} sets x 5 reps`, { sets, reps: '5' }, input)),
  };
}

function buildWod(input: SectionBuilderInput): WorkoutSection {
  const { day, exerciseLibrary, recentSessionsThisDay, adjustment, postHyrox, wodFormat } = input;

  const lowerBodyFriendlyCategories: ExerciseCategory[] = [
    'bodyweight',
    'gymnastics',
    'machine',
    'dumbbell',
    'kettlebell',
  ];
  const candidates = filterExercises(exerciseLibrary, {
    section: 'wod',
    categories: postHyrox.capLowerBodyWodLoad ? lowerBodyFriendlyCategories : undefined,
    ...baseFilterOptions(input),
  });

  // A WOD is full-body conditioning, so this is a soft bias (not a hard filter):
  // lean toward the day's focus plus always-appropriate conditioning/core work,
  // rather than banning the opposing focus outright (a few box jumps in a
  // Thursday WOD is fine — three heavy barbell squats are not).
  const wodBiasPatterns: MovementPattern[] =
    day === 'tuesday'
      ? [...LOWER_BODY_PATTERNS, ...CORE_PATTERNS, 'locomotion']
      : [...UPPER_BODY_PATTERNS, 'locomotion', 'core_flexion'];
  const pool = preferPatterns(candidates, wodBiasPatterns, 4);

  const movementCount = wodFormat === 'Tabata' || wodFormat === 'DeathBy' ? 2 : 3;
  const picks = pickExercisesForSection(pool, 'wod', recentSessionsThisDay, exerciseLibrary, movementCount);
  const timeCapMinutes = scaleMinutes(wodBaseMinutes(wodFormat), adjustment.volumeMultiplier);

  return {
    type: 'wod',
    title: `WOD — ${wodFormat}`,
    wodFormat,
    timeCapMinutes,
    items: picks.map((ex) => loadedItem(ex, wodItemPrescription(ex), { reps: wodRepsFor(ex) }, input)),
  };
}

function wodItemPrescription(exercise: Exercise): string {
  if (exercise.category === 'machine') return 'moderate pace for calories/meters';
  if (exercise.equipment.includes('none')) return '12-15 reps';
  return '8-12 reps';
}

function wodRepsFor(exercise: Exercise): string | undefined {
  if (exercise.category === 'machine') return undefined;
  if (exercise.equipment.includes('none')) return '12-15';
  return '8-12';
}

function buildAccessories(input: SectionBuilderInput): WorkoutSection {
  const { day, exerciseLibrary, recentSessionsThisDay, adjustment } = input;
  const patterns = day === 'tuesday' ? [...CORE_PATTERNS, 'hinge' as MovementPattern] : UPPER_BODY_PATTERNS;

  const candidates = filterExercises(exerciseLibrary, {
    section: 'accessories',
    ...baseFilterOptions(input),
  });
  const pool = preferPatterns(candidates, patterns);
  const picks = pickExercisesForSection(pool, 'accessories', recentSessionsThisDay, exerciseLibrary, 2);
  const sets = scaleSets(3, adjustment.volumeMultiplier, 2);

  return {
    type: 'accessories',
    title: 'Accessories',
    timeCapMinutes: SECTION_MINUTES.accessories,
    items: picks.map((ex) => loadedItem(ex, `${sets} sets x 10-12 reps`, { sets, reps: '10-12' }, input)),
  };
}

function buildCooldown(input: SectionBuilderInput): WorkoutSection {
  const { exerciseLibrary, recentSessionsThisDay } = input;
  const candidates = filterExercises(exerciseLibrary, {
    section: 'cooldown',
    ...baseFilterOptions(input),
  });
  const picks = pickExercisesForSection(candidates, 'cooldown', recentSessionsThisDay, exerciseLibrary, 3);

  return {
    type: 'cooldown',
    title: 'Cooldown',
    timeCapMinutes: SECTION_MINUTES.cooldown,
    items: picks.map((ex) => toSectionItem(ex, '60-90s per side/position, easy breathing')),
  };
}
