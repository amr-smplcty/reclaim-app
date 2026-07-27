import {
  canReadWeeklyIntro,
  deriveJourneyMap,
  shouldShowBeginningSequence,
  shouldShowWeeklyIntro,
  upcomingLabelFor,
} from '@/features/journey/journeyMap';
import { getJourneyContent } from '@/lib/content/journey';

const mapContent = getJourneyContent().journey_map;

describe('deriveJourneyMap — state derivation across all week states + maintenance', () => {
  it('marks earlier weeks completed, the current week current with day dots, later weeks upcoming', () => {
    const view = deriveJourneyMap(mapContent, { week: 3, day: 4 }, null);

    expect(view.nodes.find((n) => n.week === 1)?.state).toBe('completed');
    expect(view.nodes.find((n) => n.week === 2)?.state).toBe('completed');

    const current = view.nodes.find((n) => n.week === 3)!;
    expect(current.state).toBe('current');
    expect(current.dayDots).toEqual({ total: 7, currentDay: 4 });

    expect(view.nodes.find((n) => n.week === 4)?.state).toBe('upcoming');
    expect(view.nodes.find((n) => n.week === 6)?.state).toBe('upcoming');
    expect(view.maintenance.state).toBe('upcoming');
  });

  it('only the current week carries day dots', () => {
    const view = deriveJourneyMap(mapContent, { week: 3, day: 4 }, null);
    expect(view.nodes.filter((n) => n.dayDots).map((n) => n.week)).toEqual([3]);
  });

  it('week 1 day 1 makes week 1 current and everything else upcoming', () => {
    const view = deriveJourneyMap(mapContent, { week: 1, day: 1 }, null);
    expect(view.nodes.find((n) => n.week === 1)?.state).toBe('current');
    expect(view.nodes.filter((n) => n.state === 'upcoming')).toHaveLength(5);
    expect(view.maintenance.state).toBe('upcoming');
  });

  it('once the program is complete, every week is completed and maintenance becomes current', () => {
    const view = deriveJourneyMap(mapContent, { week: 7, day: 1 }, '2026-01-01T00:00:00.000Z');
    expect(view.nodes.every((n) => n.state === 'completed')).toBe(true);
    expect(view.nodes.some((n) => n.dayDots)).toBe(false);
    expect(view.maintenance.state).toBe('current');
  });

  it('uses the authored titles/subtitles and heading (never inlined copy)', () => {
    const view = deriveJourneyMap(mapContent, { week: 1, day: 1 }, null);
    expect(view.heading).toBe(mapContent.heading);
    expect(view.nodes[0].title).toBe(mapContent.nodes[0].title);
    expect(view.maintenance.title).toBe(mapContent.maintenance_node.title);
  });
});

describe('upcomingLabelFor', () => {
  it('fills the {n} placeholder with the week that unlocks it (no padlock language)', () => {
    // Week 4 upcoming → "Starts after Week 3".
    expect(upcomingLabelFor(mapContent, 4)).toBe('Starts after Week 3');
    expect(upcomingLabelFor(mapContent, 4).toLowerCase()).not.toContain('lock');
  });
});

describe('canReadWeeklyIntro', () => {
  it('allows re-reading a reached (completed/current) week, not an upcoming one', () => {
    expect(canReadWeeklyIntro('completed')).toBe(true);
    expect(canReadWeeklyIntro('current')).toBe(true);
    expect(canReadWeeklyIntro('upcoming')).toBe(false);
  });
});

describe('shouldShowWeeklyIntro — render-once, weeks 2–6, Day 1 only', () => {
  it('shows on the first open of each of weeks 2–6 Day 1', () => {
    for (const week of [2, 3, 4, 5, 6]) {
      expect(shouldShowWeeklyIntro({ week, day: 1 }, {})).toBe(true);
    }
  });

  it('never shows for Week 1 (its intro is the beginning sequence)', () => {
    expect(shouldShowWeeklyIntro({ week: 1, day: 1 }, {})).toBe(false);
  });

  it('never shows past Day 1 of a week', () => {
    expect(shouldShowWeeklyIntro({ week: 3, day: 2 }, {})).toBe(false);
  });

  it('does not show again once that week has been seen', () => {
    expect(shouldShowWeeklyIntro({ week: 3, day: 1 }, { 3: true })).toBe(false);
  });

  it('is independent per week — seeing week 2 does not suppress week 3', () => {
    expect(shouldShowWeeklyIntro({ week: 3, day: 1 }, { 2: true })).toBe(true);
  });
});

describe('shouldShowBeginningSequence — render-once, at the very start', () => {
  const base = {
    hasOnboarded: true,
    beginningSequenceSeen: false,
    position: { week: 1, day: 1 },
    hasAnyCompletion: false,
    programCompletedAt: null,
  };

  it('shows for a freshly-onboarded user at W1D1 who has not seen it', () => {
    expect(shouldShowBeginningSequence(base)).toBe(true);
  });

  it('does not show before onboarding completes', () => {
    expect(shouldShowBeginningSequence({ ...base, hasOnboarded: false })).toBe(false);
  });

  it('does not show once seen', () => {
    expect(shouldShowBeginningSequence({ ...base, beginningSequenceSeen: true })).toBe(false);
  });

  it('does not show once the program has advanced past the very start', () => {
    expect(shouldShowBeginningSequence({ ...base, position: { week: 1, day: 2 } })).toBe(false);
    expect(shouldShowBeginningSequence({ ...base, hasAnyCompletion: true })).toBe(false);
  });

  it('does not show after graduation', () => {
    expect(shouldShowBeginningSequence({ ...base, programCompletedAt: '2026-01-01T00:00:00.000Z' })).toBe(false);
  });
});
