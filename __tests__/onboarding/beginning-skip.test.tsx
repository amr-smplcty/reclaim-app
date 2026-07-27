import { fireEvent, render } from '@testing-library/react-native';

import { tick } from '../../test-utils/asyncAct';
import BeginningScreen from '../../app/(onboarding)/beginning';
import { useJourneyStore } from '@/features/journey/useJourneyStore';
import { getJourneyContent } from '@/lib/content/journey';

jest.mock('expo-router', () => ({
  router: { replace: jest.fn(), push: jest.fn(), back: jest.fn(), canGoBack: () => false },
}));

const screens = getJourneyContent().beginning_sequence;

// One interactive test per file (BACKLOG #38) — the Skip path is separate.
describe('BeginningScreen — Skip', () => {
  afterEach(() => {
    useJourneyStore.getState().reset();
  });

  it('shows no Skip on screen 1, but Skip from screen 2 jumps to the final screen', async () => {
    const { getByText, queryByText } = await render(<BeginningScreen />);

    // Screen 1: no Skip.
    expect(queryByText('Skip')).toBeNull();

    // Advance to screen 2 — Skip now available.
    fireEvent.press(getByText(screens[0].cta));
    await tick();
    expect(getByText('Skip')).toBeTruthy();

    // Skip jumps straight to the final screen (its CTA is the last one).
    fireEvent.press(getByText('Skip'));
    await tick();
    expect(getByText(screens[screens.length - 1].title)).toBeTruthy();
    // On the final screen, Skip is gone again.
    expect(queryByText('Skip')).toBeNull();
  });
});
