import {
  applyKeepDecision,
  finalizeTop5,
  isSortComplete,
  needsRanking,
  toggleRank,
  type SortState,
} from '@/features/program/valueCardSort';

const DECK = [
  { id: 'connection', label: 'Connection', hint: 'x' },
  { id: 'integrity', label: 'Integrity', hint: 'x' },
  { id: 'growth', label: 'Growth', hint: 'x' },
];

describe('applyKeepDecision', () => {
  it('appends the card label and advances the index when kept', () => {
    const start: SortState = { index: 0, kept: [] };
    const next = applyKeepDecision(start, DECK, true);
    expect(next).toEqual({ index: 1, kept: ['Connection'] });
  });

  it('advances the index without adding the label when discarded', () => {
    const start: SortState = { index: 0, kept: [] };
    const next = applyKeepDecision(start, DECK, false);
    expect(next).toEqual({ index: 1, kept: [] });
  });

  it('accumulates across repeated decisions in order', () => {
    let state: SortState = { index: 0, kept: [] };
    state = applyKeepDecision(state, DECK, true);
    state = applyKeepDecision(state, DECK, false);
    state = applyKeepDecision(state, DECK, true);
    expect(state).toEqual({ index: 3, kept: ['Connection', 'Growth'] });
  });

  it('never throws when called past the end of the deck (degenerate input guard)', () => {
    const start: SortState = { index: DECK.length, kept: ['Connection'] };
    expect(() => applyKeepDecision(start, DECK, true)).not.toThrow();
    expect(applyKeepDecision(start, DECK, true)).toEqual({ index: DECK.length + 1, kept: ['Connection'] });
  });
});

describe('isSortComplete', () => {
  it('is false while cards remain', () => {
    expect(isSortComplete({ index: 2, kept: [] }, DECK.length)).toBe(false);
  });

  it('is true once every card has been reviewed', () => {
    expect(isSortComplete({ index: 3, kept: [] }, DECK.length)).toBe(true);
    expect(isSortComplete({ index: 4, kept: [] }, DECK.length)).toBe(true);
  });
});

describe('needsRanking', () => {
  it('is false when kept is at or under keep_count — nothing to rank among', () => {
    expect(needsRanking(['A', 'B'], 5)).toBe(false);
    expect(needsRanking(['A', 'B', 'C', 'D', 'E'], 5)).toBe(false);
    expect(needsRanking([], 5)).toBe(false);
  });

  it('is true once kept exceeds keep_count', () => {
    expect(needsRanking(['A', 'B', 'C', 'D', 'E', 'F'], 5)).toBe(true);
  });
});

describe('toggleRank', () => {
  it('adds an unranked label to the end of the rank order', () => {
    expect(toggleRank(['A'], 'B', 5)).toEqual(['A', 'B']);
  });

  it('removes an already-ranked label (un-ranking it)', () => {
    expect(toggleRank(['A', 'B', 'C'], 'B', 5)).toEqual(['A', 'C']);
  });

  it('refuses to add beyond keep_count', () => {
    expect(toggleRank(['A', 'B', 'C', 'D', 'E'], 'F', 5)).toEqual(['A', 'B', 'C', 'D', 'E']);
  });
});

describe('finalizeTop5', () => {
  it('uses kept, in keep-order, when no ranking was needed', () => {
    expect(finalizeTop5(['A', 'B', 'C'], [], 5)).toEqual(['A', 'B', 'C']);
  });

  it('uses the ranked order once ranking happened', () => {
    expect(finalizeTop5(['A', 'B', 'C', 'D', 'E', 'F'], ['C', 'A', 'F', 'B', 'D'], 5)).toEqual(['C', 'A', 'F', 'B', 'D']);
  });
});
