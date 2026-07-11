# Architecture

The app is built in layers with strict, one-directional dependencies. The goal is
that the two things most likely to change — **how workouts are decided** and
**where data is stored** — can each be replaced without touching the rest of the
app.

```
domain  ──►  (imported by everything, imports nothing)

data/            coaching/            data-access/
(static lib)     (rules engine)       (repositories)
      │                │                    │
      └────────┬───────┴──────────┬─────────┘
               ▼                   ▼
           context/  (hooks: wire repositories + engine to React)
               ▼
          pages/ + components/  (UI)
```

## Layer rules

### `src/domain/`
Pure TypeScript types and label maps. **Zero dependencies** — importable from
anywhere. Defines `Exercise`, `GeneratedWorkout`, `WorkoutLog`,
`ReadinessCheckin`, `PersonalRecord`, `UserProfile`, and the enums
(`TrainingDay`, `WodFormat`, `OlympicLiftProgression`, movement patterns, muscle
groups, equipment).

### `src/data/`
The static exercise library (~105 movements) split by category and merged in
`index.ts`. Each `Exercise` is tagged with movement pattern(s), primary/secondary
muscles, equipment, the sections it can appear in, and a `skillOnly` flag (used
for Handstand Walk, Bar Muscle-Up, Snatch). Depends only on `domain`.

### `src/coaching/` — the engine
The product's core, deliberately isolated. Public entry point:

```ts
generateWorkout(day, checkin, history, prHistory, profile, exerciseLibrary?, options?)
  : GeneratedWorkout
```

- **Pure and deterministic** — identical inputs always produce an identical
  workout (the id/date are injectable for tests). No `Date.now()`, no storage, no
  React.
- **Takes plain data in, returns plain data out.** It never imports from
  `pages/`, `components/`, or `data-access/`.
- Internally organized as small, individually testable pieces:
  - `rules/` — `fatigueAdjustment`, `weeklyLoadBalance`, `sorenessRules`,
    `postHyroxRule`, `liftProgression`. Each returns both its effect and a trace
    entry used to build the "why today" rationale.
  - `rotation/` — least-recently-used selection for Olympic lifts and WOD formats,
    plus movement-pattern de-duplication.
  - `selectors/` — history lookback and equipment/injury/section exercise filters.
  - `builders/` — assemble the six sections and compose the rationale string.
  - `programmingRules.ts` — the thin orchestrator that runs the pipeline.

**Why this matters:** a future LLM-based recommender can implement the same
`generateWorkout` signature (reusing the deterministic rules as guardrails), and
`context/useTodayWorkout.ts` just calls the new function — no UI, storage, or
domain changes needed.

### `src/data-access/` — persistence
Async repository interfaces (`WorkoutRepository`, `ProfileRepository`,
`PRRepository`, `ReadinessRepository`) in `types.ts`, with a localStorage
implementation in `localStorage/`. Every method returns a `Promise` even though
localStorage is synchronous, so call sites already treat data access as async.

`getRepositories()` in `index.ts` is the **single swap point**: to move to
Supabase / Postgres / Firebase, add a sibling implementation of the same
interfaces and branch here. UI and engine both go through the interfaces only and
would not change. Storage keys are namespaced and versioned
(`crossfit-coach:v1:*`).

### `src/context/`
Thin glue. `RepositoryProvider` exposes the repositories via context (and seeds a
default profile on first run). Per-domain hooks — `useProfile`,
`useWorkoutHistory`, `usePersonalRecords`, `useTodayWorkout` — own their own
fetch/refresh state and are the only place the UI touches data or the engine.
React Context + hooks were chosen over Redux/Zustand because update frequency is
low (explicit user actions, not per-keystroke); the hook boundary makes a later
upgrade cheap if needed.

### `src/pages/` + `src/components/`
The shadcn/ui interface. `components/ui/` holds generated primitives;
`components/{layout,dashboard,workout,history,progress,pr,common}/` hold feature
components. Routing is `react-router-dom` (Dashboard, Today/Generate, Log,
History, Progress, Profile).

## Extension points (future work, already unblocked)

- **AI coach / workout analysis** — new `coaching/` implementation behind
  `generateWorkout`.
- **Cloud sync, auth, wearables (Garmin/Strava/WHOOP/Concept2)** — new
  `data-access/` implementation behind `getRepositories()`; add a `userId` to the
  interfaces when multi-user is needed.
- **Automatic progressive overload / deload planning** — extend `rules/`
  (PR history is already threaded into `generateWorkout`).
- **PDF/Excel export, notifications, calendar** — additive UI over the existing
  repositories.
