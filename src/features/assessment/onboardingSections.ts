import type { OnboardingStepId } from '@/features/assessment/useOnboardingStore';

// Three named sections for onboarding progress (PRODUCT_SPEC §4 value arc):
// "About you → The screening → Your results". "welcome" sits outside all
// three — it's the upfront contract screen, not part of the measured flow.
export type OnboardingSection = 'about-you' | 'screening' | 'results';

export const SECTION_ORDER: OnboardingSection[] = ['about-you', 'screening', 'results'];

export const SECTION_LABEL: Record<OnboardingSection, string> = {
  'about-you': 'About you',
  screening: 'The screening',
  results: 'Your results',
};

const SECTION_STEPS: Record<OnboardingSection, OnboardingStepId[]> = {
  'about-you': [
    'age',
    'motivation',
    'context-years',
    'context-frequency',
    'context-escalation',
    'insight-escalation',
    'context-quits',
    'insight-quits',
  ],
  screening: ['disclaimer', 'ppcs6', 'mood'],
  results: ['results', 'personalization', 'notifications', 'account', 'paywall'],
};

export interface SectionProgress {
  section: OnboardingSection;
  fill: number;
}

export function sectionForStep(step: OnboardingStepId): OnboardingSection | undefined {
  return SECTION_ORDER.find((section) => SECTION_STEPS[section].includes(step));
}

export function sectionProgressFor(step: OnboardingStepId): SectionProgress | undefined {
  const section = sectionForStep(step);
  if (!section) return undefined;

  const steps = SECTION_STEPS[section];
  const fill = (steps.indexOf(step) + 1) / steps.length;
  return { section, fill };
}
