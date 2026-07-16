import {
  assembleProfileSections,
  buildAnchorWhySummary,
  collectComparisonLines,
  resolveCommitmentTemplate,
  resolveSelectOptions,
  summarizeExerciseOutput,
} from '@/features/program/exerciseHelpers';
import type { CommitmentBuilderPayload, MultiSelectWritePayload } from '@/types/program';

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

  // Week 5 Day 7's foundations_profile is the first profile_builder to pull
  // in a rated_inventory section (life_audit) — previously fell through
  // every branch to '', rendering blank.
  it('summarizes a rated_inventory output, area by area, with notes where present', () => {
    const output = {
      ratings: { Sleep: 1, Movement: 0, Connection: 2 },
      notes: { Sleep: "Up past 1am most nights.", Movement: "Basically never." },
    };
    expect(summarizeExerciseOutput(output)).toBe(
      "Sleep: 1 — Up past 1am most nights.; Movement: 0 — Basically never.; Connection: 2"
    );
  });

  // Week 5 Day 7 also pulls in movement_plan, a committed_action_planner
  // output (CommittedAction[]) — previously matched the bare Array.isArray
  // branch and fell through to `.join(', ')` on objects, rendering
  // "[object Object]".
  it('summarizes a committed_action_planner output (CommittedAction[]), not [object Object]', () => {
    const output = [
      { id: 'w5-action-0', value: 'Health & vitality', action: '10-minute walk', if_then_anchor: 'After dinner', days_of_week: ['mon', 'wed', 'fri'] },
    ];
    const result = summarizeExerciseOutput(output);
    expect(result).not.toContain('[object Object]');
    expect(result).toBe('10-minute walk (mon/wed/fri)');
  });

  // Week 5 Day 7's foundations_profile also pulls in weekly_architecture, a
  // risk_window_planner output ({plants, worksheetText}).
  it('summarizes a risk_window_planner output in planned mode as window -> plant pairs', () => {
    const output = {
      plants: [
        { window: 'Late at night', plant: '10-minute walk' },
        { window: 'Post-work slump', plant: 'Guitar' },
      ],
      worksheetText: null,
    };
    expect(summarizeExerciseOutput(output)).toBe('Late at night → 10-minute walk; Post-work slump → Guitar');
  });

  it('summarizes a risk_window_planner output in worksheet fallback mode as the free text', () => {
    const output = { plants: [], worksheetText: 'Still mapping my windows out.' };
    expect(summarizeExerciseOutput(output)).toBe('Still mapping my windows out.');
  });

  it('falls back to a friendly placeholder when nothing was saved', () => {
    expect(summarizeExerciseOutput(undefined)).toBe('Not yet completed.');
  });
});

describe('resolveCommitmentTemplate', () => {
  const week1Payload: CommitmentBuilderPayload = {
    kind: 'commitment_builder',
    template:
      "Because {anchor_why_summary}, I'm committing to this program: daily practice, honest check-ins, reaching for my tools when urges come — and if I slip, a debrief instead of a spiral. I'm not promising perfection. I'm promising to stay in the process.\n\nWhat's at stake for me: {emergency_card_line}",
    inputs: ['anchor_why', 'emergency_card_line', 'lapse_letter'],
    signature_required: true,
    save_to: 'commitment_statement',
    pin_to_today: true,
  };

  it('resolves Week 1s template exactly as the original hardcoded logic did', () => {
    const outputs = {
      anchor_why: { selected: ['My time', 'My self-respect'], write: '' },
      emergency_card_line: 'the version of me that keeps his word',
    };
    const result = resolveCommitmentTemplate(week1Payload, outputs);
    expect(result).toBe(
      "Because my time and my self-respect, I'm committing to this program: daily practice, honest check-ins, reaching for my tools when urges come — and if I slip, a debrief instead of a spiral. I'm not promising perfection. I'm promising to stay in the process.\n\nWhat's at stake for me: the version of me that keeps his word"
    );
  });

  it('falls back gracefully when Week 1s inputs are missing', () => {
    const result = resolveCommitmentTemplate(week1Payload, {});
    expect(result).toContain('what this is costing me');
    expect(result).toContain('what this program can give me back');
  });

  const week3Payload: CommitmentBuilderPayload = {
    kind: 'commitment_builder',
    template:
      "When it rises: {breather_slot_summary}\nWhen the pitch starts: remember — {urge_thoughts_top}. I'm having a thought, not taking an order.\nMy turn away: {shift_list_top}. My hands are free, and they're for {anchor_why_summary}.",
    inputs: ['breather_slot', 'urge_thoughts', 'shift_list', 'anchor_why', 'tool_ranking'],
    signature_required: false,
    save_to: 'urge_script',
    max_words: 100,
    surface_in: ['urge_surf_entry', 'emergency_card'],
  };

  it('resolves Week 3 Day 7s different placeholders — a plain-string output via _summary', () => {
    const outputs = { breather_slot: "it's 11pm and I'm scrolling" };
    const result = resolveCommitmentTemplate(week3Payload, outputs);
    expect(result).toContain("When it rises: it's 11pm and I'm scrolling");
  });

  it('resolves a _top placeholder to the first item of a list-shaped output', () => {
    const outputs = {
      urge_thoughts: { items: ['"Just this once"', '"You deserve it"'] },
      shift_list: { items: ['Walk around the block', 'Call a friend'] },
    };
    const result = resolveCommitmentTemplate(week3Payload, outputs);
    expect(result).toContain('remember — "Just this once".');
    expect(result).toContain('My turn away: Walk around the block.');
  });

  it('still resolves {anchor_why_summary} the same special way inside a different template', () => {
    const outputs = { anchor_why: { selected: ['My time'], write: '' } };
    const result = resolveCommitmentTemplate(week3Payload, outputs);
    expect(result).toContain("they're for my time.");
  });

  it('tolerates an input with no matching placeholder in the template (tool_ranking)', () => {
    const outputs = { tool_ranking: 'Breather first, then Urge Surf' };
    expect(() => resolveCommitmentTemplate(week3Payload, outputs)).not.toThrow();
  });

  it('never throws on completely empty outputs', () => {
    expect(() => resolveCommitmentTemplate(week3Payload, {})).not.toThrow();
  });
});

describe('resolveSelectOptions — Week 4 Day 2 sources its options from a saved output', () => {
  const inlinePayload: MultiSelectWritePayload = {
    kind: 'multi_select_write',
    select_options: ['Did it', "Didn't manage it"],
    select_count: 1,
    write_prompt: 'p',
    save_to: 'flexibility_rep',
  };

  const sourcedPayload: MultiSelectWritePayload = {
    kind: 'multi_select_write',
    select_options_source: 'values_top5',
    select_count: 2,
    write_prompt: 'p',
    save_to: 'values_core',
  };

  it('uses select_options directly when present (Week 1/2/4 Day 5 style)', () => {
    expect(resolveSelectOptions(inlinePayload, {})).toEqual(['Did it', "Didn't manage it"]);
  });

  it('resolves select_options_source from a value_card_sort output (Week 4 Day 2)', () => {
    const outputs = { values_top5: { kept: ['A', 'B', 'C', 'D', 'E', 'F'], top5: ['A', 'B', 'C', 'D', 'E'] } };
    expect(resolveSelectOptions(sourcedPayload, outputs)).toEqual(['A', 'B', 'C', 'D', 'E']);
  });

  it('resolves select_options_source from a plain string-array output', () => {
    expect(resolveSelectOptions(sourcedPayload, { values_top5: ['X', 'Y'] })).toEqual(['X', 'Y']);
  });

  it('returns an empty list when the source has not been saved yet, rather than throwing', () => {
    expect(resolveSelectOptions(sourcedPayload, {})).toEqual([]);
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
