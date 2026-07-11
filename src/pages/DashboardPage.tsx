import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Flame, Dumbbell, Gauge, Weight } from 'lucide-react';
import { useProfile } from '@/context/useProfile';
import { useWorkoutHistory } from '@/context/useWorkoutHistory';
import { StatTile } from '@/components/common/StatTile';
import { NextWorkoutCard } from '@/components/dashboard/NextWorkoutCard';
import { WeeklyScheduleCard } from '@/components/dashboard/WeeklyScheduleCard';
import { WorkoutHistoryList } from '@/components/history/WorkoutHistoryList';
import { WorkoutDetailDialog } from '@/components/history/WorkoutDetailDialog';
import { Skeleton } from '@/components/ui/skeleton';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { computeStats } from '@/lib/stats';
import { todayIso } from '@/lib/date';
import { DEFAULT_WEEKLY_SCHEDULE, type WorkoutLog } from '@/domain';

export function DashboardPage() {
  const { profile, loading: profileLoading } = useProfile();
  const { history, loading: historyLoading, deleteLog } = useWorkoutHistory();
  const [selected, setSelected] = useState<WorkoutLog | null>(null);

  const stats = useMemo(() => computeStats(history, todayIso()), [history]);
  const recent = history.slice(0, 3);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Your weekly schedule, next workout, and training snapshot.
        </p>
      </div>

      {historyLoading ? (
        <Skeleton className="h-24 w-full" />
      ) : (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatTile icon={Dumbbell} label="Total workouts" value={String(stats.totalWorkouts)} />
          <StatTile
            icon={Flame}
            label="Week streak"
            value={String(stats.weekStreak)}
            hint={stats.weekStreak === 1 ? 'week' : 'weeks'}
          />
          <StatTile icon={Gauge} label="Avg RPE" value={stats.averageRpe != null ? String(stats.averageRpe) : '—'} />
          <StatTile
            icon={Weight}
            label="This week"
            value={`${stats.weeklyVolumeKg.toLocaleString()}`}
            hint="kg volume"
          />
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <NextWorkoutCard />
        {profileLoading || !profile ? (
          <Skeleton className="h-80 w-full" />
        ) : (
          <WeeklyScheduleCard schedule={profile?.weeklySchedule ?? DEFAULT_WEEKLY_SCHEDULE} />
        )}
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold tracking-tight">Recent workouts</h2>
          {history.length > 0 && (
            <Link to="/history" className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }))}>
              View all
            </Link>
          )}
        </div>
        {historyLoading ? (
          <Skeleton className="h-20 w-full" />
        ) : recent.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
            No workouts logged yet. Head to the Today tab to program and log your first session.
          </p>
        ) : (
          <WorkoutHistoryList history={recent} onSelect={setSelected} />
        )}
      </div>

      <WorkoutDetailDialog log={selected} onClose={() => setSelected(null)} onDelete={deleteLog} />
    </div>
  );
}
