import { formatTimeOfDay, stepHour, stepMinute } from '@/features/settings/timeOfDay';

describe('formatTimeOfDay', () => {
  it('formats a morning time', () => {
    expect(formatTimeOfDay({ hour: 8, minute: 0 })).toBe('8:00 AM');
  });

  it('formats an evening time', () => {
    expect(formatTimeOfDay({ hour: 21, minute: 30 })).toBe('9:30 PM');
  });

  it('formats midnight as 12:00 AM', () => {
    expect(formatTimeOfDay({ hour: 0, minute: 0 })).toBe('12:00 AM');
  });

  it('formats noon as 12:00 PM', () => {
    expect(formatTimeOfDay({ hour: 12, minute: 0 })).toBe('12:00 PM');
  });

  it('zero-pads single-digit minutes', () => {
    expect(formatTimeOfDay({ hour: 7, minute: 5 })).toBe('7:05 AM');
  });
});

describe('stepHour', () => {
  it('increments the hour, leaving minute untouched', () => {
    expect(stepHour({ hour: 8, minute: 15 }, 1)).toEqual({ hour: 9, minute: 15 });
  });

  it('decrements the hour', () => {
    expect(stepHour({ hour: 8, minute: 0 }, -1)).toEqual({ hour: 7, minute: 0 });
  });

  it('wraps forward past 23 back to 0', () => {
    expect(stepHour({ hour: 23, minute: 0 }, 1)).toEqual({ hour: 0, minute: 0 });
  });

  it('wraps backward past 0 to 23', () => {
    expect(stepHour({ hour: 0, minute: 0 }, -1)).toEqual({ hour: 23, minute: 0 });
  });
});

describe('stepMinute', () => {
  it('increments the minute by the given delta, leaving hour untouched', () => {
    expect(stepMinute({ hour: 8, minute: 0 }, 5)).toEqual({ hour: 8, minute: 5 });
  });

  it('decrements the minute', () => {
    expect(stepMinute({ hour: 8, minute: 30 }, -5)).toEqual({ hour: 8, minute: 25 });
  });

  it('wraps forward past 59 back to 0 without touching the hour', () => {
    expect(stepMinute({ hour: 8, minute: 55 }, 5)).toEqual({ hour: 8, minute: 0 });
  });

  it('wraps backward past 0 to 55 without touching the hour', () => {
    expect(stepMinute({ hour: 8, minute: 0 }, -5)).toEqual({ hour: 8, minute: 55 });
  });
});
