import { useState, type FormEvent } from 'react';
import type { KnowledgeCategory, KnowledgeSource, KnowledgeSourceType } from '@/domain';
import {
  KNOWLEDGE_CATEGORY_LABELS,
  KNOWLEDGE_CATEGORY_ORDER,
  KNOWLEDGE_TYPE_LABELS,
} from '@/domain';
import { newId } from '@/lib/id';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ToggleChip } from '@/components/common/ToggleChip';

interface AddSourceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (source: KnowledgeSource) => Promise<void>;
}

const TYPE_ORDER: KnowledgeSourceType[] = [
  'article',
  'pdf',
  'book',
  'research',
  'podcast',
  'video',
  'other',
];

const selectClass = cn(
  'h-9 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none transition-colors',
  'focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30'
);

export function AddSourceDialog({ open, onOpenChange, onAdd }: AddSourceDialogProps) {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [category, setCategory] = useState<KnowledgeCategory>('strength_hypertrophy');
  const [type, setType] = useState<KnowledgeSourceType>('article');
  const [url, setUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [isFree, setIsFree] = useState(true);
  const [saving, setSaving] = useState(false);

  function reset() {
    setTitle('');
    setAuthor('');
    setCategory('strength_hypertrophy');
    setType('article');
    setUrl('');
    setNotes('');
    setIsFree(true);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim() || saving) return;
    setSaving(true);
    try {
      await onAdd({
        id: newId(),
        title: title.trim(),
        author: author.trim() || undefined,
        category,
        type,
        url: url.trim() || undefined,
        notes: notes.trim() || undefined,
        isFree,
        status: 'linked',
        addedAt: new Date().toISOString(),
        isSeed: false,
      });
      reset();
      onOpenChange(false);
    } catch {
      // Parent surfaces the failure via a toast; keep the dialog open so the
      // athlete doesn't lose what they typed.
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add a knowledge source</DialogTitle>
          <DialogDescription>
            Link an article, upload reference, book or podcast the coach should learn from. Use
            free/official sources or material you legally own.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="src-title">Title</Label>
            <Input
              id="src-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Overcoming Gravity (2nd ed.)"
              autoFocus
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="src-category">Category</Label>
              <select
                id="src-category"
                value={category}
                onChange={(e) => setCategory(e.target.value as KnowledgeCategory)}
                className={selectClass}
              >
                {KNOWLEDGE_CATEGORY_ORDER.map((c) => (
                  <option key={c} value={c}>
                    {KNOWLEDGE_CATEGORY_LABELS[c]}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="src-type">Type</Label>
              <select
                id="src-type"
                value={type}
                onChange={(e) => setType(e.target.value as KnowledgeSourceType)}
                className={selectClass}
              >
                {TYPE_ORDER.map((t) => (
                  <option key={t} value={t}>
                    {KNOWLEDGE_TYPE_LABELS[t]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="src-author">Author / source (optional)</Label>
            <Input
              id="src-author"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="e.g. Steven Low"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="src-url">Link (optional)</Label>
            <Input
              id="src-url"
              type="url"
              inputMode="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://…"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="src-notes">Notes (optional)</Label>
            <Textarea
              id="src-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="What this source covers and why it's credible."
              rows={2}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Availability</Label>
            <div className="flex flex-wrap gap-1.5">
              <ToggleChip label="Free / official" active={isFree} onToggle={() => setIsFree(true)} />
              <ToggleChip label="Paid (I own it)" active={!isFree} onToggle={() => setIsFree(false)} />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!title.trim() || saving}>
              {saving ? 'Adding…' : 'Add source'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
