import { Link } from 'react-router-dom';
import { ArrowRight, CalendarClock } from 'lucide-react';
import type { TrainingDay } from '@/domain';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { buttonVariants } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { currentTrainingDay } from '@/lib/date';
import { focusForDay, dayLabel } from '@/lib/workoutSummary';

/** Today if it's a training day, otherwise the next Tuesday/Thursday. */
function nextTrainingDay(): { day: TrainingDay; isToday: boolean } {
  const today = currentTrainingDay();
  if (today) return { day: today, isToday: true };
  const dow = new Date().getDay(); // 0 Sun .. 6 Sat
  // Next Tuesday (2) or Thursday (4), whichever comes first.
  const nextTue = (2 - dow + 7) % 7 || 7;
  const nextThu = (4 - dow + 7) % 7 || 7;
  return { day: nextTue <= nextThu ? 'tuesday' : 'thursday', isToday: false };
}

export function NextWorkoutCard() {
  const { day, isToday } = nextTrainingDay();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <CardTitle>Next workout</CardTitle>
          <Badge variant={isToday ? 'default' : 'secondary'}>
            {isToday ? 'Today' : dayLabel(day)}
          </Badge>
        </div>
        <CardDescription>{focusForDay(day)}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3 rounded-lg bg-muted/50 px-3 py-2.5 text-sm text-muted-foreground">
          <CalendarClock className="size-4 shrink-0" />
          <span>
            {isToday
              ? 'Ready when you are — check in and your coach will program the session.'
              : `Your next coached session is ${dayLabel(day)}. Monday & Wednesday are Hyrox with your coach.`}
          </span>
        </div>
        <Link to="/generate" className={cn(buttonVariants({ size: 'lg' }), 'w-full')}>
          {isToday ? "Start today's check-in" : 'Preview a session'}
          <ArrowRight className="size-4" />
        </Link>
      </CardContent>
    </Card>
  );
}
