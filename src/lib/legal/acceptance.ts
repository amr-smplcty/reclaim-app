import { supabase } from '@/lib/supabase/client';
import { PRIVACY_VERSION, TOU_VERSION } from '@/lib/legal/versions';

export type LegalDoc = 'tou' | 'privacy';

export interface LegalAcceptanceRecord {
  doc: LegalDoc;
  doc_version: string;
  accepted_at: string;
}

export function buildAcceptanceRecords(acceptedAtIso: string): LegalAcceptanceRecord[] {
  return [
    { doc: 'tou', doc_version: TOU_VERSION, accepted_at: acceptedAtIso },
    { doc: 'privacy', doc_version: PRIVACY_VERSION, accepted_at: acceptedAtIso },
  ];
}

// Best-effort remote sync (LEGAL_COMPLIANCE §9: store {user_id, doc_version,
// accepted_at}) — requires an authenticated session, which only the Apple
// sign-in path yields synchronously today; the email/OTP path doesn't
// establish a session until the user follows the magic link (see CLAUDE.md
// open risks). The local timestamp in the onboarding store is the acceptance
// record of record either way; this call never blocks onboarding on failure.
export async function recordLegalAcceptance(userId: string, acceptedAtIso: string) {
  const rows = buildAcceptanceRecords(acceptedAtIso).map((record) => ({ user_id: userId, ...record }));
  const { error } = await supabase.from('legal_acceptances').insert(rows);
  if (error) {
    console.warn('Failed to record legal acceptance remotely:', error.message);
  }
}
