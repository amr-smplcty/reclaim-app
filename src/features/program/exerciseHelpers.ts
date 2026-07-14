import type { GuidedListOutput, MultiSelectWriteOutput, RatedInventoryOutput } from '@/types/program';

// Fills the {anchor_why_summary} placeholder in the Day 7 commitment template
// (content/week1.json) from the Day 1 multi_select_write output. The result is
// editable before signing, so a slightly loose join reads fine in practice.
export function buildAnchorWhySummary(output: MultiSelectWriteOutput | undefined): string {
  if (!output || output.selected.length === 0) return 'what this is costing me';

  const items = output.selected.map((s) => s.charAt(0).toLowerCase() + s.slice(1));
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(', ')}, and ${items[items.length - 1]}`;
}

// Gathers every candidate line for the Day 4 decisional_balance_compare
// "which single line hits hardest" selection — benefits, the costs the user
// actually noted, and the gains they just wrote.
export function collectComparisonLines(
  benefits: GuidedListOutput | undefined,
  costs: RatedInventoryOutput | undefined,
  gains: string[]
): string[] {
  const benefitLines = benefits?.items ?? [];
  const costLines = costs ? Object.entries(costs.notes).map(([area, note]) => `${area}: ${note}`) : [];
  return [...benefitLines, ...costLines, ...gains];
}
