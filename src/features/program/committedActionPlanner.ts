// Pure pieces behind CommittedActionPlanner.tsx (Week 4 Day 3) — one small
// action per core value, an if-then anchor, and a day-of-week schedule.

import type { CommittedAction, DayOfWeek } from '@/types/program';

export function initializeActions(values: string[]): CommittedAction[] {
  return values.map((value, index) => ({
    id: `w4-action-${index}`,
    value,
    action: '',
    if_then_anchor: '',
    days_of_week: [],
  }));
}

export function toggleDay(days: DayOfWeek[], day: DayOfWeek): DayOfWeek[] {
  return days.includes(day) ? days.filter((d) => d !== day) : [...days, day];
}

export function isActionComplete(action: CommittedAction): boolean {
  return action.action.trim().length > 0 && action.if_then_anchor.trim().length > 0 && action.days_of_week.length > 0;
}

// Empty is never "complete" — Day 2 must have saved at least one core value
// for there to be anything to plan.
export function allActionsComplete(actions: CommittedAction[]): boolean {
  return actions.length > 0 && actions.every(isActionComplete);
}
