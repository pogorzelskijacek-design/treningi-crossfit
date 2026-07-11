# AI CrossFit / Hyrox Coach

A personal coaching web app that programs your **Tuesday** (Lower Body + Core +
Olympic lifting) and **Thursday** (Upper Body + Gymnastics) sessions — the way an
experienced CrossFit coach would. It is **not** a random WOD generator: every
session is produced by a deterministic rules engine that reads your readiness
check-in, workout history, personal records, and profile, and explains *why*
today's workout was chosen.

Monday and Wednesday (coached Hyrox classes) and the optional Saturday team WOD
are **not** programmed by the app.

## Features

- **Readiness check-in** before every session — energy, recovery, sleep,
  soreness, pain/injuries, previous-session completion, notes.
- **Coaching engine** that:
  - reduces volume 25–40% when fatigue is high, caps intensity on poor sleep,
    and nudges load up on excellent recovery — never increasing volume and
    intensity in the same week;
  - rotates the Olympic-lift progression (11 clean variations) and WOD format
    (8 formats) using a least-recently-used algorithm so nothing repeats;
  - caps heavy lower-body loading in Tuesday's WOD after Monday's Hyrox class;
  - steers around sore/injured areas from your check-in and profile;
  - keeps Handstand Walk, Bar Muscle-Up, and Snatch out of every block except
    optional skill practice;
  - writes a plain-English rationale for each session.
- **Weights from your profile** — set a working weight per lift once; the coach
  prescribes concrete loads (e.g. *Back Squat 5×5 @ 120 kg*), scales them to your
  daily readiness, and ratchets them up as you complete sessions cleanly. Olympic
  technique loads derive automatically from your power-clean weight.
- **One-tap logging** — every set is pre-filled as prescribed and assumed done, so
  you just **Confirm & save**. Did something differently? Tap *Adjust* on that one
  movement and change only what changed.
- **Automatic PR detection** — beat a tracked lift and it prompts to save the PR.
- **History** — list + calendar views with full session detail.
- **Progress** — volume trend, RPE trend, PR progression charts, training stats
  (total workouts, week streak, average RPE, weekly/monthly volume), best WODs.
- **Personal records** — 9 standard lifts plus custom PRs.
- **Profile** — height, weight, age, goals, experience, equipment, injuries,
  weekly schedule (feeds the engine).
- **Dark mode** (default), light mode, and a fully responsive layout.
- **Installable mobile app (PWA)** — add it to your phone's home screen for a
  full-screen, offline-capable app with its own icon (see below).

## Tech stack

React · TypeScript · Vite · Tailwind CSS · shadcn/ui · lucide-react · Recharts ·
react-router-dom · Vitest · vite-plugin-pwa (Workbox). Data persists to
**localStorage** behind a repository interface designed for a drop-in swap to
Supabase / Postgres / Firebase.

## Install on your phone (PWA)

The app is a Progressive Web App, so it installs to your home screen and runs
full-screen and offline — no app store needed. First it has to be reachable from
your phone (same Wi-Fi as this computer, or deployed to a host — see below).

- **iPhone / iPad (Safari):** open the app's URL → tap **Share** → **Add to Home
  Screen**.
- **Android (Chrome):** open the app's URL → menu **⋮** → **Install app** / **Add
  to Home screen**.

Once installed it opens like a native app (barbell icon, dark splash, no browser
bar) and works offline; your data stays on the device.

> Running the dev server (`npm run dev`) binds to `localhost`. To open it on your
> phone over Wi-Fi, run `npm run dev -- --host` and visit
> `http://<your-computer-ip>:5173` from the phone. For a permanent install,
> deploy the production build (`npm run build` → the `dist/` folder) to any static
> host (Vercel, Netlify, GitHub Pages, Cloudflare Pages). PWA install prompts
> require HTTPS, which those hosts provide automatically.

Later this same codebase can be wrapped with **Capacitor** to ship real App Store
/ Google Play binaries with native health/notification integrations — the PWA is
the foundation for that.

## Getting started

Requires Node.js 20+.

```bash
npm install
npm run dev      # start the dev server (http://localhost:5173)
```

On first launch a default profile (height 184 cm, weight 93 kg) is created — edit
it on the **Profile** page. Go to **Today** to run a readiness check-in and
generate a session, then **log** it to build history, PRs, and progress charts.

## Scripts

```bash
npm run dev       # dev server with HMR
npm run build     # type-check + production build
npm run preview   # preview the production build
npm run test      # run the coaching-engine unit tests (Vitest)
npm run lint      # oxlint
```

## Architecture

See [ARCHITECTURE.md](ARCHITECTURE.md) for the module boundaries and the design
decisions that keep the coaching engine and persistence layer swappable. In
short:

- `src/domain/` — pure types, zero dependencies.
- `src/data/` — the static exercise library (~105 movements, tagged).
- `src/coaching/` — the isolated rules engine (`programmingRules.ts`). Takes plain
  data in, returns a `GeneratedWorkout` out. No UI or storage imports, so it can
  later be swapped for an LLM-based recommender behind the same signature.
- `src/data-access/` — async repository interfaces + a localStorage implementation;
  `getRepositories()` is the single swap point for a future backend.
- `src/context/` — React hooks wiring the repositories and engine to the UI.
- `src/pages/` + `src/components/` — the shadcn/ui-based interface.

## Testing

The coaching engine — the product's core — has direct unit coverage
(`src/coaching/**/*.test.ts`, `src/lib/stats.test.ts`): rotation LRU logic,
fatigue/recovery adjustments, section appropriateness, banned-movement exclusion,
determinism, and stats aggregation. Run with `npm run test`.
