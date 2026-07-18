import { fastForwardCurrentDay } from '@/features/dev/devFastForward';
import { useProgramStore } from '@/features/program/useProgramStore';

describe('fastForwardCurrentDay — dev-gate unreachability', () => {
  const originalDev = __DEV__;

  afterEach(() => {
    // @ts-expect-error — __DEV__ is a read-only global in real RN, writable here for the test double
    __DEV__ = originalDev;
    useProgramStore.getState().reset();
  });

  it('throws outside development so it can never reach a production build', () => {
    // @ts-expect-error — see above
    __DEV__ = false;
    expect(() => fastForwardCurrentDay()).toThrow();
  });

  it('does not touch program state when it throws in production', () => {
    // @ts-expect-error — see above
    __DEV__ = false;
    expect(() => fastForwardCurrentDay()).toThrow();
    expect(useProgramStore.getState().position).toEqual({ week: 1, day: 1 });
    expect(useProgramStore.getState().completions).toEqual({});
  });

  it('marks the current day complete and advances position in development', () => {
    // @ts-expect-error — see above
    __DEV__ = true;
    const before = useProgramStore.getState().position;
    fastForwardCurrentDay();
    const state = useProgramStore.getState();

    const completion = state.completions[`${before.week}-${before.day}`];
    expect(completion?.lessonComplete).toBe(true);
    expect(completion?.exerciseComplete).toBe(true);
    expect(completion?.checkinComplete).toBe(true);
    // Both lesson and exercise complete -> the program's own advance logic moves position forward.
    expect(state.position).not.toEqual(before);
  });

  it('saves a placeholder exercise output under the day-s real save_to key, when one exists', () => {
    // @ts-expect-error — see above
    __DEV__ = true;
    fastForwardCurrentDay();
    const outputs = useProgramStore.getState().exerciseOutputs;
    const savedKeys = Object.keys(outputs);
    // Week 1 Day 1's real content always defines a save_to key; whichever it
    // is, the placeholder must have landed under it (not silently dropped).
    expect(savedKeys.length).toBeGreaterThan(0);
    expect(Object.values(outputs)[0]).toMatchObject({ fastForwarded: true });
  });

  it('repeated calls can walk multiple days forward without getting stuck', () => {
    // @ts-expect-error — see above
    __DEV__ = true;
    fastForwardCurrentDay();
    const afterOne = useProgramStore.getState().position;
    fastForwardCurrentDay();
    const afterTwo = useProgramStore.getState().position;
    expect(afterTwo).not.toEqual(afterOne);
  });
});
