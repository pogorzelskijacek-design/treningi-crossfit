import type { WorkoutLog } from '@/domain';
import { focusesLabel } from '@/domain';

export interface LoggedSetSummary {
  bestWeightKg?: number;
  totalReps: number;
  totalVolumeKg: number;
  workingSets: number;
}

/** Aggregates completed sets across a logged workout for cards, stats, and charts. */
export function summarizeLog(log: WorkoutLog): LoggedSetSummary {
  let bestWeightKg: number | undefined;
  let totalReps = 0;
  let totalVolumeKg = 0;
  let workingSets = 0;

  for (const exercise of log.loggedExercises) {
    for (const set of exercise.sets) {
      if (!set.completed) continue;
      workingSets += 1;
      const reps = set.reps ?? 0;
      const weight = set.weightKg ?? 0;
      totalReps += reps;
      totalVolumeKg += reps * weight;
      if (weight > 0 && (bestWeightKg == null || weight > bestWeightKg)) {
        bestWeightKg = weight;
      }
    }
  }

  return { bestWeightKg, totalReps, totalVolumeKg, workingSets };
}

/** Human label for a logged session's focus set, e.g. "Lower + Olympic". */
export function sessionLabel(log: WorkoutLog): string {
  return focusesLabel(log.focuses);
}
