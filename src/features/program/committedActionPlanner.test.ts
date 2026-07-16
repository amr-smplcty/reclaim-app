import {
  allActionsComplete,
  initializeActions,
  isActionComplete,
  toggleDay,
} from '@/features/program/committedActionPlanner';
import type { CommittedAction } from '@/types/program';

describe('initializeActions', () => {
  it('builds one blank action per value, with a stable id', () => {
    expect(initializeActions(['Presence', 'Connection'])).toEqual([
      { id: 'w4-action-0', value: 'Presence', action: '', if_then_anchor: '', days_of_week: [] },
      { id: 'w4-action-1', value: 'Connection', action: '', if_then_anchor: '', days_of_week: [] },
    ]);
  });

  it('returns an empty list for an empty values list, never throwing', () => {
    expect(initializeActions([])).toEqual([]);
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
