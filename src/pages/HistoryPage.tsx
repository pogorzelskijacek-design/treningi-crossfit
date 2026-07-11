import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, List, Dumbbell } from 'lucide-react';
import type { WorkoutLog } from '@/domain';
import { useWorkoutHistory } from '@/context/useWorkoutHistory';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/common/EmptyState';
import { WorkoutHistoryList } from '@/components/history/WorkoutHistoryList';
import { WorkoutCalendar } from '@/components/history/WorkoutCalendar';
import { WorkoutDetailDialog } from '@/components/history/WorkoutDetailDialog';

export function HistoryPage() {
  const { history, loading, deleteLog } = useWorkoutHistory();
  const [selected, setSelected] = useState<WorkoutLog | null>(null);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">History</h1>
        <p className="mt-1 text-sm text-muted-foreground">Every logged workout, in list and calendar form.</p>
      </div>

      {loading ? (
        <Skeleton className="h-64 w-full" />
      ) : history.length === 0 ? (
        <EmptyState
          icon={Dumbbell}
          title="No workouts logged yet"
          description="Generate and log your first Tuesday or Thursday session to start building your history."
          action={
            <Link to="/generate" className={cn(buttonVariants())}>
              Generate today&apos;s workout
            </Link>
          }
        />
      ) : (
        <Tabs defaultValue="list">
          <TabsList>
            <TabsTrigger value="list">
              <List className="size-4" /> List
            </TabsTrigger>
            <TabsTrigger value="calendar">
              <CalendarDays className="size-4" /> Calendar
            </TabsTrigger>
          </TabsList>
          <TabsContent value="list">
            <WorkoutHistoryList history={history} onSelect={setSelected} />
          </TabsContent>
          <TabsContent value="calendar">
            <WorkoutCalendar history={history} onSelect={setSelected} />
          </TabsContent>
        </Tabs>
      )}

      <WorkoutDetailDialog log={selected} onClose={() => setSelected(null)} onDelete={deleteLog} />
    </div>
  );
}
