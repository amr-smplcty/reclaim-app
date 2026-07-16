// Pure pieces behind CommittedActionPlanner.tsx (Week 4 Day 3, and Week 5
// Day 3's freestanding mode) — one small action per value (or one
// value-agnostic action), an if-then anchor, and a day-of-week schedule.

import type { CommittedAction, CommittedActionPlannerPayload, DayOfWeek, MultiSelectWriteOutput } from '@/types/program';

// idPrefix is the payload's own save_to — every committed_action_planner
// instance saves to a different key (committed_actions, movement_plan, …),
// so using it as the id prefix keeps two instances' actions from ever
// colliding once checkin.tsx merges them into one Record keyed by id.
export function initializeActions(values: string[], idPrefix: string): CommittedAction[] {
  return values.map((value, index) => ({
    id: `${idPrefix}-action-${index}`,
    value,
    action: '',
    if_then_anchor: '',
    days_of_week: [],
  }));
}

// Week 4 Day 3 sources its values from a prior multi_select_write save
// (values_core); Week 5 Day 3 is "freestanding" (values_source: null) — a
// single value-agnostic action under a fixed label ("Health & vitality").
// Degrades to an empty list (never throws) if freestanding mode somehow
// omits its label, same spirit as the empty-values guard already in the
// component for the value-driven case.
export function resolveCommittedActionValues(
  payload: CommittedActionPlannerPayload,
  outputs: Record<string, unknown>
): string[] {
  if (payload.values_source === null) {
    return payload.fixed_value_label ? [payload.fixed_value_label] : [];
  }
  const valuesOutput = outputs[payload.values_source] as MultiSelectWriteOutput | undefined;
  return valuesOutput?.selected ?? [];
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
