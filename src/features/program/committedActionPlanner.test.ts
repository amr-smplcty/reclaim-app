import {
  allActionsComplete,
  initializeActions,
  isActionComplete,
  resolveCommittedActionValues,
  toggleDay,
} from '@/features/program/committedActionPlanner';
import type { CommittedAction, CommittedActionPlannerPayload } from '@/types/program';

describe('initializeActions', () => {
  it('builds one blank action per value, ids prefixed by the given save_to key', () => {
    expect(initializeActions(['Presence', 'Connection'], 'committed_actions')).toEqual([
      { id: 'committed_actions-action-0', value: 'Presence', action: '', if_then_anchor: '', days_of_week: [] },
      { id: 'committed_actions-action-1', value: 'Connection', action: '', if_then_anchor: '', days_of_week: [] },
    ]);
  });

  it('prefixes ids with a different key so two instances never collide (Week 4 committed_actions vs Week 5 movement_plan)', () => {
    const week4 = initializeActions(['Presence'], 'committed_actions');
    const week5 = initializeActions(['Health & vitality'], 'movement_plan');
    expect(week4[0].id).not.toBe(week5[0].id);
  });

  it('returns an empty list for an empty values list, never throwing', () => {
    expect(initializeActions([], 'committed_actions')).toEqual([]);
  });
});

describe('resolveCommittedActionValues — Week 5 Day 3 freestanding mode (values_source: null)', () => {
  const valueDrivenPayload: CommittedActionPlannerPayload = {
    kind: 'committed_action_planner',
    actions_per_value: 1,
    values_source: 'values_core',
    action_fields: ['action', 'if_then_anchor', 'days_of_week'],
    size_note: 'x',
    save_to: 'committed_actions',
  };

  const freestandingPayload: CommittedActionPlannerPayload = {
    kind: 'committed_action_planner',
    actions_per_value: 1,
    values_source: null,
    fixed_value_label: 'Health & vitality',
    action_fields: ['action', 'if_then_anchor', 'days_of_week'],
    size_note: 'x',
    save_to: 'movement_plan',
  };

  it('resolves values from the source output when values_source is set (Week 4 Day 3)', () => {
    const outputs = { values_core: { selected: ['Presence', 'Connection'], write: '' } };
    expect(resolveCommittedActionValues(valueDrivenPayload, outputs)).toEqual(['Presence', 'Connection']);
  });

  it('uses fixed_value_label as the sole value when values_source is null (Week 5 Day 3)', () => {
    expect(resolveCommittedActionValues(freestandingPayload, {})).toEqual(['Health & vitality']);
  });

  it('ignores whatever outputs contains when in freestanding mode', () => {
    const outputs = { values_core: { selected: ['Presence'], write: '' } };
    expect(resolveCommittedActionValues(freestandingPayload, outputs)).toEqual(['Health & vitality']);
  });

  it('degrades to an empty list rather than throwing if freestanding mode has no fixed_value_label', () => {
    const { fixed_value_label, ...withoutLabel } = freestandingPayload;
    void fixed_value_label;
    expect(resolveCommittedActionValues(withoutLabel as CommittedActionPlannerPayload, {})).toEqual([]);
  });
});

describe('toggleDay', () => {
  it('adds a day not yet selected', () => {
    expect(toggleDay(['mon'], 'wed')).toEqual(['mon', 'wed']);
  });

  it('removes a day already selected', () => {
    expect(toggleDay(['mon', 'wed'], 'mon')).toEqual(['wed']);
  });
});

describe('isActionComplete', () => {
  const base: CommittedAction = { id: 'w4-action-0', value: 'Presence', action: '', if_then_anchor: '', days_of_week: [] };

  it('is false when the action text is blank', () => {
    expect(isActionComplete({ ...base, if_then_anchor: 'At dinner', days_of_week: ['mon'] })).toBe(false);
  });

  it('is false when the if-then anchor is blank', () => {
    expect(isActionComplete({ ...base, action: 'Phone away', days_of_week: ['mon'] })).toBe(false);
  });

  it('is false when no day is scheduled', () => {
    expect(isActionComplete({ ...base, action: 'Phone away', if_then_anchor: 'At dinner' })).toBe(false);
  });

  it('is true once all three fields are filled', () => {
    expect(isActionComplete({ ...base, action: 'Phone away', if_then_anchor: 'At dinner', days_of_week: ['mon'] })).toBe(
      true
    );
  });

  it('treats whitespace-only text as blank', () => {
    expect(isActionComplete({ ...base, action: '   ', if_then_anchor: 'At dinner', days_of_week: ['mon'] })).toBe(false);
  });
});

describe('allActionsComplete', () => {
  it('is false for an empty list — nothing to submit', () => {
    expect(allActionsComplete([])).toBe(false);
  });

  it('is false if any one action is incomplete', () => {
    const actions: CommittedAction[] = [
      { id: 'a', value: 'Presence', action: 'Phone away', if_then_anchor: 'At dinner', days_of_week: ['mon'] },
      { id: 'b', value: 'Connection', action: '', if_then_anchor: '', days_of_week: [] },
    ];
    expect(allActionsComplete(actions)).toBe(false);
  });

  it('is true once every action is complete', () => {
    const actions: CommittedAction[] = [
      { id: 'a', value: 'Presence', action: 'Phone away', if_then_anchor: 'At dinner', days_of_week: ['mon'] },
      { id: 'b', value: 'Connection', action: 'Text her', if_then_anchor: 'At 9pm', days_of_week: ['tue'] },
    ];
    expect(allActionsComplete(actions)).toBe(true);
  });
});
