// The program advances on completion, not calendar (PRODUCT_SPEC §5.1) — these
// are pure functions so that invariant stays testable in isolation from storage.

export interface ProgramPosition {
  week: number;
  day: number;
}

export interface DayCompletion {
  lessonComplete: boolean;
  exerciseComplete: boolean;
  checkinComplete: boolean;
  // Last-touched timestamp for this program day (any of the three flags
  // flipping true stamps it) — Epic 7 needs real calendar dates for weekly
  // consistency and Commitment Goal credit; program days themselves are
  // calendar-agnostic (position advances on completion, not date).
  lastActivityAt?: string;
}

export function isDayComplete(completion: DayCompletion): boolean {
  return completion.lessonComplete && completion.exerciseComplete;
}

export function nextPosition(current: ProgramPosition, daysPerWeek = 7): ProgramPosition {
  if (current.day < daysPerWeek) {
    return { week: current.week, day: current.day + 1 };
  }
  return { week: current.week + 1, day: 1 };
}

export function dayKey(position: ProgramPosition): string {
  return `${position.week}-${position.day}`;
}

export function previousPosition(current: ProgramPosition, daysPerWeek = 7): ProgramPosition | null {
  if (current.day > 1) {
    return { week: current.week, day: current.day - 1 };
  }
  if (current.week > 1) {
    return { week: current.week - 1, day: daysPerWeek };
  }
  return null;
}

// Generic over the day shape (not importing ProgramModule) so this stays a
// dependency-free pure function usable by any module/day-shaped content.
export function findProgramDay<T extends { day: number }>(
  modules: Array<{ week: number; days: T[] }>,
  position: ProgramPosition
): T | undefined {
  return modules.find((m) => m.week === position.week)?.days.find((d) => d.day === position.day);
}
