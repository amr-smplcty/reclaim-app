import type { TimeWindow } from '@/features/progress/patternInsights';
import { buildUrgeEventTimestamps, findDominantTimeWindow } from '@/features/progress/patternInsights';

export interface TimeOfDay {
  hour: number;
  minute: number;
}

// Window start hours, matching patternInsights' own windowForHour buckets.
const WINDOW_START_HOUR: Record<TimeWindow, number> = {
  late_night: 22,
  early_morning: 1,
  morning: 6,
  afternoon: 12,
  evening: 18,
};

// PRODUCT_SPEC §7 — "opt-in supportive ping 30 min before the modal hour."
// patternInsights only reports the dominant bucket, not one exact clock hour
// within it, so the window's own start hour stands in for "the modal hour."
export function riskyWindowReminderTime(window: TimeWindow): TimeOfDay {
  const startHour = WINDOW_START_HOUR[window];
  const totalMinutes = (startHour * 60 - 30 + 24 * 60) % (24 * 60);
  return { hour: Math.floor(totalMinutes / 60), minute: totalMinutes % 60 };
}

// PRODUCT_SPEC §7 copy example ("Late nights are your pattern — plan the
// next hour on purpose?") generalized across all five windows — neutral
// regarding subject matter, safe for a lock screen either way.
const WINDOW_COPY: Record<TimeWindow, string> = {
  late_night: 'Late nights are your pattern',
  early_morning: 'Early mornings are your pattern',
  morning: 'Mornings are your pattern',
  afternoon: 'Afternoons are your pattern',
  evening: 'Evenings are your pattern',
};

export function riskyWindowReminderCopy(window: TimeWindow): { title: string; body: string } {
  return {
    title: `${WINDOW_COPY[window]} — plan the next hour on purpose?`,
    body: 'A few minutes of a plan can change how the next hour goes.',
  };
}

export interface RiskyWindowEligibility {
  eligible: boolean;
  window?: TimeWindow;
  percentage?: number;
}

// PRODUCT_SPEC §7 gate: "after >=5 urge logs, if a time cluster exists."
// Practice-excluded per Epic 7 — buildUrgeEventTimestamps strips
// practice-flagged tool uses before they ever reach the clustering math.
export function evaluateRiskyWindowEligibility(
  urgeLogTimestamps: string[],
  toolUses: Array<{ timestamp: string; practice?: boolean }>
): RiskyWindowEligibility {
  const timestamps = buildUrgeEventTimestamps({ urgeLogTimestamps, toolUses });
  const cluster = findDominantTimeWindow(timestamps);
  if (!cluster) return { eligible: false };
  return { eligible: true, window: cluster.window, percentage: cluster.percentage };
}
