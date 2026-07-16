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
  // Set once, the moment Week 6 Day 7's letter_write (completes_program: true)
  // is submitted — the program's single source of truth for "has this user
  // graduated" (CLINICAL_SPEC §4 maintenance mode). Never cleared by
  // anything except reset().
  programCompletedAt: string | null;
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
  completeProgram: () => void;
  reset: () => void;
}

function updateCompletion(
  completions: Record<string, DayCompletion>,
  position: ProgramPosition,
  patch: Partial<DayCompletion>
) {
  const key = dayKey(position);
  const current = completions[key] ?? emptyCompletion;
  return { ...completions, [key]: { ...current, ...patch, lastActivityAt: new Date().toISOString() } };
}

export const useProgramStore = create<ProgramState>()(
  persist(
    (set, get) => ({
      position: { week: 1, day: 1 },
      completions: {},
      exerciseOutputs: {},
      reflections: {},
      commitmentFollowups: {},
      programCompletedAt: null,

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

      // Idempotent — only the first call stamps a timestamp, so re-saving
      // Week 6 Day 7 (e.g. a refresher redo, or any future re-run) can never
      // push the graduation date forward.
      completeProgram: () => {
        set((state) => (state.programCompletedAt ? state : { programCompletedAt: new Date().toISOString() }));
      },

      reset: () =>
        set({
          position: { week: 1, day: 1 },
          completions: {},
          exerciseOutputs: {},
          reflections: {},
          commitmentFollowups: {},
          programCompletedAt: null,
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
