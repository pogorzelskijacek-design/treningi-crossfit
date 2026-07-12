/** How many past sessions sharing a focus to look back at for rotation/load decisions. */
export const LOOKBACK_SESSIONS = 6;

/** Target total session length used to sanity-check section time budgets. */
export const TARGET_SESSION_MINUTES = 60;

/**
 * Fixed per-section minute budgets. Skill and strength are computed by the
 * section builder from the day's focuses (an Olympic skill block gets the
 * "15-25 minute" slot; without it that time shifts into strength). WOD varies
 * by format (see wodBaseMinutes) so the total floats around ~60.
 */
export const SECTION_MINUTES = {
  warmup: 10,
  accessories: 8,
  cooldown: 5,
  skillOlympic: 15,
  skillGymnastics: 8,
  strengthWithOlympic: 10,
  strengthDefault: 15,
  strengthNoSkill: 18,
} as const;
