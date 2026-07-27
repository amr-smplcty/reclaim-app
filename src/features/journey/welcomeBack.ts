import { dateKeyOf } from '@/features/progress/dailyCreditReconciliation';

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const INACTIVE_DAYS_THRESHOLD = 3;

// The most recent day the user did anything the program counts as engagement:
// any program-day activity (lesson/exercise/check-in flip stamps lastActivityAt)
// or any journal check-in. Returns the latest ISO timestamp, or null if the
// user has never engaged.
export function lastActivityTimestamp(
  completionActivityTimestamps: Array<string | undefined>,
  checkinTimestamps: string[]
): string | null {
  const all = [...completionActivityTimestamps.filter((t): t is string => !!t), ...checkinTimestamps];
  if (all.length === 0) return null;
  return all.reduce((latest, t) => (t > latest ? t : latest));
}

// A whole-day number for a YYYY-MM-DD key, parsed as UTC midnight — same
// UTC-based day model as dateKeyOf (which slices the ISO string), so the two
// never disagree across a timezone boundary (the flakiness class INC-14 warns
// about).
function dayNumberFromIso(iso: string): number {
  return Math.floor(Date.parse(`${dateKeyOf(iso)}T00:00:00Z`) / MS_PER_DAY);
}

// Whole calendar days between two ISO timestamps.
function calendarDaysBetween(fromIso: string, toIso: string): number {
  return dayNumberFromIso(toIso) - dayNumberFromIso(fromIso);
}

// PRODUCT_SPEC §5.7 no-shame return: shown after 3+ consecutive days with no
// completed session and no check-in. Never for a brand-new user who has never
// engaged (they're not "back"), and it disappears the moment there's any
// activity today (0 days since → below threshold).
export function shouldShowWelcomeBack(lastActivityIso: string | null, now: Date): boolean {
  if (!lastActivityIso) return false;
  return calendarDaysBetween(lastActivityIso, now.toISOString()) >= INACTIVE_DAYS_THRESHOLD;
}

// Rotates through the authored welcome_back variants by day, so a returning
// user on consecutive days doesn't see the same line, but it's stable within
// a day. Deterministic from the date — no randomness.
export function selectWelcomeBackLine(lines: string[], now: Date): string | undefined {
  if (lines.length === 0) return undefined;
  const dayNumber = dayNumberFromIso(now.toISOString());
  return lines[((dayNumber % lines.length) + lines.length) % lines.length];
}
