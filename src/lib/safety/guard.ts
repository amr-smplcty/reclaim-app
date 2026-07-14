import { router } from 'expo-router';

import { detectSafetySignal } from '@/lib/safety/detect';
import { getCrisisPatterns } from '@/lib/content';
import { trackCrisisLanguageDetected, trackIllegalContentDisclosed } from '@/lib/analytics/events';

// Shared crisis/illegal-content screen (CLINICAL_SPEC §6) for the program
// engine's free-text surfaces (lesson reflections, exercise write-ins, evening
// check-in) — same detector Epic 2 wired into onboarding's motivation screen.
// Returns true if the text was safe to save; false if it triggered the
// safety-resources interrupt (caller should not persist the text).
export function guardFreeText(text: string): boolean {
  if (!text.trim()) return true;

  const signal = detectSafetySignal(text, getCrisisPatterns());
  if (!signal) return true;

  if (signal === 'crisis') trackCrisisLanguageDetected();
  else trackIllegalContentDisclosed();

  router.push({ pathname: '/(modals)/safety-resources', params: { type: signal } });
  return false;
}

// Checks several free-text fields at once (e.g. a rated inventory's per-area
// notes) — stops and interrupts at the first flagged one.
export function guardAllFreeText(texts: string[]): boolean {
  return texts.every((text) => guardFreeText(text));
}
