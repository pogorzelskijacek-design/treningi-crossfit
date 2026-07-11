import type { DayPlan, WeeklySchedule } from '@/domain';
import { DAY_PLAN_LABELS, isGeneratedPlan } from '@/domain';
import { cn } from '@/lib/utils';

interface ScheduleEditorProps {
  value: WeeklySchedule;
  onChange: (schedule: WeeklySchedule) => void;
}

const DAY_ORDER: (keyof WeeklySchedule)[] = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
];

const DAY_LABELS: Record<keyof WeeklySchedule, string> = {
  monday: 'Monday',
  tuesday: 'Tuesday',
  wednesday: 'Wednesday',
  thursday: 'Thursday',
  friday: 'Friday',
  saturday: 'Saturday',
  sunday: 'Sunday',
};

const PLAN_OPTIONS = Object.keys(DAY_PLAN_LABELS) as DayPlan[];

export function ScheduleEditor({ value, onChange }: ScheduleEditorProps) {
  const generatedCount = DAY_ORDER.filter((d) => isGeneratedPlan(value[d])).length;

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        {DAY_ORDER.map((day) => (
          <div key={day} className="flex items-center justify-between gap-3">
            <label htmlFor={`plan-${day}`} className="w-24 shrink-0 text-sm font-medium">
              {DAY_LABELS[day]}
            </label>
            <select
              id={`plan-${day}`}
              value={value[day]}
              onChange={(e) => onChange({ ...value, [day]: e.target.value as DayPlan })}
              className={cn(
                'h-9 flex-1 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none transition-colors',
                'focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30',
                isGeneratedPlan(value[day]) && 'font-medium text-foreground'
              )}
            >
              {PLAN_OPTIONS.map((plan) => (
                <option key={plan} value={plan}>
                  {DAY_PLAN_LABELS[plan]}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        {generatedCount === 0
          ? 'No coached days selected — mark at least one day as “Coached” for the app to program it.'
          : `${generatedCount} coached ${generatedCount === 1 ? 'session' : 'sessions'} per week. “Coached” days are the ones the app generates; other days are your own classes or rest.`}
      </p>
    </div>
  );
}
