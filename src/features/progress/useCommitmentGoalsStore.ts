import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import {
  applyLapse,
  createGoal,
  promoteIfComplete,
  recordDayCredit,
  stepDown,
  type CommitmentGoalState,
  type DayCreditInput,
} from '@/features/progress/commitmentGoals';

interface CommitmentGoalsState {
  optedIn: boolean;
  rewardName: string;
  dailyPledgeAmount: number;
  goal: CommitmentGoalState | null;
  // Guards recordDailyCredit against being credited twice for the same
  // calendar day (lesson/check-in completion can each trigger a call).
  lastCreditedDateKey: string | null;

  optIn: (rewardName: string, dailyPledgeAmount: number) => void;
  recordDailyCredit: (day: DayCreditInput, dateKey: string) => void;
  applyLapseToGoal: () => void;
  stepDownGoal: () => void;
  reset: () => void;
}

const initialState = {
  optedIn: false,
  rewardName: '',
  dailyPledgeAmount: 0,
  goal: null,
  lastCreditedDateKey: null,
};

// Commitment Goals (CLINICAL_SPEC §9) — thin persistence wrapper around the
// pure commitmentGoals.ts state machine. Opt-in only; nothing here ever
// auto-creates a goal.
export const useCommitmentGoalsStore = create<CommitmentGoalsState>()(
  persist(
    (set, get) => ({
      ...initialState,

      optIn: (rewardName, dailyPledgeAmount) => {
        set({
          optedIn: true,
          rewardName,
          dailyPledgeAmount,
          goal: createGoal(new Date().toISOString()),
        });
      },

      recordDailyCredit: (day, dateKey) => {
        const state = get();
        if (!state.goal || state.lastCreditedDateKey === dateKey) return;

        const credited = recordDayCredit(state.goal, day, state.dailyPledgeAmount);
        const promoted = promoteIfComplete(credited, new Date().toISOString());
        set({ goal: promoted, lastCreditedDateKey: dateKey });
      },

      applyLapseToGoal: () => {
        const { goal } = get();
        if (!goal) return;
        set({ goal: applyLapse(goal) });
      },

      stepDownGoal: () => {
        const { goal } = get();
        if (!goal) return;
        set({ goal: stepDown(goal) });
      },

      reset: () => set(initialState),
    }),
    {
      name: 'commitment-goals-store',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
