import { useEffect, useState, type FormEvent } from 'react';
import type { PersonalRecord, StandardPrType } from '@/domain';
import { STANDARD_PR_LABELS } from '@/domain';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { newId } from '@/lib/id';
import { todayIso } from '@/lib/date';

interface PrEditDialogProps {
  open: boolean;
  /** Editing an existing PR, or seeding a new one for a known standard type. */
  editing?: PersonalRecord | null;
  seedType?: StandardPrType | null;
  onSave: (pr: PersonalRecord) => void;
  onClose: () => void;
}

export function PrEditDialog({ open, editing, seedType, onSave, onClose }: PrEditDialogProps) {
  const [label, setLabel] = useState('');
  const [valueKg, setValueKg] = useState('');
  const [reps, setReps] = useState('1');
  const [date, setDate] = useState(todayIso());
  const isCustom = editing ? editing.isCustom : !seedType;

  useEffect(() => {
    if (!open) return;
    if (editing) {
      setLabel(editing.label);
      setValueKg(editing.valueKg != null ? String(editing.valueKg) : '');
      setReps(editing.reps != null ? String(editing.reps) : '1');
      setDate(editing.date);
    } else if (seedType) {
      setLabel(STANDARD_PR_LABELS[seedType]);
      setValueKg('');
      setReps('1');
      setDate(todayIso());
    } else {
      setLabel('');
      setValueKg('');
      setReps('1');
      setDate(todayIso());
    }
  }, [open, editing, seedType]);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const kg = Number(valueKg);
    if (!label.trim() || !Number.isFinite(kg) || kg <= 0) return;

    const pr: PersonalRecord = {
      id: editing?.id ?? newId(),
      type: editing?.type ?? seedType ?? label.trim(),
      label: label.trim(),
      isCustom,
      valueKg: kg,
      reps: Number(reps) || 1,
      date,
      workoutLogId: editing?.workoutLogId,
    };
    onSave(pr);
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editing ? 'Edit record' : 'Add personal record'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="pr-label">Lift</Label>
            <Input
              id="pr-label"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              disabled={!isCustom}
              placeholder="e.g. Weighted Pull-up"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="pr-weight">Weight (kg)</Label>
              <Input
                id="pr-weight"
                type="number"
                step="0.5"
                min={0}
                value={valueKg}
                onChange={(e) => setValueKg(e.target.value)}
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pr-reps">Reps</Label>
              <Input
                id="pr-reps"
                type="number"
                min={1}
                value={reps}
                onChange={(e) => setReps(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="pr-date">Date</Label>
            <Input id="pr-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Save</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
