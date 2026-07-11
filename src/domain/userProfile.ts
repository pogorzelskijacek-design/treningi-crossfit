import type { EquipmentType } from './exercise';

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

export type DaySchedule =
  | 'hyrox_class'
  | 'generated'
  | 'team_wod_optional'
  | 'rest';

export interface WeeklySchedule {
  monday: DaySchedule;
  tuesday: DaySchedule;
  wednesday: DaySchedule;
  thursday: DaySchedule;
  friday: DaySchedule;
  saturday: DaySchedule;
  sunday: DaySchedule;
}

export const DEFAULT_WEEKLY_SCHEDULE: WeeklySchedule = {
  monday: 'hyrox_class',
  tuesday: 'generated',
  wednesday: 'hyrox_class',
  thursday: 'generated',
  friday: 'rest',
  saturday: 'team_wod_optional',
  sunday: 'rest',
};

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
