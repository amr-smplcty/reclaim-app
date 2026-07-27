import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

// Render-once state for the journey experience layer (PRODUCT_SPEC §5.7):
// the 4-screen beginning sequence (once, after first paywall continuation)
// and each week's kickoff interstitial (once, weeks 2–6). Persisted so a
// relaunch never re-shows a ceremony the user has already seen.
interface JourneyState {
  beginningSequenceSeen: boolean;
  weeklyIntrosSeen: Record<number, boolean>;
  markBeginningSequenceSeen: () => void;
  markWeeklyIntroSeen: (week: number) => void;
  reset: () => void;
}

const initialState = {
  beginningSequenceSeen: false,
  weeklyIntrosSeen: {} as Record<number, boolean>,
};

export const useJourneyStore = create<JourneyState>()(
  persist(
    (set) => ({
      ...initialState,
      markBeginningSequenceSeen: () => set({ beginningSequenceSeen: true }),
      markWeeklyIntroSeen: (week) =>
        set((state) => ({ weeklyIntrosSeen: { ...state.weeklyIntrosSeen, [week]: true } })),
      reset: () => set({ beginningSequenceSeen: false, weeklyIntrosSeen: {} }),
    }),
    {
      name: 'journey-store',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
