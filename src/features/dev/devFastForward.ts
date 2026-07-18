import { getProgramModules } from '@/lib/content/week';
import { findProgramDay } from '@/features/program/progression';
import { useProgramStore } from '@/features/program/useProgramStore';

// QA-only speed-run through the 6-week program — same unreachable-outside-
// dev pattern as continueWithoutAccountDev (src/lib/supabase/auth.ts).
// Marks the current day's lesson + exercise + evening check-in complete with
// a placeholder exercise output, so a founder can walk all 42 days without
// authoring real answers for every exercise. Downstream screens that read a
// specific exercise's shape (Emergency Card, profile builders, etc.) may
// render placeholder/blank sections for a fast-forwarded day — acceptable
// for a QA speed-run, not a shipped path (see BACKLOG for the pre-TestFlight
// unreachability re-check, same as the account bypass).
export function fastForwardCurrentDay(): void {
  if (!__DEV__) {
    throw new Error('fastForwardCurrentDay is not available outside development builds');
  }

  const { position, completeLesson, completeExercise, completeCheckin, saveExerciseOutput, completeProgram } =
    useProgramStore.getState();

  const day = findProgramDay(getProgramModules(), position);
  if (day) {
    const payload = day.exercise.payload as Record<string, unknown> & { save_to?: string; completes_program?: boolean };
    if (payload.save_to) {
      saveExerciseOutput(payload.save_to, { fastForwarded: true, note: '[dev fast-forward placeholder]' });
    }
    if (payload.completes_program) {
      completeProgram();
    }
  }

  completeLesson(position.week, position.day);
  completeExercise(position.week, position.day);
  completeCheckin(position.week, position.day);
}
