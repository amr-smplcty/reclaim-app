import type {
  CommitmentBuilderPayload,
  GuidedListOutput,
  MultiSelectWriteOutput,
  ProfileSection,
  RatedInventoryOutput,
} from '@/types/program';

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

// Turns any saved exercise output into a short human-readable line — used by
// if_then_builder's reference display and profile_builder's section assembly
// (Week 2 Day 7's Pattern Profile) so both read the same summarization rules
// regardless of which payload kind originally produced the data.
export function summarizeExerciseOutput(value: unknown): string {
  if (value === undefined || value === null) return 'Not yet completed.';
  if (typeof value === 'string') return value;

  if (Array.isArray(value)) {
    if (value.every((item) => item && typeof item === 'object' && 'if_text' in item && 'then_text' in item)) {
      return value.map((plan) => `If ${plan.if_text}, then ${plan.then_text}.`).join(' ');
    }
    return value.join(', ');
  }

  if (typeof value === 'object') {
    const v = value as Record<string, unknown>;
    if (Array.isArray(v.selected)) {
      const write = typeof v.write === 'string' && v.write ? ` — ${v.write}` : '';
      return `${(v.selected as string[]).join(', ')}${write}`;
    }
    if (Array.isArray(v.links)) {
      return `Chain: ${(v.links as string[]).join(' → ')}. Weakest link: ${v.weakest_link ?? '—'}`;
    }
    if (Array.isArray(v.commitments)) {
      return `Committed to: ${(v.commitments as string[]).join('; ')}`;
    }
    if (Array.isArray(v.items)) {
      return (v.items as string[]).join(', ');
    }
  }

  return '';
}

// Compiles the Day 7 Pattern Profile (profile_builder) from this week's
// saves — each section pulls whatever's at its source key through the same
// summarizer, so a missing save reads as "Not yet completed" rather than
// crashing the assembly.
export function assembleProfileSections(
  sections: ProfileSection[],
  outputs: Record<string, unknown>
): Array<{ title: string; content: string }> {
  return sections.map((section) => ({
    title: section.title,
    content: summarizeExerciseOutput(outputs[section.source]),
  }));
}

// A couple of commitment_builder templates need "the first item of a list"
// rather than the full summary (Week 3 Day 7's {..._top} placeholders) —
// summarizeExerciseOutput joins everything, this picks just the lead item.
function firstItemOf(value: unknown): string | undefined {
  if (typeof value !== 'object' || value === null) return undefined;
  const v = value as Record<string, unknown>;
  if (Array.isArray(v.items) && typeof v.items[0] === 'string') return v.items[0];
  if (Array.isArray(v.selected) && typeof v.selected[0] === 'string') return v.selected[0];
  return undefined;
}

// Week 1 Day 7's two placeholders predate the generic "{input}_summary" /
// "{input}_top" convention below and keep their own bespoke resolution
// (buildAnchorWhySummary's natural-language join; emergency_card_line's own
// fallback line) — reused as-is by any later week's template that
// references the same placeholder name (Week 3 Day 7 reuses
// {anchor_why_summary} verbatim).
const SPECIAL_PLACEHOLDER_RESOLVERS: Record<string, (outputs: Record<string, unknown>) => string> = {
  anchor_why_summary: (outputs) => buildAnchorWhySummary(outputs.anchor_why as MultiSelectWriteOutput | undefined),
  emergency_card_line: (outputs) =>
    (typeof outputs.emergency_card_line === 'string' && outputs.emergency_card_line) ||
    'what this program can give me back',
};

// Fills every {placeholder} in a commitment_builder template from the
// exercise outputs it lists as `inputs`. An input with no matching
// placeholder in the template (e.g. Week 3 Day 7's tool_ranking, kept only
// for provenance) is simply never touched — no error either way.
export function resolveCommitmentTemplate(payload: CommitmentBuilderPayload, outputs: Record<string, unknown>): string {
  const placeholderNames = new Set(
    [...payload.template.matchAll(/\{([a-z0-9_]+)\}/g)].map((match) => match[1])
  );

  let result = payload.template;
  for (const placeholder of placeholderNames) {
    const token = `{${placeholder}}`;

    if (SPECIAL_PLACEHOLDER_RESOLVERS[placeholder]) {
      result = result.split(token).join(SPECIAL_PLACEHOLDER_RESOLVERS[placeholder](outputs));
      continue;
    }

    const summaryMatch = placeholder.match(/^(.+)_summary$/);
    const topMatch = placeholder.match(/^(.+)_top$/);

    if (summaryMatch) {
      const summary = summarizeExerciseOutput(outputs[summaryMatch[1]]);
      result = result.split(token).join(summary === 'Not yet completed.' ? 'what I noted' : summary);
    } else if (topMatch) {
      result = result.split(token).join(firstItemOf(outputs[topMatch[1]]) ?? 'what I noted');
    }
  }

  return result;
}
