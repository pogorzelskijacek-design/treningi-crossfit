import { ChevronRight, Dumbbell } from 'lucide-react';
import type { WorkoutLog } from '@/domain';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDateShort } from '@/lib/date';
import { dayLabel, focusForDay, summarizeLog } from '@/lib/workoutSummary';

interface WorkoutHistoryListProps {
  history: WorkoutLog[];
  onSelect: (log: WorkoutLog) => void;
}

export function WorkoutHistoryList({ history, onSelect }: WorkoutHistoryListProps) {
  return (
    <div className="space-y-2">
      {history.map((log) => {
        const summary = summarizeLog(log);
        return (
          <Card key={log.id}>
            <button
              type="button"
              onClick={() => onSelect(log)}
              className="flex w-full items-center gap-3 px-4 text-left transition-colors hover:bg-muted/40"
            >
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Dumbbell className="size-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{dayLabel(log.day)}</span>
                  <span className="text-xs text-muted-foreground">{formatDateShort(log.date)}</span>
                </div>
                <p className="truncate text-xs text-muted-foreground">{focusForDay(log.day)}</p>
              </div>
              <div className="hidden items-center gap-1.5 sm:flex">
                {log.overallRpe != null && <Badge variant="secondary">RPE {log.overallRpe}</Badge>}
                {summary.totalVolumeKg > 0 && (
                  <Badge variant="outline">{Math.round(summary.totalVolumeKg).toLocaleString()} kg</Badge>
                )}
              </div>
              <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
            </button>
          </Card>
        );
      })}
    </div>
  );
}
