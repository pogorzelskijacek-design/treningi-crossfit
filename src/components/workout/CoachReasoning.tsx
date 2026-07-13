import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, Quote, Sparkles } from 'lucide-react';
import type { GeneratedWorkout } from '@/domain';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useKnowledgeSources } from '@/context/useKnowledgeSources';
import { citableSources, explainWorkout, type CoachExplanation } from '@/lib/aiCoach';

type State = 'idle' | 'loading' | 'done' | 'error';

/**
 * On-demand: asks the AI coach to justify this session, grounded in — and
 * quoting — the athlete's knowledge sources. Not auto-run, so it costs nothing
 * unless the athlete asks.
 */
export function CoachReasoning({ workout }: { workout: GeneratedWorkout }) {
  const { all } = useKnowledgeSources();
  const ready = citableSources(all);
  const [state, setState] = useState<State>('idle');
  const [result, setResult] = useState<CoachExplanation | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setState('loading');
    setError(null);
    try {
      setResult(await explainWorkout(workout, ready));
      setState('done');
    } catch (err) {
      console.error('explainWorkout failed', err);
      setError(
        'Nie udało się pobrać uzasadnienia. Upewnij się, że funkcja explain-workout jest wdrożona, a klucz ANTHROPIC_API_KEY ustawiony w Supabase.'
      );
      setState('error');
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Sparkles className="size-4 text-primary" />
          Uzasadnienie ze źródeł (AI)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {ready.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Aby trener uzasadnił trening cytatami, dodaj źródła z treścią w zakładce{' '}
            <Link to="/knowledge" className="font-medium text-foreground underline underline-offset-2">
              Knowledge
            </Link>{' '}
            (wklej kluczowe fragmenty lub notatki w polu „Text for the AI coach to quote”).
          </p>
        ) : state === 'idle' ? (
          <>
            <p className="text-sm text-muted-foreground">
              Trener wyjaśni dobór tej sesji na podstawie {ready.length}{' '}
              {ready.length === 1 ? 'źródła' : 'źródeł'} — z cytatami.
            </p>
            <Button onClick={run} variant="outline">
              <Sparkles />
              Wyjaśnij ten trening
            </Button>
          </>
        ) : state === 'loading' ? (
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            Analizuję źródła…
          </p>
        ) : state === 'error' ? (
          <>
            <p className="text-sm text-destructive">{error}</p>
            <Button onClick={run} variant="outline" size="sm">
              Spróbuj ponownie
            </Button>
          </>
        ) : result ? (
          <div className="space-y-3">
            {result.answer ? (
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">{result.answer}</p>
            ) : (
              <p className="text-sm text-muted-foreground">Trener nie zwrócił uzasadnienia.</p>
            )}

            {result.citations.length > 0 && (
              <div className="space-y-2 border-t border-border pt-3">
                <p className="text-xs font-medium text-muted-foreground">Cytowane źródła</p>
                {result.citations.map((c, i) => (
                  <blockquote key={i} className="border-l-2 border-primary/40 pl-3 text-xs">
                    <span className="flex items-center gap-1 font-medium text-foreground">
                      <Quote className="size-3" />
                      {c.title}
                    </span>
                    <span className="italic text-muted-foreground">„{c.citedText}”</span>
                  </blockquote>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between gap-2 pt-1">
              {result.model && <p className="text-[10px] text-muted-foreground">Model: {result.model}</p>}
              <Button onClick={run} variant="ghost" size="xs" className="ml-auto">
                Odśwież
              </Button>
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
