import { validateWeekContentPack } from '@/lib/content/week';

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
    expect(pack.checkin_prompts.length).toBeGreaterThan(0);
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
});
