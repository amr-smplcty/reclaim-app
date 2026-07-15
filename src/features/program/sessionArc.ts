import type { DayCompletion } from '@/features/program/progression';

export interface SessionArcProgress {
  completedCount: number;
  totalCount: 3;
}

// Today's session arc (PRODUCT_SPEC §5.2) — lesson + exercise + evening
// check-in framed as one "Today's session · ~10 min" whole, with a single
// shared progress indicator, even though each piece stays individually
// completable (check-in naturally happens later in the day).
export function computeSessionArcProgress(completion: DayCompletion | undefined): SessionArcProgress {
  const flags = [completion?.lessonComplete, completion?.exerciseComplete, completion?.checkinComplete];
  return { completedCount: flags.filter(Boolean).length, totalCount: 3 };
}
