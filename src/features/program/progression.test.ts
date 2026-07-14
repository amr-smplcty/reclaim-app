import { dayKey, isDayComplete, nextPosition } from '@/features/program/progression';

describe('isDayComplete', () => {
  it('is false until both lesson and exercise are complete', () => {
    expect(isDayComplete({ lessonComplete: false, exerciseComplete: false, checkinComplete: false })).toBe(false);
    expect(isDayComplete({ lessonComplete: true, exerciseComplete: false, checkinComplete: false })).toBe(false);
    expect(isDayComplete({ lessonComplete: false, exerciseComplete: true, checkinComplete: false })).toBe(false);
  });

  it('is true once both lesson and exercise are complete, regardless of checkin', () => {
    expect(isDayComplete({ lessonComplete: true, exerciseComplete: true, checkinComplete: false })).toBe(true);
    expect(isDayComplete({ lessonComplete: true, exerciseComplete: true, checkinComplete: true })).toBe(true);
  });
});

describe('nextPosition — completion-based advance, not calendar', () => {
  it('advances day-by-day within a week', () => {
    expect(nextPosition({ week: 1, day: 1 })).toEqual({ week: 1, day: 2 });
    expect(nextPosition({ week: 1, day: 6 })).toEqual({ week: 1, day: 7 });
  });

  it('rolls into the next week after the last day', () => {
    expect(nextPosition({ week: 1, day: 7 })).toEqual({ week: 2, day: 1 });
  });

  it('respects a custom days-per-week', () => {
    expect(nextPosition({ week: 3, day: 5 }, 5)).toEqual({ week: 4, day: 1 });
  });
});

describe('dayKey', () => {
  it('produces a stable week-day key', () => {
    expect(dayKey({ week: 1, day: 7 })).toBe('1-7');
    expect(dayKey({ week: 2, day: 1 })).toBe('2-1');
  });
});
