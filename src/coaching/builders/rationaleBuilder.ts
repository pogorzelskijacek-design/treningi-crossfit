import type { OlympicLiftProgression, SessionFocus, WodFormat } from '@/domain';
import { OLYMPIC_LIFT_LABELS, WOD_FORMAT_LABELS, focusesLabel } from '@/domain';
import type { RuleTrace } from '../types';

export function buildRationale(
  focuses: SessionFocus[],
  traces: RuleTrace[],
  wodFormat: WodFormat,
  olympicLiftProgression?: OlympicLiftProgression
): string {
  const sentences: string[] = [];

  sentences.push(`Today's focus: ${focusesLabel(focuses)}.`);

  if (traces.length === 0) {
    sentences.push("You're fresh and recovered, so today follows your standard programming.");
  } else {
    sentences.push(...traces.map((t) => t.effect));
  }

  if (olympicLiftProgression) {
    sentences.push(
      `Today's Olympic lifting focus is ${OLYMPIC_LIFT_LABELS[olympicLiftProgression]}, rotated in so your clean work doesn't repeat the same variation session after session.`
    );
  }

  const formatLabel = WOD_FORMAT_LABELS[wodFormat];
  const article = /^[aeiou]/i.test(formatLabel) ? 'an' : 'a';
  sentences.push(`The WOD uses ${article} ${formatLabel} format to keep the conditioning stimulus varied.`);

  return sentences.join(' ');
}
