import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import type { GeneratedWorkout, WorkoutLog } from '@/domain';
import { useRepositories } from '@/context/RepositoryProvider';
import { useWorkoutHistory } from '@/context/useWorkoutHistory';
import { usePersonalRecords } from '@/context/usePersonalRecords';
import { WorkoutLogForm } from '@/components/workout/WorkoutLogForm';
import { NewPrDialog } from '@/components/pr/NewPrDialog';
import { Skeleton } from '@/components/ui/skeleton';
import { buildDraftLog } from '@/lib/workoutLogDraft';
import { detectPrCandidates, prCandidateToRecord, type PrCandidate } from '@/lib/prDetection';

export function LogWorkoutPage() {
  const { generatedWorkoutId } = useParams();
  const navigate = useNavigate();
  const repos = useRepositories();
  const { logWorkout } = useWorkoutHistory();
  const { currentBests, upsert } = usePersonalRecords();

  const [workout, setWorkout] = useState<GeneratedWorkout | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [pendingLog, setPendingLog] = useState<WorkoutLog | null>(null);
  const [prCandidates, setPrCandidates] = useState<PrCandidate[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!generatedWorkoutId) return;
      const found = await repos.workouts.getGeneratedWorkoutById(generatedWorkoutId);
      if (!cancelled) {
        setWorkout(found);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [generatedWorkoutId, repos]);

  const draft = useMemo(() => (workout ? buildDraftLog(workout) : null), [workout]);

  async function finalize(log: WorkoutLog) {
    await logWorkout(log);
    toast.success('Workout logged', { description: 'Your session is saved to history.' });
    navigate('/history');
  }

  async function handleSubmit(log: WorkoutLog) {
    setSubmitting(true);
    const candidates = detectPrCandidates(log, currentBests);
    if (candidates.length > 0) {
      setPendingLog(log);
      setPrCandidates(candidates);
      setSubmitting(false);
      return;
    }
    await finalize(log);
  }

  async function confirmPrs(accepted: PrCandidate[]) {
    if (!pendingLog) return;
    for (const candidate of accepted) {
      await upsert(prCandidateToRecord(candidate, pendingLog.date, pendingLog.id));
    }
    toast.success(accepted.length > 1 ? 'PRs saved' : 'PR saved');
    const log = pendingLog;
    setPendingLog(null);
    setPrCandidates([]);
    await finalize(log);
  }

  async function dismissPrs() {
    if (!pendingLog) return;
    const log = pendingLog;
    setPendingLog(null);
    setPrCandidates([]);
    await finalize(log);
  }

  if (loading) {
    return <Skeleton className="h-96 w-full" />;
  }

  if (!workout || !draft) {
    return (
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Workout not found</h1>
        <p className="text-sm text-muted-foreground">
          This generated workout is no longer available. Generate a new one from the Today tab.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Log Workout</h1>
        <p className="mt-1 text-sm text-muted-foreground">{workout.focus}</p>
      </div>

      <WorkoutLogForm workout={workout} draft={draft} onSubmit={handleSubmit} submitting={submitting} />

      <NewPrDialog
        candidates={prCandidates}
        open={prCandidates.length > 0}
        onConfirm={confirmPrs}
        onDismiss={dismissPrs}
      />
    </div>
  );
}
