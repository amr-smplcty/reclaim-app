import {
  compileEmergencyCardSections,
  parseToolIdsFromRanking,
  visibleEmergencyCardSections,
} from '@/features/program/emergencyCard';
import type { EmergencyCardSourceSpec } from '@/types/program';

describe('parseToolIdsFromRanking — free-text tool_ranking to real ToolIds', () => {
  it('recovers tools in the order first mentioned, capped at maxItems', () => {
    expect(parseToolIdsFromRanking('Breather first, then Urge Surf, then the 10-Minute Shift', 2)).toEqual([
      'breather',
      'urge_surf',
    ]);
  });

  it('matches short unambiguous aliases (surf, breather)', () => {
    expect(parseToolIdsFromRanking('Surf > Breather > Defusion', 3)).toEqual(['urge_surf', 'breather', 'defusion']);
  });

  it('does not match the ambiguous bare word "shift" alone', () => {
    expect(parseToolIdsFromRanking('I mostly just shift my focus around', 2)).toEqual([]);
  });

  it('distinguishes shift environment from the 10-minute shift when spelled out', () => {
    expect(parseToolIdsFromRanking('Shift Environment, then Ten-Minute Shift', 2)).toEqual([
      'shift_environment',
      'ten_minute_shift',
    ]);
  });

  it('returns an empty list rather than throwing on unparseable text', () => {
    expect(parseToolIdsFromRanking('honestly not sure, whatever works', 2)).toEqual([]);
  });
});

describe('compileEmergencyCardSections — real Week 6 Day 5 shape', () => {
  const defaultOrder: EmergencyCardSourceSpec[] = [
    { title: 'My line', source: 'emergency_card_line' },
    { title: 'My urge script', source: 'urge_script' },
    { title: 'Tools', source: 'tool_ranking', render: 'action_buttons', max_items: 2 },
    { title: 'My shifts', source: 'shift_list', max_items: 2 },
    { title: 'My person', source: 'relapse_prevention_plan.person', render: 'contact_action' },
    { title: 'Coach lines', source: 'inner_coach_lines' },
    { title: "If it happened: my letter", source: 'lapse_letter', render: 'collapsed' },
  ];

  const fullOutputs = {
    emergency_card_line: 'what this program can give me back',
    urge_script: { statement: 'Breathe, name it, choose the next ten minutes.', signature: 'A', signed_at: '2026-01-01T00:00:00.000Z' },
    tool_ranking: 'Breather, then Urge Surf, then the 10-Minute Shift',
    shift_list: { items: ['Cold shower', 'Push-ups', 'Call a friend', 'Walk the block'] },
    relapse_prevention_plan: {
      sections: [
        { title: 'My triggers', content: 'Late night, alone.' },
        { title: 'My person', content: 'My brother — text "rough night", he calls.' },
      ],
    },
    inner_coach_lines: { items: ["You're allowed to want relief without acting on it.", 'One hard hour, not a verdict.'] },
    lapse_letter: 'Hey — you slipped. That is a data point, not a verdict.',
  };

  it('compiles every section with real content when nothing has been reordered/hidden yet', () => {
    const compiled = compileEmergencyCardSections(defaultOrder, undefined, fullOutputs);
    expect(compiled.map((s) => s.source)).toEqual(defaultOrder.map((s) => s.source));
    expect(compiled.every((s) => s.hidden === false)).toBe(true);

    const line = compiled.find((s) => s.source === 'emergency_card_line')!;
    expect(line.content).toBe('what this program can give me back');

    const script = compiled.find((s) => s.source === 'urge_script')!;
    expect(script.content).toBe('Breathe, name it, choose the next ten minutes.');

    const tools = compiled.find((s) => s.source === 'tool_ranking')!;
    expect(tools.toolIds).toEqual(['breather', 'urge_surf']);

    const shifts = compiled.find((s) => s.source === 'shift_list')!;
    expect(shifts.content).toBe('Cold shower, Push-ups');

    const person = compiled.find((s) => s.source === 'relapse_prevention_plan.person')!;
    expect(person.content).toBe('My brother — text "rough night", he calls.');

    const coach = compiled.find((s) => s.source === 'inner_coach_lines')!;
    expect(coach.content).toBe("You're allowed to want relief without acting on it., One hard hour, not a verdict.");

    const letter = compiled.find((s) => s.source === 'lapse_letter')!;
    expect(letter.content).toBe('Hey — you slipped. That is a data point, not a verdict.');
    expect(letter.render).toBe('collapsed');
  });

  it('handles missing sources gracefully — every source unsaved reads "Not yet completed.", never throws', () => {
    const compiled = compileEmergencyCardSections(defaultOrder, undefined, {});
    expect(() => compileEmergencyCardSections(defaultOrder, undefined, {})).not.toThrow();
    compiled.forEach((section) => {
      expect(section.content).toBe('Not yet completed.');
    });
    // action_buttons section still gets a (empty) toolIds array, never undefined-crashes a renderer.
    expect(compiled.find((s) => s.source === 'tool_ranking')?.toolIds).toEqual([]);
  });

  it('handles a partially-saved program — some sections real, some missing', () => {
    const compiled = compileEmergencyCardSections(defaultOrder, undefined, {
      emergency_card_line: fullOutputs.emergency_card_line,
      lapse_letter: fullOutputs.lapse_letter,
    });
    expect(compiled.find((s) => s.source === 'emergency_card_line')?.content).toBe('what this program can give me back');
    expect(compiled.find((s) => s.source === 'urge_script')?.content).toBe('Not yet completed.');
    expect(compiled.find((s) => s.source === 'relapse_prevention_plan.person')?.content).toBe('Not yet completed.');
  });

  it('applies the users saved reorder', () => {
    const savedState = [
      { source: 'lapse_letter', hidden: false },
      { source: 'emergency_card_line', hidden: false },
      { source: 'urge_script', hidden: false },
      { source: 'tool_ranking', hidden: false },
      { source: 'shift_list', hidden: false },
      { source: 'relapse_prevention_plan.person', hidden: false },
      { source: 'inner_coach_lines', hidden: false },
    ];
    const compiled = compileEmergencyCardSections(defaultOrder, savedState, fullOutputs);
    expect(compiled.map((s) => s.source)[0]).toBe('lapse_letter');
    expect(compiled.map((s) => s.source)[1]).toBe('emergency_card_line');
  });

  it('applies the users saved hide flags, and visibleEmergencyCardSections filters them out', () => {
    const savedState = defaultOrder.map((spec) => ({
      source: spec.source,
      hidden: spec.source === 'inner_coach_lines' || spec.source === 'lapse_letter',
    }));
    const compiled = compileEmergencyCardSections(defaultOrder, savedState, fullOutputs);
    expect(compiled.find((s) => s.source === 'inner_coach_lines')?.hidden).toBe(true);

    const visible = visibleEmergencyCardSections(compiled);
    expect(visible.map((s) => s.source)).not.toContain('inner_coach_lines');
    expect(visible.map((s) => s.source)).not.toContain('lapse_letter');
    expect(visible.length).toBe(defaultOrder.length - 2);
  });
});
