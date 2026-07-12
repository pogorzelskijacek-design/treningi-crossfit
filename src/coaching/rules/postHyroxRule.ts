import type { ReadinessCheckin, SessionFocus } from '@/domain';
import type { RuleTrace } from '../types';

export interface PostHyroxResult {
  capLowerBodyWodLoad: boolean;
  traces: RuleTrace[];
}

/**
 * On a lower-body-focused day that follows a completed Hyrox/leg session, cap
 * heavy lower-body WOD loading so that fatigue doesn't compound with fresh
 * squat/hinge/carry volume.
 */
export function postHyroxRule(focuses: SessionFocus[], checkin: ReadinessCheckin): PostHyroxResult {
  const lowerFocus = focuses.includes('lower') || focuses.includes('strongman');
  if (!lowerFocus || !checkin.previousWorkoutCompleted) {
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
