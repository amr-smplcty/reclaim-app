import { cleanup, fireEvent, render, waitFor } from '@testing-library/react-native';

import { useOnboardingStore } from '@/features/assessment/useOnboardingStore';
import { useAppStore } from '@/stores/useAppStore';
import ResultsScreen from './results';
import PaywallScreen from './paywall';

jest.mock('expo-router', () => ({
  router: { canGoBack: () => false, push: jest.fn(), replace: jest.fn(), back: jest.fn() },
}));

// Simulates the real navigation stack shape: goNextFrom uses router.push, so
// by the time the user reaches paywall, ResultsScreen is still mounted
// (just off-screen) underneath it — both co-exist in one tree, same as in
// the app.
function OnboardingStackSnapshot() {
  return (
    <>
      <ResultsScreen />
      <PaywallScreen />
    </>
  );
}

// Regression coverage for the exact crash: onboarding complete -> paywall
// "Continue" -> ResultsScreen (still mounted further down the onboarding
// stack) used to throw "PPCS-6 items must be on the 1-7 scale" when
// paywall's handleContinue reset the shared onboarding store while
// ResultsScreen was still reactively subscribed to it.
describe('paywall continue -> onboarding store reset (crash regression)', () => {
  afterEach(() => {
    cleanup();
    useOnboardingStore.getState().reset();
    useAppStore.setState({ hasOnboarded: false });
  });

  it('does not crash a still-mounted ResultsScreen when Continue resets the onboarding store', async () => {
    useOnboardingStore.setState((state) => ({
      currentStep: 'paywall',
      answers: { ...state.answers, ppcs6Responses: [5, 5, 5, 5, 5, 5] },
    }));

    const { getByText, getAllByText } = await render(<OnboardingStackSnapshot />);
    expect(getByText('Your score')).toBeTruthy();

    // Both screens render a "Continue" button — press paywall's (the second,
    // since ResultsScreen renders first in the snapshot).
    const paywallContinue = getAllByText('Continue')[1];
    expect(() => fireEvent.press(paywallContinue)).not.toThrow();

    expect(useAppStore.getState().hasOnboarded).toBe(true);
    expect(useOnboardingStore.getState().currentStep).toBe('welcome');
    // The stale, still-mounted ResultsScreen re-rendered against the
    // now-cleared store and degraded gracefully instead of throwing.
    await waitFor(() => expect(getByText("Let's pick up where you left off.")).toBeTruthy());
  });
});
