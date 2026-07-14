-- Legal doc acceptance records (LEGAL_COMPLIANCE §9) — one row per document
-- accepted, stamped with the version shown to the user and when.
create table if not exists legal_acceptances (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  doc text not null check (doc in ('tou', 'privacy')),
  doc_version text not null,
  accepted_at timestamptz not null
);

alter table legal_acceptances enable row level security;

create policy "users can insert their own legal acceptances"
  on legal_acceptances for insert
  with check (auth.uid() = user_id);

create policy "users can read their own legal acceptances"
  on legal_acceptances for select
  using (auth.uid() = user_id);
