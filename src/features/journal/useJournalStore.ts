import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { createEncryptedAsyncStorage } from '@/lib/storage/encryptedStorage';
import { useProgramStore } from '@/features/program/useProgramStore';

export interface CheckinEntry {
  id: string;
  type: 'checkin';
  timestamp: string;
  week: number;
  day: number;
  mood: number; // 1-5
  urgesToday: boolean;
  urgeCount: number;
  promptText: string;
  promptResponse: string;
  // Week 4 Day 3's checkin_integration — keyed by CommittedAction.id, only
  // present (and only for today's scheduled actions) while Week 4 is
  // active. Optional and shame-free: an unanswered action is just absent,
  // never recorded as a "no."
  committedActionStatus?: Record<string, boolean>;
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

interface JournalState {
  checkins: CheckinEntry[];
  hasMigratedLegacyCheckins: boolean;
  addCheckin: (entry: Omit<CheckinEntry, 'id' | 'timestamp' | 'type'>) => CheckinEntry;
  migrateLegacyCheckins: () => void;
  reset: () => void;
}

export const useJournalStore = create<JournalState>()(
  persist(
    (set, get) => ({
      checkins: [],
      hasMigratedLegacyCheckins: false,

      addCheckin: (entry) => {
        const newEntry: CheckinEntry = {
          ...entry,
          id: generateId(),
          type: 'checkin',
          timestamp: new Date().toISOString(),
        };
        set((state) => ({ checkins: [...state.checkins, newEntry] }));
        return newEntry;
      },

      // One-time migration of the pre-Epic-6 lightweight check-in
      // (useProgramStore's old checkinResponses, a plain dayKey -> text map,
      // BACKLOG #11) into full CheckinEntry records. Fields the old model
      // never captured (mood, urgesToday/urgeCount) get an honest neutral
      // default rather than a fabricated one. Guarded by
      // hasMigratedLegacyCheckins so it only ever runs once, however many
      // times it's called.
      migrateLegacyCheckins: () => {
        if (get().hasMigratedLegacyCheckins) return;

        const legacy = (useProgramStore.getState() as unknown as { checkinResponses?: Record<string, string> })
          .checkinResponses;

        if (legacy) {
          Object.entries(legacy).forEach(([key, responseText]) => {
            const [weekStr, dayStr] = key.split('-');
            get().addCheckin({
              week: Number(weekStr),
              day: Number(dayStr),
              mood: 3,
              urgesToday: false,
              urgeCount: 0,
              promptText: 'Migrated from an earlier check-in',
              promptResponse: responseText,
            });
          });
        }

        set({ hasMigratedLegacyCheckins: true });
      },

      reset: () => set({ checkins: [], hasMigratedLegacyCheckins: false }),
    }),
    {
      name: 'journal-store',
      storage: createJSONStorage(() => createEncryptedAsyncStorage()),
    }
  )
);
