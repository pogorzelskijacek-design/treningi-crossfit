import { useMemo, useState, type FormEvent } from 'react';
import { Check, ChevronDown, Pencil, Plus, X } from 'lucide-react';
import type { GeneratedWorkout, LoggedExercise, LoggedSet, WorkoutLog } from '@/domain';
import { getExerciseById } from '@/data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { SliderField } from '@/components/common/SliderField';
import { TechniqueRating } from './TechniqueRating';
import { formatWeight } from '@/lib/weight';
import { cn } from '@/lib/utils';

interface WorkoutLogFormProps {
  workout: GeneratedWorkout;
  draft: WorkoutLog;
  onSubmit: (log: WorkoutLog) => void | Promise<void>;
  submitting?: boolean;
}

function numOrUndefined(value: string): number | undefined {
  if (value.trim() === '') return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}

function isPerHand(exerciseId: string): boolean {
  const category = getExerciseById(exerciseId)?.category;
  return category === 'dumbbell' || category === 'kettlebell';
}

/** Compact "N × reps @ weight" summary of the prescribed/logged sets. */
function summarize(exercise: LoggedExercise): string {
  const sets = exercise.sets;
  const done = sets.filter((s) => s.completed).length;
  const reps = sets[0]?.reps;
  const weight = sets[0]?.weightKg;
  const uniformReps = sets.every((s) => s.reps === reps);
  const uniformWeight = sets.every((s) => s.weightKg === weight);
  const repsPart = uniformReps && reps != null ? ` × ${reps}` : '';
  const weightPart = uniformWeight && weight != null ? ` @ ${formatWeight(weight, isPerHand(exercise.exerciseId))}` : '';
  return `${done} set${done === 1 ? '' : 's'}${repsPart}${weightPart}`;
}

export function WorkoutLogForm({ workout, draft, onSubmit, submitting }: WorkoutLogFormProps) {
  const [log, setLog] = useState<WorkoutLog>(draft);
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const [showSessionDetails, setShowSessionDetails] = useState(false);

  function toggleExpanded(index: number) {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(index) ? next.delete(index) : next.add(index);
      return next;
    });
  }

  function updateExercise(index: number, updater: (ex: LoggedExercise) => LoggedExercise) {
    setLog((prev) => ({
      ...prev,
      loggedExercises: prev.loggedExercises.map((ex, i) => (i === index ? updater(ex) : ex)),
    }));
  }

  function updateSet(exIndex: number, setIndex: number, patch: Partial<LoggedSet>) {
    updateExercise(exIndex, (ex) => ({
      ...ex,
      sets: ex.sets.map((s, i) => (i === setIndex ? { ...s, ...patch } : s)),
    }));
  }

  function addSet(exIndex: number) {
    updateExercise(exIndex, (ex) => ({
      ...ex,
      sets: [...ex.sets, { ...ex.sets[ex.sets.length - 1], setNumber: ex.sets.length + 1 }],
    }));
  }

  function removeSet(exIndex: number, setIndex: number) {
    updateExercise(exIndex, (ex) => ({
      ...ex,
      sets: ex.sets.filter((_, i) => i !== setIndex).map((s, i) => ({ ...s, setNumber: i + 1 })),
    }));
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    onSubmit(log);
  }

  const groups = useMemo(() => {
    const order: { key: LoggedExercise['sectionType']; title: string; showTechnique: boolean }[] = [
      { key: 'skill', title: 'Skill', showTechnique: true },
      { key: 'strength', title: 'Strength', showTechnique: false },
      { key: 'accessories', title: 'Accessories', showTechnique: false },
    ];
    return order
      .map((g) => ({
        ...g,
        items: log.loggedExercises
          .map((ex, index) => ({ ex, index }))
          .filter(({ ex }) => ex.sectionType === g.key),
      }))
      .filter((g) => g.items.length > 0);
  }, [log.loggedExercises]);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="rounded-lg border border-border/60 bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
        Everything is pre-filled as your coach prescribed it. If you did the session as written, just{' '}
        <span className="font-medium text-foreground">confirm</span> below. Otherwise tap{' '}
        <span className="font-medium text-foreground">Adjust</span> on any movement to change it.
      </div>

      {groups.map((group) => (
        <Card key={group.key}>
          <CardHeader>
            <CardTitle>{group.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {group.items.map(({ ex, index }) => {
              const open = expanded.has(index);
              return (
                <div key={index} className="rounded-lg border border-border/60">
                  <div className="flex items-center gap-3 px-3 py-2.5">
                    <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Check className="size-3.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-medium">{ex.exerciseName}</div>
                      <div className="text-xs text-muted-foreground">{summarize(ex)}</div>
                    </div>
                    {group.showTechnique && ex.techniqueRating != null && (
                      <span className="text-xs text-muted-foreground">technique {ex.techniqueRating}/5</span>
                    )}
                    <Button
                      type="button"
                      variant={open ? 'secondary' : 'ghost'}
                      size="sm"
                      onClick={() => toggleExpanded(index)}
                    >
                      {open ? <ChevronDown className="size-4" /> : <Pencil className="size-3.5" />}
                      {open ? 'Done' : 'Adjust'}
                    </Button>
                  </div>

                  {open && (
                    <div className="space-y-2 border-t border-border/60 px-3 py-3">
                      {group.showTechnique && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Technique</span>
                          <TechniqueRating
                            value={ex.techniqueRating}
                            onChange={(v) => updateExercise(index, (e) => ({ ...e, techniqueRating: v }))}
                          />
                        </div>
                      )}

                      <div className="grid grid-cols-[auto_1fr_1fr_1fr_auto] items-center gap-2 text-xs text-muted-foreground">
                        <span className="w-8">Set</span>
                        <span>Reps</span>
                        <span>Kg</span>
                        <span>RPE</span>
                        <span className="w-8" />
                      </div>

                      {ex.sets.map((set, setIndex) => (
                        <div key={setIndex} className="grid grid-cols-[auto_1fr_1fr_1fr_auto] items-center gap-2">
                          <button
                            type="button"
                            aria-label={set.completed ? 'Mark set not done' : 'Mark set done'}
                            onClick={() => updateSet(index, setIndex, { completed: !set.completed })}
                            className={cn(
                              'flex size-8 items-center justify-center rounded-lg border text-sm transition-colors',
                              set.completed
                                ? 'border-primary bg-primary text-primary-foreground'
                                : 'border-input text-muted-foreground hover:bg-muted'
                            )}
                          >
                            {set.completed ? <Check className="size-4" /> : set.setNumber}
                          </button>
                          <Input
                            type="number"
                            inputMode="numeric"
                            aria-label={`Set ${set.setNumber} reps`}
                            value={set.reps ?? ''}
                            onChange={(e) => updateSet(index, setIndex, { reps: numOrUndefined(e.target.value) })}
                          />
                          <Input
                            type="number"
                            inputMode="decimal"
                            step="0.5"
                            aria-label={`Set ${set.setNumber} weight`}
                            value={set.weightKg ?? ''}
                            onChange={(e) => updateSet(index, setIndex, { weightKg: numOrUndefined(e.target.value) })}
                          />
                          <Input
                            type="number"
                            inputMode="numeric"
                            min={1}
                            max={10}
                            aria-label={`Set ${set.setNumber} RPE`}
                            value={set.rpe ?? ''}
                            onChange={(e) => updateSet(index, setIndex, { rpe: numOrUndefined(e.target.value) })}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            aria-label="Remove set"
                            onClick={() => removeSet(index, setIndex)}
                          >
                            <X className="size-4" />
                          </Button>
                        </div>
                      ))}

                      <Button type="button" variant="ghost" size="sm" onClick={() => addSet(index)}>
                        <Plus className="size-3.5" /> Add set
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>
      ))}

      <Card>
        <CardHeader>
          <CardTitle>WOD result {workout.sections.wod.wodFormat ? `— ${workout.sections.wod.wodFormat}` : ''}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="wodScore">Score / result (optional)</Label>
            <Input
              id="wodScore"
              placeholder='e.g. "5 rounds + 12 reps" or "11:42"'
              value={log.wodScore ?? ''}
              onChange={(e) => setLog((prev) => ({ ...prev, wodScore: e.target.value || undefined }))}
            />
          </div>
        </CardContent>
      </Card>

      <div className="rounded-lg border border-border/60">
        <button
          type="button"
          onClick={() => setShowSessionDetails((v) => !v)}
          className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium"
        >
          Session notes &amp; overall RPE (optional)
          <ChevronDown className={cn('size-4 transition-transform', showSessionDetails && 'rotate-180')} />
        </button>
        {showSessionDetails && (
          <div className="space-y-5 border-t border-border/60 px-4 py-4">
            <SliderField
              id="overallRpe"
              label="Overall RPE"
              value={log.overallRpe ?? 7}
              onChange={(v) => setLog((prev) => ({ ...prev, overallRpe: v }))}
              lowLabel="Easy"
              highLabel="Maximal"
            />
            <div className="space-y-2">
              <Label htmlFor="sessionNotes">Notes</Label>
              <Textarea
                id="sessionNotes"
                placeholder="How did it feel? Anything to remember for next time?"
                value={log.notes ?? ''}
                onChange={(e) => setLog((prev) => ({ ...prev, notes: e.target.value || undefined }))}
              />
            </div>
          </div>
        )}
      </div>

      <Button type="submit" size="lg" className="w-full" disabled={submitting}>
        {submitting ? 'Saving…' : 'Confirm & save workout'}
      </Button>
    </form>
  );
}
