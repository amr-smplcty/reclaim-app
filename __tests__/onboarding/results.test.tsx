import { cleanup, render } from '@testing-library/react-native';

import { useOnboardingStore } from '@/features/assessment/useOnboardingStore';
import ResultsScreen from '../../app/(onboarding)/results';

jest.mock('expo-router', () => ({
  router: { canGoBack: () => false, push: jest.fn(), replace: jest.fn(), back: jest.fn() },
}));

describe('ResultsScreen', () => {
  afterEach(() => {
    cleanup();
    useOnboardingStore.getState().reset();
  });

  it('renders the graceful recovery path instead of throwing when responses are empty', async () => {
    // Matches the default state after paywall's reset — this is the exact
    // shape that used to crash with "PPCS-6 items must be on the 1-7 scale".
    useOnboardingStore.setState((state) => ({
      answers: { ...state.answers, ppcs6Responses: [null, null, null, null, null, null] },
    }));

    const { getByText } = await render(<ResultsScreen />);
    expect(getByText("Let's pick up where you left off.")).toBeTruthy();
  });

  it('renders the graceful recovery path for partially-answered/invalid responses too', async () => {
    useOnboardingStore.setState((state) => ({
      answers: { ...state.answers, ppcs6Responses: [1, 2, 3, null, null, null] },
    }));

    const { getByText, queryByText } = await render(<ResultsScreen />);
    expect(getByText("Let's pick up where you left off.")).toBeTruthy();
    expect(queryByText(/Your score/)).toBeNull();
  });

  it('renders the real score when responses are complete and valid', async () => {
    useOnboardingStore.setState((state) => ({
      answers: { ...state.answers, ppcs6Responses: [7, 7, 7, 7, 7, 7] },
    }));

    const { getByText, queryByText } = await render(<ResultsScreen />);
    expect(queryByText("Let's pick up where you left off.")).toBeNull();
    expect(getByText('Your score')).toBeTruthy();
  });
});
