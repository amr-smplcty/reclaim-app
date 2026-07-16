import { actionsForToday, dayOfWeekKeyFor } from '@/features/journal/committedActionCheckin';
import type { CommittedAction } from '@/types/program';

function action(id: string, days: CommittedAction['days_of_week']): CommittedAction {
  return { id, value: 'Presence', action: 'Phone away', if_then_anchor: 'At dinner', days_of_week: days };
}

describe('dayOfWeekKeyFor', () => {
  it("maps each JS Date.getDay() index (0=Sun..6=Sat) to the matching key, in order", () => {
    // Anchor on a date whose getDay() we ask JS for directly, then walk 7
    // consecutive days — independent of what weekday any specific date
    // actually falls on, so this can't drift with calendar arithmetic.
    const anchor = new Date('2026-01-04T12:00:00');
    const expectedOrder = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
    for (let i = 0; i < 7; i++) {
      const date = new Date(anchor.getTime() + i * 24 * 60 * 60 * 1000);
      const expectedIndex = date.getDay();
      expect(dayOfWeekKeyFor(date)).toBe(expectedOrder[expectedIndex]);
    }
  });
});

describe('actionsForToday — Day 3 checkin_integration filter', () => {
  it('includes only actions scheduled for the given day', () => {
    const actions = [action('a', ['mon', 'wed', 'fri']), action('b', ['tue', 'thu'])];
    expect(actionsForToday(actions, 'mon').map((a) => a.id)).toEqual(['a']);
    expect(actionsForToday(actions, 'tue').map((a) => a.id)).toEqual(['b']);
  });

  it('returns an empty list when nothing is scheduled for that day', () => {
    const actions = [action('a', ['mon'])];
    expect(actionsForToday(actions, 'sun')).toEqual([]);
  });

  it('returns an empty list for an empty actions list, never throwing', () => {
    expect(actionsForToday([], 'mon')).toEqual([]);
  });

  it('includes an action scheduled on every day of the week it runs', () => {
    const actions = [action('daily', ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'])];
    for (const day of ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const) {
      expect(actionsForToday(actions, day).map((a) => a.id)).toEqual(['daily']);
    }
  });
});
