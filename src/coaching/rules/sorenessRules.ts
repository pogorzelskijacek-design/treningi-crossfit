import type { MovementPattern, MuscleGroup, ReadinessCheckin, UserProfile } from '@/domain';
import type { SorenessExclusions } from '../types';

interface InjuryKeywordRule {
  keywords: string[];
  excludedMuscles: MuscleGroup[];
  excludedPatterns: MovementPattern[];
}

const INJURY_KEYWORD_RULES: InjuryKeywordRule[] = [
  {
    keywords: ['shoulder'],
    excludedMuscles: ['shoulders'],
    excludedPatterns: ['push_vertical', 'gymnastics_push', 'gymnastics_hold'],
  },
  {
    keywords: ['knee'],
    excludedMuscles: ['quads'],
    excludedPatterns: ['squat', 'lunge', 'jump'],
  },
  {
    keywords: ['lower back', 'lumbar', 'back pain', 'lower-back'],
    excludedMuscles: ['lower_back'],
    excludedPatterns: ['hinge'],
  },
  {
    keywords: ['wrist'],
    excludedMuscles: ['forearms'],
    excludedPatterns: ['olympic_catch'],
  },
  {
    keywords: ['elbow'],
    excludedMuscles: ['triceps', 'biceps'],
    excludedPatterns: ['pull_vertical', 'push_horizontal'],
  },
  {
    keywords: ['hip'],
    excludedMuscles: ['glutes'],
    excludedPatterns: ['squat', 'hinge', 'lunge'],
  },
  {
    keywords: ['ankle'],
    excludedMuscles: ['calves'],
    excludedPatterns: ['jump', 'locomotion'],
  },
  {
    keywords: ['neck'],
    excludedMuscles: ['traps'],
    excludedPatterns: ['gymnastics_hold'],
  },
];

function unique<T>(items: T[]): T[] {
  return [...new Set(items)];
}

/**
 * Keyword-matches today's pain/injury free text plus persistent profile injuries
 * against a small mapping to targeted muscle/pattern exclusions. Not NLP — just
 * enough to keep an aggravated joint out of today's programming.
 */
export function sorenessRules(checkin: ReadinessCheckin, profile: UserProfile): SorenessExclusions {
  const sources = [checkin.painOrInjuries, ...profile.injuries]
    .filter(Boolean)
    .map((s) => s.toLowerCase());

  const excludedMuscles: MuscleGroup[] = [];
  const excludedPatterns: MovementPattern[] = [];
  const matchedLabels: string[] = [];

  for (const rule of INJURY_KEYWORD_RULES) {
    const matched = sources.some((source) => rule.keywords.some((kw) => source.includes(kw)));
    if (matched) {
      excludedMuscles.push(...rule.excludedMuscles);
      excludedPatterns.push(...rule.excludedPatterns);
      matchedLabels.push(rule.keywords[0]);
    }
  }

  const traces =
    matchedLabels.length > 0
      ? [
          {
            rule: 'soreness-injury',
            effect: `Noted concern around ${matchedLabels.join(', ')} — avoiding movements that load that area today.`,
          },
        ]
      : [];

  return {
    excludedMuscles: unique(excludedMuscles),
    excludedPatterns: unique(excludedPatterns),
    traces,
  };
}
