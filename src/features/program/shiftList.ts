import type { GuidedListOutput } from '@/types/program';

// The in-tool 10-Minute Shift builder and Week 2 Day 6's "My Shift List"
// exercise both read and write the single `shift_list` key in the program
// store's exerciseOutputs (BACKLOG #14) — this resolves what to pre-fill an
// editable list with, so the two entry points merge rather than overwrite.
export function resolveShiftListSeed(existing: GuidedListOutput | undefined): string[] {
  return existing?.items ?? [];
}
