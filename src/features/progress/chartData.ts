// Pure data-shaping for the Progress charts (PRODUCT_SPEC §5.5) — thin SVG
// components just render whatever these return. Plain react-native-svg only,
// no victory-native/Skia (INCIDENTS.md INC-2 class — Expo-Go-incompatible
// native modules).

import { PPCS6_SCORE_MAX, PPCS6_SCORE_MIN } from '@/features/assessment/scoring';
import type { AssessmentEntry } from '@/features/assessment/useAssessmentHistoryStore';

export interface TrendPoint {
  x: number;
  y: number;
  score: number;
  timestamp: string;
}

// Score falls as the user improves — mapped so a falling score visually
// descends the chart too (worst score at the top, best at the bottom),
// matching "the number going down is your real progress."
export function buildTrendPoints(
  entries: AssessmentEntry[],
  width: number,
  height: number,
  padding = 12
): TrendPoint[] {
  if (entries.length === 0) return [];

  const sorted = [...entries].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  const usableWidth = width - 2 * padding;
  const usableHeight = height - 2 * padding;

  return sorted.map((entry, index) => {
    const x = sorted.length === 1 ? width / 2 : padding + (index / (sorted.length - 1)) * usableWidth;
    const scoreFraction = (PPCS6_SCORE_MAX - entry.score) / (PPCS6_SCORE_MAX - PPCS6_SCORE_MIN);
    const y = padding + scoreFraction * usableHeight;
    return { x, y, score: entry.score, timestamp: entry.timestamp };
  });
}

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export interface WeeklyBar {
  count: number;
  avgIntensity: number;
}

// Trailing weekly buckets (day-boundary based, not exact-hour, so "today's"
// events always land in the current bucket regardless of what time `now`
// is) — oldest first, most recent last, matching how the trend chart reads
// left to right.
export function buildWeeklyBars(
  urgeLogs: Array<{ timestamp: string; intensity: number }>,
  now: Date,
  weeksToShow: number
): WeeklyBar[] {
  const nowDateOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const buckets: Array<{ sum: number; count: number }> = Array.from({ length: weeksToShow }, () => ({
    sum: 0,
    count: 0,
  }));

  for (const log of urgeLogs) {
    const logDate = new Date(log.timestamp);
    const logDateOnly = new Date(logDate.getFullYear(), logDate.getMonth(), logDate.getDate()).getTime();
    const daysAgo = Math.floor((nowDateOnly - logDateOnly) / MS_PER_DAY);
    const weekIndex = Math.floor(daysAgo / 7);
    if (weekIndex < 0 || weekIndex >= weeksToShow) continue;

    const arrayIndex = weeksToShow - 1 - weekIndex;
    buckets[arrayIndex].sum += log.intensity;
    buckets[arrayIndex].count += 1;
  }

  return buckets.map((b) => ({
    count: b.count,
    avgIntensity: b.count > 0 ? Math.round((b.sum / b.count) * 10) / 10 : 0,
  }));
}
