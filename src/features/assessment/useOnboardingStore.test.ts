import { ONBOARDING_STEPS, nextStepOf, useOnboardingStore } from '@/features/assessment/useOnboardingStore';

describe('nextStepOf', () => {
  it('walks the full step order', () => {
    for (let i = 0; i < ONBOARDING_STEPS.length - 1; i++) {
      expect(nextStepOf(ONBOARDING_STEPS[i])).toBe(ONBOARDING_STEPS[i + 1]);
    }
  });

  it('stays on the last step (paywall)', () => {
    expect(nextStepOf('paywall')).toBe('paywall');
  });
});

describe('useOnboardingStore', () => {
  afterEach(() => {
    useOnboardingStore.getState().reset();
  });

  it('advances through steps in order', () => {
    expect(useOnboardingStore.getState().currentStep).toBe('welcome');
    useOnboardingStore.getState().advance();
    expect(useOnboardingStore.getState().currentStep).toBe('age');
  });

  it('merges partial answer updates without clobbering the rest', () => {
    useOnboardingStore.getState().updateAnswers({ yearsOfUse: '5' });
    useOnboardingStore.getState().updateAnswers({ frequencyNow: 'daily' });
    const { answers } = useOnboardingStore.getState();
    expect(answers.yearsOfUse).toBe('5');
    expect(answers.frequencyNow).toBe('daily');
  });

  it('clears motivationOther without touching other answers', () => {
    useOnboardingStore.getState().updateAnswers({ motivationOther: 'a disclosure', yearsOfUse: '3' });
    useOnboardingStore.getState().clearMotivationOther();
    const { answers } = useOnboardingStore.getState();
    expect(answers.motivationOther).toBe('');
    expect(answers.yearsOfUse).toBe('3');
  });
});
