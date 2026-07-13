# `explain-workout` — source-grounded AI coach (Phase 2 / RAG)

A Supabase Edge Function that grounds the coach's reasoning in the athlete's
knowledge sources. It receives a plain-text brief of a generated session plus the
source texts, calls the **Claude API** with the **Citations** feature, and returns
reasoning that quotes those sources.

The Anthropic API key lives **only** here, as a Supabase secret — never in the
frontend bundle. Requests are gated by Supabase's default JWT check, so only a
signed-in user can invoke it.

## One-time setup

Prerequisite: the [Supabase CLI](https://supabase.com/docs/guides/cli) and an
Anthropic API key from <https://console.anthropic.com> (Settings → API keys; the
account needs billing/credit).

```bash
# 1. Log in and link this repo to the project (project ref is in src/lib/supabase.ts)
supabase login
supabase link --project-ref xdjlhklkhjbkfyneaved

# 2. Store the Anthropic key as a server-side secret (never committed)
supabase secrets set ANTHROPIC_API_KEY=sk-ant-...

# 3. Deploy the function
supabase functions deploy explain-workout
```

## Update after code changes

```bash
supabase functions deploy explain-workout
```

## Test from the CLI (optional)

```bash
curl -i -X POST \
  "https://xdjlhklkhjbkfyneaved.functions.supabase.co/explain-workout" \
  -H "Authorization: Bearer <a-logged-in-user-access-token>" \
  -H "apikey: <supabase-anon-key>" \
  -H "content-type: application/json" \
  -d '{"brief":"Focus: Lower + Olympic\n## Strength\n- Back Squat: 5x5 @ 110kg","sources":[{"title":"Test source","content":"Squats build lower-body strength; 5x5 is a classic strength scheme."}]}'
```

## Notes

- Model: `claude-opus-4-8`. Change `MODEL` in `index.ts` to `claude-haiku-4-5` for
  a cheaper/faster option.
- Cost is a few US cents per call at most; the panel is on-demand, so nothing is
  billed unless the athlete clicks "Wyjaśnij ten trening".
- Phase 2B (later): move source **selection** server-side with embeddings +
  `pgvector` so large e-books scale beyond what fits in one request.
