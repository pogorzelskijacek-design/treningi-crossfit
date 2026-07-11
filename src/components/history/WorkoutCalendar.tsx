import { useMemo, useState } from 'react';
import { format, parseISO } from 'date-fns';
import type { WorkoutLog } from '@/domain';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent } from '@/components/ui/card';
import { todayIso } from '@/lib/date';
import { WorkoutHistoryList } from './WorkoutHistoryList';

interface WorkoutCalendarProps {
  history: WorkoutLog[];
  onSelect: (log: WorkoutLog) => void;
}

export function WorkoutCalendar({ history, onSelect }: WorkoutCalendarProps) {
  const [selected, setSelected] = useState<Date | undefined>(parseISO(todayIso()));

  const workoutDays = useMemo(() => history.map((log) => parseISO(log.date)), [history]);

  const selectedIso = selected ? format(selected, 'yyyy-MM-dd') : null;
  const workoutsOnSelected = useMemo(
    () => (selectedIso ? history.filter((log) => log.date === selectedIso) : []),
    [history, selectedIso]
  );

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="flex justify-center">
          <Calendar
            mode="single"
            selected={selected}
            onSelect={setSelected}
            modifiers={{ workout: workoutDays }}
            modifiersClassNames={{
              workout:
                'relative after:absolute after:bottom-1 after:left-1/2 after:size-1 after:-translate-x-1/2 after:rounded-full after:bg-primary',
            }}
            className="w-full"
          />
        </CardContent>
      </Card>

      {workoutsOnSelected.length > 0 ? (
        <WorkoutHistoryList history={workoutsOnSelected} onSelect={onSelect} />
      ) : (
        <p className="text-center text-sm text-muted-foreground">No workout logged on this day.</p>
      )}
    </div>
  );
}
