import { format, parseISO, startOfWeek } from 'date-fns';
import type { PersonalRecord, WorkoutLog } from '@/domain';
import { summarizeLog } from './workoutSummary';

export interface TrainingStats {
  totalWorkouts: number;
  weekStreak: number;
  averageRpe: number | null;
  weeklyVolumeKg: number;
  monthlyVolumeKg: number;
}

function isoWeekKey(dateIso: string): string {
  return format(startOfWeek(parseISO(dateIso), { weekStartsOn: 1 }), 'yyyy-MM-dd');
}

/**
 * Consecutive-week training streak: counts back from the current (or most
 * recent) training week while each successive week has at least one logged
 * workout. A gap week ends the streak.
 */
export function computeWeekStreak(history: WorkoutLog[], todayIso: string): number {
  if (history.length === 0) return 0;
  const weeksWithWorkouts = new Set(history.map((log) => isoWeekKey(log.date)));

  const thisWeek = startOfWeek(parseISO(todayIso), { weekStartsOn: 1 });
  let streak = 0;
  for (let offset = 0; ; offset += 1) {
    const week = new Date(thisWeek);
    week.setDate(week.getDate() - offset * 7);
    const key = format(week, 'yyyy-MM-dd');
    if (weeksWithWorkouts.has(key)) {
      streak += 1;
    } else if (offset === 0) {
      // Allow the current week to be empty without breaking a prior streak.
      continue;
    } else {
      break;
    }
  }
  return streak;
}

export function computeStats(history: WorkoutLog[], todayIso: string): TrainingStats {
  const totalWorkouts = history.length;

  const rpes = history.map((log) => log.overallRpe).filter((r): r is number => r != null);
  const averageRpe = rpes.length > 0 ? Math.round((rpes.reduce((a, b) => a + b, 0) / rpes.length) * 10) / 10 : null;

  const thisWeekKey = isoWeekKey(todayIso);
  const thisMonthKey = todayIso.slice(0, 7);

  let weeklyVolumeKg = 0;
  let monthlyVolumeKg = 0;
  for (const log of history) {
    const volume = summarizeLog(log).totalVolumeKg;
    if (isoWeekKey(log.date) === thisWeekKey) weeklyVolumeKg += volume;
    if (log.date.slice(0, 7) === thisMonthKey) monthlyVolumeKg += volume;
  }

  return {
    totalWorkouts,
    weekStreak: computeWeekStreak(history, todayIso),
    averageRpe,
    weeklyVolumeKg: Math.round(weeklyVolumeKg),
    monthlyVolumeKg: Math.round(monthlyVolumeKg),
  };
}

export interface SessionPoint {
  date: string;
  label: string;
  volumeKg: number;
  rpe: number | null;
}

/** One point per logged session, oldest-first, for volume and RPE trend charts. */
export function sessionTrend(history: WorkoutLog[]): SessionPoint[] {
  return [...history]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((log) => ({
      date: log.date,
      label: format(parseISO(log.date), 'MMM d'),
      volumeKg: Math.round(summarizeLog(log).totalVolumeKg),
      rpe: log.overallRpe ?? null,
    }));
}

export interface PrPoint {
  date: string;
  label: string;
  valueKg: number;
}

/** PR progression over time for a single lift type, oldest-first. */
export function prProgression(records: PersonalRecord[], type: string): PrPoint[] {
  return records
    .filter((pr) => pr.type === type && pr.valueKg != null)
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((pr) => ({
      date: pr.date,
      label: format(parseISO(pr.date), 'MMM d'),
      valueKg: pr.valueKg as number,
    }));
}

export interface BestWod {
  date: string;
  label: string;
  wodFormat?: string;
  score: string;
}

/** Most recent logged WOD results (there's no universal way to rank arbitrary scores). */
export function recentWods(history: WorkoutLog[], limit = 5): BestWod[] {
  return [...history]
    .filter((log) => log.wodScore && log.wodScore.trim().length > 0)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, limit)
    .map((log) => ({
      date: log.date,
      label: format(parseISO(log.date), 'MMM d'),
      wodFormat: log.wodFormat,
      score: log.wodScore as string,
    }));
}
