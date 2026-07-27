import { lastActivityTimestamp, selectWelcomeBackLine, shouldShowWelcomeBack } from '@/features/journey/welcomeBack';
import { resolveTopBanner } from '@/features/journey/banners';
import { getJourneyContent } from '@/lib/content/journey';

describe('lastActivityTimestamp', () => {
  it('returns the latest of program-activity and check-in timestamps', () => {
    const result = lastActivityTimestamp(
      ['2026-01-01T10:00:00.000Z', undefined, '2026-01-03T09:00:00.000Z'],
      ['2026-01-02T21:00:00.000Z']
    );
    expect(result).toBe('2026-01-03T09:00:00.000Z');
  });

  it('is null for a user who has never engaged', () => {
    expect(lastActivityTimestamp([undefined], [])).toBeNull();
  });
});

// UTC times (…Z) throughout so the date-key day boundaries are unambiguous
// regardless of the test runner's timezone (the day model is UTC, matching
// dateKeyOf across the codebase).
describe('shouldShowWelcomeBack — 3+ consecutive inactive days', () => {
  it('is false the same day as activity', () => {
    expect(shouldShowWelcomeBack('2026-01-10T09:00:00Z', new Date('2026-01-10T22:00:00Z'))).toBe(false);
  });

  it('is false at 2 days inactive (below threshold)', () => {
    expect(shouldShowWelcomeBack('2026-01-10T09:00:00Z', new Date('2026-01-12T12:00:00Z'))).toBe(false);
  });

  it('is true at exactly 3 days inactive', () => {
    expect(shouldShowWelcomeBack('2026-01-10T09:00:00Z', new Date('2026-01-13T12:00:00Z'))).toBe(true);
  });

  it('is true beyond 3 days', () => {
    expect(shouldShowWelcomeBack('2026-01-10T09:00:00Z', new Date('2026-01-20T12:00:00Z'))).toBe(true);
  });

  it('never shows for a brand-new user (no activity ever)', () => {
    expect(shouldShowWelcomeBack(null, new Date('2026-01-20T12:00:00Z'))).toBe(false);
  });
});

describe('selectWelcomeBackLine — rotates by day, from authored copy', () => {
  const lines = getJourneyContent().welcome_back;

  it('always returns one of the authored variants', () => {
    expect(lines).toContain(selectWelcomeBackLine(lines, new Date('2026-01-13T12:00:00Z')));
  });

  it('is stable within a day but rotates across days', () => {
    const day1a = selectWelcomeBackLine(lines, new Date('2026-01-13T08:00:00Z'));
    const day1b = selectWelcomeBackLine(lines, new Date('2026-01-13T20:00:00Z'));
    const day2 = selectWelcomeBackLine(lines, new Date('2026-01-14T08:00:00Z'));
    expect(day1a).toBe(day1b);
    expect(day2).not.toBe(day1a);
  });
});

describe('resolveTopBanner — priority: crisis > reassessment > risky-window > welcome back', () => {
  it('returns null when nothing is active', () => {
    expect(resolveTopBanner({})).toBeNull();
  });

  it('welcome-back shows only when it is the sole active banner', () => {
    expect(resolveTopBanner({ welcome_back: true })).toBe('welcome_back');
  });

  it('re-assessment-due outranks risky-window and welcome-back', () => {
    expect(resolveTopBanner({ reassessment_due: true, risky_window_offer: true, welcome_back: true })).toBe(
      'reassessment_due'
    );
  });

  it('risky-window outranks welcome-back', () => {
    expect(resolveTopBanner({ risky_window_offer: true, welcome_back: true })).toBe('risky_window_offer');
  });

  it('crisis outranks everything (nothing stacks under a crisis surface)', () => {
    expect(
      resolveTopBanner({ crisis: true, reassessment_due: true, risky_window_offer: true, welcome_back: true })
    ).toBe('crisis');
  });
});
