import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export interface TimeOfDay {
  hour: number;
  minute: number;
}

interface SettingsState {
  // Stored ahead of the scheduling engine itself (PRODUCT_SPEC §7 local/push
  // notifications is Epic 9 follow-on work, BACKLOG #35) — these are the
  // user's chosen times, not yet wired to any actual reminder.
  dailyLessonTime: TimeOfDay;
  eveningCheckinTime: TimeOfDay;
  appLockEnabled: boolean;
  setDailyLessonTime: (time: TimeOfDay) => void;
  setEveningCheckinTime: (time: TimeOfDay) => void;
  setAppLockEnabled: (value: boolean) => void;
  reset: () => void;
}

const initialState = {
  dailyLessonTime: { hour: 8, minute: 0 },
  eveningCheckinTime: { hour: 21, minute: 30 },
  appLockEnabled: false,
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...initialState,
      setDailyLessonTime: (time) => set({ dailyLessonTime: time }),
      setEveningCheckinTime: (time) => set({ eveningCheckinTime: time }),
      setAppLockEnabled: (value) => set({ appLockEnabled: value }),
      reset: () => set(initialState),
    }),
    {
      name: 'settings-store',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
