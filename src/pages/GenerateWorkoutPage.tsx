import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { TrainingDay } from '@/domain';
import { useTodayWorkout } from '@/context/useTodayWorkout';
import { ReadinessForm } from '@/components/workout/ReadinessForm';
import { GeneratedWorkoutView } from '@/components/workout/GeneratedWorkoutView';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { currentTrainingDay } from '@/lib/date';

export function GenerateWorkoutPage() {
  const navigate = useNavigate();
  const detectedDay = currentTrainingDay();
  const [day, setDay] = useState<TrainingDay>(detectedDay ?? 'tuesday');
  const { generated, restoring, submitting, error, submitCheckin, setGenerated } = useTodayWorkout(day);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Today&apos;s Workout</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Check in, and your coach will program today&apos;s session.
        </p>
      </div>

      {!detectedDay && !generated && !restoring && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            Today isn&apos;t a generated training day — pick one to program anyway:
          </span>
          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              variant={day === 'tuesday' ? 'default' : 'outline'}
              onClick={() => setDay('tuesday')}
            >
              Tuesday
            </Button>
            <Button
              type="button"
              size="sm"
              variant={day === 'thursday' ? 'default' : 'outline'}
              onClick={() => setDay('thursday')}
            >
              Thursday
            </Button>
          </div>
        </div>
      )}

      {restoring ? (
        <Skeleton className="h-64 w-full" />
      ) : generated ? (
        <div className="space-y-3">
          <GeneratedWorkoutView
            workout={generated}
            onLogWorkout={() => navigate(`/generate/log/${generated.id}`)}
          />
          <Button variant="outline" className="w-full" onClick={() => setGenerated(null)}>
            New check-in / regenerate
          </Button>
        </div>
      ) : (
        <ReadinessForm day={day} submitting={submitting} onSubmit={submitCheckin} />
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
