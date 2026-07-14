import { dayKey, findProgramDay, isDayComplete, nextPosition, previousPosition } from '@/features/program/progression';

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

describe('previousPosition — multi-week progression', () => {
  it('steps back within a week', () => {
    expect(previousPosition({ week: 2, day: 5 })).toEqual({ week: 2, day: 4 });
  });

  it('steps back across the week boundary (W2D1 → W1D7)', () => {
    expect(previousPosition({ week: 2, day: 1 })).toEqual({ week: 1, day: 7 });
  });

  it('returns null before the very first day', () => {
    expect(previousPosition({ week: 1, day: 1 })).toBeNull();
  });

  it('respects a custom days-per-week', () => {
    expect(previousPosition({ week: 4, day: 1 }, 5)).toEqual({ week: 3, day: 5 });
  });
});

describe('findProgramDay — multi-week content lookup (W1D7 → W2D1)', () => {
  const modules = [
    { week: 1, title: 'Week One', days: [{ day: 7, lesson: { id: 'w1d7' } as any, exercise: { id: 'w1d7_ex' } as any }] },
    { week: 2, title: 'Week Two', days: [{ day: 1, lesson: { id: 'w2d1' } as any, exercise: { id: 'w2d1_ex' } as any }] },
  ];

  it('finds a day within the first module', () => {
    expect(findProgramDay(modules, { week: 1, day: 7 })?.lesson.id).toBe('w1d7');
  });

  it('finds a day in the second module — proves W2D1 is reachable after W1D7', () => {
    expect(findProgramDay(modules, { week: 2, day: 1 })?.lesson.id).toBe('w2d1');
  });

  it('returns undefined past the end of authored content', () => {
    expect(findProgramDay(modules, { week: 3, day: 1 })).toBeUndefined();
  });
});
