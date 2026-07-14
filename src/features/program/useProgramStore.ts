import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { dayKey, isDayComplete, nextPosition, type DayCompletion, type ProgramPosition } from '@/features/program/progression';
import type { CommitmentFollowupAnswer, LessonReflectionRecord } from '@/types/program';

const emptyCompletion: DayCompletion = {
  lessonComplete: false,
  exerciseComplete: false,
  checkinComplete: false,
};

interface ProgramState {
  position: ProgramPosition;
  completions: Record<string, DayCompletion>;
  exerciseOutputs: Record<string, unknown>;
  reflections: Record<string, LessonReflectionRecord>;
  completeLesson: (week: number, day: number) => void;
  completeExercise: (week: number, day: number) => void;
  // Evening check-in *content* (mood, urges, prompt response) now lives in
  // useJournalStore (Epic 6) — this just flips the day's completion flag.
  completeCheckin: (week: number, day: number) => void;
  saveExerciseOutput: (key: string, value: unknown) => void;
  getExerciseOutput: <T = unknown>(key: string) => T | undefined;
  saveReflection: (lessonId: string, record: Omit<LessonReflectionRecord, 'timestamp'>) => void;
  commitmentFollowups: Record<string, CommitmentFollowupAnswer>;
  recordCommitmentFollowup: (dayKey: string, answer: CommitmentFollowupAnswer) => void;
  reset: () => void;
}

function updateCompletion(
  completions: Record<string, DayCompletion>,
  position: ProgramPosition,
  patch: Partial<DayCompletion>
) {
  const key = dayKey(position);
  const current = completions[key] ?? emptyCompletion;
  return { ...completions, [key]: { ...current, ...patch } };
}

export const useProgramStore = create<ProgramState>()(
  persist(
    (set, get) => ({
      position: { week: 1, day: 1 },
      completions: {},
      exerciseOutputs: {},
      reflections: {},
      commitmentFollowups: {},

      completeLesson: (week, day) => {
        set((state) => {
          const completions = updateCompletion(state.completions, { week, day }, { lessonComplete: true });
          return { completions };
        });
        advanceIfDayComplete(get, set, { week, day });
      },

      completeExercise: (week, day) => {
        set((state) => {
          const completions = updateCompletion(state.completions, { week, day }, { exerciseComplete: true });
          return { completions };
        });
        advanceIfDayComplete(get, set, { week, day });
      },

      completeCheckin: (week, day) => {
        set((state) => ({
          completions: updateCompletion(state.completions, { week, day }, { checkinComplete: true }),
        }));
      },

      saveExerciseOutput: (key, value) => {
        set((state) => ({ exerciseOutputs: { ...state.exerciseOutputs, [key]: value } }));
      },

      getExerciseOutput: <T,>(key: string) => get().exerciseOutputs[key] as T | undefined,

      saveReflection: (lessonId, record) => {
        const stamped: LessonReflectionRecord = { ...record, timestamp: new Date().toISOString() };
        set((state) => ({ reflections: { ...state.reflections, [lessonId]: stamped } }));
      },

      recordCommitmentFollowup: (key, answer) => {
        set((state) => ({ commitmentFollowups: { ...state.commitmentFollowups, [key]: answer } }));
      },

      reset: () =>
        set({
          position: { week: 1, day: 1 },
          completions: {},
          exerciseOutputs: {},
          reflections: {},
          commitmentFollowups: {},
        }),
    }),
    {
      name: 'program-store',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

// Advances position only when the just-updated day's lesson AND exercise are
// both complete — the program's only source of movement (no calendar/date logic).
function advanceIfDayComplete(
  get: () => ProgramState,
  set: (partial: Partial<ProgramState>) => void,
  position: ProgramPosition
) {
  const completion = get().completions[dayKey(position)] ?? emptyCompletion;
  if (isDayComplete(completion) && dayKey(get().position) === dayKey(position)) {
    set({ position: nextPosition(position) });
  }
}
