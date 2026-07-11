import { Trophy } from 'lucide-react';
import type { PrCandidate } from '@/lib/prDetection';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface NewPrDialogProps {
  candidates: PrCandidate[];
  open: boolean;
  onConfirm: (accepted: PrCandidate[]) => void;
  onDismiss: () => void;
}

export function NewPrDialog({ candidates, open, onConfirm, onDismiss }: NewPrDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(next) => !next && onDismiss()}>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Trophy className="size-5" />
            </div>
            <DialogTitle>New personal record{candidates.length > 1 ? 's' : ''}!</DialogTitle>
          </div>
          <DialogDescription>
            You beat your previous best on {candidates.length === 1 ? 'this lift' : 'these lifts'}. Save{' '}
            {candidates.length > 1 ? 'them' : 'it'} to your records?
          </DialogDescription>
        </DialogHeader>

        <ul className="space-y-2">
          {candidates.map((candidate) => (
            <li
              key={candidate.type}
              className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2 text-sm"
            >
              <span className="font-medium">{candidate.label}</span>
              <span className="tabular-nums text-muted-foreground">
                {candidate.valueKg} kg × {candidate.reps}
              </span>
            </li>
          ))}
        </ul>

        <DialogFooter>
          <Button variant="outline" onClick={onDismiss}>
            Not a PR
          </Button>
          <Button onClick={() => onConfirm(candidates)}>Save {candidates.length > 1 ? 'PRs' : 'PR'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
