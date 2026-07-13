import type { GeneratedWorkout, KnowledgeSource } from '@/domain';
import { requireSupabase } from '@/lib/supabase';

/**
 * Phase 2 — source-grounded AI coach.
 *
 * The athlete's knowledge sources (those with pasted/ingested `content`) plus a
 * plain-text brief of the generated session are sent to the `explain-workout`
 * Supabase Edge Function, which calls the Claude API with the Citations feature
 * and returns reasoning grounded in — and quoting — those sources. The Anthropic
 * API key lives only as a Supabase secret, never in this frontend bundle.
 */

export interface CoachCitation {
  title: string;
  citedText: string;
}

export interface CoachExplanation {
  answer: string;
  citations: CoachCitation[];
  model?: string;
}

/** Sources the coach can actually cite — only those with ingested text. */
export function citableSources(sources: KnowledgeSource[]): KnowledgeSource[] {
  return sources.filter((s) => (s.content ?? '').trim().length > 0);
}

/** Compact, plain-text description of the generated session for the model. */
export function buildWorkoutBrief(workout: GeneratedWorkout): string {
  const lines: string[] = [
    `Focus: ${workout.focus}`,
    `Szacowany czas: ${workout.estimatedDurationMinutes} min`,
  ];
  if (workout.rationale) lines.push(`Notatka silnika: ${workout.rationale}`);

  for (const section of Object.values(workout.sections)) {
    if (!section.items.length) continue;
    const cap = section.timeCapMinutes != null ? ` (${section.timeCapMinutes} min)` : '';
    lines.push('', `## ${section.title}${cap}`);
    for (const item of section.items) {
      const load =
        item.prescribedWeightKg != null
          ? ` @ ${item.prescribedWeightKg}kg${item.weightPerHand ? '/ręka' : ''}`
          : '';
      lines.push(`- ${item.exerciseName}: ${item.prescription}${load}`);
    }
  }
  return lines.join('\n');
}

// Keep the request (and cost) bounded; Phase 2B moves selection server-side via embeddings.
const MAX_SOURCES = 12;
const MAX_CHARS_PER_SOURCE = 6000;

export async function explainWorkout(
  workout: GeneratedWorkout,
  sources: KnowledgeSource[]
): Promise<CoachExplanation> {
  const usable = citableSources(sources)
    .slice(0, MAX_SOURCES)
    .map((s) => ({
      title: [s.title, s.author].filter(Boolean).join(' — '),
      content: (s.content ?? '').slice(0, MAX_CHARS_PER_SOURCE),
    }));

  const { data, error } = await requireSupabase().functions.invoke('explain-workout', {
    body: { brief: buildWorkoutBrief(workout), focus: workout.focus, sources: usable },
  });
  if (error) throw error;
  if (data?.error) throw new Error(String(data.error));

  return {
    answer: String(data?.answer ?? '').trim(),
    citations: Array.isArray(data?.citations) ? (data.citations as CoachCitation[]) : [],
    model: data?.model,
  };
}
