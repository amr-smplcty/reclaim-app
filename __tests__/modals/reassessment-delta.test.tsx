import { fireEvent, render } from '@testing-library/react-native';

import { useAssessmentHistoryStore } from '@/features/assessment/useAssessmentHistoryStore';
import { tick } from '../../test-utils/asyncAct';
import ReassessmentScreen from '../../app/(modals)/reassessment';

jest.mock('expo-router', () => ({
  router: { canGoBack: () => false, push: jest.fn(), replace: jest.fn(), back: jest.fn() },
}));

// Single interactive test per file — see reassessment-submit.test.tsx for why.
describe('ReassessmentScreen delta framing', () => {
  afterEach(() => {
    useAssessmentHistoryStore.getState().reset();
  });

  it('computes a delta framing against a prior assessment', async () => {
    useAssessmentHistoryStore.getState().recordAssessment([7, 7, 7, 7, 7, 7], 'past_6_months');

    const { getByText, getAllByText } = await render(<ReassessmentScreen />);
    const neverChips = getAllByText('Never');
    for (const chip of neverChips) {
      fireEvent.press(chip);
      await tick();
    }

    fireEvent.press(getByText('Submit'));
    await tick();

    expect(getByText('−36 points since your last check.')).toBeTruthy();
  });
});
