import { fireEvent, render } from '@testing-library/react-native';

import { tick } from '../../test-utils/asyncAct';
import { getPpcs6Assessment } from '@/lib/content';
import { useAssessmentHistoryStore } from '@/features/assessment/useAssessmentHistoryStore';
import { useRefresherStore } from '@/features/program/useRefresherStore';
import ReassessmentScreen from '../../app/(modals)/reassessment';

jest.mock('expo-router', () => ({
  router: { canGoBack: () => false, push: jest.fn(), replace: jest.fn(), back: jest.fn() },
}));

// Split into its own file per BACKLOG #38 (a second render() in the same
// file as another interactive root-view-swapping test corrupts this
// environment) — the decline / "no-nag" half of the refresher-offer flow.
describe('ReassessmentScreen — declining the refresher offer', () => {
  afterEach(() => {
    useAssessmentHistoryStore.getState().reset();
    useRefresherStore.getState().reset();
  });

  it('declining records the decision and dismisses the offer without navigating anywhere', async () => {
    useAssessmentHistoryStore.getState().recordAssessment([1, 1, 1, 1, 1, 1], 'past_2_weeks');

    const { getByText, getAllByText, queryByText } = await render(<ReassessmentScreen />);

    const ppcs6 = getPpcs6Assessment();
    const highestLabel = ppcs6.scale_labels[ppcs6.scale_labels.length - 1];
    const chips = getAllByText(highestLabel);
    for (const chip of chips) {
      fireEvent.press(chip);
      await tick();
    }

    fireEvent.press(getByText('Submit'));
    await tick();

    expect(getByText('Want a refresher week?')).toBeTruthy();

    fireEvent.press(getByText('Not now'));
    await tick();

    // Declined, respected immediately — the offer UI disappears on this
    // same screen without needing to leave and come back.
    expect(queryByText('Want a refresher week?')).toBeNull();

    const entries = useAssessmentHistoryStore.getState().entries;
    const latestId = entries[entries.length - 1].id;
    expect(useRefresherStore.getState().offerDecisions[latestId]).toBe('declined');
  });
});
