-- Delete-account flow (PRODUCT_SPEC §5.6 / LEGAL_COMPLIANCE §5.6-5.7): the
-- client needs to delete its own rows in every table it can otherwise
-- read/write, scoped the same way as the existing insert/select policies.
-- This does NOT delete the auth.users row itself — Supabase only allows
-- that via a service-role key, which this client-only app doesn't hold; see
-- src/features/settings/deleteAccount.ts and BACKLOG for the follow-up.
create policy "users can delete their own legal acceptances"
  on legal_acceptances for delete
  using (auth.uid() = user_id);

create policy "users can delete their own assessment history"
  on assessment_history for delete
  using (auth.uid() = user_id);
