// Pattern insights v1 (PRODUCT_SPEC §5.5/§7) — rule-based time-of-day
// clustering over urge events. "70% of your urges land between 10pm–1am"
// is the spec's own example; the ≥5-entry minimum mirrors §7's notification
// trigger ("after ≥5 urge logs, if a time cluster exists").

export type TimeWindow = 'late_night' | 'early_morning' | 'morning' | 'afternoon' | 'evening';

const MIN_ENTRIES = 5;
const DOMINANCE_THRESHOLD_PERCENT = 50;

const WINDOW_LABELS: Record<TimeWindow, string> = {
  late_night: '10pm–1am',
  early_morning: '1am–6am',
  morning: '6am–12pm',
  afternoon: '12pm–6pm',
  evening: '6pm–10pm',
};

function windowForHour(hour: number): TimeWindow {
  if (hour === 22 || hour === 23 || hour === 0) return 'late_night';
  if (hour >= 1 && hour <= 5) return 'early_morning';
  if (hour >= 6 && hour <= 11) return 'morning';
  if (hour >= 12 && hour <= 17) return 'afternoon';
  return 'evening'; // 18-21
}

export interface TimeClusterResult {
  window: TimeWindow;
  count: number;
  percentage: number;
}

// Buckets timestamps by local hour into 5 windows and reports the dominant
// one, if any window clears both the minimum-entry and dominance thresholds.
// Practice-flagged sessions must be filtered out by the caller before
// timestamps reach here (see buildUrgeEventTimestamps) — this function is
// deliberately just a bucketer.
export function findDominantTimeWindow(timestamps: string[]): TimeClusterResult | null {
  if (timestamps.length < MIN_ENTRIES) return null;

  const counts: Record<TimeWindow, number> = {
    late_night: 0,
    early_morning: 0,
    morning: 0,
    afternoon: 0,
    evening: 0,
  };
  for (const ts of timestamps) {
    counts[windowForHour(new Date(ts).getHours())] += 1;
  }

  const [dominantWindow, dominantCount] = (Object.entries(counts) as Array<[TimeWindow, number]>).reduce((best, entry) =>
    entry[1] > best[1] ? entry : best
  );

  const percentage = Math.round((dominantCount / timestamps.length) * 100);
  if (percentage < DOMINANCE_THRESHOLD_PERCENT) return null;

  return { window: dominantWindow, count: dominantCount, percentage };
}

export function formatTimeClusterInsight(result: TimeClusterResult): string {
  return `${result.percentage}% of your urges land between ${WINDOW_LABELS[result.window]}.`;
}

interface UrgeEventSource {
  urgeLogTimestamps: string[];
  toolUses: Array<{ timestamp: string; practice?: boolean }>;
}

// Merges the two sources of real urge-event timestamps: every "Log the
// urge" entry (always real) plus toolkit tool-use entries that aren't
// practice-flagged (Week 3 integration rule — see ToolUseEntry.practice).
export function buildUrgeEventTimestamps({ urgeLogTimestamps, toolUses }: UrgeEventSource): string[] {
  const realToolUseTimestamps = toolUses.filter((t) => !t.practice).map((t) => t.timestamp);
  return [...urgeLogTimestamps, ...realToolUseTimestamps];
}
