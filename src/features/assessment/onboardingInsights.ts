import { getOnboardingInsights } from '@/lib/content';
import type { OnboardingAnswers, OnboardingStepId } from '@/features/assessment/useOnboardingStore';
import type { OnboardingInsight, OnboardingInsightTrigger } from '@/types/content';

// Maps a step in the onboarding machine to the content-JSON insight it shows.
// Copy always comes from content/onboarding_insights.json — never invented here.
const STEP_TO_INSIGHT_ID: Partial<Record<OnboardingStepId, string>> = {
  'insight-escalation': 'escalation-tolerance',
  'insight-quits': 'repeated-quit-attempts',
};

export function insightForStep(step: OnboardingStepId): OnboardingInsight | undefined {
  const insightId = STEP_TO_INSIGHT_ID[step];
  if (!insightId) return undefined;
  return getOnboardingInsights().insights.find((insight) => insight.id === insightId);
}

function matchesTrigger(trigger: OnboardingInsightTrigger, answers: OnboardingAnswers): boolean {
  const value = answers[trigger.field];
  if (trigger.equals !== undefined) return value === trigger.equals;
  if (trigger.in !== undefined) return typeof value === 'string' && trigger.in.includes(value);
  return false;
}

// Whether an insight step should actually be shown for these answers — the
// step machine skips it entirely otherwise (PRODUCT_SPEC §4: interstitials
// react to real answers, so a screen with nothing to react to is skipped).
export function shouldShowInsight(step: OnboardingStepId, answers: OnboardingAnswers): boolean {
  const insight = insightForStep(step);
  if (!insight) return false;
  return matchesTrigger(insight.trigger, answers);
}
