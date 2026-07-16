import week1Raw from '../../../content/week1.json';
import week2Raw from '../../../content/week2.json';
import week3Raw from '../../../content/week3.json';
import week4Raw from '../../../content/week4.json';
import week5Raw from '../../../content/week5.json';

import type { ProgramModule } from '@/types/content';
import type { CommittedActionPlannerPayload, UrgeSurfScript, UrgeValueMapPayload, WeekContentPack } from '@/types/program';

const REFLECTION_TYPES = ['single_choice', 'free_text'];
// CLINICAL_SPEC §7 lists decisional_balance|worksheet|audio_practice|planner|card_sort
// as examples, not an exhaustive enum — content/week2.json's Day 6 exercise
// uses "guided_list" as its top-level type too (matching its payload kind).
const EXERCISE_TYPES = ['decisional_balance', 'worksheet', 'audio_practice', 'planner', 'card_sort', 'guided_list'];

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

  // checkin_prompts is optional per-pack — week1.json carries the base list,
  // later weeks add to it via checkin_prompts_additions instead of repeating it.
  if (raw.checkin_prompts !== undefined) {
    if (!Array.isArray(raw.checkin_prompts) || raw.checkin_prompts.some((p) => typeof p !== 'string')) {
      fail('checkin_prompts must be an array of strings when present');
    }
  }
  if (raw.checkin_prompts_additions !== undefined) {
    if (!Array.isArray(raw.checkin_prompts_additions) || raw.checkin_prompts_additions.some((p) => typeof p !== 'string')) {
      fail('checkin_prompts_additions must be an array of strings when present');
    }
  }
  if (raw.toolkit_scripts !== undefined) {
    if (!isPlainObject(raw.toolkit_scripts)) fail('toolkit_scripts must be an object when present');
    const urgeSurf = (raw.toolkit_scripts as Record<string, unknown>).urge_surf;
    if (urgeSurf !== undefined) {
      if (!isPlainObject(urgeSurf)) fail('toolkit_scripts.urge_surf must be an object');
      if (typeof urgeSurf.duration_seconds !== 'number') fail('toolkit_scripts.urge_surf.duration_seconds must be a number');
      if (!Array.isArray(urgeSurf.on_screen_beats)) fail('toolkit_scripts.urge_surf.on_screen_beats must be an array');
    }
  }

  return raw as unknown as WeekContentPack;
}

let cachedPacks: WeekContentPack[] | null = null;

// Each week's JSON is bundled into the JS bundle at build time (no network
// fetch), so it's inherently available offline — no separate MMKV cache
// layer is needed until content is served from Supabase (CLINICAL_SPEC §8,
// not yet built). Validation runs once per pack and is memoized.
export function getAllWeekPacks(): WeekContentPack[] {
  if (!cachedPacks) {
    cachedPacks = [
      validateWeekContentPack(week1Raw),
      validateWeekContentPack(week2Raw),
      validateWeekContentPack(week3Raw),
      validateWeekContentPack(week4Raw),
      validateWeekContentPack(week5Raw),
    ];
  }
  return cachedPacks;
}

export function getProgramModules(): ProgramModule[] {
  return getAllWeekPacks().flatMap((pack) => pack.modules);
}

export function getAllCheckinPrompts(): string[] {
  const packs = getAllWeekPacks();
  return [...packs.flatMap((p) => p.checkin_prompts ?? []), ...packs.flatMap((p) => p.checkin_prompts_additions ?? [])];
}

// Later weeks' authored script replaces earlier interim ones — walk packs
// newest-first and take the first urge_surf script defined.
export function getUrgeSurfScript(): UrgeSurfScript | undefined {
  const packs = getAllWeekPacks();
  for (let i = packs.length - 1; i >= 0; i--) {
    const script = packs[i].toolkit_scripts?.urge_surf;
    if (script) return script;
  }
  return undefined;
}

// Finds the urge_value_map exercise payload wherever it lives in the program
// (Week 4 Day 4 today) — used by the urge-log screen to source its ongoing
// "what was it asking for?" tag options (tag_options_source + extra_tags)
// without hardcoding a week/day number.
export function getUrgeValueMapPayload(): UrgeValueMapPayload | undefined {
  for (const module of getProgramModules()) {
    for (const day of module.days) {
      if ((day.exercise.payload as { kind?: string })?.kind === 'urge_value_map') {
        return day.exercise.payload as unknown as UrgeValueMapPayload;
      }
    }
  }
  return undefined;
}

// Finds every committed_action_planner payload's save_to key that opted
// into the evening check-in's "did today's committed actions happen?"
// section (checkin_integration: true) — Week 4 Day 3's committed_actions
// and Week 5 Day 3's movement_plan today, generic to any future week that
// reuses the pattern rather than hardcoding either key.
export function getCheckinIntegratedActionKeys(): string[] {
  const keys: string[] = [];
  for (const module of getProgramModules()) {
    for (const day of module.days) {
      const payload = day.exercise.payload as unknown as CommittedActionPlannerPayload;
      if (payload?.kind === 'committed_action_planner' && payload.checkin_integration) {
        keys.push(payload.save_to);
      }
    }
  }
  return keys;
}
