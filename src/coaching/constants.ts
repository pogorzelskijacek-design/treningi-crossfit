/** How many past sessions of the same weekday to look back at for rotation/load decisions. */
export const LOOKBACK_SESSIONS = 6;

/** Target total session length used to sanity-check section time budgets. */
export const TARGET_SESSION_MINUTES = 60;

/**
 * Fixed per-section minute budgets. Tuesday's skill+strength together form the
 * "15-25 minute Olympic lifting block" from the programming rules; Thursday
 * shifts that time into strength instead since its skill slot is optional
 * gymnastics practice, not a mandatory technical block. WOD varies by format
 * (see wodBaseMinutes) so the total floats around ~60 rather than hitting it
 * exactly every time.
 */
export const SECTION_MINUTES = {
  warmup: 10,
  skill: { tuesday: 15, thursday: 8 },
  strength: { tuesday: 10, thursday: 15 },
  accessories: 8,
  cooldown: 5,
} as const;
