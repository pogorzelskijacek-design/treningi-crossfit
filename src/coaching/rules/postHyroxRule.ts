import type { ReadinessCheckin, TrainingDay } from '@/domain';
import type { RuleTrace } from '../types';

export interface PostHyroxResult {
  capLowerBodyWodLoad: boolean;
  traces: RuleTrace[];
}

/**
 * Tuesday always follows Monday's coach-led Hyrox class. If the athlete
 * confirms they completed it, cap heavy lower-body WOD loading today so
 * Hyrox fatigue doesn't compound with fresh squat/hinge/carry volume.
 */
export function postHyroxRule(day: TrainingDay, checkin: ReadinessCheckin): PostHyroxResult {
  if (day !== 'tuesday' || !checkin.previousWorkoutCompleted) {
    return { capLowerBodyWodLoad: false, traces: [] };
  }

  return {
    capLowerBodyWodLoad: true,
    traces: [
      {
        rule: 'post-hyrox',
        effect:
          "You completed Monday's Hyrox class, so today's WOD favors moderate loading on the legs instead of adding heavy fresh volume on top.",
      },
    ],
  };
}
