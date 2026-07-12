import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { SessionFocus } from '@/domain';
import { SESSION_FOCUS_LABELS, SESSION_FOCUS_ORDER } from '@/domain';
import { useProfile } from '@/context/useProfile';
import { useTodayWorkout } from '@/context/useTodayWorkout';
import { ReadinessForm } from '@/components/workout/ReadinessForm';
import { GeneratedWorkoutView } from '@/components/workout/GeneratedWorkoutView';
import { ToggleChip } from '@/components/common/ToggleChip';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { todaysFocuses } from '@/lib/date';

export function GenerateWorkoutPage() {
  const navigate = useNavigate();
  const { profile, loading: profileLoading } = useProfile();
  const scheduledFocuses = profile ? todaysFocuses(profile.weeklySchedule) : [];
  const [override, setOverride] = useState<SessionFocus[] | null>(null);
  const activeFocuses: SessionFocus[] =
    override ?? (scheduledFocuses.length > 0 ? scheduledFocuses : ['lower', 'olympic']);
  const { generated, restoring, submitting, error, submitCheckin, setGenerated } = useTodayWorkout(activeFocuses);

  if (profileLoading) {
    return <Skeleton className="h-64 w-full" />;
  }

  const showFocusPicker = scheduledFocuses.length === 0 && !generated && !restoring;

  function toggleFocus(focus: SessionFocus) {
    // Start from what's actually shown (the default set until the user edits it).
    const current = override ?? activeFocuses;
    const next = current.includes(focus) ? current.filter((f) => f !== focus) : [...current, focus];
    setOverride(next);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Today&apos;s Workout</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Check in, and your coach will program today&apos;s session.
        </p>
      </div>

      {showFocusPicker && (
        <div className="space-y-2">
          <span className="text-sm text-muted-foreground">
            Today isn&apos;t a scheduled training day — pick one or more focuses to program:
          </span>
          <div className="flex flex-wrap gap-2">
            {SESSION_FOCUS_ORDER.map((focus) => (
              <ToggleChip
                key={focus}
                label={SESSION_FOCUS_LABELS[focus]}
                active={activeFocuses.includes(focus)}
                onToggle={() => toggleFocus(focus)}
              />
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
        <ReadinessForm focuses={activeFocuses} submitting={submitting} onSubmit={submitCheckin} />
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
