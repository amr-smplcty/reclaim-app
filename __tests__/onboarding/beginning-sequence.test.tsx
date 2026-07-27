import { fireEvent, render } from '@testing-library/react-native';

import { tick } from '../../test-utils/asyncAct';
import BeginningScreen from '../../app/(onboarding)/beginning';
import { useJourneyStore } from '@/features/journey/useJourneyStore';
import { getJourneyContent } from '@/lib/content/journey';

const mockReplace = jest.fn();
jest.mock('expo-router', () => ({
  router: { replace: (...args: unknown[]) => mockReplace(...args), push: jest.fn(), back: jest.fn(), canGoBack: () => false },
}));

const screens = getJourneyContent().beginning_sequence;

// One interactive (root-view-swapping) test per file (BACKLOG #38).
describe('BeginningScreen — 4-screen ceremony, render-once', () => {
  afterEach(() => {
    useJourneyStore.getState().reset();
    mockReplace.mockClear();
  });

  it('taps through all four authored screens and, on the last, marks seen and enters the app', async () => {
    const { getByText } = await render(<BeginningScreen />);

    // Screen 1: authored title + CTA; no Skip yet.
    expect(getByText(screens[0].title)).toBeTruthy();

    fireEvent.press(getByText(screens[0].cta));
    await tick();
    expect(getByText(screens[1].title)).toBeTruthy();

    fireEvent.press(getByText(screens[1].cta));
    await tick();
    expect(getByText(screens[2].title)).toBeTruthy();

    fireEvent.press(getByText(screens[2].cta));
    await tick();
    expect(getByText(screens[3].title)).toBeTruthy();

    // Final CTA marks the sequence seen and replaces into Today.
    fireEvent.press(getByText(screens[3].cta));
    await tick();

    expect(useJourneyStore.getState().beginningSequenceSeen).toBe(true);
    expect(mockReplace).toHaveBeenCalledWith('/(tabs)/today');
  });
});
