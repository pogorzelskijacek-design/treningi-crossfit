import type { EquipmentType } from './exercise';
import type { SessionFocus } from './trainingDay';
import { focusesLabel } from './trainingDay';

export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced';

export const EXPERIENCE_LABELS: Record<ExperienceLevel, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
};

export type Goal =
  | 'hyrox_performance'
  | 'crossfit_performance'
  | 'strength'
  | 'olympic_lifting_technique'
  | 'work_capacity'
  | 'mobility'
  | 'athletic_physique'
  | 'fat_loss';

export const GOAL_LABELS: Record<Goal, string> = {
  hyrox_performance: 'Hyrox performance',
  crossfit_performance: 'CrossFit performance',
  strength: 'Strength',
  olympic_lifting_technique: 'Olympic lifting technique',
  work_capacity: 'Work capacity',
  mobility: 'Mobility',
  athletic_physique: 'Athletic, muscular physique',
  fat_loss: 'Reduce body fat',
};

export type DayKind = 'rest' | 'hyrox_class' | 'team_wod_optional' | 'generated';

/**
 * What a given weekday is. A `generated` day is one the app programs and carries
 * one or more focuses; how many generated days there are is the user's "training
 * days per week". Non-generated days (external Hyrox class, team WOD, rest) aren't programmed.
 */
export type DayPlan =
  | { kind: 'rest' }
  | { kind: 'hyrox_class' }
  | { kind: 'team_wod_optional' }
  | { kind: 'generated'; focuses: SessionFocus[] };

export const DAY_KIND_LABELS: Record<Exclude<DayKind, 'generated'>, string> = {
  rest: 'Rest',
  hyrox_class: 'Hyrox class',
  team_wod_optional: 'Team WOD (optional)',
};

export function isGeneratedPlan(plan: DayPlan): plan is { kind: 'generated'; focuses: SessionFocus[] } {
  return plan.kind === 'generated';
}

export function dayPlanFocuses(plan: DayPlan): SessionFocus[] {
  return plan.kind === 'generated' ? plan.focuses : [];
}

/** Short label for any day plan (focus set for generated days). */
export function dayPlanLabel(plan: DayPlan): string {
  return plan.kind === 'generated' ? focusesLabel(plan.focuses) : DAY_KIND_LABELS[plan.kind];
}

export interface WeeklySchedule {
  monday: DayPlan;
  tuesday: DayPlan;
  wednesday: DayPlan;
  thursday: DayPlan;
  friday: DayPlan;
  saturday: DayPlan;
  sunday: DayPlan;
}

export const DEFAULT_WEEKLY_SCHEDULE: WeeklySchedule = {
  monday: { kind: 'hyrox_class' },
  tuesday: { kind: 'generated', focuses: ['lower', 'olympic'] },
  wednesday: { kind: 'hyrox_class' },
  thursday: { kind: 'generated', focuses: ['upper', 'gymnastics'] },
  friday: { kind: 'rest' },
  saturday: { kind: 'team_wod_optional' },
  sunday: { kind: 'rest' },
};

const VALID_FOCUSES: SessionFocus[] = [
  'olympic',
  'lower',
  'upper',
  'gymnastics',
  'conditioning',
  'endurance',
  'core',
  'strongman',
];

/** Coerces one stored/legacy day value into the current DayPlan object. */
function normalizeDayPlan(raw: unknown, weekday: keyof WeeklySchedule): DayPlan {
  // New object form
  if (raw && typeof raw === 'object' && 'kind' in (raw as Record<string, unknown>)) {
    const kind = (raw as { kind: string }).kind;
    if (kind === 'generated') {
      const focuses = ((raw as { focuses?: unknown }).focuses ?? []) as unknown[];
      const clean = focuses.filter((f): f is SessionFocus => VALID_FOCUSES.includes(f as SessionFocus));
      return { kind: 'generated', focuses: clean.length ? clean : ['lower'] };
    }
    if (kind === 'rest' || kind === 'hyrox_class' || kind === 'team_wod_optional') return { kind };
  }
  // Legacy string form
  if (raw === 'generated_lower') return { kind: 'generated', focuses: ['lower', 'olympic'] };
  if (raw === 'generated_upper') return { kind: 'generated', focuses: ['upper', 'gymnastics'] };
  if (raw === 'generated')
    return { kind: 'generated', focuses: weekday === 'thursday' ? ['upper', 'gymnastics'] : ['lower', 'olympic'] };
  if (raw === 'hyrox_class' || raw === 'team_wod_optional' || raw === 'rest') return { kind: raw };
  return { ...(DEFAULT_WEEKLY_SCHEDULE[weekday]) };
}

/** Upgrades a stored/legacy schedule (old string values, or missing) to the current shape. */
export function normalizeSchedule(schedule: Partial<Record<keyof WeeklySchedule, unknown>> | undefined): WeeklySchedule {
  const out = {} as WeeklySchedule;
  const days = Object.keys(DEFAULT_WEEKLY_SCHEDULE) as (keyof WeeklySchedule)[];
  for (const wd of days) {
    out[wd] = schedule ? normalizeDayPlan(schedule[wd], wd) : { ...DEFAULT_WEEKLY_SCHEDULE[wd] };
  }
  return out;
}

export interface UserProfile {
  id: string;
  heightCm: number;
  weightKg: number;
  age: number;
  goals: Goal[];
  experienceLevel: ExperienceLevel;
  availableEquipment: EquipmentType[];
  /** Free-text current/chronic injury flags, checked by the soreness/injury rule. */
  injuries: string[];
  /**
   * Baseline working weight (kg) per exercise id, used by the engine as the
   * default prescribed load. Overrides the built-in DEFAULT_WORKING_WEIGHTS.
   * Dumbbell/kettlebell entries are per implement (per hand).
   */
  workingWeights: Record<string, number>;
  weeklySchedule: WeeklySchedule;
}

export const DEFAULT_PROFILE: UserProfile = {
  id: 'default',
  heightCm: 184,
  weightKg: 93,
  age: 30,
  goals: [
    'hyrox_performance',
    'crossfit_performance',
    'strength',
    'olympic_lifting_technique',
    'athletic_physique',
    'fat_loss',
  ],
  experienceLevel: 'advanced',
  availableEquipment: [
    'barbell',
    'dumbbell',
    'kettlebell',
    'pull_up_bar',
    'rings',
    'rower',
    'bike_erg',
    'ski_erg',
    'sled',
    'box',
    'jump_rope',
    'sandbag',
    'yoke',
    'ghd',
    'medicine_ball',
    'band',
    'rope',
    'battle_ropes',
  ],
  injuries: [],
  workingWeights: {},
  weeklySchedule: DEFAULT_WEEKLY_SCHEDULE,
};
