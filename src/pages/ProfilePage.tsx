import { useEffect, useState, type FormEvent } from 'react';
import { X, Plus } from 'lucide-react';
import { toast } from 'sonner';
import type { EquipmentType, ExperienceLevel, Goal, UserProfile } from '@/domain';
import {
  EQUIPMENT_LABELS,
  EXPERIENCE_LABELS,
  GOAL_LABELS,
} from '@/domain';
import { useProfile } from '@/context/useProfile';
import { REFERENCE_LIFT_GROUPS, getExerciseName, resolveWorkingWeight } from '@/data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ToggleChip } from '@/components/common/ToggleChip';
import { Skeleton } from '@/components/ui/skeleton';
import { ScheduleEditor } from '@/components/profile/ScheduleEditor';
import { normalizeSchedule } from '@/domain';

const GOAL_ENTRIES = Object.entries(GOAL_LABELS) as [Goal, string][];
const EQUIPMENT_ENTRIES = Object.entries(EQUIPMENT_LABELS) as [Exclude<EquipmentType, 'none'>, string][];
const EXPERIENCE_ENTRIES = Object.entries(EXPERIENCE_LABELS) as [ExperienceLevel, string][];

export function ProfilePage() {
  const { profile, loading, save } = useProfile();
  const [draft, setDraft] = useState<UserProfile | null>(null);
  const [injuryInput, setInjuryInput] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile)
      setDraft({
        ...profile,
        workingWeights: profile.workingWeights ?? {},
        weeklySchedule: normalizeSchedule(profile.weeklySchedule),
      });
  }, [profile]);

  if (loading || !draft) {
    return <Skeleton className="h-96 w-full" />;
  }

  function update<K extends keyof UserProfile>(key: K, value: UserProfile[K]) {
    setDraft((prev) => (prev ? { ...prev, [key]: value } : prev));
  }

  function toggleGoal(goal: Goal) {
    if (!draft) return;
    const goals = draft.goals.includes(goal)
      ? draft.goals.filter((g) => g !== goal)
      : [...draft.goals, goal];
    update('goals', goals);
  }

  function toggleEquipment(eq: Exclude<EquipmentType, 'none'>) {
    if (!draft) return;
    const equipment = draft.availableEquipment.includes(eq)
      ? draft.availableEquipment.filter((e) => e !== eq)
      : [...draft.availableEquipment, eq];
    update('availableEquipment', equipment);
  }

  function setWorkingWeight(exerciseId: string, kg: number | undefined) {
    setDraft((prev) => {
      if (!prev) return prev;
      const workingWeights = { ...(prev.workingWeights ?? {}) };
      if (kg == null || kg <= 0) delete workingWeights[exerciseId];
      else workingWeights[exerciseId] = kg;
      return { ...prev, workingWeights };
    });
  }

  function addInjury() {
    const value = injuryInput.trim();
    if (!value || !draft) return;
    update('injuries', [...draft.injuries, value]);
    setInjuryInput('');
  }

  function removeInjury(index: number) {
    if (!draft) return;
    update('injuries', draft.injuries.filter((_, i) => i !== index));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!draft) return;
    setSaving(true);
    await save(draft);
    setSaving(false);
    toast.success('Profile saved');
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Profile</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Your stats, goals, equipment, and weekly schedule — your coach uses these to program your sessions.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Athlete stats</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-3 gap-3">
          <div className="space-y-2">
            <Label htmlFor="height">Height (cm)</Label>
            <Input
              id="height"
              type="number"
              value={draft.heightCm}
              onChange={(e) => update('heightCm', Number(e.target.value))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="weight">Weight (kg)</Label>
            <Input
              id="weight"
              type="number"
              step="0.5"
              value={draft.weightKg}
              onChange={(e) => update('weightKg', Number(e.target.value))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="age">Age</Label>
            <Input
              id="age"
              type="number"
              value={draft.age}
              onChange={(e) => update('age', Number(e.target.value))}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Experience level</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {EXPERIENCE_ENTRIES.map(([level, label]) => (
            <ToggleChip
              key={level}
              label={label}
              active={draft.experienceLevel === level}
              onToggle={() => update('experienceLevel', level)}
            />
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Goals</CardTitle>
          <CardDescription>What you want your training to develop.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {GOAL_ENTRIES.map(([goal, label]) => (
            <ToggleChip
              key={goal}
              label={label}
              active={draft.goals.includes(goal)}
              onToggle={() => toggleGoal(goal)}
            />
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Available equipment</CardTitle>
          <CardDescription>Only movements using gear you have on hand will be programmed.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {EQUIPMENT_ENTRIES.map(([eq, label]) => (
            <ToggleChip
              key={eq}
              label={label}
              active={draft.availableEquipment.includes(eq)}
              onToggle={() => toggleEquipment(eq)}
            />
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Working weights</CardTitle>
          <CardDescription>
            Your default working load per lift (kg). The coach prescribes from these, adjusts for your daily
            readiness, and nudges the weight up as you complete sessions cleanly.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {REFERENCE_LIFT_GROUPS.map((group) => (
            <div key={group.title} className="space-y-2">
              <div className="text-xs font-medium text-muted-foreground">{group.title}</div>
              <div className="grid gap-x-4 gap-y-2 sm:grid-cols-2">
                {group.exerciseIds.map((exerciseId) => (
                  <div key={exerciseId} className="flex items-center justify-between gap-3">
                    <Label htmlFor={`ww-${exerciseId}`} className="text-sm font-normal">
                      {getExerciseName(exerciseId)}
                    </Label>
                    <div className="flex items-center gap-1.5">
                      <Input
                        id={`ww-${exerciseId}`}
                        type="number"
                        step="2.5"
                        min={0}
                        className="w-20 text-right"
                        value={resolveWorkingWeight(exerciseId, draft) ?? ''}
                        onChange={(e) =>
                          setWorkingWeight(
                            exerciseId,
                            e.target.value === '' ? undefined : Number(e.target.value)
                          )
                        }
                      />
                      <span className="text-xs text-muted-foreground">kg</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Injuries &amp; limitations</CardTitle>
          <CardDescription>
            Your coach avoids loading these areas. e.g. &quot;left shoulder&quot;, &quot;lower back&quot;.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Input
              value={injuryInput}
              onChange={(e) => setInjuryInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addInjury();
                }
              }}
              placeholder="Add an injury or limitation"
            />
            <Button type="button" variant="outline" onClick={addInjury}>
              <Plus className="size-4" /> Add
            </Button>
          </div>
          {draft.injuries.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {draft.injuries.map((injury, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-sm"
                >
                  {injury}
                  <button
                    type="button"
                    aria-label={`Remove ${injury}`}
                    onClick={() => removeInjury(i)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="size-3.5" />
                  </button>
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No injuries logged — training is unrestricted.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Weekly schedule</CardTitle>
          <CardDescription>
            Choose which days the coach programs for you (“Coached”) and how many per week. Other days are your
            own Hyrox/team classes or rest.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScheduleEditor
            value={draft.weeklySchedule}
            onChange={(weeklySchedule) => update('weeklySchedule', weeklySchedule)}
          />
        </CardContent>
      </Card>

      <div className="sticky bottom-16 z-10 md:bottom-4">
        <Button type="submit" size="lg" className="w-full shadow-lg" disabled={saving}>
          {saving ? 'Saving…' : 'Save profile'}
        </Button>
      </div>
    </form>
  );
}
