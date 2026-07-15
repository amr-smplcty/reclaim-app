import {
  buildUrgeEventTimestamps,
  findDominantTimeWindow,
  formatTimeClusterInsight,
} from '@/features/progress/patternInsights';

function at(hour: number, day = 1): string {
  return new Date(2026, 0, day, hour, 0, 0).toISOString();
}

describe('findDominantTimeWindow', () => {
  it('is null with fewer than 5 timestamps (PRODUCT_SPEC §7 minimum)', () => {
    const timestamps = [at(23), at(23), at(23), at(23)];
    expect(findDominantTimeWindow(timestamps)).toBeNull();
  });

  it('finds a clear late-night cluster matching the spec example', () => {
    // 7 of 10 (70%) between 10pm-1am.
    const timestamps = [
      at(22), at(23), at(0), at(23), at(22), at(23), at(0),
      at(9), at(14), at(19),
    ];
    const result = findDominantTimeWindow(timestamps);
    expect(result).not.toBeNull();
    expect(result?.window).toBe('late_night');
    expect(result?.percentage).toBe(70);
  });

  it('is null when no window clears the dominance threshold', () => {
    // Perfectly spread across 5 windows — no single window dominates.
    const timestamps = [at(23), at(3), at(9), at(15), at(20)];
    expect(findDominantTimeWindow(timestamps)).toBeNull();
  });

  it('excludes practice-flagged tool-use timestamps from the caller side (this function just buckets whatever it is given)', () => {
    // This function is deliberately dumb about practice-flagging — exclusion
    // happens before timestamps reach it (see buildUrgeEventTimestamps).
    const timestamps = [at(22), at(23), at(0), at(23), at(22)];
    expect(findDominantTimeWindow(timestamps)?.window).toBe('late_night');
  });
});

describe('buildUrgeEventTimestamps', () => {
  it('includes all urge-log timestamps (always real)', () => {
    const result = buildUrgeEventTimestamps({
      urgeLogTimestamps: [at(22), at(9)],
      toolUses: [],
    });
    expect(result).toEqual([at(22), at(9)]);
  });

  it('includes non-practice tool-use timestamps', () => {
    const result = buildUrgeEventTimestamps({
      urgeLogTimestamps: [],
      toolUses: [{ timestamp: at(22), practice: false }, { timestamp: at(23) }],
    });
    expect(result).toEqual([at(22), at(23)]);
  });

  it('excludes practice-flagged tool-use timestamps (Week 3 integration rule)', () => {
    const result = buildUrgeEventTimestamps({
      urgeLogTimestamps: [at(9)],
      toolUses: [{ timestamp: at(22), practice: true }, { timestamp: at(23), practice: false }],
    });
    expect(result).toEqual([at(9), at(23)]);
  });
});

describe('formatTimeClusterInsight', () => {
  it('matches the spec\'s example phrasing shape', () => {
    const text = formatTimeClusterInsight({ window: 'late_night', count: 7, percentage: 70 });
    expect(text).toBe('70% of your urges land between 10pm–1am.');
  });

  it('labels every window sensibly', () => {
    expect(formatTimeClusterInsight({ window: 'early_morning', count: 5, percentage: 50 })).toContain('1am–6am');
    expect(formatTimeClusterInsight({ window: 'morning', count: 5, percentage: 50 })).toContain('6am–12pm');
    expect(formatTimeClusterInsight({ window: 'afternoon', count: 5, percentage: 50 })).toContain('12pm–6pm');
    expect(formatTimeClusterInsight({ window: 'evening', count: 5, percentage: 50 })).toContain('6pm–10pm');
  });
});
