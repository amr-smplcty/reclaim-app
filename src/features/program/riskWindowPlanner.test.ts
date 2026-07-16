import {
  allWindowsPlanted,
  buildPlannedOutput,
  buildWorksheetOutput,
  deriveRiskWindows,
  extractPlantOptions,
  resolvePlantOptions,
} from '@/features/program/riskWindowPlanner';

describe('deriveRiskWindows — real Week 2 save shapes (trigger_map_external + chain_analysis)', () => {
  // Real content/week2.json Day 1 multi_select_write output shape.
  const triggerMapExternal = {
    selected: ['Late at night', 'Home alone', 'Weekend or free afternoons with no plans'],
    write: 'Alone at home, late, phone in bed, nothing planned tomorrow morning.',
  };

  // Real content/week2.json Day 3 chain_builder output shape.
  const chainAnalysis = {
    links: ['Stressful day at work', 'Skipped dinner', 'Scrolling in bed', 'Phone in bed'],
    weakest_link: 'Phone in bed',
  };

  it('combines trigger_map_external.selected with chain_analysis.weakest_link', () => {
    expect(deriveRiskWindows(triggerMapExternal, chainAnalysis)).toEqual([
      'Late at night',
      'Home alone',
      'Weekend or free afternoons with no plans',
      'Phone in bed',
    ]);
  });

  it('de-duplicates when the weakest link happens to match a selected trigger verbatim', () => {
    const duplicateChain = { links: ['x'], weakest_link: 'Late at night' };
    expect(deriveRiskWindows(triggerMapExternal, duplicateChain)).toEqual([
      'Late at night',
      'Home alone',
      'Weekend or free afternoons with no plans',
    ]);
  });

  it('degrades to just the chain weakest link when trigger_map_external is missing', () => {
    expect(deriveRiskWindows(undefined, chainAnalysis)).toEqual(['Phone in bed']);
  });

  it('degrades to just the selected triggers when chain_analysis is missing', () => {
    expect(deriveRiskWindows(triggerMapExternal, undefined)).toEqual([
      'Late at night',
      'Home alone',
      'Weekend or free afternoons with no plans',
    ]);
  });

  it('returns an empty list (never throws) when both sources are missing', () => {
    expect(deriveRiskWindows(undefined, undefined)).toEqual([]);
  });

  it('returns an empty list when trigger_map_external has no selections yet', () => {
    expect(deriveRiskWindows({ selected: [], write: '' }, undefined)).toEqual([]);
  });
});

describe('extractPlantOptions — heterogeneous save shapes', () => {
  it('reads a guided_list output (reconnection_plan, boredom_plan, shift_list)', () => {
    expect(extractPlantOptions({ items: ['Walk', 'Call a friend'] })).toEqual(['Walk', 'Call a friend']);
  });

  it('reads a committed_action_planner output (movement_plan) by its action text', () => {
    const movementPlan = [
      { id: 'movement_plan-action-0', value: 'Health & vitality', action: '10-minute walk', if_then_anchor: 'x', days_of_week: ['mon'] },
    ];
    expect(extractPlantOptions(movementPlan)).toEqual(['10-minute walk']);
  });

  it('reads a plain string array', () => {
    expect(extractPlantOptions(['A', 'B'])).toEqual(['A', 'B']);
  });

  it('returns an empty list for undefined, never throwing', () => {
    expect(extractPlantOptions(undefined)).toEqual([]);
  });

  it('returns an empty list for an unrecognized shape', () => {
    expect(extractPlantOptions({ ratings: {}, notes: {} })).toEqual([]);
  });
});

describe('resolvePlantOptions — merges movement_plan/reconnection_plan/boredom_plan/shift_list', () => {
  it('flattens and de-duplicates across every source', () => {
    const outputs = {
      movement_plan: [{ id: 'a', value: 'Health & vitality', action: '10-minute walk', if_then_anchor: 'x', days_of_week: ['mon'] }],
      reconnection_plan: { items: ['Call Dad Thursday'] },
      boredom_plan: { items: ['Guitar', 'Chess app'] },
      shift_list: { items: ['Walk', 'Cold water'] },
    };
    expect(resolvePlantOptions(['movement_plan', 'reconnection_plan', 'boredom_plan', 'shift_list'], outputs)).toEqual([
      '10-minute walk',
      'Call Dad Thursday',
      'Guitar',
      'Chess app',
      'Walk',
      'Cold water',
    ]);
  });

  it('tolerates missing sources, never throwing', () => {
    expect(resolvePlantOptions(['movement_plan', 'boredom_plan'], {})).toEqual([]);
  });
});

describe('allWindowsPlanted', () => {
  it('is false until every window has a non-empty plant', () => {
    expect(allWindowsPlanted(['Late at night', 'Home alone'], { 'Late at night': 'A walk' })).toBe(false);
  });

  it('is true once every window has a plant', () => {
    expect(
      allWindowsPlanted(['Late at night', 'Home alone'], { 'Late at night': 'A walk', 'Home alone': 'Guitar' })
    ).toBe(true);
  });

  it('is false for an empty windows list — nothing to submit', () => {
    expect(allWindowsPlanted([], {})).toBe(false);
  });

  it('treats a whitespace-only plant as unplanted', () => {
    expect(allWindowsPlanted(['Late at night'], { 'Late at night': '   ' })).toBe(false);
  });
});

describe('buildPlannedOutput / buildWorksheetOutput — the two mutually exclusive submission shapes', () => {
  it('planned output carries window/plant pairs and a null worksheetText', () => {
    expect(buildPlannedOutput(['Late at night', 'Home alone'], { 'Late at night': 'A walk', 'Home alone': 'Guitar' })).toEqual({
      plants: [
        { window: 'Late at night', plant: 'A walk' },
        { window: 'Home alone', plant: 'Guitar' },
      ],
      worksheetText: null,
    });
  });

  it('worksheet output carries the free text and no plants', () => {
    expect(buildWorksheetOutput('Not sure yet, still figuring out my windows.')).toEqual({
      plants: [],
      worksheetText: 'Not sure yet, still figuring out my windows.',
    });
  });
});
