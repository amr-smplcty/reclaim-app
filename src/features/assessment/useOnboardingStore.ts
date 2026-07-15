import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { shouldShowInsight } from '@/features/assessment/onboardingInsights';

// Step order mirrors PRODUCT_SPEC §4 steps 1-12 (paywall placeholder until Epic 3).
// "disclaimer" is the wellness-disclaimer interstitial added ahead of the
// assessment per LEGAL_COMPLIANCE §3/§6.
export type OnboardingStepId =
  | 'welcome'
  | 'age'
  | 'motivation'
  | 'context-years'
  | 'context-frequency'
  | 'context-escalation'
  | 'insight-escalation'
  | 'context-quits'
  | 'insight-quits'
  | 'disclaimer'
  | 'ppcs6'
  | 'mood'
  | 'results'
  | 'personalization'
  | 'notifications'
  | 'account'
  | 'paywall';

// "insight-escalation"/"insight-quits" are insight interstitials (PRODUCT_SPEC
// §4 value arc) — present in the step order but skipped at advance()-time
// when their content-JSON trigger doesn't match the user's answers.
export const ONBOARDING_STEPS: OnboardingStepId[] = [
  'welcome',
  'age',
  'motivation',
  'context-years',
  'context-frequency',
  'context-escalation',
  'insight-escalation',
  'context-quits',
  'insight-quits',
  'disclaimer',
  'ppcs6',
  'mood',
  'results',
  'personalization',
  'notifications',
  'account',
  'paywall',
];

export type MotivationTag =
  | 'relationships'
  | 'focus_energy'
  | 'values_self_respect'
  | 'sexual_function'
  | 'time_lost'
  | 'other';

export type EscalationAnswer = 'yes' | 'no' | 'unsure';

export interface OnboardingAnswers {
  dobIso: string | null;
  motivations: MotivationTag[];
  motivationOther: string;
  yearsOfUse: string | null;
  frequencyNow: string | null;
  escalation: EscalationAnswer | null;
  priorQuitAttempts: string | null;
  ppcs6Responses: Array<number | null>;
  ppcs6ItemIndex: number;
  phq2Responses: Array<number | null>;
  gad2Responses: Array<number | null>;
  notificationsRequested: boolean;
  legalAcceptedAt: string | null;
}

const defaultAnswers: OnboardingAnswers = {
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

interface OnboardingState {
  currentStep: OnboardingStepId;
  answers: OnboardingAnswers;
  isMinor: boolean;
  goToStep: (step: OnboardingStepId) => void;
  advance: () => void;
  updateAnswers: (partial: Partial<OnboardingAnswers>) => void;
  setIsMinor: (value: boolean) => void;
  clearMotivationOther: () => void;
  reset: () => void;
}

export function nextStepOf(current: OnboardingStepId): OnboardingStepId {
  const idx = ONBOARDING_STEPS.indexOf(current);
  return ONBOARDING_STEPS[Math.min(idx + 1, ONBOARDING_STEPS.length - 1)];
}

const INSIGHT_STEPS: OnboardingStepId[] = ['insight-escalation', 'insight-quits'];

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      currentStep: 'welcome',
      answers: defaultAnswers,
      isMinor: false,
      goToStep: (step) => set({ currentStep: step }),
      advance: () =>
        set((state) => {
          let next = nextStepOf(state.currentStep);
          while (INSIGHT_STEPS.includes(next) && !shouldShowInsight(next, state.answers)) {
            next = nextStepOf(next);
          }
          return { currentStep: next };
        }),
      updateAnswers: (partial) => set((state) => ({ answers: { ...state.answers, ...partial } })),
      setIsMinor: (value) => set({ isMinor: value }),
      // Illegal-content/crisis disclosures are never persisted past the safety check (CLINICAL_SPEC §6).
      clearMotivationOther: () => set((state) => ({ answers: { ...state.answers, motivationOther: '' } })),
      reset: () => set({ currentStep: 'welcome', answers: defaultAnswers, isMinor: false }),
    }),
    {
      name: 'onboarding-store',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
