import { fireEvent, render } from '@testing-library/react-native';

import { useAssessmentHistoryStore } from '@/features/assessment/useAssessmentHistoryStore';
import { tick } from '../../test-utils/asyncAct';
import ReassessmentScreen from '../../app/(modals)/reassessment';

jest.mock('expo-router', () => ({
  router: { canGoBack: () => false, push: jest.fn(), replace: jest.fn(), back: jest.fn() },
}));

// A single interactive test per file: this environment's react-test-renderer
// leaves cross-test contamination behind once a screen transitions to a
// different conditional root view (confirmed via a minimal, code-independent
// repro) — one test per file sidesteps it instead of masking it.
describe('ReassessmentScreen submit', () => {
  afterEach(() => {
    useAssessmentHistoryStore.getState().reset();
  });

  it('records a past_2_weeks entry and shows the score on submit', async () => {
    const { getByText, getAllByText } = await render(<ReassessmentScreen />);

    // Answer all 6 items with the same response value ("Never").
    const neverChips = getAllByText('Never');
    expect(neverChips).toHaveLength(6);
    for (const chip of neverChips) {
      fireEvent.press(chip);
      await tick();
    }

    expect(getByText('Submit').parent?.props.accessibilityState.disabled).toBe(false);
    fireEvent.press(getByText('Submit'));
    await tick();

    const { entries } = useAssessmentHistoryStore.getState();
    expect(entries).toHaveLength(1);
    expect(entries[0].timeframe).toBe('past_2_weeks');
    expect(entries[0].score).toBe(6);
    expect(getByText('6 / 42 · Low indication')).toBeTruthy();
  });
});
