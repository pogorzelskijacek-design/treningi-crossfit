import { Trash2 } from 'lucide-react';
import type { WorkoutLog, WorkoutSectionType } from '@/domain';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDateLong } from '@/lib/date';
import { dayLabel, focusForDay } from '@/lib/workoutSummary';

interface WorkoutDetailDialogProps {
  log: WorkoutLog | null;
  onClose: () => void;
  onDelete: (id: string) => void;
}

const SECTION_LABEL: Record<WorkoutSectionType, string> = {
  warmup: 'Warm-up',
  skill: 'Skill',
  strength: 'Strength',
  wod: 'WOD',
  accessories: 'Accessories',
  cooldown: 'Cooldown',
};

export function WorkoutDetailDialog({ log, onClose, onDelete }: WorkoutDetailDialogProps) {
  return (
    <Dialog open={log != null} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        {log && (
          <>
            <DialogHeader>
              <div className="flex items-center gap-2">
                <DialogTitle>{dayLabel(log.day)}</DialogTitle>
                {log.overallRpe != null && <Badge variant="secondary">RPE {log.overallRpe}</Badge>}
              </div>
              <DialogDescription>
                {formatDateLong(log.date)} · {focusForDay(log.day)}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {log.wodScore && (
                <div className="rounded-lg bg-muted/50 px-3 py-2 text-sm">
                  <span className="text-muted-foreground">WOD result: </span>
                  <span className="font-medium">{log.wodScore}</span>
                </div>
              )}

              {log.loggedExercises.map((exercise, i) => {
                const workingSets = exercise.sets.filter((s) => s.completed);
                if (workingSets.length === 0) return null;
                return (
                  <div key={i} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{exercise.exerciseName}</span>
                      <span className="text-xs text-muted-foreground">
                        {SECTION_LABEL[exercise.sectionType]}
                        {exercise.techniqueRating != null && ` · technique ${exercise.techniqueRating}/5`}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {workingSets.map((set, si) => (
                        <span
                          key={si}
                          className="rounded-md bg-muted px-2 py-0.5 text-xs tabular-nums text-muted-foreground"
                        >
                          {set.reps ?? '–'}
                          {set.weightKg != null ? ` × ${set.weightKg}kg` : ''}
                          {set.rpe != null ? ` @${set.rpe}` : ''}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}

              {log.notes && <p className="text-sm text-muted-foreground italic">{log.notes}</p>}
            </div>

            <div className="flex justify-end border-t border-border pt-3">
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  onDelete(log.id);
                  onClose();
                }}
              >
                <Trash2 className="size-4" /> Delete
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
