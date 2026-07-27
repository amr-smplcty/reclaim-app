import { fireEvent, render } from '@testing-library/react-native';

import TodayScreen from '../../app/(tabs)/today';
import { useProgramStore } from '@/features/program/useProgramStore';
import { useJourneyStore } from '@/features/journey/useJourneyStore';
import { useAppStore } from '@/stores/useAppStore';

const mockPush = jest.fn();
jest.mock('expo-router', () => ({
  router: { push: (...args: unknown[]) => mockPush(...args), replace: jest.fn(), back: jest.fn(), canGoBack: () => false },
  Redirect: () => null,
}));

// Header-tap navigation to the journey map (PRODUCT_SPEC §5.7).
describe('TodayScreen — tappable Week/Day header opens the journey map', () => {
  beforeEach(() => {
    // Past the beginning sequence so Today renders its normal branch.
    useAppStore.setState({ hasOnboarded: true });
    useJourneyStore.setState({ beginningSequenceSeen: true, weeklyIntrosSeen: {} });
    useProgramStore.setState({ position: { week: 1, day: 1 }, programCompletedAt: null });
  });

  afterEach(() => {
    useProgramStore.getState().reset();
    useJourneyStore.getState().reset();
    useAppStore.setState({ hasOnboarded: false });
    mockPush.mockClear();
  });

  it('tapping "Week 1 · Day 1" pushes the journey-map modal', async () => {
    const { getByText } = await render(<TodayScreen />);
    fireEvent.press(getByText('Week 1 · Day 1'));
    expect(mockPush).toHaveBeenCalledWith('/(modals)/journey-map');
  });
});
