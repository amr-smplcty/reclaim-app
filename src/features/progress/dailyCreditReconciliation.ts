import type { DayCreditInput } from '@/features/progress/commitmentGoals';

export function dateKeyOf(timestamp: string): string {
  return timestamp.slice(0, 10); // YYYY-MM-DD
}

interface ReconciliationData {
  completions: Record<string, { lessonComplete: boolean; lastActivityAt?: string }>;
  checkinDateKeys: string[];
  lapseDebriefDateKeys: string[];
}

// Derives a Commitment Goal day-credit input for one calendar date from the
// program/journal/toolkit stores' already-persisted data — there's no
// separate "did you engage today" tracker; this reads the same records the
// rest of the app already keeps. Only ever called for a fully-elapsed day
// (yesterday or earlier), never "today" while it's still in progress.
export function computeDayCreditInputForDate(dateKey: string, data: ReconciliationData): DayCreditInput {
  const lessonCompleted = Object.values(data.completions).some(
    (c) => c.lessonComplete && c.lastActivityAt && dateKeyOf(c.lastActivityAt) === dateKey
  );
  const checkinCompleted = data.checkinDateKeys.includes(dateKey);
  const lapsedThatDay = data.lapseDebriefDateKeys.includes(dateKey);

  return {
    lessonCompleted,
    checkinCompleted,
    cleanDay: !lapsedThatDay,
    lapseDebriefed: lapsedThatDay,
  };
}
