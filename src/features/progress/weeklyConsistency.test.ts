import { computeWeeklyConsistency } from '@/features/progress/weeklyConsistency';

const now = new Date('2026-01-29T12:00:00.000Z'); // Thursday

describe('computeWeeklyConsistency', () => {
  it('is 0 of 7 with no activity at all', () => {
    expect(computeWeeklyConsistency([], now)).toEqual({ daysActive: 0, daysTotal: 7 });
  });

  it('counts distinct active calendar days within the trailing 7-day window', () => {
    const timestamps = [
      '2026-01-29T08:00:00.000Z', // today
      '2026-01-28T20:00:00.000Z', // yesterday
      '2026-01-28T09:00:00.000Z', // yesterday again — same day, not double-counted
      '2026-01-23T10:00:00.000Z', // 6 days ago — still in window
    ];
    expect(computeWeeklyConsistency(timestamps, now)).toEqual({ daysActive: 3, daysTotal: 7 });
  });

  it('excludes activity from more than 7 days ago', () => {
    const timestamps = ['2026-01-20T10:00:00.000Z']; // 9 days ago
    expect(computeWeeklyConsistency(timestamps, now)).toEqual({ daysActive: 0, daysTotal: 7 });
  });

  it('excludes future timestamps (defensive — should never happen in practice)', () => {
    const timestamps = ['2026-02-01T10:00:00.000Z'];
    expect(computeWeeklyConsistency(timestamps, now)).toEqual({ daysActive: 0, daysTotal: 7 });
  });

  it('caps at 7 even with more than 7 distinct active days somehow provided', () => {
    const timestamps = Array.from({ length: 10 }, (_, i) => {
      const d = new Date(now);
      d.setUTCDate(d.getUTCDate() - i);
      return d.toISOString();
    });
    expect(computeWeeklyConsistency(timestamps, now).daysActive).toBeLessThanOrEqual(7);
  });
});
