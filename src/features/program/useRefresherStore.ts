import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type RefresherOfferDecision = 'accepted' | 'declined';

interface RefresherState {
  // Keyed by the AssessmentEntry.id whose >=6-point rise triggered the
  // offer (CLINICAL_SPEC §4) — a decline is permanent for THAT trigger
  // ("declining is respected without nagging"), but a later, separate
  // qualifying rise carries a different entry id and can offer again.
  offerDecisions: Record<string, RefresherOfferDecision>;
  // Keyed by the reviewed day's lesson.id — independent of the main
  // program's position/completions, which must never be touched by a
  // refresher redo (it's a maintenance-mode add-on, not a program replay).
  completedLessonIds: Record<string, boolean>;
  recordOfferDecision: (entryId: string, decision: RefresherOfferDecision) => void;
  markDayReviewed: (lessonId: string) => void;
  reset: () => void;
}

export const useRefresherStore = create<RefresherState>()(
  persist(
    (set) => ({
      offerDecisions: {},
      completedLessonIds: {},

      recordOfferDecision: (entryId, decision) => {
        set((state) => ({ offerDecisions: { ...state.offerDecisions, [entryId]: decision } }));
      },

      markDayReviewed: (lessonId) => {
        set((state) => ({ completedLessonIds: { ...state.completedLessonIds, [lessonId]: true } }));
      },

      reset: () => set({ offerDecisions: {}, completedLessonIds: {} }),
    }),
    {
      name: 'refresher-store',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
