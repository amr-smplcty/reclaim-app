// Pure pieces behind checkin.tsx's Week 4 Day 3 checkin_integration — while
// Week 4 is active, the evening check-in asks whether *today's* scheduled
// committed actions happened (filtered by day of week), not every action.

import type { CommittedAction, DayOfWeek } from '@/types/program';

const DAY_ORDER: DayOfWeek[] = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

export function dayOfWeekKeyFor(date: Date): DayOfWeek {
  return DAY_ORDER[date.getDay()];
}

export function actionsForToday(actions: CommittedAction[], day: DayOfWeek): CommittedAction[] {
  return actions.filter((action) => action.days_of_week.includes(day));
}
