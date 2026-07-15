import { router, type Href } from 'expo-router';

import { trackOnboardingStepCompleted } from '@/lib/analytics/events';
import { useOnboardingStore, type OnboardingStepId } from '@/features/assessment/useOnboardingStore';

const ROUTE_FOR_STEP: Record<OnboardingStepId, Href> = {
  welcome: '/(onboarding)/welcome' as Href,
  age: '/(onboarding)/age' as Href,
  motivation: '/(onboarding)/motivation' as Href,
  'context-years': '/(onboarding)/context-years' as Href,
  'context-frequency': '/(onboarding)/context-frequency' as Href,
  'context-escalation': '/(onboarding)/context-escalation' as Href,
  'insight-escalation': '/(onboarding)/insight-escalation' as Href,
  'context-quits': '/(onboarding)/context-quits' as Href,
  'insight-quits': '/(onboarding)/insight-quits' as Href,
  disclaimer: '/(onboarding)/disclaimer' as Href,
  ppcs6: '/(onboarding)/ppcs6' as Href,
  mood: '/(onboarding)/mood' as Href,
  results: '/(onboarding)/results' as Href,
  personalization: '/(onboarding)/personalization' as Href,
  notifications: '/(onboarding)/notifications' as Href,
  account: '/(onboarding)/account' as Href,
  paywall: '/(onboarding)/paywall' as Href,
};

export function routeForStep(step: OnboardingStepId): Href {
  return ROUTE_FOR_STEP[step];
}

// Advances the store past `completedStep`, fires the analytics event for it,
// and navigates to whatever step comes next.
export function goNextFrom(completedStep: OnboardingStepId) {
  trackOnboardingStepCompleted(completedStep);
  useOnboardingStore.getState().advance();
  const next = useOnboardingStore.getState().currentStep;
  router.push(routeForStep(next));
}
