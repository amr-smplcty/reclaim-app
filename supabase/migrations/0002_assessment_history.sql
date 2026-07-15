-- PPCS-6 assessment history (CLINICAL_SPEC §2.2) — one row per
-- administration: onboarding's 6-month one, plus every 14-day 2-week
-- re-take. Append-only from the client (useAssessmentHistoryStore never
-- overwrites); rows are never updated or deleted by the app.
create table if not exists assessment_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  score int not null check (score >= 6 and score <= 42),
  band text not null check (band in ('A', 'B', 'C', 'D')),
  timeframe text not null check (timeframe in ('past_6_months', 'past_2_weeks')),
  responses int[] not null,
  instrument_version text not null,
  recorded_at timestamptz not null
);

alter table assessment_history enable row level security;

create policy "users can insert their own assessment history"
  on assessment_history for insert
  with check (auth.uid() = user_id);

create policy "users can read their own assessment history"
  on assessment_history for select
  using (auth.uid() = user_id);
