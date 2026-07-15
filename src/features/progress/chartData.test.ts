import { buildTrendPoints, buildWeeklyBars } from '@/features/progress/chartData';
import type { AssessmentEntry } from '@/features/assessment/useAssessmentHistoryStore';

function entry(timestamp: string, score: number): AssessmentEntry {
  return { id: timestamp, timestamp, score, band: 'C', timeframe: 'past_6_months', responses: [] };
}

describe('buildTrendPoints', () => {
  const width = 300;
  const height = 100;

  it('returns an empty array with no entries', () => {
    expect(buildTrendPoints([], width, height)).toEqual([]);
  });

  it('centers a single point horizontally', () => {
    const points = buildTrendPoints([entry('2026-01-01', 20)], width, height);
    expect(points).toHaveLength(1);
    expect(points[0].x).toBe(width / 2);
  });

  it('places the worst possible score (42) at the top and best (6) at the bottom — falling is visually "down"', () => {
    const points = buildTrendPoints(
      [entry('2026-01-01', 42), entry('2026-01-15', 6)],
      width,
      height
    );
    expect(points[0].y).toBeLessThan(points[1].y);
  });

  it('spaces multiple points evenly left to right in chronological order, regardless of input order', () => {
    const points = buildTrendPoints(
      [entry('2026-01-15', 20), entry('2026-01-01', 27)],
      width,
      height
    );
    expect(points[0].x).toBeLessThan(points[1].x);
  });

  it('keeps every y coordinate within the chart bounds', () => {
    const points = buildTrendPoints(
      [entry('2026-01-01', 6), entry('2026-01-15', 42)],
      width,
      height
    );
    for (const p of points) {
      expect(p.y).toBeGreaterThanOrEqual(0);
      expect(p.y).toBeLessThanOrEqual(height);
    }
  });
});

describe('buildWeeklyBars', () => {
  const now = new Date('2026-01-29T12:00:00.000Z'); // a Thursday

  it('returns the requested number of trailing weekly buckets, oldest first', () => {
    const bars = buildWeeklyBars([], now, 3);
    expect(bars).toHaveLength(3);
  });

  it('counts urge logs into the correct trailing week', () => {
    const urgeLogs = [
      { timestamp: '2026-01-29T22:00:00.000Z', intensity: 8 }, // this week
      { timestamp: '2026-01-28T10:00:00.000Z', intensity: 4 }, // this week
      { timestamp: '2026-01-20T10:00:00.000Z', intensity: 6 }, // 1 week ago
    ];
    const bars = buildWeeklyBars(urgeLogs, now, 2);
    expect(bars[1].count).toBe(2); // most recent week (last element)
    expect(bars[1].avgIntensity).toBe(6);
    expect(bars[0].count).toBe(1); // prior week
    expect(bars[0].avgIntensity).toBe(6);
  });

  it('reports 0 count and 0 average intensity for empty weeks', () => {
    const bars = buildWeeklyBars([], now, 1);
    expect(bars[0].count).toBe(0);
    expect(bars[0].avgIntensity).toBe(0);
  });
});
