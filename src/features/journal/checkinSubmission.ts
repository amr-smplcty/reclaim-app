import { guardFreeText } from '@/lib/safety/guard';

export interface CheckinSubmissionInput {
  week: number;
  day: number;
  mood: number;
  urgesToday: boolean;
  urgeCount: number;
  promptText: string;
  promptResponse: string;
  committedActionStatus?: Record<string, boolean>;
}

// Gate for saving a check-in — the prompt response is the one free-text
// surface here (CLINICAL_SPEC §6), so it runs through the crisis guard
// before anything is persisted. isTextSafe is injectable so the gating logic
// stays unit-testable without mocking expo-router's navigation side effect.
export function buildCheckinEntry(
  input: CheckinSubmissionInput,
  isTextSafe: (text: string) => boolean = guardFreeText
): CheckinSubmissionInput | null {
  if (!isTextSafe(input.promptResponse)) return null;
  return input;
}
