import { useCallback, useEffect, useState } from 'react';
import type { GeneratedWorkout, ReadinessCheckin, SessionFocus } from '@/domain';
import { generateWorkout } from '@/coaching';
import { newId } from '@/lib/id';
import { todayIso } from '@/lib/date';
import { useRepositories } from './RepositoryProvider';

export type ReadinessInput = Omit<ReadinessCheckin, 'id' | 'focuses' | 'date'>;

export function useTodayWorkout(focuses: SessionFocus[]) {
  const repos = useRepositories();
  const focusKey = focuses.join(',');
  const [generated, setGenerated] = useState<GeneratedWorkout | null>(null);
  const [restoring, setRestoring] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setRestoring(true);
    setGenerated(null);
    (async () => {
      const recent = await repos.workouts.getRecentGenerated(5);
      const today = recent.find((w) => w.date === todayIso());
      if (!cancelled) {
        setGenerated(today ?? null);
        setRestoring(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [focusKey, repos]);

  const submitCheckin = useCallback(
    async (input: ReadinessInput) => {
      setSubmitting(true);
      setError(null);
      try {
        const checkin: ReadinessCheckin = { id: newId(), focuses, date: todayIso(), ...input };
        await repos.readiness.save(checkin);

        const [profile, history, prHistory] = await Promise.all([
          repos.profile.get(),
          repos.workouts.getAll(),
          repos.prs.getAll(),
        ]);
        if (!profile) throw new Error('Set up your profile before generating a workout.');

        const workout = generateWorkout(focuses, checkin, history, prHistory, profile);
        await repos.workouts.saveGeneratedWorkout(workout);
        setGenerated(workout);
        return workout;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to generate workout.');
        return null;
      } finally {
        setSubmitting(false);
      }
    },
    [focusKey, focuses, repos]
  );

  return { generated, restoring, submitting, error, submitCheckin, setGenerated };
}
