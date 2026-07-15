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

  it('advances into the escalation insight when its trigger matches', () => {
    useOnboardingStore.getState().updateAnswers({ escalation: 'yes' });
    useOnboardingStore.getState().goToStep('context-escalation');
    useOnboardingStore.getState().advance();
    expect(useOnboardingStore.getState().currentStep).toBe('insight-escalation');
  });

  it('skips the escalation insight when its trigger does not match', () => {
    useOnboardingStore.getState().updateAnswers({ escalation: 'no' });
    useOnboardingStore.getState().goToStep('context-escalation');
    useOnboardingStore.getState().advance();
    expect(useOnboardingStore.getState().currentStep).toBe('context-quits');
  });

  it('advances into the repeated-quits insight when its trigger matches', () => {
    useOnboardingStore.getState().updateAnswers({ priorQuitAttempts: '6+ times' });
    useOnboardingStore.getState().goToStep('context-quits');
    useOnboardingStore.getState().advance();
    expect(useOnboardingStore.getState().currentStep).toBe('insight-quits');
  });

  it('skips the repeated-quits insight when its trigger does not match', () => {
    useOnboardingStore.getState().updateAnswers({ priorQuitAttempts: 'None yet' });
    useOnboardingStore.getState().goToStep('context-quits');
    useOnboardingStore.getState().advance();
    expect(useOnboardingStore.getState().currentStep).toBe('disclaimer');
  });
});
