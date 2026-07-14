import week1Raw from '../../../content/week1.json';

import type { WeekContentPack } from '@/types/program';

const REFLECTION_TYPES = ['single_choice', 'free_text'];
const EXERCISE_TYPES = ['decisional_balance', 'worksheet', 'audio_practice', 'planner', 'card_sort'];

function fail(message: string): never {
  throw new Error(`Invalid content pack: ${message}`);
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function validateLesson(lesson: unknown, path: string) {
  if (!isPlainObject(lesson)) fail(`${path}.lesson must be an object`);
  const l = lesson as Record<string, unknown>;
  if (typeof l.id !== 'string') fail(`${path}.lesson.id must be a string`);
  if (typeof l.title !== 'string') fail(`${path}.lesson.title must be a string`);
  if (typeof l.body_md !== 'string') fail(`${path}.lesson.body_md must be a string`);
  if (typeof l.read_minutes !== 'number') fail(`${path}.lesson.read_minutes must be a number`);
  if (l.audio_url !== null && typeof l.audio_url !== 'string') fail(`${path}.lesson.audio_url must be a string or null`);

  if (!isPlainObject(l.reflection)) fail(`${path}.lesson.reflection must be an object`);
  const reflection = l.reflection as Record<string, unknown>;
  if (!REFLECTION_TYPES.includes(reflection.type as string)) {
    fail(`${path}.lesson.reflection.type must be one of ${REFLECTION_TYPES.join('|')}`);
  }
  if (typeof reflection.prompt !== 'string') fail(`${path}.lesson.reflection.prompt must be a string`);
  // free_text reflections legitimately omit `options` (see content/week1.json day 2/4/6).
  if (reflection.type === 'single_choice' && !Array.isArray(reflection.options)) {
    fail(`${path}.lesson.reflection.options must be an array for single_choice`);
  }
  if (reflection.options !== undefined && !Array.isArray(reflection.options)) {
    fail(`${path}.lesson.reflection.options must be an array when present`);
  }
}

function validateExercise(exercise: unknown, path: string) {
  if (!isPlainObject(exercise)) fail(`${path}.exercise must be an object`);
  const e = exercise as Record<string, unknown>;
  if (typeof e.id !== 'string') fail(`${path}.exercise.id must be a string`);
  if (!EXERCISE_TYPES.includes(e.type as string)) {
    fail(`${path}.exercise.type must be one of ${EXERCISE_TYPES.join('|')}`);
  }
  if (typeof e.title !== 'string') fail(`${path}.exercise.title must be a string`);
  if (!Array.isArray(e.steps)) fail(`${path}.exercise.steps must be an array`);

  if (!isPlainObject(e.payload)) fail(`${path}.exercise.payload must be an object`);
  const payload = e.payload as Record<string, unknown>;
  // Unknown `kind` values are allowed — the renderer falls back to a
  // sequential worksheet for anything it doesn't recognize yet.
  if (typeof payload.kind !== 'string') fail(`${path}.exercise.payload.kind must be a string`);
}

function validateDay(day: unknown, path: string) {
  if (!isPlainObject(day)) fail(`${path} must be an object`);
  const d = day as Record<string, unknown>;
  if (typeof d.day !== 'number') fail(`${path}.day must be a number`);
  validateLesson(d.lesson, path);
  validateExercise(d.exercise, path);
}

function validateModule(module: unknown, index: number) {
  if (!isPlainObject(module)) fail(`modules[${index}] must be an object`);
  const m = module as Record<string, unknown>;
  if (typeof m.week !== 'number') fail(`modules[${index}].week must be a number`);
  if (typeof m.title !== 'string') fail(`modules[${index}].title must be a string`);
  if (!Array.isArray(m.days)) fail(`modules[${index}].days must be an array`);
  m.days.forEach((day, dayIndex) => validateDay(day, `modules[${index}].days[${dayIndex}]`));
}

// Validates against the content JSON contract in CLINICAL_SPEC §7.
export function validateWeekContentPack(raw: unknown): WeekContentPack {
  if (!isPlainObject(raw)) fail('content pack must be an object');

  if (typeof raw.content_version !== 'string') fail('content_version must be a string');
  if (typeof raw.notes_for_engineering !== 'string') fail('notes_for_engineering must be a string');
  if (!Array.isArray(raw.modules)) fail('modules must be an array');
  raw.modules.forEach((module, index) => validateModule(module, index));
  if (!Array.isArray(raw.checkin_prompts) || raw.checkin_prompts.some((p) => typeof p !== 'string')) {
    fail('checkin_prompts must be an array of strings');
  }

  return raw as unknown as WeekContentPack;
}

let cached: WeekContentPack | null = null;

// week1.json is bundled into the JS bundle at build time (no network fetch),
// so it's inherently available offline — no separate MMKV cache layer is
// needed until content is served from Supabase (CLINICAL_SPEC §8, not yet
// built). Validation runs once and the result is memoized.
export function getWeekContent(): WeekContentPack {
  if (!cached) {
    cached = validateWeekContentPack(week1Raw);
  }
  return cached;
}
