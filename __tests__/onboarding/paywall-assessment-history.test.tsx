import { fireEvent, render } from '@testing-library/react-native';

import { useOnboardingStore } from '@/features/assessment/useOnboardingStore';
import { useAssessmentHistoryStore } from '@/features/assessment/useAssessmentHistoryStore';
import ResultsScreen from '../../app/(onboarding)/results';
import PaywallScreen from '../../app/(onboarding)/paywall';

jest.mock('expo-router', () => ({
  router: { canGoBack: () => false, push: jest.fn(), replace: jest.fn(), back: jest.fn() },
}));

// Simulates the real navigation stack shape: goNextFrom uses router.push, so
// by the time the user reaches paywall, ResultsScreen is still mounted
// (just off-screen) underneath it.
function OnboardingStackSnapshot() {
  return (
    <>
      <ResultsScreen />
      <PaywallScreen />
    </>
  );
}

// Part 3 (Epic 8 reconciliation) — regression coverage for the exact
// persistence guarantee useAssessmentHistoryStore exists for: the baseline
// PPCS-6 record, written by results.tsx on its own Continue, must survive
// paywall.tsx's later resetOnboarding() call untouched, because assessment
// history lives in a completely separate store from useOnboardingStore.
// One interactive test in this file — see BACKLOG #38 on why more than one
// per file isn't safe in this test environment.
describe('assessment history survives the paywall-completion store reset', () => {
  afterEach(() => {
    useOnboardingStore.getState().reset();
    useAssessmentHistoryStore.getState().reset();
  });

  it('keeps the baseline PPCS-6 record after results.tsx records it and paywall resets useOnboardingStore', async () => {
    useOnboardingStore.setState((state) => ({
      currentStep: 'paywall',
      answers: { ...state.answers, ppcs6Responses: [5, 5, 5, 5, 5, 5] },
    }));

    const { getAllByText } = await render(<OnboardingStackSnapshot />);

    // ResultsScreen's own Continue records the baseline history entry.
    fireEvent.press(getAllByText('Continue')[0]);
    expect(useAssessmentHistoryStore.getState().entries).toHaveLength(1);
    const baselineEntry = useAssessmentHistoryStore.getState().entries[0];
    expect(baselineEntry.score).toBe(30);

    // Paywall's Continue resets useOnboardingStore — a separate store — the
    // assessment history must be completely untouched.
    fireEvent.press(getAllByText('Continue')[1]);

    const { entries } = useAssessmentHistoryStore.getState();
    expect(entries).toHaveLength(1);
    expect(entries[0]).toEqual(baselineEntry);
    // And the onboarding store did reset, confirming this isn't just a
    // no-op press.
    expect(useOnboardingStore.getState().currentStep).toBe('welcome');
  });
});
