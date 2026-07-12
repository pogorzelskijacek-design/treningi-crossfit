import type {
  Exercise,
  GeneratedWorkout,
  PersonalRecord,
  ReadinessCheckin,
  SessionFocus,
  UserProfile,
  WorkoutLog,
} from '@/domain';
import { focusesLabel } from '@/domain';
import { EXERCISE_LIBRARY } from '@/data';
import { newId } from '@/lib/id';
import { LOOKBACK_SESSIONS } from './constants';
import { getRecentSessionsByFocus, getRecentSessionsSharingFocus } from './selectors/historyLookback';
import { combineFocusHints } from './focusHints';
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
 * inputs always produce an identical workout. Takes the day's `focuses` and
 * shapes the six sections from them (see focusHints.ts).
 */
export function generateWorkout(
  focuses: SessionFocus[],
  checkin: ReadinessCheckin,
  history: WorkoutLog[],
  _prHistory: PersonalRecord[],
  profile: UserProfile,
  exerciseLibrary: Exercise[] = EXERCISE_LIBRARY,
  options: GenerateWorkoutOptions = {}
): GeneratedWorkout {
  const idFactory = options.idFactory ?? newId;
  const date = checkin.date;
  const activeFocuses: SessionFocus[] = focuses.length > 0 ? focuses : ['lower', 'olympic'];

  const hints = combineFocusHints(activeFocuses);
  const recentSessions = getRecentSessionsSharingFocus(history, activeFocuses, LOOKBACK_SESSIONS);

  let adjustment = fatigueAdjustment(checkin);
  adjustment = applyWeeklyLoadBalance(adjustment, date, history);

  const soreness = sorenessRules(checkin, profile);
  const postHyrox = postHyroxRule(activeFocuses, checkin);

  const traces: RuleTrace[] = [...adjustment.traces, ...soreness.traces, ...postHyrox.traces];

  const wodFormat = pickNextWodFormat(recentSessions);
  const olympicLiftProgression =
    hints.skill === 'olympic'
      ? pickNextOlympicLift(getRecentSessionsByFocus(history, 'olympic', LOOKBACK_SESSIONS))
      : undefined;
  const liftProgressionSuggestion = olympicLiftProgression
    ? suggestLiftProgression(olympicLiftProgression, history)
    : undefined;
  if (liftProgressionSuggestion?.trace) traces.push(liftProgressionSuggestion.trace);

  const sections = buildSections({
    focuses: activeFocuses,
    hints,
    exerciseLibrary,
    profile,
    recentSessions,
    history,
    adjustment,
    soreness,
    postHyrox,
    olympicLiftProgression,
    liftProgressionSuggestion,
    wodFormat,
  });

  const rationale = buildRationale(activeFocuses, traces, wodFormat, olympicLiftProgression);

  const estimatedDurationMinutes = Object.values(sections).reduce(
    (total, section) => total + (section.timeCapMinutes ?? 0),
    0
  );

  return {
    id: idFactory(),
    focuses: activeFocuses,
    date,
    focus: focusesLabel(activeFocuses),
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
