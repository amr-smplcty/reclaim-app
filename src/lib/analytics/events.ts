import { getAnalyticsClient } from '@/lib/analytics/posthog';

// Event names and payload shapes exactly as named in PRODUCT_SPEC §8 — no PII,
// journal/free-text content never included.
export function trackOnboardingStepCompleted(step: string) {
  getAnalyticsClient()?.capture('onboarding_step_completed', { step });
}

export function trackAssessmentCompleted(score: number, band: string) {
  getAnalyticsClient()?.capture('assessment_completed', { score, band });
}

export function trackPaywallViewed() {
  getAnalyticsClient()?.capture('paywall_viewed');
}

export function trackTrialStarted() {
  getAnalyticsClient()?.capture('trial_started');
}

export function trackSubscriptionStarted(plan: 'annual' | 'monthly') {
  getAnalyticsClient()?.capture('subscription_started', { plan });
}

export function trackReassessmentCompleted(score: number, delta: number | null) {
  getAnalyticsClient()?.capture('reassessment_completed', { score, delta });
}

// Logged as event class only — no free text — per CLINICAL_SPEC §6.
export function trackCrisisLanguageDetected() {
  getAnalyticsClient()?.capture('crisis_language_detected');
}

export function trackIllegalContentDisclosed() {
  getAnalyticsClient()?.capture('illegal_content_disclosed');
}

export function trackUrgeToolUsed(tool: string, preIntensity: number, postDelta: number) {
  getAnalyticsClient()?.capture('urge_tool_used', { tool, pre_intensity: preIntensity, post_delta: postDelta });
}

export function trackUrgeLogged(trigger: string, intensity: number) {
  getAnalyticsClient()?.capture('urge_logged', { trigger, intensity });
}

export function trackLapseLogged() {
  getAnalyticsClient()?.capture('lapse_logged');
}

// No journal free-text in the payload — mood/urge counts only (PRODUCT_SPEC §8).
export function trackCheckinCompleted() {
  getAnalyticsClient()?.capture('checkin_completed');
}
