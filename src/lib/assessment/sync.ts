import { supabase } from '@/lib/supabase/client';
import type { AssessmentEntry } from '@/features/assessment/useAssessmentHistoryStore';

export interface AssessmentHistoryRow {
  user_id: string;
  score: number;
  band: string;
  timeframe: string;
  responses: number[];
  instrument_version: string;
  recorded_at: string;
}

export function buildAssessmentHistoryRow(userId: string, entry: AssessmentEntry): AssessmentHistoryRow {
  return {
    user_id: userId,
    score: entry.score,
    band: entry.band,
    timeframe: entry.timeframe,
    responses: entry.responses,
    instrument_version: entry.instrumentVersion,
    recorded_at: entry.timestamp,
  };
}

// Best-effort remote sync (mirrors src/lib/legal/acceptance.ts's
// legal_acceptances pattern) — requires an authenticated session, which
// isn't always available the moment a score is recorded (onboarding's PPCS-6
// happens before account creation). Callers only invoke this when a
// session/userId already exists; the local assessment-history store (Epic
// 6b encrypted at rest) is the record of truth either way, so a failure here
// never blocks anything.
export async function recordAssessmentRemotely(userId: string, entry: AssessmentEntry) {
  const { error } = await supabase.from('assessment_history').insert(buildAssessmentHistoryRow(userId, entry));
  if (error) {
    console.warn('Failed to record assessment history remotely:', error.message);
  }
}
