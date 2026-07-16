import { fireEvent, render } from '@testing-library/react-native';

import { tick } from '../../test-utils/asyncAct';
import { useToolkitStore } from '@/features/toolkit/useToolkitStore';
import { useProgramStore } from '@/features/program/useProgramStore';
import LogUrgeScreen from '../../app/(toolkit)/log-urge';

jest.mock('expo-router', () => ({
  router: { canGoBack: () => false, push: jest.fn(), replace: jest.fn(), back: jest.fn() },
}));

// Week 4 Day 4's enable_ongoing_tagging (PRODUCT_SPEC / CLINICAL_SPEC §4) —
// real urge logs before that exercise is complete carry no tag at all; once
// it's done, every future log offers the same optional "what was it asking
// for?" tag, sourced from the user's real values_core + the content's
// extra_tags. One interactive test per file (BACKLOG #38): the "before"
// render is query-only (no submit, no root-view swap) so only the "after"
// render's Save press ever swaps LogUrgeScreen's conditional root view.
describe('LogUrgeScreen — ongoing value-tag persistence', () => {
  afterEach(() => {
    useToolkitStore.getState().reset();
    useProgramStore.getState().reset();
  });

  it('offers no tag before Day 4 is complete, then offers and persists one after', async () => {
    const before = await render(<LogUrgeScreen />);
    expect(before.queryByText('What was it asking for? (optional)')).toBeNull();

    // Complete Day 4 for real — a real values_core save plus the
    // urge_value_map exercise output that gates the ongoing tag.
    useProgramStore.getState().saveExerciseOutput('values_core', { selected: ['Presence'], write: '' });
    useProgramStore.getState().saveExerciseOutput('urge_value_map', { entries: [], worksheetText: null });

    const after = await render(<LogUrgeScreen />);
    expect(after.getByText('What was it asking for? (optional)')).toBeTruthy();
    expect(after.getByText('Presence')).toBeTruthy();
    expect(after.getByText('rest / relief')).toBeTruthy();

    fireEvent.press(after.getByText('7'));
    fireEvent.press(after.getByText('Stress'));
    fireEvent.press(after.getByText('Presence'));
    await tick();
    fireEvent.press(after.getByText('Save'));
    await tick();

    const logs = useToolkitStore.getState().urgeLogs;
    expect(logs).toHaveLength(1);
    expect(logs[0].valueTag).toBe('Presence');
  });
});
