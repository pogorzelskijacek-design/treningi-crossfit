import type { OlympicLiftProgression, WorkoutLog } from '@/domain';
import type { RuleTrace } from '../types';

export interface LiftProgressionSuggestion {
  loadNote: string;
  trace?: RuleTrace;
}

/**
 * Looks at the most recent session where this exact lift progression was
 * logged (matched by exerciseId === progression on the skill-block entry)
 * and proposes a simple next-session load note. This is a lightweight
 * heuristic, not a percentage-based program — technique quality gates
 * whether load goes up at all.
 */
export function suggestLiftProgression(
  progression: OlympicLiftProgression,
  history: WorkoutLog[]
): LiftProgressionSuggestion {
  const priorSessions = [...history]
    .filter((log) => log.completed)
    .sort((a, b) => b.date.localeCompare(a.date));

  for (const log of priorSessions) {
    const entry = log.loggedExercises.find((e) => e.exerciseId === progression);
    if (!entry || entry.sets.length === 0) continue;

    const lastSet = entry.sets[entry.sets.length - 1];
    const lastWeight = lastSet?.weightKg;
    const rpe = lastSet?.rpe;
    const technique = entry.techniqueRating;

    if (lastWeight == null) {
      return { loadNote: 'Build to a confident working weight, prioritizing bar path over load.' };
    }

    if (technique != null && technique <= 2) {
      return {
        loadNote: `Same weight as last time (${lastWeight}kg) — technique was rated ${technique}/5, so dial in positioning before adding load.`,
        trace: {
          rule: 'lift-progression',
          effect: `Held load steady on this progression after a low technique rating last session.`,
        },
      };
    }

    if (technique != null && technique >= 4 && rpe != null && rpe <= 8) {
      const nextWeight = Math.round((lastWeight + 2.5) * 2) / 2;
      return {
        loadNote: `+2.5kg from last session (${lastWeight}kg → ${nextWeight}kg) — technique and effort both looked solid.`,
        trace: {
          rule: 'lift-progression',
          effect: `Progressed load on this lift after a clean, controlled session last time.`,
        },
      };
    }

    return { loadNote: `Repeat last session's working weight (${lastWeight}kg) and aim for cleaner reps.` };
  }

  return { loadNote: 'First time programming this progression — start light and build to a technical working weight.' };
}
