import type { EquipmentType } from './exercise';
import type { TrainingDay } from './trainingDay';

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

/** The two coaching templates the engine generates. */
export type SessionFocus = 'lower_olympic' | 'upper_gymnastics';

export const SESSION_FOCUS_LABELS: Record<SessionFocus, string> = {
  lower_olympic: 'Lower Body + Olympic',
  upper_gymnastics: 'Upper Body + Gymnastics',
};

/**
 * What a given weekday is. `generated_*` days are the ones the app programs; how
 * many of them there are is the user's "training days per week". Non-generated
 * days (external Hyrox class, optional team WOD, rest) aren't programmed.
 */
export type DayPlan =
  | 'rest'
  | 'hyrox_class'
  | 'team_wod_optional'
  | 'generated_lower'
  | 'generated_upper';

export const DAY_PLAN_LABELS: Record<DayPlan, string> = {
  rest: 'Rest',
  hyrox_class: 'Hyrox class',
  team_wod_optional: 'Team WOD (optional)',
  generated_lower: 'Coached · Lower + Olympic',
  generated_upper: 'Coached · Upper + Gymnastics',
};

export function isGeneratedPlan(plan: DayPlan): boolean {
  return plan === 'generated_lower' || plan === 'generated_upper';
}

/** Maps a day plan to the engine's focus token, or null for non-generated days. */
export function planFocusToken(plan: DayPlan): TrainingDay | null {
  if (plan === 'generated_lower') return 'tuesday';
  if (plan === 'generated_upper') return 'thursday';
  return null;
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
  monday: 'hyrox_class',
  tuesday: 'generated_lower',
  wednesday: 'hyrox_class',
  thursday: 'generated_upper',
  friday: 'rest',
  saturday: 'team_wod_optional',
  sunday: 'rest',
};

const VALID_PLANS: DayPlan[] = ['rest', 'hyrox_class', 'team_wod_optional', 'generated_lower', 'generated_upper'];

/** Upgrades a stored/legacy schedule (e.g. the old `'generated'` value) to the current shape. */
export function normalizeSchedule(schedule: Partial<Record<keyof WeeklySchedule, string>> | undefined): WeeklySchedule {
  const out: WeeklySchedule = { ...DEFAULT_WEEKLY_SCHEDULE };
  if (!schedule) return out;
  (Object.keys(DEFAULT_WEEKLY_SCHEDULE) as (keyof WeeklySchedule)[]).forEach((wd) => {
    const raw = schedule[wd];
    if (raw && VALID_PLANS.includes(raw as DayPlan)) out[wd] = raw as DayPlan;
    else if (raw === 'generated') out[wd] = wd === 'thursday' ? 'generated_upper' : 'generated_lower';
  });
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
