import { fireEvent, render } from '@testing-library/react-native';

import { tick } from '../../test-utils/asyncAct';
import TodayScreen from '../../app/(tabs)/today';
import { useProgramStore } from '@/features/program/useProgramStore';
import { useJourneyStore } from '@/features/journey/useJourneyStore';
import { useAppStore } from '@/stores/useAppStore';
import { getWeeklyIntro } from '@/lib/content/journey';

jest.mock('expo-router', () => ({
  router: { push: jest.fn(), replace: jest.fn(), back: jest.fn(), canGoBack: () => false },
  Redirect: () => null,
}));

// Weekly kickoff interstitial (PRODUCT_SPEC §5.7): once, on first open of each
// week's Day 1 (weeks 2–6). One interactive test per file (BACKLOG #38).
describe('TodayScreen — weekly kickoff interstitial', () => {
  beforeEach(() => {
    useAppStore.setState({ hasOnboarded: true });
    useJourneyStore.setState({ beginningSequenceSeen: true, weeklyIntrosSeen: {} });
    useProgramStore.setState({ position: { week: 2, day: 1 }, programCompletedAt: null });
  });

  afterEach(() => {
    useProgramStore.getState().reset();
    useJourneyStore.getState().reset();
    useAppStore.setState({ hasOnboarded: false });
  });

  it('shows Week 2s kickoff on first open of W2D1, and dismissing marks it seen (revealing the day)', async () => {
    const intro = getWeeklyIntro(2)!;
    const { getByText, queryByText } = await render(<TodayScreen />);

    // The kickoff replaces the day stack.
    expect(getByText(intro.title)).toBeTruthy();
    expect(queryByText('Week 2 · Day 1')).toBeNull();

    // Dismiss via the authored CTA → marks seen.
    fireEvent.press(getByText(intro.cta));
    await tick();

    expect(useJourneyStore.getState().weeklyIntrosSeen[2]).toBe(true);
  });
});
