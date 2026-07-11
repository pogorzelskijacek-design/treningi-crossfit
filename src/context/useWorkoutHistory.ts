import { useCallback, useEffect, useState } from 'react';
import type { WorkoutLog } from '@/domain';
import { useRepositories } from './RepositoryProvider';

export function useWorkoutHistory() {
  const { workouts } = useRepositories();
  const [history, setHistory] = useState<WorkoutLog[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    setHistory(await workouts.getAll());
    setLoading(false);
  }, [workouts]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const logWorkout = useCallback(
    async (log: WorkoutLog) => {
      await workouts.save(log);
      await refresh();
    },
    [workouts, refresh]
  );

  const deleteLog = useCallback(
    async (id: string) => {
      await workouts.delete(id);
      await refresh();
    },
    [workouts, refresh]
  );

  return { history, loading, logWorkout, deleteLog, refresh };
}
