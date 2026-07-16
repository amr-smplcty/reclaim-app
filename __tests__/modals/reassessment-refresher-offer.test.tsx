import { fireEvent, render } from '@testing-library/react-native';

import { tick } from '../../test-utils/asyncAct';
import { getPpcs6Assessment } from '@/lib/content';
import { useAssessmentHistoryStore } from '@/features/assessment/useAssessmentHistoryStore';
import { useRefresherStore } from '@/features/program/useRefresherStore';
import ReassessmentScreen from '../../app/(modals)/reassessment';

const mockPush = jest.fn();
jest.mock('expo-router', () => ({
  router: { canGoBack: () => false, push: (...args: unknown[]) => mockPush(...args), replace: jest.fn(), back: jest.fn() },
}));

// One interactive test per file (BACKLOG #38) — split from the other
// reassessment result-screen tests for the same reason those are split.
describe('ReassessmentScreen — refresher-week offer on a qualifying rise', () => {
  afterEach(() => {
    useAssessmentHistoryStore.getState().reset();
    useRefresherStore.getState().reset();
    mockPush.mockClear();
  });

  it('offers the refresher after a >=6-point rise across two re-assessments, and accepting records the decision + navigates', async () => {
    // First re-assessment: all "Never" -> score 6.
    useAssessmentHistoryStore.getState().recordAssessment([1, 1, 1, 1, 1, 1], 'past_2_weeks');

    const { getByText, getAllByText } = await render(<ReassessmentScreen />);

    // Second re-assessment — select the highest-value option for every item,
    // producing a large rise over the first (all-lowest) re-assessment.
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

    fireEvent.press(getByText('Start the refresher'));
    await tick();

    expect(mockPush).toHaveBeenCalledWith('/(modals)/refresher-week');
    const entries = useAssessmentHistoryStore.getState().entries;
    const latestId = entries[entries.length - 1].id;
    expect(useRefresherStore.getState().offerDecisions[latestId]).toBe('accepted');
  });
});
