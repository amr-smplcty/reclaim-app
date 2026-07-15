import { computeDayCreditInputForDate, dateKeyOf } from '@/features/progress/dailyCreditReconciliation';

describe('dateKeyOf', () => {
  it('extracts the calendar date from an ISO timestamp', () => {
    expect(dateKeyOf('2026-01-15T22:30:00.000Z')).toBe('2026-01-15');
  });
});

describe('computeDayCreditInputForDate', () => {
  const dateKey = '2026-01-15';

  it('credits a lesson completed that day', () => {
    const result = computeDayCreditInputForDate(dateKey, {
      completions: { '1-1': { lessonComplete: true, lastActivityAt: '2026-01-15T09:00:00.000Z' } },
      checkinDateKeys: [],
      lapseDebriefDateKeys: [],
    });
    expect(result.lessonCompleted).toBe(true);
  });

  it('does not credit a lesson completed on a different day', () => {
    const result = computeDayCreditInputForDate(dateKey, {
      completions: { '1-1': { lessonComplete: true, lastActivityAt: '2026-01-14T09:00:00.000Z' } },
      checkinDateKeys: [],
      lapseDebriefDateKeys: [],
    });
    expect(result.lessonCompleted).toBe(false);
  });

  it('credits a check-in logged that day', () => {
    const result = computeDayCreditInputForDate(dateKey, {
      completions: {},
      checkinDateKeys: [dateKey],
      lapseDebriefDateKeys: [],
    });
    expect(result.checkinCompleted).toBe(true);
  });

  it('is a clean day when no lapse was debriefed that day', () => {
    const result = computeDayCreditInputForDate(dateKey, {
      completions: {},
      checkinDateKeys: [],
      lapseDebriefDateKeys: [],
    });
    expect(result.cleanDay).toBe(true);
    expect(result.lapseDebriefed).toBe(false);
  });

  it('marks a lapse-debriefed day as not clean, but debriefed (partial credit path)', () => {
    const result = computeDayCreditInputForDate(dateKey, {
      completions: {},
      checkinDateKeys: [],
      lapseDebriefDateKeys: [dateKey],
    });
    expect(result.cleanDay).toBe(false);
    expect(result.lapseDebriefed).toBe(true);
  });
});
