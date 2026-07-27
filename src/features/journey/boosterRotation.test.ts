import { getBoosterLessons } from '@/lib/content/week';
import { selectWeeklyBooster } from '@/features/program/maintenance';

// Epic 14: content/boosters_addendum.json's two Dopamine Nation entries
// (seesaw, self-binding) merge into the Week 6 booster rotation.
describe('booster rotation includes the addendum entries', () => {
  const boosters = getBoosterLessons();

  it('contains both new addendum boosters alongside the Week 6 ones', () => {
    const ids = boosters.map((b) => b.id);
    expect(ids).toContain('booster_seesaw');
    expect(ids).toContain('booster_selfbinding');
  });

  it('surfaces every booster (including the two new ones) somewhere in the weekly rotation', () => {
    const completedAt = '2026-01-01T00:00:00.000Z';
    const seen = new Set<string>();
    // Walk enough weeks to cover the whole rotation at least once.
    for (let week = 0; week < boosters.length + 2; week++) {
      const now = new Date(new Date(completedAt).getTime() + week * 7 * 24 * 60 * 60 * 1000);
      const booster = selectWeeklyBooster(boosters, completedAt, now);
      if (booster) seen.add(booster.id);
    }
    expect(seen.has('booster_seesaw')).toBe(true);
    expect(seen.has('booster_selfbinding')).toBe(true);
    expect(seen.size).toBe(boosters.length);
  });
});
