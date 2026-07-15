import { insightForStep, shouldShowInsight } from '@/features/assessment/onboardingInsights';
import type { OnboardingAnswers } from '@/features/assessment/useOnboardingStore';

const baseAnswers: OnboardingAnswers = {
  dobIso: null,
  motivations: [],
  motivationOther: '',
  yearsOfUse: null,
  frequencyNow: null,
  escalation: null,
  priorQuitAttempts: null,
  ppcs6Responses: [null, null, null, null, null, null],
  ppcs6ItemIndex: 0,
  phq2Responses: [null, null],
  gad2Responses: [null, null],
  notificationsRequested: false,
  legalAcceptedAt: null,
};

describe('insightForStep', () => {
  it('resolves the content-JSON insight for a known insight step', () => {
    expect(insightForStep('insight-escalation')?.id).toBe('escalation-tolerance');
    expect(insightForStep('insight-quits')?.id).toBe('repeated-quit-attempts');
  });

  it('returns undefined for a step with no associated insight', () => {
    expect(insightForStep('context-escalation')).toBeUndefined();
  });
});

describe('shouldShowInsight', () => {
  it('shows the escalation insight only when escalation is yes', () => {
    expect(shouldShowInsight('insight-escalation', { ...baseAnswers, escalation: 'yes' })).toBe(true);
    expect(shouldShowInsight('insight-escalation', { ...baseAnswers, escalation: 'no' })).toBe(false);
    expect(shouldShowInsight('insight-escalation', { ...baseAnswers, escalation: 'unsure' })).toBe(false);
  });

  it('shows the repeated-quit-attempts insight only for 3-5 or 6+ prior attempts', () => {
    expect(shouldShowInsight('insight-quits', { ...baseAnswers, priorQuitAttempts: '3-5 times' })).toBe(true);
    expect(shouldShowInsight('insight-quits', { ...baseAnswers, priorQuitAttempts: '6+ times' })).toBe(true);
    expect(shouldShowInsight('insight-quits', { ...baseAnswers, priorQuitAttempts: 'None yet' })).toBe(false);
    expect(shouldShowInsight('insight-quits', { ...baseAnswers, priorQuitAttempts: null })).toBe(false);
  });

  it('is false for steps with no insight at all', () => {
    expect(shouldShowInsight('context-quits', baseAnswers)).toBe(false);
  });
});
