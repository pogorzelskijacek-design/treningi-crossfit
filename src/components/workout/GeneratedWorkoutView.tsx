import { useState } from 'react';
import { CirclePlay } from 'lucide-react';
import type { GeneratedWorkout, WorkoutSection } from '@/domain';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ExerciseVideoDialog } from '@/components/exercises/ExerciseVideoDialog';
import { CoachReasoning } from '@/components/workout/CoachReasoning';
import { formatDateLong } from '@/lib/date';
import { formatWeight } from '@/lib/weight';

interface GeneratedWorkoutViewProps {
  workout: GeneratedWorkout;
  onLogWorkout?: () => void;
}

type ActiveExercise = { id: string; name: string } | null;

export function GeneratedWorkoutView({ workout, onLogWorkout }: GeneratedWorkoutViewProps) {
  const [active, setActive] = useState<ActiveExercise>(null);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-2">
            <CardTitle>{workout.focus}</CardTitle>
            <Badge variant="secondary">~{workout.estimatedDurationMinutes} min</Badge>
          </div>
          <CardDescription>{formatDateLong(workout.date)}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed text-foreground">{workout.rationale}</p>
          {workout.appliedRules.length > 0 && (
            <details className="mt-3 text-xs text-muted-foreground">
              <summary className="cursor-pointer select-none font-medium">
                Why these choices? ({workout.appliedRules.length})
              </summary>
              <ul className="mt-2 list-disc space-y-1 pl-4">
                {workout.appliedRules.map((rule, i) => (
                  <li key={i}>{rule}</li>
                ))}
              </ul>
            </details>
          )}
        </CardContent>
      </Card>

      {Object.values(workout.sections)
        .filter((section) => section.items.length > 0)
        .map((section) => (
          <SectionCard key={section.type} section={section} onPlay={(id, name) => setActive({ id, name })} />
        ))}

      <CoachReasoning workout={workout} />

      {onLogWorkout && (
        <Button onClick={onLogWorkout} size="lg" className="w-full">
          Log this workout
        </Button>
      )}

      <ExerciseVideoDialog
        exerciseId={active?.id}
        exerciseName={active?.name}
        open={active != null}
        onOpenChange={(open) => !open && setActive(null)}
      />
    </div>
  );
}

interface SectionCardProps {
  section: WorkoutSection;
  onPlay: (exerciseId: string, exerciseName: string) => void;
}

function SectionCard({ section, onPlay }: SectionCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <CardTitle>{section.title}</CardTitle>
          {section.timeCapMinutes != null && <Badge variant="outline">{section.timeCapMinutes} min</Badge>}
        </div>
      </CardHeader>
      <CardContent>
        {section.items.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nothing matched your equipment or constraints today — adjust equipment in your profile if this looks
            wrong.
          </p>
        ) : (
          <ul className="space-y-3">
            {section.items.map((item, i) => (
              <li
                key={i}
                className="flex flex-col gap-0.5 border-b border-border/60 pb-3 last:border-0 last:pb-0"
              >
                <div className="flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => onPlay(item.exerciseId, item.exerciseName)}
                    className="group flex items-center gap-1.5 text-left font-medium transition-colors hover:text-primary"
                    title={`Watch ${item.exerciseName} demo`}
                  >
                    {item.exerciseName}
                    <CirclePlay className="size-3.5 shrink-0 text-muted-foreground transition-colors group-hover:text-red-500" />
                  </button>
                  <span className="text-right text-sm text-muted-foreground">
                    {item.prescription}
                    {item.prescribedWeightKg != null && (
                      <span className="ml-1 font-semibold text-foreground">
                        @ {formatWeight(item.prescribedWeightKg, item.weightPerHand)}
                      </span>
                    )}
                  </span>
                </div>
                {item.loadNote && <span className="text-xs text-muted-foreground">{item.loadNote}</span>}
                {item.notes && <span className="text-xs text-muted-foreground italic">{item.notes}</span>}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
