import { useState, type FormEvent } from 'react';
import type { TrainingDay } from '@/domain';
import type { ReadinessInput } from '@/context/useTodayWorkout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { SliderField } from '@/components/common/SliderField';
import { cn } from '@/lib/utils';

interface ReadinessFormProps {
  day: TrainingDay;
  onSubmit: (input: ReadinessInput) => unknown;
  submitting?: boolean;
}

export function ReadinessForm({ day, onSubmit, submitting }: ReadinessFormProps) {
  const [energy, setEnergy] = useState(6);
  const [recovery, setRecovery] = useState(6);
  const [soreness, setSoreness] = useState(3);
  const [sleepHours, setSleepHours] = useState(7.5);
  const [painOrInjuries, setPainOrInjuries] = useState('');
  const [previousWorkoutCompleted, setPreviousWorkoutCompleted] = useState(true);
  const [notes, setNotes] = useState('');

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    onSubmit({
      energy,
      recovery,
      soreness,
      sleepHours,
      painOrInjuries,
      previousWorkoutCompleted,
      notes: notes.trim() ? notes.trim() : undefined,
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>How are you feeling today?</CardTitle>
        <CardDescription>
          {day === 'tuesday' ? 'Lower Body + Olympic Lifting' : 'Upper Body + Gymnastics'} day — a few questions
          before your coach programs today&apos;s session.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <SliderField
            id="energy"
            label="Energy"
            value={energy}
            onChange={setEnergy}
            lowLabel="Wiped out"
            highLabel="Great"
          />
          <SliderField
            id="recovery"
            label="Recovery"
            value={recovery}
            onChange={setRecovery}
            lowLabel="Beat up"
            highLabel="Fully recovered"
          />
          <SliderField
            id="soreness"
            label="Muscle soreness"
            value={soreness}
            onChange={setSoreness}
            lowLabel="None"
            highLabel="Very sore"
          />

          <div className="space-y-2">
            <Label htmlFor="sleepHours">Sleep last night (hours)</Label>
            <Input
              id="sleepHours"
              type="number"
              min={0}
              max={14}
              step={0.5}
              value={sleepHours}
              onChange={(e) => setSleepHours(Number(e.target.value))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="painOrInjuries">Pain or injuries</Label>
            <Textarea
              id="painOrInjuries"
              placeholder="e.g. slight left shoulder soreness, nothing serious"
              value={painOrInjuries}
              onChange={(e) => setPainOrInjuries(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Did you complete {day === 'tuesday' ? "Monday's Hyrox class" : 'your last scheduled session'}?</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={previousWorkoutCompleted ? 'default' : 'outline'}
                className={cn('flex-1')}
                onClick={() => setPreviousWorkoutCompleted(true)}
              >
                Yes
              </Button>
              <Button
                type="button"
                variant={!previousWorkoutCompleted ? 'default' : 'outline'}
                className={cn('flex-1')}
                onClick={() => setPreviousWorkoutCompleted(false)}
              >
                No
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Additional notes (optional)</Label>
            <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>

          <Button type="submit" disabled={submitting} className="w-full">
            {submitting ? 'Programming your workout…' : "Generate today's workout"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
