// Supabase Edge Function: explain-workout
// -----------------------------------------------------------------------------
// Source-grounded AI coach (Phase 2 / RAG). Receives a plain-text brief of a
// generated session plus the athlete's knowledge-source texts, calls the Claude
// API with the **Citations** feature, and returns reasoning that quotes those
// sources. The Anthropic API key lives only here (as a Supabase secret) — never
// in the frontend bundle.
//
// Deploy:   supabase functions deploy explain-workout
// Secret:   supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
// -----------------------------------------------------------------------------

const CORS: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const MODEL = 'claude-opus-4-8';

const SYSTEM = `Jesteś doświadczonym trenerem CrossFit / Hyrox i przygotowania siłowego.
Twoim zadaniem jest wyjaśnić po polsku, DLACZEGO zaproponowana sesja treningowa jest sensownie ułożona.

ZASADY (bezwzględne):
- Opieraj się WYŁĄCZNIE na dostarczonych źródłach i cytuj je.
- Jeśli źródła nie obejmują jakiegoś elementu sesji, powiedz to wprost ("źródła tego nie obejmują") — nie zmyślaj i nie dodawaj wiedzy spoza źródeł.
- Bądź konkretny i zwięzły (4–8 zdań). Odnoś się do realnych elementów sesji: bloków, doboru ćwiczeń, objętości, intensywności.
- Nie udzielaj porad medycznych.`;

interface SourceInput {
  title?: string;
  content?: string;
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, 'content-type': 'application/json' },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  const apiKey = Deno.env.get('ANTHROPIC_API_KEY');
  if (!apiKey) return json({ error: 'ANTHROPIC_API_KEY is not set on the server.' }, 500);

  let payload: { brief?: string; sources?: SourceInput[] };
  try {
    payload = await req.json();
  } catch {
    return json({ error: 'Invalid JSON body.' }, 400);
  }

  const brief = String(payload?.brief ?? '').slice(0, 8000);
  const sources = Array.isArray(payload?.sources) ? payload.sources : [];
  if (!brief) return json({ error: 'Missing workout brief.' }, 400);
  if (sources.length === 0) return json({ answer: '', citations: [], model: MODEL });

  // Each source becomes a citable document block.
  const documents = sources.slice(0, 20).map((s) => ({
    type: 'document',
    source: { type: 'text', media_type: 'text/plain', data: String(s?.content ?? '').slice(0, 8000) },
    title: String(s?.title ?? 'Źródło').slice(0, 200),
    citations: { enabled: true },
  }));

  const userContent = [
    ...documents,
    {
      type: 'text',
      text: `Oto zaproponowana sesja treningowa:\n\n${brief}\n\nWyjaśnij po polsku, dlaczego taki dobór bloków, ćwiczeń, objętości i intensywności jest uzasadniony — cytując powyższe źródła. Jeśli czegoś w źródłach nie ma, powiedz to wprost.`,
    },
  ];

  let anthropicRes: Response;
  try {
    anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 1200,
        system: SYSTEM,
        messages: [{ role: 'user', content: userContent }],
      }),
    });
  } catch (err) {
    return json({ error: `Could not reach the Claude API: ${String(err)}` }, 502);
  }

  if (!anthropicRes.ok) {
    const detail = await anthropicRes.text();
    return json({ error: `Claude API error ${anthropicRes.status}`, detail: detail.slice(0, 500) }, 502);
  }

  const data = await anthropicRes.json();
  const blocks: unknown[] = Array.isArray(data?.content) ? data.content : [];

  let answer = '';
  const citations: { title: string; citedText: string }[] = [];
  for (const raw of blocks) {
    const block = raw as { type?: string; text?: string; citations?: unknown[] };
    if (block?.type !== 'text') continue;
    answer += block.text ?? '';
    for (const rawC of block.citations ?? []) {
      const c = rawC as { document_title?: string; cited_text?: string };
      const citedText = String(c?.cited_text ?? '').trim();
      if (citedText) citations.push({ title: String(c?.document_title ?? 'Źródło'), citedText });
    }
  }

  // De-duplicate identical citations.
  const seen = new Set<string>();
  const uniqueCitations = citations.filter((c) => {
    const key = `${c.title}||${c.citedText}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return json({ answer: answer.trim(), citations: uniqueCitations, model: data?.model ?? MODEL });
});
