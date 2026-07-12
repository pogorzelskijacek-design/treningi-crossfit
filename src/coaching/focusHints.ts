import type { ExerciseCategory, MovementPattern, SessionFocus } from '@/domain';

/**
 * How the selected focuses shape each block of the session. The engine unions
 * these across all focuses picked for the day, so e.g. "Olympic + Gymnastics +
 * Core" gets an Olympic skill block, gymnastics + core movements in the WOD, and
 * core accessories.
 */
export interface FocusHints {
  /** Which skill block to program (Olympic wins over gymnastics when both are picked). */
  skill?: 'olympic' | 'gymnastics';
  strengthPatterns: MovementPattern[];
  strengthCategories?: ExerciseCategory[];
  wodPatterns: MovementPattern[];
  accessoryPatterns: MovementPattern[];
  /** conditioning → shorter, punchier metcon; endurance → longer aerobic piece. */
  wodStyle?: 'sprint' | 'long';
}

const LOWER: MovementPattern[] = ['squat', 'hinge', 'lunge'];
const UPPER: MovementPattern[] = ['push_horizontal', 'push_vertical', 'pull_horizontal', 'pull_vertical'];
const GYM: MovementPattern[] = ['gymnastics_push', 'gymnastics_pull', 'gymnastics_hold'];
const CORE: MovementPattern[] = ['core_flexion', 'core_rotation', 'core_anti_extension'];
const MONO: MovementPattern[] = ['locomotion', 'jump'];

const PER_FOCUS: Record<SessionFocus, Partial<FocusHints>> = {
  olympic: {
    strengthPatterns: ['olympic_pull', 'olympic_catch', 'squat'],
    wodPatterns: [],
    accessoryPatterns: ['core_anti_extension', 'hinge'],
  },
  lower: {
    strengthPatterns: LOWER,
    wodPatterns: [...LOWER, 'jump'],
    accessoryPatterns: ['hinge', 'lunge', 'core_flexion'],
  },
  upper: {
    strengthPatterns: UPPER,
    wodPatterns: [...UPPER, ...GYM],
    accessoryPatterns: [...GYM, 'core_flexion'],
  },
  gymnastics: {
    strengthPatterns: [],
    wodPatterns: [...GYM, 'core_flexion'],
    accessoryPatterns: GYM,
  },
  conditioning: {
    strengthPatterns: [],
    wodPatterns: [...MONO, 'push_vertical', 'hinge', 'squat'],
    accessoryPatterns: CORE,
    wodStyle: 'sprint',
  },
  endurance: {
    strengthPatterns: [],
    wodPatterns: ['locomotion', 'lunge'],
    accessoryPatterns: ['core_anti_extension'],
    wodStyle: 'long',
  },
  core: {
    strengthPatterns: [],
    wodPatterns: ['core_flexion', 'core_rotation'],
    accessoryPatterns: CORE,
  },
  strongman: {
    strengthPatterns: ['carry', 'hinge'],
    strengthCategories: ['strongman'],
    wodPatterns: ['carry', 'locomotion'],
    accessoryPatterns: ['carry', 'core_anti_extension'],
  },
};

/** A sensible default strength pattern set when no strength-oriented focus was picked. */
const DEFAULT_STRENGTH: MovementPattern[] = ['squat', 'hinge', 'push_vertical', 'pull_vertical'];

function uniq<T>(items: T[]): T[] {
  return [...new Set(items)];
}

export function combineFocusHints(focuses: SessionFocus[]): FocusHints {
  const out: FocusHints = { strengthPatterns: [], wodPatterns: [], accessoryPatterns: [] };
  for (const focus of focuses) {
    const h = PER_FOCUS[focus];
    if (h.strengthPatterns) out.strengthPatterns.push(...h.strengthPatterns);
    if (h.strengthCategories) out.strengthCategories = uniq([...(out.strengthCategories ?? []), ...h.strengthCategories]);
    if (h.wodPatterns) out.wodPatterns.push(...h.wodPatterns);
    if (h.accessoryPatterns) out.accessoryPatterns.push(...h.accessoryPatterns);
    if (h.wodStyle) out.wodStyle = h.wodStyle;
  }
  out.skill = focuses.includes('olympic') ? 'olympic' : focuses.includes('gymnastics') ? 'gymnastics' : undefined;
  out.strengthPatterns = uniq(out.strengthPatterns);
  if (out.strengthPatterns.length === 0) out.strengthPatterns = [...DEFAULT_STRENGTH];
  out.wodPatterns = uniq(out.wodPatterns);
  out.accessoryPatterns = uniq(out.accessoryPatterns.length ? out.accessoryPatterns : CORE);
  return out;
}

export function hasFocus(focuses: SessionFocus[], focus: SessionFocus): boolean {
  return focuses.includes(focus);
}
