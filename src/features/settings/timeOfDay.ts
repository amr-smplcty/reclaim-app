import type { TimeOfDay } from '@/features/settings/useSettingsStore';

// No native time-picker module is installed (same gap as the plain-text-field
// date input tracked in BACKLOG #17 — a native picker needs a dev client and
// doesn't run in Expo Go); this hand-rolled stepper works everywhere.

export function formatTimeOfDay({ hour, minute }: TimeOfDay): string {
  const period = hour < 12 ? 'AM' : 'PM';
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  const displayMinute = minute.toString().padStart(2, '0');
  return `${displayHour}:${displayMinute} ${period}`;
}

export function stepHour(time: TimeOfDay, delta: number): TimeOfDay {
  return { ...time, hour: (time.hour + delta + 24) % 24 };
}

export function stepMinute(time: TimeOfDay, delta: number): TimeOfDay {
  return { ...time, minute: (time.minute + delta + 60) % 60 };
}
