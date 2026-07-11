import type {
  Exercise,
  EquipmentType,
  ExerciseCategory,
  MovementPattern,
  MuscleGroup,
  WorkoutLog,
  WorkoutSectionType,
} from '@/domain';
import { getRecentlyUsedPatterns } from '../rotation/movementPatternRotation';

const NEVER_USED_RECENCY = 100;
const RECENT_PATTERN_PENALTY = 50;

export interface ExerciseFilterOptions {
  section: WorkoutSectionType;
  availableEquipment: EquipmentType[];
  categories?: ExerciseCategory[];
  excludedMuscles?: MuscleGroup[];
  excludedPatterns?: MovementPattern[];
  excludeExerciseIds?: string[];
}

/** Hard filter: section fit, equipment on hand, injury exclusions, skill-only gating. */
export function filterExercises(library: Exercise[], options: ExerciseFilterOptions): Exercise[] {
  return library.filter((exercise) => {
    if (!exercise.sections.includes(options.section)) return false;
    if (exercise.skillOnly && options.section !== 'skill') return false;
    if (options.categories && !options.categories.includes(exercise.category)) return false;
    if (options.excludeExerciseIds?.includes(exercise.id)) return false;

    const equipmentAvailable = exercise.equipment.some(
      (eq) => eq === 'none' || options.availableEquipment.includes(eq)
    );
    if (!equipmentAvailable) return false;

    const allMuscles = [...exercise.primaryMuscles, ...(exercise.secondaryMuscles ?? [])];
    if (options.excludedMuscles?.some((m) => allMuscles.includes(m))) return false;
    if (options.excludedPatterns?.some((p) => exercise.movementPattern.includes(p))) return false;

    return true;
  });
}

function exerciseRecency(exercise: Exercise, sectionType: WorkoutSectionType, sessions: WorkoutLog[]): number {
  const index = sessions.findIndex((log) =>
    log.loggedExercises.some((e) => e.sectionType === sectionType && e.exerciseId === exercise.id)
  );
  return index === -1 ? NEVER_USED_RECENCY : index;
}

/**
 * Deterministically ranks candidates by how long it's been since this exact
 * exercise (or its movement pattern) was used in this section, then picks the
 * single best slot filler. Never-used exercises are treated as maximally stale;
 * a recently-used movement pattern is a soft penalty, not a hard exclusion.
 * `extraPenalizedPatterns` lets a multi-slot fill (see pickExercisesForSection)
 * penalize patterns already chosen for an earlier slot in the same workout, so
 * a single WOD doesn't land on three different squat variations back to back.
 */
export function pickExerciseForSlot(
  candidates: Exercise[],
  sectionType: WorkoutSectionType,
  recentSessions: WorkoutLog[],
  exerciseLibrary: Exercise[],
  excludeIdsThisWorkout: string[] = [],
  extraPenalizedPatterns: ReadonlySet<MovementPattern> = new Set()
): Exercise | undefined {
  const available = candidates.filter((c) => !excludeIdsThisWorkout.includes(c.id));
  if (available.length === 0) return undefined;

  const recentPatterns = getRecentlyUsedPatterns(recentSessions, sectionType, exerciseLibrary);

  let best = available[0];
  let bestScore = -Infinity;
  for (const exercise of available) {
    const recency = exerciseRecency(exercise, sectionType, recentSessions);
    const usesRecentPattern = exercise.movementPattern.some((p) => recentPatterns.has(p));
    const usesPatternAlreadyPickedThisWorkout = exercise.movementPattern.some((p) => extraPenalizedPatterns.has(p));
    const penalty =
      (usesRecentPattern ? RECENT_PATTERN_PENALTY : 0) + (usesPatternAlreadyPickedThisWorkout ? RECENT_PATTERN_PENALTY : 0);
    const score = recency - penalty;
    if (score > bestScore) {
      bestScore = score;
      best = exercise;
    }
  }
  return best;
}

/** Fills `count` distinct slots in a section, each pick excluding what came before and de-prioritizing repeated patterns. */
export function pickExercisesForSection(
  candidates: Exercise[],
  sectionType: WorkoutSectionType,
  recentSessions: WorkoutLog[],
  exerciseLibrary: Exercise[],
  count: number
): Exercise[] {
  const picked: Exercise[] = [];
  const pickedPatterns = new Set<MovementPattern>();
  for (let i = 0; i < count; i++) {
    const next = pickExerciseForSlot(
      candidates,
      sectionType,
      recentSessions,
      exerciseLibrary,
      picked.map((e) => e.id),
      pickedPatterns
    );
    if (!next) break;
    picked.push(next);
    next.movementPattern.forEach((p) => pickedPatterns.add(p));
  }
  return picked;
}
