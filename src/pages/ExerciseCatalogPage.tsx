import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CirclePlay, Play, Search } from 'lucide-react';
import type { Exercise, ExerciseCategory } from '@/domain';
import { EXERCISE_LIBRARY, exerciseVideo } from '@/data';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ExerciseVideoDialog } from '@/components/exercises/ExerciseVideoDialog';

const CATEGORY_LABELS: Record<ExerciseCategory, string> = {
  barbell: 'Barbell',
  olympic_lifting: 'Olympic Lifting',
  dumbbell: 'Dumbbell',
  kettlebell: 'Kettlebell',
  gymnastics: 'Gymnastics',
  bodyweight: 'Bodyweight',
  machine: 'Machines & Cardio',
  strongman: 'Strongman',
  conditioning: 'Conditioning',
  mobility: 'Mobility & Warm-up',
};

const CATEGORY_ORDER: ExerciseCategory[] = [
  'barbell',
  'olympic_lifting',
  'dumbbell',
  'kettlebell',
  'gymnastics',
  'bodyweight',
  'machine',
  'strongman',
  'conditioning',
  'mobility',
];

function prettyMuscles(exercise: Exercise): string {
  return exercise.primaryMuscles
    .slice(0, 2)
    .map((m) => m.replace(/_/g, ' '))
    .join(' · ');
}

export function ExerciseCatalogPage() {
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState('');
  const [active, setActive] = useState<Exercise | null>(null);

  // Deep link (?ex=<id>) — auto-open a movement's demo, e.g. from a workout.
  useEffect(() => {
    const exId = params.get('ex');
    if (!exId) return;
    const found = EXERCISE_LIBRARY.find((e) => e.id === exId);
    if (found) {
      setActive(found);
      requestAnimationFrame(() => {
        document.getElementById(`ex-${exId}`)?.scrollIntoView({ block: 'center' });
      });
    }
  }, [params]);

  const grouped = useMemo(() => {
    const q = query.trim().toLowerCase();
    const matches = EXERCISE_LIBRARY.filter((e) => !q || e.name.toLowerCase().includes(q));
    const byCategory = new Map<ExerciseCategory, Exercise[]>();
    for (const ex of matches) {
      const list = byCategory.get(ex.category) ?? [];
      list.push(ex);
      byCategory.set(ex.category, list);
    }
    const orderedCats = [
      ...CATEGORY_ORDER.filter((c) => byCategory.has(c)),
      ...[...byCategory.keys()].filter((c) => !CATEGORY_ORDER.includes(c)),
    ];
    return orderedCats.map((cat) => ({
      category: cat,
      exercises: byCategory.get(cat)!.sort((a, b) => a.name.localeCompare(b.name)),
    }));
  }, [query]);

  function openExercise(ex: Exercise) {
    setActive(ex);
  }

  function handleDialogChange(open: boolean) {
    if (!open) {
      setActive(null);
      if (params.has('ex')) {
        params.delete('ex');
        setParams(params, { replace: true });
      }
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Exercise Library</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Tap any movement for a technique demo from the{' '}
          <span className="text-foreground">CrossFit Essentials</span> series on YouTube.
        </p>
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search movements…"
          className="h-10 pl-9"
        />
      </div>

      {grouped.length === 0 ? (
        <p className="text-sm text-muted-foreground">No movements match “{query}”.</p>
      ) : (
        grouped.map(({ category, exercises }) => (
          <section key={category} className="space-y-3">
            <h2 className="text-sm font-semibold text-muted-foreground">{CATEGORY_LABELS[category] ?? category}</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {exercises.map((ex) => (
                <ExerciseCard key={ex.id} exercise={ex} onOpen={() => openExercise(ex)} />
              ))}
            </div>
          </section>
        ))
      )}

      <ExerciseVideoDialog
        exerciseId={active?.id}
        exerciseName={active?.name}
        open={active != null}
        onOpenChange={handleDialogChange}
      />
    </div>
  );
}

function ExerciseCard({ exercise, onOpen }: { exercise: Exercise; onOpen: () => void }) {
  const video = exerciseVideo(exercise.id, exercise.name);
  return (
    <button
      id={`ex-${exercise.id}`}
      type="button"
      onClick={onOpen}
      className="group flex scroll-mt-24 flex-col overflow-hidden rounded-xl border border-border bg-card text-left transition-colors hover:border-primary/60"
    >
      <div className="relative aspect-video w-full overflow-hidden bg-muted">
        {video.thumbnailUrl ? (
          <img
            src={video.thumbnailUrl}
            alt=""
            loading="lazy"
            className="size-full object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="flex size-full items-center justify-center bg-gradient-to-br from-muted to-muted/40">
            <CirclePlay className="size-7 text-muted-foreground" />
          </div>
        )}
        <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/30">
          <span className="flex size-9 items-center justify-center rounded-full bg-background/90 text-foreground opacity-0 shadow-sm transition-opacity group-hover:opacity-100">
            <Play className="size-4 fill-current" />
          </span>
        </div>
        {exercise.skillOnly && (
          <Badge variant="secondary" className="absolute left-1.5 top-1.5 text-[10px]">
            Skill
          </Badge>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-0.5 p-2.5">
        <span className="text-sm font-medium leading-tight">{exercise.name}</span>
        <span className="text-xs capitalize text-muted-foreground">{prettyMuscles(exercise)}</span>
      </div>
    </button>
  );
}
