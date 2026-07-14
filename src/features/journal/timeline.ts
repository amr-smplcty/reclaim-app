import type { LapseDebriefEntry, UrgeLogEntry } from '@/features/toolkit/useToolkitStore';
import type { LessonReflectionRecord } from '@/types/program';
import type { CheckinEntry } from '@/features/journal/useJournalStore';

export type JournalTimelineItem =
  | { id: string; type: 'checkin'; timestamp: string; entry: CheckinEntry }
  | { id: string; type: 'urge_log'; timestamp: string; entry: UrgeLogEntry }
  | { id: string; type: 'lapse_debrief'; timestamp: string; entry: LapseDebriefEntry }
  | { id: string; type: 'lesson_reflection'; timestamp: string; entry: { lessonId: string } & LessonReflectionRecord };

export interface JournalSources {
  checkins: CheckinEntry[];
  urgeLogs: UrgeLogEntry[];
  lapseDebriefs: LapseDebriefEntry[];
  reflections: Record<string, LessonReflectionRecord>;
}

// Unifies check-ins, urge logs, lapse debriefs, and lesson reflections
// (PRODUCT_SPEC §5.4) into one newest-first timeline, without duplicating
// any of the underlying data — each source stays owned by its own store.
export function assembleJournalTimeline(sources: JournalSources): JournalTimelineItem[] {
  const items: JournalTimelineItem[] = [
    ...sources.checkins.map((entry) => ({ id: entry.id, type: 'checkin' as const, timestamp: entry.timestamp, entry })),
    ...sources.urgeLogs.map((entry) => ({ id: entry.id, type: 'urge_log' as const, timestamp: entry.timestamp, entry })),
    ...sources.lapseDebriefs.map((entry) => ({
      id: entry.id,
      type: 'lapse_debrief' as const,
      timestamp: entry.timestamp,
      entry,
    })),
    ...Object.entries(sources.reflections).map(([lessonId, record]) => ({
      id: `reflection-${lessonId}`,
      type: 'lesson_reflection' as const,
      timestamp: record.timestamp,
      entry: { lessonId, ...record },
    })),
  ];

  return items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export interface JournalDayGroup {
  dateKey: string;
  items: JournalTimelineItem[];
}

// Groups an already-sorted (newest-first) timeline by calendar date, keeping
// group order intact — no re-sorting.
export function groupTimelineByDay(items: JournalTimelineItem[]): JournalDayGroup[] {
  const groups: JournalDayGroup[] = [];
  const indexByDate = new Map<string, number>();

  for (const item of items) {
    const dateKey = item.timestamp.slice(0, 10);
    let index = indexByDate.get(dateKey);
    if (index === undefined) {
      index = groups.length;
      indexByDate.set(dateKey, index);
      groups.push({ dateKey, items: [] });
    }
    groups[index].items.push(item);
  }

  return groups;
}
