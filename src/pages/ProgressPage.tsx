import { useMemo } from 'react';
import { LineChart as LineChartIcon, Dumbbell, CalendarRange, Gauge, Weight } from 'lucide-react';
import { useWorkoutHistory } from '@/context/useWorkoutHistory';
import { usePersonalRecords } from '@/context/usePersonalRecords';
import { StatTile } from '@/components/common/StatTile';
import { EmptyState } from '@/components/common/EmptyState';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { VolumeChart } from '@/components/progress/VolumeChart';
import { RpeTrendChart } from '@/components/progress/RpeTrendChart';
import { PrProgressionChart } from '@/components/progress/PrProgressionChart';
import { PrTable } from '@/components/pr/PrTable';
import { computeStats, recentWods, sessionTrend } from '@/lib/stats';
import { todayIso } from '@/lib/date';

export function ProgressPage() {
  const { history, loading } = useWorkoutHistory();
  const { records } = usePersonalRecords();

  const stats = useMemo(() => computeStats(history, todayIso()), [history]);
  const trend = useMemo(() => sessionTrend(history), [history]);
  const wods = useMemo(() => recentWods(history), [history]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Progress</h1>
        <p className="mt-1 text-sm text-muted-foreground">Volume, RPE trends, and personal record progression.</p>
      </div>

      {loading ? (
        <Skeleton className="h-64 w-full" />
      ) : (
        <>
          {history.length === 0 ? (
            <EmptyState
              icon={LineChartIcon}
              title="No sessions logged yet"
              description="Volume, RPE, and WOD charts appear here once you've logged a few workouts. You can still track your maxes below."
            />
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                <StatTile icon={Dumbbell} label="Total workouts" value={String(stats.totalWorkouts)} />
                <StatTile
                  icon={Gauge}
                  label="Avg RPE"
                  value={stats.averageRpe != null ? String(stats.averageRpe) : '—'}
                />
                <StatTile
                  icon={Weight}
                  label="This week"
                  value={stats.weeklyVolumeKg.toLocaleString()}
                  hint="kg volume"
                />
                <StatTile
                  icon={CalendarRange}
                  label="This month"
                  value={stats.monthlyVolumeKg.toLocaleString()}
                  hint="kg volume"
                />
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <VolumeChart data={trend} />
                <RpeTrendChart data={trend} />
              </div>

              <PrProgressionChart records={records} />

              {wods.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Recent WOD results</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {wods.map((wod, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between border-b border-border/60 pb-2 text-sm last:border-0 last:pb-0"
                      >
                        <div className="flex items-center gap-2">
                          {wod.wodFormat && <Badge variant="outline">{wod.wodFormat}</Badge>}
                          <span className="font-medium">{wod.score}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">{wod.label}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </>
          )}

          <PrTable />
        </>
      )}
    </div>
  );
}
