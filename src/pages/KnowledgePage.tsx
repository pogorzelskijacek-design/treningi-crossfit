import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { BookOpen, ExternalLink, Lock, Plus, Search, Sparkles, Trash2 } from 'lucide-react';
import type { KnowledgeCategory, KnowledgeSource } from '@/domain';
import { KNOWLEDGE_CATEGORY_LABELS, KNOWLEDGE_CATEGORY_ORDER, KNOWLEDGE_TYPE_LABELS } from '@/domain';
import { useKnowledgeSources } from '@/context/useKnowledgeSources';
import { AddSourceDialog } from '@/components/knowledge/AddSourceDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

export function KnowledgePage() {
  const { all, userSources, loading, add, remove } = useKnowledgeSources();
  const [query, setQuery] = useState('');
  const [addOpen, setAddOpen] = useState(false);

  const grouped = useMemo(() => {
    const q = query.trim().toLowerCase();
    const matches = all.filter(
      (s) =>
        !q ||
        s.title.toLowerCase().includes(q) ||
        s.author?.toLowerCase().includes(q) ||
        s.notes?.toLowerCase().includes(q)
    );
    const byCategory = new Map<KnowledgeCategory, KnowledgeSource[]>();
    for (const s of matches) {
      const list = byCategory.get(s.category) ?? [];
      list.push(s);
      byCategory.set(s.category, list);
    }
    return KNOWLEDGE_CATEGORY_ORDER.filter((c) => byCategory.has(c)).map((category) => ({
      category,
      sources: byCategory.get(category)!,
    }));
  }, [all, query]);

  async function handleAdd(source: KnowledgeSource) {
    try {
      await add(source);
      toast.success('Source added', { description: source.title });
    } catch (err) {
      console.error('Failed to save knowledge source', err);
      toast.error('Could not save source', {
        description: 'The cloud table may still need setup — see the note at the top of the page.',
      });
      throw err;
    }
  }

  async function handleRemove(source: KnowledgeSource) {
    try {
      await remove(source.id);
      toast.success('Source removed', { description: source.title });
    } catch (err) {
      console.error('Failed to remove knowledge source', err);
      toast.error('Could not remove source');
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Knowledge</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            The curated, credible sources the coach is grounded in. Add your own to keep teaching it.
          </p>
        </div>
        <Button onClick={() => setAddOpen(true)}>
          <Plus />
          Add source
        </Button>
      </div>

      {/* Honest status: what the tab does today vs. the RAG upgrade next. */}
      <div className="flex gap-3 rounded-xl border border-primary/20 bg-primary/5 p-3.5 text-sm">
        <Sparkles className="mt-0.5 size-4 shrink-0 text-primary" />
        <div className="space-y-1">
          <p className="font-medium">Source-grounded coach — step 1 of 2</p>
          <p className="text-muted-foreground">
            This is the source library. Next comes ingestion + retrieval (RAG) so the coach quotes
            these sources directly instead of relying on the AI model's own knowledge. Use free /
            official sources or material you legally own — never pirated copies.
          </p>
        </div>
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search sources…"
          className="h-10 pl-9"
        />
      </div>

      {loading ? (
        <Skeleton className="h-64 w-full" />
      ) : (
        <>
          <p className="text-xs text-muted-foreground">
            {all.length} sources across {grouped.length || KNOWLEDGE_CATEGORY_ORDER.length} categories
            {userSources.length > 0 && ` · ${userSources.length} added by you`}
          </p>

          {grouped.length === 0 ? (
            <p className="text-sm text-muted-foreground">No sources match “{query}”.</p>
          ) : (
            grouped.map(({ category, sources }) => (
              <section key={category} className="space-y-2.5">
                <h2 className="text-sm font-semibold text-muted-foreground">
                  {KNOWLEDGE_CATEGORY_LABELS[category]}
                </h2>
                <div className="space-y-2">
                  {sources.map((source) => (
                    <SourceRow key={source.id} source={source} onRemove={() => handleRemove(source)} />
                  ))}
                </div>
              </section>
            ))
          )}
        </>
      )}

      <AddSourceDialog open={addOpen} onOpenChange={setAddOpen} onAdd={handleAdd} />
    </div>
  );
}

function SourceRow({ source, onRemove }: { source: KnowledgeSource; onRemove: () => void }) {
  const meta = [KNOWLEDGE_TYPE_LABELS[source.type], source.author].filter(Boolean).join(' · ');
  return (
    <div className="flex items-start gap-3 rounded-xl border border-border bg-card p-3">
      <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
        <BookOpen className="size-4" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="text-sm font-medium leading-tight">{source.title}</span>
          {source.isSeed && (
            <Badge variant="secondary" className="text-[10px]">
              Starter
            </Badge>
          )}
          {!source.isFree && (
            <Badge variant="outline" className="text-[10px]">
              <Lock />
              Paid
            </Badge>
          )}
        </div>
        {meta && <p className="mt-0.5 text-xs text-muted-foreground">{meta}</p>}
        {source.notes && <p className="mt-1 text-xs leading-snug text-muted-foreground">{source.notes}</p>}
      </div>

      <div className="flex shrink-0 items-center gap-0.5">
        {source.url && (
          <Button
            variant="ghost"
            size="icon-sm"
            render={
              <a href={source.url} target="_blank" rel="noreferrer noopener" aria-label="Open source" />
            }
          >
            <ExternalLink />
          </Button>
        )}
        {!source.isSeed && (
          <Button
            variant="ghost"
            size="icon-sm"
            className="text-muted-foreground hover:text-destructive"
            onClick={onRemove}
            aria-label="Remove source"
          >
            <Trash2 />
          </Button>
        )}
      </div>
    </div>
  );
}
