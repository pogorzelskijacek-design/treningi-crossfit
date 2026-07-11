export type MovementPattern =
  | 'squat'
  | 'hinge'
  | 'push_horizontal'
  | 'push_vertical'
  | 'pull_horizontal'
  | 'pull_vertical'
  | 'lunge'
  | 'carry'
  | 'olympic_pull'
  | 'olympic_catch'
  | 'core_flexion'
  | 'core_rotation'
  | 'core_anti_extension'
  | 'locomotion'
  | 'jump'
  | 'gymnastics_push'
  | 'gymnastics_pull'
  | 'gymnastics_hold';

export type MuscleGroup =
  | 'quads'
  | 'hamstrings'
  | 'glutes'
  | 'calves'
  | 'lower_back'
  | 'upper_back'
  | 'lats'
  | 'traps'
  | 'shoulders'
  | 'chest'
  | 'biceps'
  | 'triceps'
  | 'forearms'
  | 'core'
  | 'full_body';

export type ExerciseCategory =
  | 'barbell'
  | 'dumbbell'
  | 'kettlebell'
  | 'strongman'
  | 'machine'
  | 'bodyweight'
  | 'gymnastics'
  | 'conditioning'
  | 'olympic_lifting'
  | 'mobility';

export type EquipmentType =
  | 'barbell'
  | 'dumbbell'
  | 'kettlebell'
  | 'pull_up_bar'
  | 'rings'
  | 'rower'
  | 'bike_erg'
  | 'ski_erg'
  | 'sled'
  | 'box'
  | 'jump_rope'
  | 'sandbag'
  | 'yoke'
  | 'ghd'
  | 'medicine_ball'
  | 'band'
  | 'rope'
  | 'battle_ropes'
  | 'none';

/** User-selectable equipment (excludes the internal "none" sentinel). */
export const EQUIPMENT_LABELS: Record<Exclude<EquipmentType, 'none'>, string> = {
  barbell: 'Barbell',
  dumbbell: 'Dumbbells',
  kettlebell: 'Kettlebells',
  pull_up_bar: 'Pull-up bar',
  rings: 'Rings',
  rower: 'RowErg',
  bike_erg: 'Bike / Echo Bike',
  ski_erg: 'SkiErg',
  sled: 'Sled',
  box: 'Plyo box',
  jump_rope: 'Jump rope',
  sandbag: 'Sandbag',
  yoke: 'Yoke',
  ghd: 'GHD',
  medicine_ball: 'Medicine / wall ball',
  band: 'Resistance bands',
  rope: 'Climbing rope',
  battle_ropes: 'Battle ropes',
};

export type WorkoutSectionType =
  | 'warmup'
  | 'skill'
  | 'strength'
  | 'wod'
  | 'accessories'
  | 'cooldown';

export interface Exercise {
  id: string;
  name: string;
  category: ExerciseCategory;
  movementPattern: MovementPattern[];
  primaryMuscles: MuscleGroup[];
  secondaryMuscles?: MuscleGroup[];
  equipment: EquipmentType[];
  /**
   * Restricted movement (Handstand Walk, Bar Muscle Up, Snatch): may only be
   * programmed in the Skill section as optional practice, never in the WOD,
   * Strength, or Accessories blocks.
   */
  skillOnly?: boolean;
  complexityLevel: 1 | 2 | 3 | 4 | 5;
  sections: WorkoutSectionType[];
  tags?: string[];
}
