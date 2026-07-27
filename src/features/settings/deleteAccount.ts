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
// console.warns on failure.
//
// The `delete-account` Edge Function (supabase/functions/) is the authoritative
// remote step (closes BACKLOG #40): with its service-role key it deletes the
// user's rows AND the auth.users row itself — the one thing an anon client can
// never do. We still run the client-side row deletes first as defense-in-depth
// (they succeed under the user's own RLS delete policies even if the function
// is unreachable), so a user on an old app build, or before the function is
// deployed, still gets their table rows cleared and the session ended. When
// the function isn't deployed yet, its invoke fails gracefully and the gap
// (the lingering auth.users row) is logged, exactly as before — deletion still
// completes locally.
export async function deleteAccountRemotely(userId: string): Promise<void> {
  const { error: legalError } = await supabase.from('legal_acceptances').delete().eq('user_id', userId);
  if (legalError) {
    console.warn('Failed to delete legal_acceptances remotely:', legalError.message);
  }

  const { error: assessmentError } = await supabase.from('assessment_history').delete().eq('user_id', userId);
  if (assessmentError) {
    console.warn('Failed to delete assessment_history remotely:', assessmentError.message);
  }

  // The authoritative server-side step: deletes the auth.users row via the
  // Edge Function's service-role key. Invoked while the session still exists
  // so its JWT is forwarded for authentication — must run BEFORE signOut.
  const { error: functionError } = await supabase.functions.invoke('delete-account', { method: 'POST' });
  if (functionError) {
    // Function-not-yet-deployed (or any transient failure) is non-fatal:
    // current behavior is preserved (rows deleted above, session ended
    // below, local data wiped by the caller), and the residual auth.users
    // row is logged as the known gap until the function is live.
    console.warn(
      'delete-account Edge Function unavailable — auth.users row may persist until it is deployed:',
      functionError.message
    );
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
