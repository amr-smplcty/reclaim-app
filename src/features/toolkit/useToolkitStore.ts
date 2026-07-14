import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { ToolId } from '@/features/toolkit/entitlement';

export type Trigger = 'stress' | 'boredom' | 'loneliness' | 'late_night' | 'saw_trigger' | 'other';

export interface UrgeLogEntry {
  id: string;
  timestamp: string;
  intensity: number;
  trigger: Trigger;
  location: string;
  whatHappenedNext: string;
}

export interface ToolUseEntry {
  id: string;
  timestamp: string;
  tool: ToolId;
  preIntensity: number;
  postIntensity: number;
  delta: number;
}

export type LapseFailureMode = 'tool_not_used' | 'used_but_overwhelmed' | 'didnt_want_to_stop';

export interface LapseDebriefAnswers {
  beforeChips: Trigger[];
  beforeFreeText: string;
  feelingChips: string[];
  whatFailed: LapseFailureMode;
  changeNextTime: string;
}

export interface LapseDebriefEntry {
  id: string;
  timestamp: string;
  answers: LapseDebriefAnswers;
}

interface ActiveSession {
  preIntensity: number;
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

interface ToolkitState {
  activeSession: ActiveSession | null;
  urgeLogs: UrgeLogEntry[];
  toolUses: ToolUseEntry[];
  lapseDebriefs: LapseDebriefEntry[];
  relapsePreventionNotes: string[];
  shiftList: string[];

  startSession: (preIntensity: number) => void;
  clearSession: () => void;
  logUrge: (entry: Omit<UrgeLogEntry, 'id' | 'timestamp'>) => void;
  logToolUse: (tool: ToolId, preIntensity: number, postIntensity: number) => ToolUseEntry;
  logLapseDebrief: (answers: LapseDebriefAnswers) => void;
  setShiftList: (items: string[]) => void;
  reset: () => void;
}

export const useToolkitStore = create<ToolkitState>()(
  persist(
    (set, get) => ({
      activeSession: null,
      urgeLogs: [],
      toolUses: [],
      lapseDebriefs: [],
      relapsePreventionNotes: [],
      shiftList: [],

      startSession: (preIntensity) => set({ activeSession: { preIntensity } }),
      clearSession: () => set({ activeSession: null }),

      logUrge: (entry) => {
        const newEntry: UrgeLogEntry = { ...entry, id: generateId(), timestamp: new Date().toISOString() };
        set((state) => ({ urgeLogs: [...state.urgeLogs, newEntry] }));
      },

      logToolUse: (tool, preIntensity, postIntensity) => {
        const newEntry: ToolUseEntry = {
          id: generateId(),
          timestamp: new Date().toISOString(),
          tool,
          preIntensity,
          postIntensity,
          delta: postIntensity - preIntensity,
        };
        set((state) => ({ toolUses: [...state.toolUses, newEntry] }));
        return newEntry;
      },

      // A lapse only ever appends data (the debrief, a relapse-prevention
      // note) — nothing here resets completion state or any streak
      // (CLINICAL_SPEC §5.4: no streak-reset punishment mechanics).
      logLapseDebrief: (answers) => {
        const newEntry: LapseDebriefEntry = { id: generateId(), timestamp: new Date().toISOString(), answers };
        set((state) => ({
          lapseDebriefs: [...state.lapseDebriefs, newEntry],
          relapsePreventionNotes: answers.changeNextTime
            ? [...state.relapsePreventionNotes, answers.changeNextTime]
            : state.relapsePreventionNotes,
        }));
      },

      setShiftList: (items) => set({ shiftList: items }),

      reset: () =>
        set({
          activeSession: null,
          urgeLogs: [],
          toolUses: [],
          lapseDebriefs: [],
          relapsePreventionNotes: [],
          shiftList: [],
        }),
    }),
    {
      name: 'toolkit-store',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
