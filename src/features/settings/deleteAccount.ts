import { supabase } from '@/lib/supabase/client';
import { deleteEncryptionKey } from '@/lib/storage/encryptedStorage';
import { useAppStore } from '@/stores/useAppStore';
import { useOnboardingStore } from '@/features/assessment/useOnboardingStore';
import { useAssessmentHistoryStore } from '@/features/assessment/useAssessmentHistoryStore';
import { useJournalStore } from '@/features/journal/useJournalStore';
import { useToolkitStore } from '@/features/toolkit/useToolkitStore';
import { useProgramStore } from '@/features/program/useProgramStore';
import { useCommitmentGoalsStore } from '@/features/progress/useCommitmentGoalsStore';
import { useSettingsStore } from '@/features/settings/useSettingsStore';

// Every store that persists user data must be reset here (PRODUCT_SPEC §5.6
// "delete account + all data," a launch-required flow) — deleteAccount.test.ts
// enumerates the same list and fails loudly if a future store is added here
// without also being reset. The Keychain key is wiped first so any encrypted
// blob left over from a step that fails partway through is unrecoverable
// either way.
export async function deleteAllLocalData(): Promise<void> {
  await deleteEncryptionKey();

  useOnboardingStore.getState().reset();
  useAssessmentHistoryStore.getState().reset();
  useJournalStore.getState().reset();
  useToolkitStore.getState().reset();
  useProgramStore.getState().reset();
  useCommitmentGoalsStore.getState().reset();
  useSettingsStore.getState().reset();
  useAppStore.getState().reset();
}

// Best-effort remote deletion (LEGAL_COMPLIANCE §5.6/§5.7), same pattern as
// the rest of this codebase's Supabase writes: never blocks or throws,
// console.warns on failure. NOTE: this deletes the user's rows in every
// table the client can reach under RLS, and signs the session out — it does
// NOT delete the auth.users row itself, which requires a service-role key
// (Supabase never lets an anon client delete its own auth user). Tracked in
// BACKLOG as a real gap until a server-side (Edge Function) deletion exists.
export async function deleteAccountRemotely(userId: string): Promise<void> {
  const { error: legalError } = await supabase.from('legal_acceptances').delete().eq('user_id', userId);
  if (legalError) {
    console.warn('Failed to delete legal_acceptances remotely:', legalError.message);
  }

  const { error: assessmentError } = await supabase.from('assessment_history').delete().eq('user_id', userId);
  if (assessmentError) {
    console.warn('Failed to delete assessment_history remotely:', assessmentError.message);
  }

  const { error: signOutError } = await supabase.auth.signOut();
  if (signOutError) {
    console.warn('Failed to sign out remotely:', signOutError.message);
  }
}

// Orchestrates both halves — the UI's single entry point.
export async function deleteAccountAndAllData(userId: string | undefined): Promise<void> {
  if (userId) {
    await deleteAccountRemotely(userId);
  }
  await deleteAllLocalData();
}
