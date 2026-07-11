import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { TrainingDay } from '@/domain';
import { useProfile } from '@/context/useProfile';
import { useTodayWorkout } from '@/context/useTodayWorkout';
import { ReadinessForm } from '@/components/workout/ReadinessForm';
import { GeneratedWorkoutView } from '@/components/workout/GeneratedWorkoutView';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { todaysFocusToken } from '@/lib/date';

const FOCUS_OPTIONS: { token: TrainingDay; label: string }[] = [
  { token: 'tuesday', label: 'Lower + Olympic' },
  { token: 'thursday', label: 'Upper + Gymnastics' },
];

export function GenerateWorkoutPage() {
  const navigate = useNavigate();
  const { profile, loading: profileLoading } = useProfile();
  const scheduledToken = profile ? todaysFocusToken(profile.weeklySchedule) : null;
  const [override, setOverride] = useState<TrainingDay | null>(null);
  const focusToken: TrainingDay = override ?? scheduledToken ?? 'tuesday';
  const { generated, restoring, submitting, error, submitCheckin, setGenerated } = useTodayWorkout(focusToken);

  if (profileLoading) {
    return <Skeleton className="h-64 w-full" />;
  }

  const showFocusPicker = !scheduledToken && !generated && !restoring;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Today&apos;s Workout</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Check in, and your coach will program today&apos;s session.
        </p>
      </div>

      {showFocusPicker && (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <span className="text-sm text-muted-foreground">
            Today isn&apos;t a scheduled training day — pick a focus to program anyway:
          </span>
          <div className="flex gap-2">
            {FOCUS_OPTIONS.map(({ token, label }) => (
              <Button
                key={token}
                type="button"
                size="sm"
                variant={focusToken === token ? 'default' : 'outline'}
                onClick={() => setOverride(token)}
              >
                {label}
              </Button>
            ))}
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
        <ReadinessForm day={focusToken} submitting={submitting} onSubmit={submitCheckin} />
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
