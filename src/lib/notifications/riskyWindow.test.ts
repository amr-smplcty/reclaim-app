import {
  evaluateRiskyWindowEligibility,
  riskyWindowReminderCopy,
  riskyWindowReminderTime,
} from '@/lib/notifications/riskyWindow';

// Local-time construction (matches patternInsights.test.ts's own convention)
// so this doesn't depend on the test runner's timezone the way a UTC ISO
// string compared via getHours() (local) would.
function at(hour: number, day = 1): string {
  return new Date(2026, 0, day, hour, 0, 0).toISOString();
}

describe('riskyWindowReminderTime (gating math: 30 min before the window start)', () => {
  it('subtracts 30 minutes from late_night (22:00 -> 21:30)', () => {
    expect(riskyWindowReminderTime('late_night')).toEqual({ hour: 21, minute: 30 });
  });

  it('wraps across midnight for early_morning (01:00 -> 00:30)', () => {
    expect(riskyWindowReminderTime('early_morning')).toEqual({ hour: 0, minute: 30 });
  });

  it('subtracts 30 minutes from morning (06:00 -> 05:30)', () => {
    expect(riskyWindowReminderTime('morning')).toEqual({ hour: 5, minute: 30 });
  });

  it('subtracts 30 minutes from afternoon (12:00 -> 11:30)', () => {
    expect(riskyWindowReminderTime('afternoon')).toEqual({ hour: 11, minute: 30 });
  });

  it('subtracts 30 minutes from evening (18:00 -> 17:30)', () => {
    expect(riskyWindowReminderTime('evening')).toEqual({ hour: 17, minute: 30 });
  });
});

describe('riskyWindowReminderCopy', () => {
  it('never mentions porn/explicit words, per PRODUCT_SPEC §7 copy rules', () => {
    const copy = riskyWindowReminderCopy('late_night');
    expect(copy.title.toLowerCase()).not.toMatch(/porn/);
    expect(copy.body.toLowerCase()).not.toMatch(/porn/);
    expect(copy.title).toBe('Late nights are your pattern — plan the next hour on purpose?');
  });
});

describe('evaluateRiskyWindowEligibility', () => {
  it('is ineligible below the 5-entry minimum', () => {
    const timestamps = [at(22, 1), at(22, 2)];
    const result = evaluateRiskyWindowEligibility(timestamps, []);
    expect(result.eligible).toBe(false);
  });

  it('is eligible once >=5 entries cluster into one dominant window', () => {
    const urgeLogTimestamps = [at(22, 1), at(22, 2), at(23, 3), at(22, 4), at(0, 5)];
    const result = evaluateRiskyWindowEligibility(urgeLogTimestamps, []);
    expect(result.eligible).toBe(true);
    expect(result.window).toBe('late_night');
  });

  it('excludes practice-flagged tool uses from the eligibility check (Epic 7 rule)', () => {
    const urgeLogTimestamps = [at(22, 1), at(22, 2)];
    // 6 practice sessions, all late at night — must not manufacture eligibility.
    const toolUses = Array.from({ length: 6 }, (_, i) => ({ timestamp: at(22, i + 1), practice: true }));
    const result = evaluateRiskyWindowEligibility(urgeLogTimestamps, toolUses);
    expect(result.eligible).toBe(false);
  });
});
