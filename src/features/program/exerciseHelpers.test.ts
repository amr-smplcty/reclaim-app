import {
  assembleProfileSections,
  buildAnchorWhySummary,
  collectComparisonLines,
  summarizeExerciseOutput,
} from '@/features/program/exerciseHelpers';

describe('buildAnchorWhySummary', () => {
  it('falls back gracefully when nothing was saved yet', () => {
    expect(buildAnchorWhySummary(undefined)).toBe('what this is costing me');
    expect(buildAnchorWhySummary({ selected: [], write: '' })).toBe('what this is costing me');
  });

  it('lowercases the first letter and joins a single item plainly', () => {
    expect(buildAnchorWhySummary({ selected: ['My time'], write: '' })).toBe('my time');
  });

  it('joins two items with "and"', () => {
    expect(buildAnchorWhySummary({ selected: ['My time', 'My self-respect'], write: '' })).toBe(
      'my time and my self-respect'
    );
  });

  it('joins three or more items with an Oxford comma', () => {
    expect(
      buildAnchorWhySummary({ selected: ['My time', 'My focus and mental energy', 'My self-respect'], write: '' })
    ).toBe('my time, my focus and mental energy, and my self-respect');
  });
});

describe('collectComparisonLines', () => {
  it('combines benefits, noted costs, and gains into one list', () => {
    const benefits = { items: ['Relief from stress', 'Helps me fall asleep'] };
    const costs = {
      ratings: { Sleep: 3, Time: 1 },
      notes: { Sleep: "I'm exhausted most mornings." },
    };
    const gains = ['Better sleep', 'More trust in myself'];

    expect(collectComparisonLines(benefits, costs, gains)).toEqual([
      'Relief from stress',
      'Helps me fall asleep',
      "Sleep: I'm exhausted most mornings.",
      'Better sleep',
      'More trust in myself',
    ]);
  });

  it('tolerates missing benefits/costs', () => {
    expect(collectComparisonLines(undefined, undefined, ['Only gain'])).toEqual(['Only gain']);
  });
});

describe('summarizeExerciseOutput', () => {
  it('summarizes a multi_select_write output', () => {
    expect(summarizeExerciseOutput({ selected: ['Late at night', 'Home alone'], write: 'Alone, late, phone in bed.' })).toBe(
      'Late at night, Home alone — Alone, late, phone in bed.'
    );
  });

  it('summarizes a chain_builder output', () => {
    expect(summarizeExerciseOutput({ links: ['Stressful day', 'Phone in bed'], weakest_link: 'Phone in bed' })).toBe(
      'Chain: Stressful day → Phone in bed. Weakest link: Phone in bed'
    );
  });

  it('summarizes an if_then_builder output', () => {
    expect(summarizeExerciseOutput([{ if_text: "It's 11pm", then_text: 'Plug in phone across the room' }])).toBe(
      "If It's 11pm, then Plug in phone across the room."
    );
  });

  it('summarizes a checklist_commit output', () => {
    expect(summarizeExerciseOutput({ audit: {}, commitments: ['Charger outside bedroom'] })).toBe(
      'Committed to: Charger outside bedroom'
    );
  });

  it('summarizes a guided_list output', () => {
    expect(summarizeExerciseOutput({ items: ['Walk', 'Call a friend'] })).toBe('Walk, Call a friend');
  });

  it('falls back to a friendly placeholder when nothing was saved', () => {
    expect(summarizeExerciseOutput(undefined)).toBe('Not yet completed.');
  });
});

describe('assembleProfileSections — Pattern Profile assembled from the weeks saves', () => {
  it('assembles each section from its source key', () => {
    const outputs = {
      trigger_map_external: { selected: ['Late at night'], write: 'Alone in bed.' },
      trigger_map_internal: { selected: ['Boredom'], write: 'Usually evenings.' },
      chain_analysis: { links: ['Stress', 'Phone in bed'], weakest_link: 'Phone in bed' },
    };
    const sections = [
      { title: 'My risky conditions', source: 'trigger_map_external' },
      { title: 'My fuel', source: 'trigger_map_internal' },
      { title: 'My chain', source: 'chain_analysis' },
    ];

    expect(assembleProfileSections(sections, outputs)).toEqual([
      { title: 'My risky conditions', content: 'Late at night — Alone in bed.' },
      { title: 'My fuel', content: 'Boredom — Usually evenings.' },
      { title: 'My chain', content: 'Chain: Stress → Phone in bed. Weakest link: Phone in bed' },
    ]);
  });

  it('handles a missing source gracefully', () => {
    expect(assembleProfileSections([{ title: 'Missing', source: 'nonexistent' }], {})).toEqual([
      { title: 'Missing', content: 'Not yet completed.' },
    ]);
  });
});
