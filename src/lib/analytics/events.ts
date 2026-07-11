import { getAnalyticsClient } from '@/lib/analytics/posthog';

// Event names and payload shapes exactly as named in PRODUCT_SPEC §8 — no PII,
// journal/free-text content never included.
export function trackOnboardingStepCompleted(step: string) {
  getAnalyticsClient()?.capture('onboarding_step_completed', { step });
}

export function trackAssessmentCompleted(score: number, band: string) {
  getAnalyticsClient()?.capture('assessment_completed', { score, band });
}

// Logged as event class only — no free text — per CLINICAL_SPEC §6.
export function trackCrisisLanguageDetected() {
  getAnalyticsClient()?.capture('crisis_language_detected');
}

export function trackIllegalContentDisclosed() {
  getAnalyticsClient()?.capture('illegal_content_disclosed');
}
