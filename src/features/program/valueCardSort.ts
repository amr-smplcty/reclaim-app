// Pure state machine behind ValueCardSort.tsx (Week 4 Day 1) — a deck
// review (keep/discard one card at a time) followed by ranking the keepers
// down to keep_count. Kept fully separate from the component so the two
// phases and their edge cases are testable without RNTL.

export interface DeckCard {
  id: string;
  label: string;
  hint: string;
}

export interface SortState {
  index: number;
  kept: string[];
}

export function applyKeepDecision(state: SortState, deck: DeckCard[], keep: boolean): SortState {
  const card = deck[state.index];
  return {
    index: state.index + 1,
    kept: keep && card ? [...state.kept, card.label] : state.kept,
  };
}

export function isSortComplete(state: SortState, deckLength: number): boolean {
  return state.index >= deckLength;
}

// If the user kept keep_count or fewer cards, there's nothing meaningful to
// rank them against — they're all "top" by default.
export function needsRanking(kept: string[], keepCount: number): boolean {
  return kept.length > keepCount;
}

export function toggleRank(ranked: string[], label: string, keepCount: number): string[] {
  if (ranked.includes(label)) return ranked.filter((l) => l !== label);
  if (ranked.length >= keepCount) return ranked;
  return [...ranked, label];
}

export function finalizeTop5(kept: string[], ranked: string[], keepCount: number): string[] {
  return needsRanking(kept, keepCount) ? ranked : kept;
}
