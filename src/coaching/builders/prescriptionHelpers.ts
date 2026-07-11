import type { Exercise, UserProfile, WodFormat, WorkoutLog, WorkoutSectionItem } from '@/domain';
import { resolveWorkingWeight, roundToStep } from '@/data';

export function scaleSets(baseSets: number, volumeMultiplier: number, min = 2): number {
  return Math.max(min, Math.round(baseSets * volumeMultiplier));
}

/** Lowest number in a rep prescription ("8-12" → 8, "5" → 5, "AMRAP" → undefined). */
export function parseTargetReps(reps?: string): number | undefined {
  if (!reps) return undefined;
  const match = reps.match(/\d+/);
  return match ? Number(match[0]) : undefined;
}

function loadStepFor(exercise: Exercise): number {
  return exercise.category === 'dumbbell' || exercise.category === 'kettlebell' ? 2 : 2.5;
}

function maxRpe(sets: { rpe?: number }[]): number | undefined {
  const rpes = sets.map((s) => s.rpe).filter((r): r is number => r != null);
  return rpes.length ? Math.max(...rpes) : undefined;
}

function lastAchievedWeight(exerciseId: string, history: WorkoutLog[]): { weight: number; clean: boolean } | undefined {
  const sorted = [...history].filter((l) => l.completed).sort((a, b) => b.date.localeCompare(a.date));
  for (const log of sorted) {
    const entry = log.loggedExercises.find((e) => e.exerciseId === exerciseId);
    if (!entry || entry.sets.length === 0) continue;
    const weights = entry.sets.map((s) => s.weightKg).filter((w): w is number => w != null);
    if (weights.length === 0) continue;
    const topWeight = Math.max(...weights);
    const allCompleted = entry.sets.every((s) => s.completed);
    const topRpe = maxRpe(entry.sets);
    // Technique gates progression when rated (Olympic work): a clean session is
    // completed at a sub-maximal RPE with solid technique.
    const technique = entry.techniqueRating;
    const clean = allCompleted && (topRpe == null || topRpe <= 8) && (technique == null || technique >= 4);
    return { weight: topWeight, clean };
  }
  return undefined;
}

export interface PrescribedLoad {
  weightKg?: number;
  weightPerHand?: boolean;
  note?: string;
}

/**
 * Core progression: anchor on the athlete's working weight, ratchet up by
 * proven history (a cleanly completed last session adds one step), then scale
 * by today's readiness. Shared by every loaded block, including Olympic work.
 */
export function progressLoad(
  exerciseId: string,
  profileBase: number,
  step: number,
  intensityMultiplier: number,
  history: WorkoutLog[]
): { weightKg: number; note: string } {
  const last = lastAchievedWeight(exerciseId, history);
  const progressed = last?.clean ?? false;
  const histBase = last ? (progressed ? last.weight + step : last.weight) : 0;
  const base = Math.max(profileBase, histBase);
  const weightKg = roundToStep(base * intensityMultiplier, step);

  let note: string;
  if (progressed && base === last!.weight + step) {
    note = `+${step} kg vs last session — you cleared it cleanly`;
  } else if (intensityMultiplier < 0.95) {
    note = `eased ~${Math.round((1 - intensityMultiplier) * 100)}% today for recovery`;
  } else if (intensityMultiplier > 1.02) {
    note = 'nudged up on strong recovery';
  } else if (last && !progressed) {
    note = 'holding load — clear all reps to progress next time';
  } else {
    note = 'your working weight';
  }
  return { weightKg, note };
}

/**
 * Resolves the concrete prescribed load for a loaded library exercise. Returns
 * no weight for bodyweight/machine work (nothing to load).
 */
export function resolvePrescribedLoad(
  exercise: Exercise,
  profile: UserProfile,
  intensityMultiplier: number,
  history: WorkoutLog[]
): PrescribedLoad {
  const profileBase = resolveWorkingWeight(exercise.id, profile);
  if (profileBase == null) return {};

  const { weightKg, note } = progressLoad(
    exercise.id,
    profileBase,
    loadStepFor(exercise),
    intensityMultiplier,
    history
  );

  return {
    weightKg,
    weightPerHand: exercise.category === 'dumbbell' || exercise.category === 'kettlebell',
    note,
  };
}

export function scaleMinutes(baseMinutes: number, volumeMultiplier: number, min = 6): number {
  return Math.max(min, Math.round(baseMinutes * volumeMultiplier));
}

export function describeLoad(intensityMultiplier: number): string {
  if (intensityMultiplier >= 1.05) return 'heavier than your recent baseline — push the load a little';
  if (intensityMultiplier >= 0.95) return 'standard working weight';
  if (intensityMultiplier >= 0.85) return 'moderate — hold weight steady, prioritize quality';
  return 'lighter than usual — focus on movement quality over load';
}

/**
 * Tuned so a full session (warmup + skill + strength + WOD + accessories +
 * cooldown) lands close to the ~60 minute target from the programming rules,
 * varying a little by format since that's realistic for a coached session.
 */
const WOD_BASE_MINUTES: Record<WodFormat, number> = {
  AMRAP: 12,
  EMOM: 14,
  ForTime: 14,
  Chipper: 15,
  Ladder: 10,
  DeathBy: 8,
  Intervals: 10,
  Tabata: 6,
};

export function wodBaseMinutes(format: WodFormat): number {
  return WOD_BASE_MINUTES[format];
}

export function toSectionItem(
  exercise: Exercise,
  prescription: string,
  extra?: Partial<WorkoutSectionItem>
): WorkoutSectionItem {
  return {
    exerciseId: exercise.id,
    exerciseName: exercise.name,
    prescription,
    ...extra,
  };
}
