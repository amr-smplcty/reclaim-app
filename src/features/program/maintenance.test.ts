import { assembleMaintenanceToday, selectWeeklyBooster } from '@/features/program/maintenance';
import type { BoosterLesson, MaintenancePlanOutput } from '@/types/program';

const boosters: BoosterLesson[] = [
  { id: 'booster_urge_anatomy', title: 'A', body_md: 'a' },
  { id: 'booster_defusion', title: 'B', body_md: 'b' },
  { id: 'booster_perimeter', title: 'C', body_md: 'c' },
];

const completedAt = '2026-01-01T00:00:00.000Z';

describe('selectWeeklyBooster — rotates through booster_lessons, one per week since graduation', () => {
  it('returns the first booster in graduation week itself', () => {
    expect(selectWeeklyBooster(boosters, completedAt, new Date('2026-01-03T00:00:00.000Z'))?.id).toBe(
      'booster_urge_anatomy'
    );
  });

  it('advances to the second booster after 7 days', () => {
    expect(selectWeeklyBooster(boosters, completedAt, new Date('2026-01-08T00:00:00.000Z'))?.id).toBe(
      'booster_defusion'
    );
  });

  it('advances to the third booster after 14 days', () => {
    expect(selectWeeklyBooster(boosters, completedAt, new Date('2026-01-15T00:00:00.000Z'))?.id).toBe(
      'booster_perimeter'
    );
  });

  it('wraps back around to the first booster after the full rotation (21 days, 3 boosters)', () => {
    expect(selectWeeklyBooster(boosters, completedAt, new Date('2026-01-22T00:00:00.000Z'))?.id).toBe(
      'booster_urge_anatomy'
    );
  });

  it('wraps around multiple times for a long-graduated user', () => {
    // 10 weeks later = week index 10, 10 % 3 = 1 -> second booster.
    const tenWeeksLater = new Date(new Date(completedAt).getTime() + 10 * 7 * 24 * 60 * 60 * 1000);
    expect(selectWeeklyBooster(boosters, completedAt, tenWeeksLater)?.id).toBe('booster_defusion');
  });

  it('returns undefined when there are no boosters at all, rather than throwing', () => {
    expect(selectWeeklyBooster([], completedAt, new Date())).toBeUndefined();
  });
});

describe('assembleMaintenanceToday — what Today shows post-graduation (CLINICAL_SPEC §4)', () => {
  const plan: MaintenancePlanOutput = { cadence: '3 evenings a week', reassessmentReminderEnabled: true, weeklyBoosterEnabled: true };

  it('includes this weeks booster and the chosen cadence when the plan opts into both', () => {
    const view = assembleMaintenanceToday(boosters, completedAt, new Date('2026-01-03T00:00:00.000Z'), plan);
    expect(view.booster?.id).toBe('booster_urge_anatomy');
    expect(view.cadence).toBe('3 evenings a week');
  });

  it('omits the booster when the user opted out in Week 6 Day 6, but keeps the cadence', () => {
    const optedOut: MaintenancePlanOutput = { ...plan, weeklyBoosterEnabled: false };
    const view = assembleMaintenanceToday(boosters, completedAt, new Date('2026-01-03T00:00:00.000Z'), optedOut);
    expect(view.booster).toBeUndefined();
    expect(view.cadence).toBe('3 evenings a week');
  });

  it('defaults the booster ON when programCompletedAt exists but no maintenance_plan was ever saved (edge case)', () => {
    const view = assembleMaintenanceToday(boosters, completedAt, new Date('2026-01-03T00:00:00.000Z'), null);
    expect(view.booster?.id).toBe('booster_urge_anatomy');
    expect(view.cadence).toBeUndefined();
  });
});
