import contentPack from '../../../content/program.json';
import ppcs6 from '../../../content/assessments/ppcs6.json';
import onboardingInsights from '../../../content/onboarding_insights.json';
import crisisPatterns from '../../../safety/crisis_patterns.json';

import type { SafetyPatterns } from '@/lib/safety/detect';
import type { ContentPack, IntakeContent, OnboardingInsightsContent, Ppcs6Assessment } from '@/types/content';

// v1 loads the bundled JSON pack directly; hot-updating from Supabase without an
// app release (CLINICAL_SPEC §8) is wired up once the program engine (Epic 4) exists.
export function getContentPack(): ContentPack {
  return contentPack as unknown as ContentPack;
}

export function getPpcs6Assessment(): Ppcs6Assessment {
  return ppcs6 as unknown as Ppcs6Assessment;
}

export function getIntakeContent(): IntakeContent {
  return contentPack.intake as unknown as IntakeContent;
}

export function getCrisisPatterns(): SafetyPatterns {
  return crisisPatterns as unknown as SafetyPatterns;
}

export function getOnboardingInsights(): OnboardingInsightsContent {
  return onboardingInsights as unknown as OnboardingInsightsContent;
}
