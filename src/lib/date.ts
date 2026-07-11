import { format, parseISO, getDay } from 'date-fns';
import type { TrainingDay } from '@/domain';

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

/** Returns the generated-workout day (tuesday/thursday) for today, or null on other days. */
export function currentTrainingDay(): TrainingDay | null {
  const day = weekdayOf(todayIso());
  return day === 'tuesday' || day === 'thursday' ? day : null;
}
