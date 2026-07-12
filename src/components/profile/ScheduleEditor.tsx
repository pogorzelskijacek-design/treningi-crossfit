import type { DayKind, DayPlan, SessionFocus, WeeklySchedule } from '@/domain';
import { SESSION_FOCUS_LABELS, SESSION_FOCUS_ORDER, isGeneratedPlan } from '@/domain';
import { ToggleChip } from '@/components/common/ToggleChip';
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

const KIND_OPTIONS: { value: DayKind; label: string }[] = [
  { value: 'generated', label: 'Coached (app programs it)' },
  { value: 'hyrox_class', label: 'Hyrox class' },
  { value: 'team_wod_optional', label: 'Team WOD (optional)' },
  { value: 'rest', label: 'Rest' },
];

export function ScheduleEditor({ value, onChange }: ScheduleEditorProps) {
  const generatedCount = DAY_ORDER.filter((d) => isGeneratedPlan(value[d])).length;

  function setPlan(day: keyof WeeklySchedule, plan: DayPlan) {
    onChange({ ...value, [day]: plan });
  }

  function setKind(day: keyof WeeklySchedule, kind: DayKind) {
    if (kind === 'generated') {
      const existing = isGeneratedPlan(value[day]) ? value[day].focuses : [];
      setPlan(day, { kind: 'generated', focuses: existing.length ? existing : ['lower'] });
    } else {
      setPlan(day, { kind });
    }
  }

  function toggleFocus(day: keyof WeeklySchedule, focus: SessionFocus) {
    const plan = value[day];
    if (!isGeneratedPlan(plan)) return;
    const next = plan.focuses.includes(focus)
      ? plan.focuses.filter((f) => f !== focus)
      : [...plan.focuses, focus];
    setPlan(day, { kind: 'generated', focuses: next.length ? next : ['lower'] });
  }

  return (
    <div className="space-y-3">
      <div className="space-y-4">
        {DAY_ORDER.map((day) => {
          const plan = value[day];
          const generated = isGeneratedPlan(plan);
          return (
            <div key={day} className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <label htmlFor={`plan-${day}`} className="w-24 shrink-0 text-sm font-medium">
                  {DAY_LABELS[day]}
                </label>
                <select
                  id={`plan-${day}`}
                  value={plan.kind}
                  onChange={(e) => setKind(day, e.target.value as DayKind)}
                  className={cn(
                    'h-9 flex-1 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none transition-colors',
                    'focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30',
                    generated && 'font-medium text-foreground'
                  )}
                >
                  {KIND_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              {generated && (
                <div className="flex flex-wrap gap-1.5 pl-24">
                  {SESSION_FOCUS_ORDER.map((focus) => (
                    <ToggleChip
                      key={focus}
                      label={SESSION_FOCUS_LABELS[focus]}
                      active={plan.focuses.includes(focus)}
                      onToggle={() => toggleFocus(day, focus)}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <p className="text-xs text-muted-foreground">
        {generatedCount === 0
          ? 'No coached days selected — mark at least one day as “Coached” for the app to program it.'
          : `${generatedCount} coached ${generatedCount === 1 ? 'session' : 'sessions'} per week. Pick one or more focuses for each coached day.`}
      </p>
    </div>
  );
}
