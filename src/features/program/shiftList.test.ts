import { resolveShiftListSeed } from '@/features/program/shiftList';
import { useProgramStore } from '@/features/program/useProgramStore';
import type { GuidedListOutput } from '@/types/program';

describe('resolveShiftListSeed', () => {
  it('returns an empty array when nothing has been saved yet', () => {
    expect(resolveShiftListSeed(undefined)).toEqual([]);
  });

  it('returns the existing items to pre-fill, not discard, them', () => {
    expect(resolveShiftListSeed({ items: ['Walk', 'Call a friend'] })).toEqual(['Walk', 'Call a friend']);
  });
});

describe('shift_list single source of truth (BACKLOG #14)', () => {
  afterEach(() => {
    useProgramStore.getState().reset();
  });

  it('the in-tool 10-Minute Shift builder and W2D6 read/write the same key without data loss', () => {
    // In-tool builder saves first (user reaches 10-Minute Shift before Week 2).
    useProgramStore.getState().saveExerciseOutput('shift_list', { items: ['Walk around the block'] });

    // W2D6 pre-fills from whatever's already there instead of starting blank.
    const seed = resolveShiftListSeed(useProgramStore.getState().getExerciseOutput<GuidedListOutput>('shift_list'));
    expect(seed).toEqual(['Walk around the block']);

    // Merge — the user adds more on top of the seed, nothing is overwritten.
    const merged = [...seed, 'Call a friend', 'Cold water on my face'];
    useProgramStore.getState().saveExerciseOutput('shift_list', { items: merged });
    expect(useProgramStore.getState().getExerciseOutput('shift_list')).toEqual({ items: merged });
  });
});
