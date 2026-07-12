import { Link } from 'react-router-dom';
import { ArrowRight, CalendarClock } from 'lucide-react';
import type { WeeklySchedule } from '@/domain';
import { focusesLabel } from '@/domain';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { buttonVariants } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { nextGeneratedDay, weekdayLabel } from '@/lib/date';

export function NextWorkoutCard({ schedule }: { schedule: WeeklySchedule }) {
  const next = nextGeneratedDay(schedule);

  if (!next) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Next workout</CardTitle>
          <CardDescription>No training days set up yet</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Mark which days you want the coach to program on your Profile, then come back to check in.
          </p>
          <Link to="/profile" className={cn(buttonVariants({ variant: 'outline', size: 'lg' }), 'w-full')}>
            Set up your week
            <ArrowRight className="size-4" />
          </Link>
        </CardContent>
      </Card>
    );
  }

  const { focuses, isToday, weekday } = next;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <CardTitle>Next workout</CardTitle>
          <Badge variant={isToday ? 'default' : 'secondary'}>{isToday ? 'Today' : weekdayLabel(weekday)}</Badge>
        </div>
        <CardDescription>{focusesLabel(focuses)}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3 rounded-lg bg-muted/50 px-3 py-2.5 text-sm text-muted-foreground">
          <CalendarClock className="size-4 shrink-0" />
          <span>
            {isToday
              ? 'Ready when you are — check in and your coach will program the session.'
              : `Your next coached session is ${weekdayLabel(weekday)}.`}
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
