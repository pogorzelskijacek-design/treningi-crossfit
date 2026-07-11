import type { OlympicLiftProgression, TrainingDay, WodFormat } from '@/domain';
import { OLYMPIC_LIFT_LABELS, WOD_FORMAT_LABELS } from '@/domain';
import type { RuleTrace } from '../types';

export function buildRationale(
  day: TrainingDay,
  traces: RuleTrace[],
  wodFormat: WodFormat,
  olympicLiftProgression?: OlympicLiftProgression
): string {
  const sentences: string[] = [];

  if (traces.length === 0) {
    sentences.push("You're fresh and recovered, so today follows your standard programming.");
  } else {
    sentences.push(...traces.map((t) => t.effect));
  }

  if (day === 'tuesday' && olympicLiftProgression) {
    sentences.push(
      `Today's Olympic lifting focus is ${OLYMPIC_LIFT_LABELS[olympicLiftProgression]}, rotated in so your clean work doesn't repeat the same variation session after session.`
    );
  }

  const formatLabel = WOD_FORMAT_LABELS[wodFormat];
  const article = /^[aeiou]/i.test(formatLabel) ? 'an' : 'a';
  sentences.push(`The WOD uses ${article} ${formatLabel} format to keep the conditioning stimulus varied.`);

  return sentences.join(' ');
}
