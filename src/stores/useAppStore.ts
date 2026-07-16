import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface AppState {
  hasOnboarded: boolean;
  setHasOnboarded: (value: boolean) => void;
  reset: () => void;
}

// Persisted (not just in-memory): app/index.tsx's resume-on-relaunch redirect
// relies on this surviving a cold relaunch — otherwise every restart would
// look like onboarding was never completed and re-route into it.
export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      hasOnboarded: false,
      setHasOnboarded: (value) => set({ hasOnboarded: value }),
      reset: () => set({ hasOnboarded: false }),
    }),
    {
      name: 'app-store',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
