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
