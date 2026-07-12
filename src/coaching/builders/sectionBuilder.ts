import type {
  Exercise,
  ExerciseCategory,
  MovementPattern,
  OlympicLiftProgression,
  SessionFocus,
  UserProfile,
  WodFormat,
  WorkoutLog,
  WorkoutSection,
  WorkoutSectionItem,
} from '@/domain';
import { OLYMPIC_LIFT_LABELS } from '@/domain';
import { resolveOlympicWorkingWeight } from '@/data';
import type { SorenessExclusions, VolumeIntensityAdjustment } from '../types';
import type { PostHyroxResult } from '../rules/postHyroxRule';
import type { LiftProgressionSuggestion } from '../rules/liftProgression';
import type { FocusHints } from '../focusHints';
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

function uniq<T>(items: T[]): T[] {
  return [...new Set(items)];
}

function preferPatterns(candidates: Exercise[], patterns: MovementPattern[], minCount = 3): Exercise[] {
  if (patterns.length === 0) return candidates;
  const biased = candidates.filter((c) => c.movementPattern.some((p) => patterns.includes(p)));
  return biased.length >= minCount ? biased : candidates;
}

export interface SectionBuilderInput {
  focuses: SessionFocus[];
  hints: FocusHints;
  exerciseLibrary: Exercise[];
  profile: UserProfile;
  /** Recent completed sessions sharing a focus — for rotation & movement-pattern de-duplication. */
  recentSessions: WorkoutLog[];
  /** Full log history (all sessions), used to progress load off proven results. */
  history: WorkoutLog[];
  adjustment: VolumeIntensityAdjustment;
  soreness: SorenessExclusions;
  postHyrox: PostHyroxResult;
  olympicLiftProgression?: OlympicLiftProgression;
  liftProgressionSuggestion?: LiftProgressionSuggestion;
  wodFormat: WodFormat;
}

function skillMinutes(hints: FocusHints): number {
  if (hints.skill === 'olympic') return SECTION_MINUTES.skillOlympic;
  if (hints.skill === 'gymnastics') return SECTION_MINUTES.skillGymnastics;
  return 0;
}

function strengthMinutes(hints: FocusHints): number {
  if (hints.skill === 'olympic') return SECTION_MINUTES.strengthWithOlympic;
  if (hints.skill === 'gymnastics') return SECTION_MINUTES.strengthDefault;
  return SECTION_MINUTES.strengthNoSkill;
}

/** Builds a section item, attaching a concrete prescribed weight for loaded lifts. */
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
  const { hints, exerciseLibrary, recentSessions } = input;
  const candidates = filterExercises(exerciseLibrary, { section: 'warmup', ...baseFilterOptions(input) });
  const bias = uniq([...hints.strengthPatterns, ...hints.wodPatterns]);
  const pool = preferPatterns(candidates, bias, 4);
  const picks = pickExercisesForSection(pool, 'warmup', recentSessions, exerciseLibrary, 4);

  return {
    type: 'warmup',
    title: 'Warm-up',
    timeCapMinutes: SECTION_MINUTES.warmup,
    items: picks.map((ex) => toSectionItem(ex, '2 rounds x 8-10 reps (or ~30-45s), easy and controlled')),
  };
}

function buildSkill(input: SectionBuilderInput): WorkoutSection {
  const { hints, exerciseLibrary, recentSessions, adjustment, olympicLiftProgression, liftProgressionSuggestion } =
    input;

  if (hints.skill === 'olympic' && olympicLiftProgression) {
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
      timeCapMinutes: skillMinutes(hints),
    };
  }

  if (hints.skill === 'gymnastics') {
    const candidates = filterExercises(exerciseLibrary, {
      section: 'skill',
      categories: ['gymnastics'],
      ...baseFilterOptions(input),
    });
    const picks = pickExercisesForSection(candidates, 'skill', recentSessions, exerciseLibrary, 1);
    return {
      type: 'skill',
      title: 'Skill — Gymnastics',
      items: picks.map((ex) =>
        toSectionItem(ex, '4-5 sets, technical focus over fatigue', {
          notes: ex.skillOnly ? 'Optional practice — only as much as feels clean and controlled.' : undefined,
        })
      ),
      timeCapMinutes: skillMinutes(hints),
    };
  }

  // No dedicated skill focus today — the time folds into strength/WOD.
  return { type: 'skill', title: 'Skill', items: [], timeCapMinutes: 0 };
}

const LOWER_STRENGTH: MovementPattern[] = ['squat', 'hinge', 'lunge'];
const UPPER_STRENGTH: MovementPattern[] = ['push_horizontal', 'push_vertical', 'pull_horizontal', 'pull_vertical'];

function buildStrength(input: SectionBuilderInput): WorkoutSection {
  const { hints, exerciseLibrary, recentSessions, adjustment } = input;
  const categories: ExerciseCategory[] = uniq([
    'barbell',
    'dumbbell',
    ...(hints.strengthCategories ?? []),
    ...(hints.skill === 'olympic' ? (['olympic_lifting'] as ExerciseCategory[]) : []),
  ]);

  // When a day is clearly upper- or lower-only, exclude the opposite group so an
  // upper day never gets a squat-pattern lift (e.g. a thruster) and vice versa.
  const wantsLower = hints.strengthPatterns.some((p) => LOWER_STRENGTH.includes(p));
  const wantsUpper = hints.strengthPatterns.some((p) => UPPER_STRENGTH.includes(p));
  const opposingPatterns = wantsUpper && !wantsLower ? LOWER_STRENGTH : wantsLower && !wantsUpper ? UPPER_STRENGTH : [];
  const base = baseFilterOptions(input);

  const candidates = filterExercises(exerciseLibrary, {
    section: 'strength',
    categories,
    ...base,
    excludedPatterns: [...base.excludedPatterns, ...opposingPatterns],
  });
  // Hard-bias to the focus's strength patterns so a Lower day gets a lower lift, etc.
  const inFocus = candidates.filter((ex) => ex.movementPattern.some((p) => hints.strengthPatterns.includes(p)));
  const pool = inFocus.length >= 1 ? inFocus : candidates;
  const picks = pickExercisesForSection(pool, 'strength', recentSessions, exerciseLibrary, 1);

  const sets = scaleSets(5, adjustment.volumeMultiplier, 3);
  return {
    type: 'strength',
    title: 'Strength',
    timeCapMinutes: strengthMinutes(hints),
    items: picks.map((ex) => loadedItem(ex, `${sets} sets x 5 reps`, { sets, reps: '5' }, input)),
  };
}

const WOD_CONDITIONING_CATEGORIES: ExerciseCategory[] = [
  'bodyweight',
  'gymnastics',
  'machine',
  'dumbbell',
  'kettlebell',
  'conditioning',
];

function buildWod(input: SectionBuilderInput): WorkoutSection {
  const { hints, exerciseLibrary, recentSessions, adjustment, postHyrox, wodFormat } = input;

  const candidates = filterExercises(exerciseLibrary, {
    section: 'wod',
    categories: postHyrox.capLowerBodyWodLoad ? WOD_CONDITIONING_CATEGORIES : undefined,
    ...baseFilterOptions(input),
  });

  // Soft bias toward the union of the day's WOD patterns (plus always-appropriate conditioning).
  const bias = uniq([...hints.wodPatterns, ...(['locomotion', 'core_flexion'] as MovementPattern[])]);
  const pool = preferPatterns(candidates, bias, 4);

  const movementCount = wodFormat === 'Tabata' || wodFormat === 'DeathBy' ? 2 : 3;
  const picks = pickExercisesForSection(pool, 'wod', recentSessions, exerciseLibrary, movementCount);

  let base = wodBaseMinutes(wodFormat);
  if (hints.wodStyle === 'sprint') base = Math.max(6, base - 3);
  if (hints.wodStyle === 'long') base += 6;
  const timeCapMinutes = scaleMinutes(base, adjustment.volumeMultiplier);

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
  const { hints, exerciseLibrary, recentSessions, adjustment } = input;
  const candidates = filterExercises(exerciseLibrary, { section: 'accessories', ...baseFilterOptions(input) });
  const pool = preferPatterns(candidates, hints.accessoryPatterns);
  const picks = pickExercisesForSection(pool, 'accessories', recentSessions, exerciseLibrary, 2);
  const sets = scaleSets(3, adjustment.volumeMultiplier, 2);

  return {
    type: 'accessories',
    title: 'Accessories',
    timeCapMinutes: SECTION_MINUTES.accessories,
    items: picks.map((ex) => loadedItem(ex, `${sets} sets x 10-12 reps`, { sets, reps: '10-12' }, input)),
  };
}

function buildCooldown(input: SectionBuilderInput): WorkoutSection {
  const { exerciseLibrary, recentSessions } = input;
  const candidates = filterExercises(exerciseLibrary, { section: 'cooldown', ...baseFilterOptions(input) });
  const picks = pickExercisesForSection(candidates, 'cooldown', recentSessions, exerciseLibrary, 3);

  return {
    type: 'cooldown',
    title: 'Cooldown',
    timeCapMinutes: SECTION_MINUTES.cooldown,
    items: picks.map((ex) => toSectionItem(ex, '60-90s per side/position, easy breathing')),
  };
}
