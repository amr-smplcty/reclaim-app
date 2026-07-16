import {
  validateWeekContentPack,
  getAllWeekPacks,
  getProgramModules,
  getAllCheckinPrompts,
  getUrgeSurfScript,
  getUrgeValueMapPayload,
} from '@/lib/content/week';
import { findProgramDay } from '@/features/program/progression';

function validFixture() {
  return {
    content_version: '1.0.0',
    notes_for_engineering: 'test notes',
    modules: [
      {
        week: 1,
        title: 'Understand & Commit',
        days: [
          {
            day: 1,
            lesson: {
              id: 'w1d1_lesson',
              title: 'Start here',
              body_md: 'Body',
              read_minutes: 3,
              audio_url: null,
              reflection: { type: 'single_choice', prompt: 'Why?', options: ['A', 'B'] },
            },
            exercise: {
              id: 'w1d1_ex',
              type: 'worksheet',
              title: 'Your Why',
              steps: ['Step 1'],
              payload: { kind: 'multi_select_write', select_options: ['A'], select_count: 1, write_prompt: 'p', save_to: 'anchor_why' },
            },
          },
        ],
      },
    ],
    checkin_prompts: ['How was today?'],
  };
}

describe('validateWeekContentPack — real content/week1.json', () => {
  it('parses and validates without throwing', () => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const week1 = require('../../../content/week1.json');
    const pack = validateWeekContentPack(week1);
    expect(pack.content_version).toBe('1.1.0');
    expect(pack.modules[0].week).toBe(1);
    expect(pack.modules[0].days).toHaveLength(7);
    expect(pack.modules[0].days[6].exercise.payload).toMatchObject({ kind: 'commitment_builder' });
    expect((pack.checkin_prompts ?? []).length).toBeGreaterThan(0);
  });
});

describe('validateWeekContentPack — schema errors', () => {
  it('accepts a well-formed fixture', () => {
    expect(() => validateWeekContentPack(validFixture())).not.toThrow();
  });

  it('rejects non-object input', () => {
    expect(() => validateWeekContentPack(null)).toThrow(/content pack/i);
    expect(() => validateWeekContentPack('nope')).toThrow();
  });

  it('rejects missing content_version', () => {
    const fixture = validFixture();
    delete (fixture as any).content_version;
    expect(() => validateWeekContentPack(fixture)).toThrow(/content_version/);
  });

  it('rejects modules that are not an array', () => {
    const fixture = validFixture();
    (fixture as any).modules = {};
    expect(() => validateWeekContentPack(fixture)).toThrow(/modules/);
  });

  it('rejects a day missing lesson', () => {
    const fixture = validFixture();
    delete (fixture as any).modules[0].days[0].lesson;
    expect(() => validateWeekContentPack(fixture)).toThrow(/lesson/);
  });

  it('rejects an invalid reflection type', () => {
    const fixture = validFixture();
    fixture.modules[0].days[0].lesson.reflection.type = 'multiple_choice';
    expect(() => validateWeekContentPack(fixture)).toThrow(/reflection/);
  });

  it('rejects an exercise missing steps', () => {
    const fixture = validFixture();
    delete (fixture as any).modules[0].days[0].exercise.steps;
    expect(() => validateWeekContentPack(fixture)).toThrow(/steps/);
  });

  it('rejects an exercise payload without a kind', () => {
    const fixture = validFixture();
    (fixture as any).modules[0].days[0].exercise.payload = {};
    expect(() => validateWeekContentPack(fixture)).toThrow(/payload/);
  });

  it('rejects checkin_prompts that are not an array of strings', () => {
    const fixture = validFixture();
    (fixture as any).checkin_prompts = 'not an array';
    expect(() => validateWeekContentPack(fixture)).toThrow(/checkin_prompts/);
  });

  it('tolerates unknown exercise payload kinds (fallback rendering handles them)', () => {
    const fixture = validFixture();
    fixture.modules[0].days[0].exercise.payload = { kind: 'some_future_kind', anything: true } as any;
    expect(() => validateWeekContentPack(fixture)).not.toThrow();
  });

  it('accepts a pack with no checkin_prompts at all (week2.json style)', () => {
    const fixture = validFixture();
    delete (fixture as any).checkin_prompts;
    (fixture as any).checkin_prompts_additions = ['An extra prompt'];
    expect(() => validateWeekContentPack(fixture)).not.toThrow();
  });
});

describe('multi-week loading — real content/week1.json + week2.json + week3.json + week4.json', () => {
  it('loads all four packs', () => {
    const packs = getAllWeekPacks();
    expect(packs).toHaveLength(4);
    expect(packs[0].modules[0].week).toBe(1);
    expect(packs[1].modules[0].week).toBe(2);
    expect(packs[2].modules[0].week).toBe(3);
    expect(packs[3].modules[0].week).toBe(4);
  });

  it('merges modules across weeks so W2D1 is reachable right after W1D7', () => {
    const modules = getProgramModules();
    expect(modules.map((m) => m.week)).toEqual([1, 2, 3, 4]);

    const w1d7 = findProgramDay(modules, { week: 1, day: 7 });
    const w2d1 = findProgramDay(modules, { week: 2, day: 1 });
    expect(w1d7?.exercise.payload).toMatchObject({ kind: 'commitment_builder' });
    expect(w2d1?.lesson.id).toBe('w2d1_lesson');
  });

  it('merges Week 3 in so W3D1 is reachable right after W2D7', () => {
    const modules = getProgramModules();
    const w2d7 = findProgramDay(modules, { week: 2, day: 7 });
    const w3d1 = findProgramDay(modules, { week: 3, day: 1 });
    expect(w2d7?.exercise.payload).toMatchObject({ kind: 'profile_builder' });
    expect(w3d1?.lesson.id).toBe('w3d1_lesson');
    expect(w3d1?.exercise.payload).toMatchObject({ kind: 'tool_practice', tool: 'urge_surf' });
  });

  it('merges Week 4 in so W4D1 is reachable right after W3D7', () => {
    const modules = getProgramModules();
    expect(modules.map((m) => m.week)).toEqual([1, 2, 3, 4]);

    const w3d7 = findProgramDay(modules, { week: 3, day: 7 });
    const w4d1 = findProgramDay(modules, { week: 4, day: 1 });
    expect(w3d7?.exercise.payload).toMatchObject({ kind: 'commitment_builder' });
    expect(w4d1?.lesson.id).toBe('w4d1_lesson');
    expect(w4d1?.exercise.payload).toMatchObject({ kind: 'value_card_sort', keep_count: 5, save_to: 'values_top5' });
  });

  it('combines week 1 checkin_prompts with week 2, week 3, and week 4 additions', () => {
    const prompts = getAllCheckinPrompts();
    expect(prompts).toContain('What was the strongest feeling you had today, and what did you do with it?');
    expect(prompts).toContain('Did any of your if-then plans fire today? What happened?');
    expect(prompts).toContain("Did you do today's calm practice run? What did you notice in your body?");
    // All three of week4.json's checkin_prompts_additions, merged in.
    expect(prompts).toContain('Did your committed actions happen today? Which votes got cast?');
    expect(prompts).toContain('Did any urge today point at a value? Which one was hungriest?');
    expect(prompts).toContain('Coach or critic — who did the talking today?');
  });

  it('finds the urge_value_map payload wherever it lives in the program (Week 4 Day 4)', () => {
    const payload = getUrgeValueMapPayload();
    expect(payload).toMatchObject({
      kind: 'urge_value_map',
      min_logs: 3,
      tag_options_source: 'values_core',
      enable_ongoing_tagging: true,
    });
    expect(payload?.extra_tags).toContain('rest / relief');
  });

  it('returns week 2s authored Urge Surf script, replacing the interim beats', () => {
    const script = getUrgeSurfScript();
    expect(script?.duration_seconds).toBe(180);
    expect(script?.on_screen_beats.length).toBeGreaterThan(0);
    expect(script?.on_screen_beats[0]).toMatchObject({ at_seconds: 0 });
  });
});
