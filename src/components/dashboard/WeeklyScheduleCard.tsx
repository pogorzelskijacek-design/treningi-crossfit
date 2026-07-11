import { Users, Dumbbell, Bed, Trophy } from 'lucide-react';
import type { DayPlan, WeeklySchedule } from '@/domain';
import { isGeneratedPlan } from '@/domain';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { weekdayOf, todayIso } from '@/lib/date';

interface WeeklyScheduleCardProps {
  schedule: WeeklySchedule;
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

const DAY_ABBR: Record<keyof WeeklySchedule, string> = {
  monday: 'Mon',
  tuesday: 'Tue',
  wednesday: 'Wed',
  thursday: 'Thu',
  friday: 'Fri',
  saturday: 'Sat',
  sunday: 'Sun',
};

const SCHEDULE_META: Record<DayPlan, { label: string; icon: typeof Users }> = {
  hyrox_class: { label: 'Hyrox class', icon: Users },
  generated_lower: { label: 'Lower + Olympic', icon: Dumbbell },
  generated_upper: { label: 'Upper + Gymnastics', icon: Dumbbell },
  team_wod_optional: { label: 'Team WOD (optional)', icon: Trophy },
  rest: { label: 'Rest', icon: Bed },
};

export function WeeklyScheduleCard({ schedule }: WeeklyScheduleCardProps) {
  const today = weekdayOf(todayIso());

  return (
    <Card>
      <CardHeader>
        <CardTitle>This week</CardTitle>
      </CardHeader>
      <CardContent className="space-y-1.5">
        {DAY_ORDER.map((day) => {
          const meta = SCHEDULE_META[schedule[day]];
          const Icon = meta.icon;
          const isToday = day === today;
          const isGenerated = isGeneratedPlan(schedule[day]);
          return (
            <div
              key={day}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2',
                isToday ? 'bg-muted' : 'bg-transparent'
              )}
            >
              <span className={cn('w-9 text-xs font-medium', isToday ? 'text-foreground' : 'text-muted-foreground')}>
                {DAY_ABBR[day]}
              </span>
              <Icon
                className={cn('size-4', isGenerated ? 'text-primary' : 'text-muted-foreground')}
              />
              <span className={cn('text-sm', isGenerated ? 'font-medium' : 'text-muted-foreground')}>
                {meta.label}
              </span>
              {isToday && (
                <span className="ml-auto text-[10px] font-semibold uppercase tracking-wide text-primary">
                  Today
                </span>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
