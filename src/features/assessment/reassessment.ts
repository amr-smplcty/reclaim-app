import type { AssessmentEntry } from '@/features/assessment/useAssessmentHistoryStore';

// CLINICAL_SPEC §2.2 — re-administer every 14 days, completable in <90s.
export const REASSESSMENT_INTERVAL_DAYS = 14;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

export function isReassessmentDue(lastAssessedAt: string | null, now: Date): boolean {
  if (!lastAssessedAt) return true;
  return daysUntilNextReassessment(lastAssessedAt, now) <= 0;
}

// Positive = days remaining; 0 = due today; negative = days overdue.
export function daysUntilNextReassessment(lastAssessedAt: string, now: Date): number {
  const elapsedMs = now.getTime() - new Date(lastAssessedAt).getTime();
  const elapsedDays = Math.floor(elapsedMs / MS_PER_DAY);
  return REASSESSMENT_INTERVAL_DAYS - elapsedDays;
}

// Latest score minus the one before it — negative means the score fell
// (improvement, since lower PPCS-6 scores are better). Compares the two most
// recent entries by timestamp, independent of array order.
export function scoreDelta(entries: AssessmentEntry[]): number | null {
  if (entries.length < 2) return null;
  const sorted = [...entries].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  const [previous, latest] = sorted.slice(-2);
  return latest.score - previous.score;
}

// Milestone/progress framing per PRODUCT_SPEC §5.5's example ("First
// re-assessment: −6 points") — calm, no shame language either direction.
export function formatScoreDelta(delta: number): string {
  if (delta === 0) return 'No change';
  return delta < 0 ? `−${Math.abs(delta)} points` : `+${delta} points`;
}
