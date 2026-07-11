import type {
  Exercise,
  GeneratedWorkout,
  PersonalRecord,
  ReadinessCheckin,
  TrainingDay,
  UserProfile,
  WorkoutLog,
} from '@/domain';
import { EXERCISE_LIBRARY } from '@/data';
import { newId } from '@/lib/id';
import { LOOKBACK_SESSIONS } from './constants';
import { getRecentSessionsByDay } from './selectors/historyLookback';
import { fatigueAdjustment } from './rules/fatigueAdjustment';
import { applyWeeklyLoadBalance } from './rules/weeklyLoadBalance';
import { sorenessRules } from './rules/sorenessRules';
import { postHyroxRule } from './rules/postHyroxRule';
import { suggestLiftProgression } from './rules/liftProgression';
import { pickNextOlympicLift } from './rotation/olympicLiftRotation';
import { pickNextWodFormat } from './rotation/wodFormatRotation';
import { buildSections } from './builders/sectionBuilder';
import { buildRationale } from './builders/rationaleBuilder';
import type { RuleTrace } from './types';

export interface GenerateWorkoutOptions {
  /** Injectable for deterministic tests; defaults to a random uuid. */
  idFactory?: () => string;
}

/**
 * The coaching engine's single entry point. Pure and deterministic: identical
 * inputs always produce an identical workout, so it's easy to test and easy
 * to later swap for an LLM-based recommender behind the same signature.
 *
 * PersonalRecord history is accepted for forward-compatibility (e.g. gating
 * strength prescriptions off a percentage of 1RM) but isn't used by any rule
 * yet — the MVP's strength/load decisions come entirely from readiness and
 * recent session history.
 */
export function generateWorkout(
  day: TrainingDay,
  checkin: ReadinessCheckin,
  history: WorkoutLog[],
  _prHistory: PersonalRecord[],
  profile: UserProfile,
  exerciseLibrary: Exercise[] = EXERCISE_LIBRARY,
  options: GenerateWorkoutOptions = {}
): GeneratedWorkout {
  const idFactory = options.idFactory ?? newId;
  const date = checkin.date;

  const recentSessionsThisDay = getRecentSessionsByDay(history, day, LOOKBACK_SESSIONS);

  let adjustment = fatigueAdjustment(checkin);
  adjustment = applyWeeklyLoadBalance(adjustment, date, history);

  const soreness = sorenessRules(checkin, profile);
  const postHyrox = postHyroxRule(day, checkin);

  const traces: RuleTrace[] = [...adjustment.traces, ...soreness.traces, ...postHyrox.traces];

  const wodFormat = pickNextWodFormat(recentSessionsThisDay);
  const olympicLiftProgression = day === 'tuesday' ? pickNextOlympicLift(recentSessionsThisDay) : undefined;
  const liftProgressionSuggestion = olympicLiftProgression
    ? suggestLiftProgression(olympicLiftProgression, history)
    : undefined;
  if (liftProgressionSuggestion?.trace) traces.push(liftProgressionSuggestion.trace);

  const sections = buildSections({
    day,
    exerciseLibrary,
    profile,
    recentSessionsThisDay,
    history,
    adjustment,
    soreness,
    postHyrox,
    olympicLiftProgression,
    liftProgressionSuggestion,
    wodFormat,
  });

  const rationale = buildRationale(day, traces, wodFormat, olympicLiftProgression);

  const estimatedDurationMinutes = Object.values(sections).reduce(
    (total, section) => total + (section.timeCapMinutes ?? 0),
    0
  );

  return {
    id: idFactory(),
    day,
    date,
    focus: day === 'tuesday' ? 'Lower Body + Core + Olympic Lifting' : 'Upper Body + Gymnastics',
    olympicLiftProgression,
    sections,
    rationale,
    appliedRules: traces.map((t) => `${t.rule}: ${t.effect}`),
    loadAdjustment: {
      volumeMultiplier: adjustment.volumeMultiplier,
      intensityMultiplier: adjustment.intensityMultiplier,
    },
    readinessCheckinId: checkin.id,
    estimatedDurationMinutes,
  };
}
