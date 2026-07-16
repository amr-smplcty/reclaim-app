import { getProgramModules } from '@/lib/content/week';
import { useProgramStore } from '@/features/program/useProgramStore';
import { dayKey } from '@/features/program/progression';
import type { LetterWritePayload } from '@/types/program';

// End-to-end proof that the real 6-week program (content/week1.json through
// week6.json) is traversable day-by-day with no gaps or dead ends, using
// only the generic completion-based progression machinery (no content-
// specific logic anywhere in useProgramStore/progression.ts) — and that
// completing the final day is the one that's flagged to end the program
// (CLINICAL_SPEC §4).
describe('Six-week progression to completion — real content, generic engine', () => {
  afterEach(() => {
    useProgramStore.getState().reset();
  });

  it('has exactly 6 modules of 7 days each (42 authored days total)', () => {
    const modules = getProgramModules();
    expect(modules).toHaveLength(6);
    modules.forEach((m, i) => {
      expect(m.week).toBe(i + 1);
      expect(m.days).toHaveLength(7);
    });
  });

  it('walks all 42 real days lesson-by-lesson, exercise-by-exercise, landing on Week 7 Day 1 with no gaps', () => {
    const modules = getProgramModules();

    for (const module of modules) {
      for (const day of module.days) {
        const before = useProgramStore.getState().position;
        expect(before).toEqual({ week: module.week, day: day.day });

        useProgramStore.getState().completeLesson(module.week, day.day);
        useProgramStore.getState().completeExercise(module.week, day.day);

        expect(useProgramStore.getState().completions[dayKey({ week: module.week, day: day.day })]).toMatchObject({
          lessonComplete: true,
          exerciseComplete: true,
        });
      }
    }

    // Every one of the 42 real days rolled forward correctly; position now
    // sits one day past the last authored content (Week 7 Day 1 — Today's
    // "more content coming soon" territory, except maintenance mode
    // intercepts it once programCompletedAt is set, tested separately).
    expect(useProgramStore.getState().position).toEqual({ week: 7, day: 1 });
  });

  it("Week 6 Day 7's real exercise payload is the one flagged completes_program — and completing the program stamps a timestamp", () => {
    const week6 = getProgramModules().find((m) => m.week === 6)!;
    const day7 = week6.days.find((d) => d.day === 7)!;
    const payload = day7.exercise.payload as unknown as LetterWritePayload;

    expect(payload.kind).toBe('letter_write');
    expect(payload.completes_program).toBe(true);

    expect(useProgramStore.getState().programCompletedAt).toBeNull();
    useProgramStore.getState().completeProgram();
    expect(typeof useProgramStore.getState().programCompletedAt).toBe('string');
  });

  it('no OTHER day in the entire 6-week program is flagged completes_program', () => {
    const modules = getProgramModules();
    const flaggedDays: string[] = [];

    for (const module of modules) {
      for (const day of module.days) {
        const payload = day.exercise.payload as Record<string, unknown>;
        if (payload.completes_program) flaggedDays.push(dayKey({ week: module.week, day: day.day }));
      }
    }

    expect(flaggedDays).toEqual(['6-7']);
  });
});
