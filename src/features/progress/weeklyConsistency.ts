import { dateKeyOf } from '@/features/progress/dailyCreditReconciliation';

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const WINDOW_DAYS = 7;

export interface WeeklyConsistency {
  daysActive: number;
  daysTotal: 7;
}

// "X of 7 days this week" (PRODUCT_SPEC §5.5) — a missed day costs one
// seventh, never everything; no daily-streak counter anywhere. Rolling
// trailing 7-day window (day-boundary based) ending "now", counting
// distinct calendar dates with at least one activity timestamp from any
// engagement source (lessons/exercises, check-ins, toolkit use, urge logs).
export function computeWeeklyConsistency(activityTimestamps: string[], now: Date): WeeklyConsistency {
  // UTC-based throughout (matches dateKeyOf's plain ISO-string slice) so the
  // window filter and the dedup key always agree on what "one day" means.
  const nowDateOnly = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const activeDates = new Set<string>();

  for (const timestamp of activityTimestamps) {
    const d = new Date(timestamp);
    const dateOnly = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
    const daysAgo = Math.floor((nowDateOnly - dateOnly) / MS_PER_DAY);
    if (daysAgo >= 0 && daysAgo < WINDOW_DAYS) {
      activeDates.add(dateKeyOf(timestamp));
    }
  }

  return { daysActive: Math.min(activeDates.size, WINDOW_DAYS), daysTotal: WINDOW_DAYS };
}
