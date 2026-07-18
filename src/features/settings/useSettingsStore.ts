import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { MaintenancePlanOutput } from '@/types/program';

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
  // Week 6 Day 6's maintenance_setup (CLINICAL_SPEC §4) — check-in cadence,
  // 14-day re-assessment reminder opt-in, weekly booster opt-in. Null until
  // the user actually graduates and completes that exercise. Lives here
  // alongside the notification preferences above for the same future
  // notifications epic (BACKLOG #35) to read both from one place.
  maintenancePlan: MaintenancePlanOutput | null;
  // PRODUCT_SPEC §7 risky-window reminder — a gentle opt-in offer, not a
  // default-on notification. `offerDecided` flips true the first time the
  // user answers the offer (either way) so the banner never nags again.
  riskyWindowReminderEnabled: boolean;
  riskyWindowOfferDecided: boolean;
  setDailyLessonTime: (time: TimeOfDay) => void;
  setEveningCheckinTime: (time: TimeOfDay) => void;
  setAppLockEnabled: (value: boolean) => void;
  setMaintenancePlan: (plan: MaintenancePlanOutput) => void;
  decideRiskyWindowReminder: (enabled: boolean) => void;
  reset: () => void;
}

const initialState = {
  dailyLessonTime: { hour: 8, minute: 0 },
  eveningCheckinTime: { hour: 21, minute: 30 },
  appLockEnabled: false,
  maintenancePlan: null as MaintenancePlanOutput | null,
  riskyWindowReminderEnabled: false,
  riskyWindowOfferDecided: false,
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...initialState,
      setDailyLessonTime: (time) => set({ dailyLessonTime: time }),
      setEveningCheckinTime: (time) => set({ eveningCheckinTime: time }),
      setAppLockEnabled: (value) => set({ appLockEnabled: value }),
      setMaintenancePlan: (plan) => set({ maintenancePlan: plan }),
      decideRiskyWindowReminder: (enabled) =>
        set({ riskyWindowReminderEnabled: enabled, riskyWindowOfferDecided: true }),
      reset: () => set(initialState),
    }),
    {
      name: 'settings-store',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
