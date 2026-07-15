import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { createEncryptedAsyncStorage } from '@/lib/storage/encryptedStorage';
import { getPpcs6Assessment } from '@/lib/content';
import { getPpcs6Band, scorePpcs6, type Ppcs6Band } from '@/features/assessment/scoring';

export type AssessmentTimeframe = 'past_6_months' | 'past_2_weeks';

export interface AssessmentEntry {
  id: string;
  timestamp: string;
  score: number;
  band: Ppcs6Band;
  timeframe: AssessmentTimeframe;
  responses: number[];
  // PPCS-6 content-pack version at the moment this was recorded (ppcs6.json's
  // content_version) — so a future wording/scoring change can never make an
  // old score ambiguous about which instrument produced it.
  instrumentVersion: string;
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

interface AssessmentHistoryState {
  entries: AssessmentEntry[];
  recordAssessment: (responses: number[], timeframe: AssessmentTimeframe) => AssessmentEntry;
  reset: () => void;
}

// Assessment history is append-only, never overwritten (CLINICAL_SPEC §2.2 —
// every PPCS-6 administration, onboarding's 6-month one and every 14-day
// 2-week re-take, becomes a permanent trend point). This is the persistence
// gap INC-8 exposed: onboarding's score used to live only in
// useOnboardingStore.answers, which paywall completion resets to null.
// Encrypted at rest (Epic 6b's journal encryption scope) — clinical scores
// and per-item responses are at least as sensitive as journal free-text.
export const useAssessmentHistoryStore = create<AssessmentHistoryState>()(
  persist(
    (set) => ({
      entries: [],

      recordAssessment: (responses, timeframe) => {
        const score = scorePpcs6(responses);
        const { band } = getPpcs6Band(score);
        const entry: AssessmentEntry = {
          id: generateId(),
          timestamp: new Date().toISOString(),
          score,
          band,
          timeframe,
          responses,
          instrumentVersion: getPpcs6Assessment().content_version,
        };
        set((state) => ({ entries: [...state.entries, entry] }));
        return entry;
      },

      reset: () => set({ entries: [] }),
    }),
    {
      name: 'assessment-history-store',
      storage: createJSONStorage(() => createEncryptedAsyncStorage()),
    }
  )
);
