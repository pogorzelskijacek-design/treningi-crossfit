-- AI CrossFit / Hyrox Coach — database schema + Row-Level Security.
-- Run this once in the Supabase SQL editor (Dashboard → SQL Editor → New query → paste → Run).
-- Safe to re-run: it uses "if not exists" / "drop policy if exists".

-- Each table stores the domain object as `data` (jsonb) plus a few promoted,
-- indexed columns for querying. Every row is owned by a user; RLS makes each
-- user able to see and change ONLY their own rows.

-- ---------- profiles (one row per user) ----------
create table if not exists public.profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

-- ---------- generated workouts ----------
create table if not exists public.generated_workouts (
  id text primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  day text not null,
  date text not null,
  data jsonb not null,
  created_at timestamptz not null default now()
);
create index if not exists generated_workouts_user_day_idx
  on public.generated_workouts (user_id, day, date desc);

-- ---------- workout logs ----------
create table if not exists public.workout_logs (
  id text primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  day text not null,
  date text not null,
  data jsonb not null,
  created_at timestamptz not null default now()
);
create index if not exists workout_logs_user_day_idx
  on public.workout_logs (user_id, day, date desc);

-- ---------- personal records ----------
create table if not exists public.personal_records (
  id text primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  type text not null,
  date text not null,
  data jsonb not null,
  created_at timestamptz not null default now()
);
create index if not exists personal_records_user_idx
  on public.personal_records (user_id);

-- ---------- readiness check-ins ----------
create table if not exists public.readiness_checkins (
  id text primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  date text not null,
  data jsonb not null,
  created_at timestamptz not null default now()
);
create index if not exists readiness_checkins_user_idx
  on public.readiness_checkins (user_id, date desc);

-- ---------- Row-Level Security ----------
alter table public.profiles          enable row level security;
alter table public.generated_workouts enable row level security;
alter table public.workout_logs      enable row level security;
alter table public.personal_records  enable row level security;
alter table public.readiness_checkins enable row level security;

-- One policy per table: a user may read/insert/update/delete only their own rows.
do $$
declare
  t text;
begin
  foreach t in array array[
    'profiles', 'generated_workouts', 'workout_logs', 'personal_records', 'readiness_checkins'
  ]
  loop
    execute format('drop policy if exists "own rows" on public.%I;', t);
    execute format(
      'create policy "own rows" on public.%I
         for all
         using (auth.uid() = user_id)
         with check (auth.uid() = user_id);', t);
  end loop;
end $$;
