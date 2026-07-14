import { buildAnchorWhySummary, collectComparisonLines } from '@/features/program/exerciseHelpers';

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
