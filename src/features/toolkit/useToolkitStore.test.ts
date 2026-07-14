import { useToolkitStore } from '@/features/toolkit/useToolkitStore';

describe('useToolkitStore — session (urge protocol entry, CLINICAL_SPEC §5.1)', () => {
  afterEach(() => {
    useToolkitStore.getState().reset();
  });

  it('defaults to no active session and empty logs', () => {
    const state = useToolkitStore.getState();
    expect(state.activeSession).toBeNull();
    expect(state.urgeLogs).toEqual([]);
    expect(state.toolUses).toEqual([]);
    expect(state.lapseDebriefs).toEqual([]);
    expect(state.relapsePreventionNotes).toEqual([]);
  });

  it('starts and clears a session', () => {
    useToolkitStore.getState().startSession(7);
    expect(useToolkitStore.getState().activeSession).toEqual({ preIntensity: 7 });

    useToolkitStore.getState().clearSession();
    expect(useToolkitStore.getState().activeSession).toBeNull();
  });
});

describe('useToolkitStore — urge log persistence (PRODUCT_SPEC §5.3)', () => {
  afterEach(() => {
    useToolkitStore.getState().reset();
  });

  it('appends a structured urge log entry', () => {
    useToolkitStore.getState().logUrge({
      intensity: 8,
      trigger: 'stress',
      location: 'bedroom',
      whatHappenedNext: 'Used the breather tool.',
    });

    const { urgeLogs } = useToolkitStore.getState();
    expect(urgeLogs).toHaveLength(1);
    expect(urgeLogs[0]).toMatchObject({
      intensity: 8,
      trigger: 'stress',
      location: 'bedroom',
      whatHappenedNext: 'Used the breather tool.',
    });
    expect(typeof urgeLogs[0].id).toBe('string');
    expect(typeof urgeLogs[0].timestamp).toBe('string');
  });

  it('accumulates multiple logs in order', () => {
    useToolkitStore.getState().logUrge({ intensity: 3, trigger: 'boredom', location: '', whatHappenedNext: '' });
    useToolkitStore.getState().logUrge({ intensity: 9, trigger: 'late_night', location: '', whatHappenedNext: '' });
    expect(useToolkitStore.getState().urgeLogs.map((l) => l.intensity)).toEqual([3, 9]);
  });
});

describe('useToolkitStore — tool-use delta logging', () => {
  afterEach(() => {
    useToolkitStore.getState().reset();
  });

  it('records pre/post intensity and computes the delta', () => {
    const entry = useToolkitStore.getState().logToolUse('breather', 7, 3);
    expect(entry.tool).toBe('breather');
    expect(entry.preIntensity).toBe(7);
    expect(entry.postIntensity).toBe(3);
    expect(entry.delta).toBe(-4);
    expect(useToolkitStore.getState().toolUses).toHaveLength(1);
  });
});

describe('useToolkitStore — lapse debrief flow state (CLINICAL_SPEC §5.4)', () => {
  afterEach(() => {
    useToolkitStore.getState().reset();
  });

  it('records the debrief and appends the change-for-next-time note to relapse-prevention data', () => {
    useToolkitStore.getState().logLapseDebrief({
      beforeChips: ['stress', 'late_night'],
      beforeFreeText: 'Long day, couldn\'t sleep.',
      feelingChips: ['Lonely', 'Tired'],
      whatFailed: 'used_but_overwhelmed',
      changeNextTime: 'Charge my phone in the kitchen, not the bedroom.',
    });

    const state = useToolkitStore.getState();
    expect(state.lapseDebriefs).toHaveLength(1);
    expect(state.lapseDebriefs[0].answers.whatFailed).toBe('used_but_overwhelmed');
    expect(state.relapsePreventionNotes).toEqual(['Charge my phone in the kitchen, not the bedroom.']);
  });

  it('never resets any streak or completion state (no streak-reset mechanics)', () => {
    useToolkitStore.getState().logLapseDebrief({
      beforeChips: [],
      beforeFreeText: '',
      feelingChips: [],
      whatFailed: 'didnt_want_to_stop',
      changeNextTime: 'Try the shift list first.',
    });
    // The toolkit store has no streak/day-count field to reset — logging a
    // lapse only ever appends data, it never mutates unrelated state.
    expect(Object.keys(useToolkitStore.getState())).not.toContain('streak');
  });
});

// The shift list moved to the program store's exerciseOutputs.shift_list —
// see src/features/program/shiftList.test.ts (BACKLOG #14: it's the same key
// Week 2 Day 6's exercise reads/writes, so both entry points share one source
// of truth instead of the toolkit store keeping its own separate copy).
