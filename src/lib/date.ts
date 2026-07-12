import { format, parseISO, getDay } from 'date-fns';
import type { SessionFocus, WeeklySchedule } from '@/domain';
import { dayPlanFocuses, isGeneratedPlan } from '@/domain';

export function todayIso(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

export function formatDateLong(iso: string): string {
  return format(parseISO(iso), 'EEEE, MMMM d, yyyy');
}

export function formatDateShort(iso: string): string {
  return format(parseISO(iso), 'MMM d, yyyy');
}

const WEEKDAY_BY_INDEX = [
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
] as const;

export function weekdayOf(iso: string): (typeof WEEKDAY_BY_INDEX)[number] {
  return WEEKDAY_BY_INDEX[getDay(parseISO(iso))];
}

export type Weekday = (typeof WEEKDAY_BY_INDEX)[number];

export function weekdayLabel(weekday: Weekday): string {
  return weekday.charAt(0).toUpperCase() + weekday.slice(1);
}

/** The focuses the user's schedule assigns to today (empty if today isn't a generated day). */
export function todaysFocuses(schedule: WeeklySchedule): SessionFocus[] {
  return dayPlanFocuses(schedule[weekdayOf(todayIso())]);
}

/** Today if it's a generated day, otherwise the soonest upcoming generated day in the schedule. */
export function nextGeneratedDay(
  schedule: WeeklySchedule
): { weekday: Weekday; focuses: SessionFocus[]; isToday: boolean } | null {
  const order = WEEKDAY_BY_INDEX;
  const todayIdx = getDay(parseISO(todayIso()));
  for (let i = 0; i < 7; i += 1) {
    const weekday = order[(todayIdx + i) % 7];
    const plan = schedule[weekday];
    if (isGeneratedPlan(plan)) return { weekday, focuses: plan.focuses, isToday: i === 0 };
  }
  return null;
}
