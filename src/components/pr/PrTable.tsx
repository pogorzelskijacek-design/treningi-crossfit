import { useMemo, useState } from 'react';
import { Pencil, Plus, Trophy } from 'lucide-react';
import type { PersonalRecord, StandardPrType } from '@/domain';
import { STANDARD_PR_LABELS, STANDARD_PR_TYPES } from '@/domain';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { usePersonalRecords } from '@/context/usePersonalRecords';
import { PrEditDialog } from './PrEditDialog';
import { formatDateShort } from '@/lib/date';

interface DialogState {
  open: boolean;
  editing?: PersonalRecord | null;
  seedType?: StandardPrType | null;
}

export function PrTable() {
  const { currentBests, records, upsert, remove } = usePersonalRecords();
  const [dialog, setDialog] = useState<DialogState>({ open: false });

  const customBests = useMemo(() => {
    const byLabel = new Map<string, PersonalRecord>();
    for (const pr of records) {
      if (!pr.isCustom) continue;
      const existing = byLabel.get(pr.type);
      if (!existing || (pr.valueKg ?? 0) > (existing.valueKg ?? 0)) byLabel.set(pr.type, pr);
    }
    return [...byLabel.values()];
  }, [records]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <CardTitle>Personal records</CardTitle>
          <Button variant="outline" size="sm" onClick={() => setDialog({ open: true, seedType: null })}>
            <Plus className="size-4" /> Custom PR
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-1">
        {STANDARD_PR_TYPES.map((type) => {
          const best = currentBests.get(type);
          return (
            <PrRow
              key={type}
              label={STANDARD_PR_LABELS[type]}
              best={best}
              onEdit={() =>
                best
                  ? setDialog({ open: true, editing: best })
                  : setDialog({ open: true, seedType: type })
              }
              onDelete={best ? () => remove(best.id) : undefined}
            />
          );
        })}

        {customBests.length > 0 && (
          <>
            <div className="mt-3 mb-1 text-xs font-medium text-muted-foreground">Custom</div>
            {customBests.map((pr) => (
              <PrRow
                key={pr.id}
                label={pr.label}
                best={pr}
                onEdit={() => setDialog({ open: true, editing: pr })}
                onDelete={() => remove(pr.id)}
              />
            ))}
          </>
        )}
      </CardContent>

      <PrEditDialog
        open={dialog.open}
        editing={dialog.editing}
        seedType={dialog.seedType}
        onSave={upsert}
        onClose={() => setDialog({ open: false })}
      />
    </Card>
  );
}

interface PrRowProps {
  label: string;
  best?: PersonalRecord;
  onEdit: () => void;
  onDelete?: () => void;
}

function PrRow({ label, best, onEdit, onDelete }: PrRowProps) {
  return (
    <div className="flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-muted/40">
      <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
        <Trophy className="size-4" />
      </div>
      <span className="flex-1 text-sm font-medium">{label}</span>
      {best ? (
        <div className="text-right">
          <div className="text-sm font-semibold tabular-nums">
            {best.valueKg} kg{best.reps && best.reps > 1 ? ` × ${best.reps}` : ''}
          </div>
          <div className="text-xs text-muted-foreground">{formatDateShort(best.date)}</div>
        </div>
      ) : (
        <span className="text-sm text-muted-foreground">—</span>
      )}
      <Button variant="ghost" size="icon-sm" aria-label={`Edit ${label}`} onClick={onEdit}>
        {best ? <Pencil className="size-3.5" /> : <Plus className="size-3.5" />}
      </Button>
      {onDelete && (
        <Button variant="ghost" size="icon-sm" aria-label={`Delete ${label} record`} onClick={onDelete}>
          <span className="text-xs text-muted-foreground">✕</span>
        </Button>
      )}
    </div>
  );
}
