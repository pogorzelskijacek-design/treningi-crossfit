import type { PersonalRecord, WorkoutLog } from '@/domain';
import { STANDARD_PR_LABELS } from '@/domain';
import { prTypeForExerciseId } from './prMapping';
import { newId } from './id';

export interface PrCandidate {
  type: string;
  label: string;
  valueKg: number;
  reps: number;
  exerciseName: string;
}

/**
 * Scans a logged workout for any set that beats the current best weight for a
 * tracked lift. Returns one candidate per lift (the heaviest completed set).
 */
export function detectPrCandidates(
  log: WorkoutLog,
  currentBests: Map<string, PersonalRecord>
): PrCandidate[] {
  const heaviestByType = new Map<string, PrCandidate>();

  for (const exercise of log.loggedExercises) {
    const prType = prTypeForExerciseId(exercise.exerciseId);
    if (!prType) continue;

    for (const set of exercise.sets) {
      if (!set.completed || set.weightKg == null || set.weightKg <= 0) continue;
      const existing = heaviestByType.get(prType);
      if (!existing || set.weightKg > existing.valueKg) {
        heaviestByType.set(prType, {
          type: prType,
          label: STANDARD_PR_LABELS[prType],
          valueKg: set.weightKg,
          reps: set.reps ?? 1,
          exerciseName: exercise.exerciseName,
        });
      }
    }
  }

  const candidates: PrCandidate[] = [];
  for (const candidate of heaviestByType.values()) {
    const currentBest = currentBests.get(candidate.type);
    if (!currentBest || candidate.valueKg > (currentBest.valueKg ?? 0)) {
      candidates.push(candidate);
    }
  }
  return candidates;
}

export function prCandidateToRecord(candidate: PrCandidate, date: string, workoutLogId: string): PersonalRecord {
  return {
    id: newId(),
    type: candidate.type,
    label: candidate.label,
    isCustom: false,
    valueKg: candidate.valueKg,
    reps: candidate.reps,
    date,
    workoutLogId,
  };
}
