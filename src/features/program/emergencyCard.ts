import type { ToolId } from '@/features/toolkit/entitlement';
import { summarizeExerciseOutput } from '@/features/program/exerciseHelpers';
import type { EmergencyCardSectionState, EmergencyCardSourceSpec, ProfileBuilderOutput } from '@/types/program';

export interface EmergencyCardCompiledSection {
  title: string;
  source: string;
  render?: EmergencyCardSourceSpec['render'];
  content: string;
  // Present (possibly empty) only when render === 'action_buttons'.
  toolIds?: ToolId[];
  hidden: boolean;
}

// Free-text tool_ranking (Week 3 Day 6's tool_practice reflection, "My
// tools, ranked most-mine to least") never carries structured ToolIds — the
// user just wrote tool names in their own words. Deterministically recovers
// up to `maxItems` real tools, in the order they were first mentioned, by
// matching each tool's full label plus a couple of unambiguous short
// aliases. "shift" alone is deliberately excluded — it's ambiguous between
// Shift Environment and the 10-Minute Shift.
const TOOL_ALIASES: Record<ToolId, string[]> = {
  urge_surf: ['urge surf', 'surf'],
  breather: ['90-second breather', 'breather'],
  defusion: ['defusion'],
  shift_environment: ['shift environment'],
  ten_minute_shift: ['10-minute shift', 'ten-minute shift', 'ten minute shift', '10 minute shift'],
};

export function parseToolIdsFromRanking(text: string, maxItems: number): ToolId[] {
  const lower = text.toLowerCase();
  const found: Array<{ tool: ToolId; index: number }> = [];

  (Object.keys(TOOL_ALIASES) as ToolId[]).forEach((tool) => {
    let earliest = -1;
    for (const alias of TOOL_ALIASES[tool]) {
      const index = lower.indexOf(alias);
      if (index !== -1 && (earliest === -1 || index < earliest)) earliest = index;
    }
    if (earliest !== -1) found.push({ tool, index: earliest });
  });

  return found
    .sort((a, b) => a.index - b.index)
    .slice(0, maxItems)
    .map((f) => f.tool);
}

// A list-shaped output (guided_list's {items}) reads as its first
// `maxItems` entries joined plainly, not the summarizer's full join — the
// Emergency Card only has room for a shortlist (Week 6 Day 5's shift_list
// section caps at 2). Every other shape defers to the shared summarizer.
function contentForSource(source: string, outputs: Record<string, unknown>, maxItems?: number): string {
  const raw = outputs[source];
  if (raw && typeof raw === 'object' && Array.isArray((raw as { items?: unknown }).items)) {
    const items = (raw as { items: string[] }).items;
    if (items.length === 0) return 'Not yet completed.';
    return (maxItems ? items.slice(0, maxItems) : items).join(', ');
  }
  return summarizeExerciseOutput(raw);
}

// Week 6 Day 5's "My person" section sources `relapse_prevention_plan.person`
// — a dotted reference into another profile_builder's own output, matching
// the sub-key against that profile's section titles (case-insensitive
// substring, "person" matches "My person"). The only nested reference in
// the app today; kept local rather than a generic dotted-path resolver
// elsewhere, same one-off precedent as exerciseHelpers.ts's
// SPECIAL_PLACEHOLDER_RESOLVERS.
function resolveNestedSection(source: string, outputs: Record<string, unknown>): string {
  const [rootKey, subKey] = source.split('.');
  const root = outputs[rootKey] as ProfileBuilderOutput | undefined;
  if (!root || !Array.isArray(root.sections)) return 'Not yet completed.';
  const match = root.sections.find((s) => s.title.toLowerCase().includes(subKey.toLowerCase()));
  return match?.content || 'Not yet completed.';
}

// Compiles the Emergency Card from its content-defined default order plus
// whatever order/visibility the user chose in the builder (or plain
// defaults — hidden: false, default order — before it's ever been saved).
// Content is always recompiled fresh from current exerciseOutputs, never
// frozen at build time, so a later edit to (say) the shift list shows up
// without re-running the builder.
export function compileEmergencyCardSections(
  defaultOrder: EmergencyCardSourceSpec[],
  savedState: EmergencyCardSectionState[] | undefined,
  outputs: Record<string, unknown>
): EmergencyCardCompiledSection[] {
  const specBySource = new Map(defaultOrder.map((spec) => [spec.source, spec]));
  const orderedSources =
    savedState && savedState.length > 0 ? savedState.map((s) => s.source) : defaultOrder.map((s) => s.source);
  const hiddenBySource = new Map((savedState ?? []).map((s) => [s.source, s.hidden]));

  return orderedSources
    .map((source) => specBySource.get(source))
    .filter((spec): spec is EmergencyCardSourceSpec => !!spec)
    .map((spec) => {
      const content = spec.source.includes('.')
        ? resolveNestedSection(spec.source, outputs)
        : contentForSource(spec.source, outputs, spec.max_items);
      const toolIds =
        spec.render === 'action_buttons'
          ? parseToolIdsFromRanking(String(outputs[spec.source] ?? ''), spec.max_items ?? 2)
          : undefined;

      return {
        title: spec.title,
        source: spec.source,
        render: spec.render,
        content,
        toolIds,
        hidden: hiddenBySource.get(spec.source) ?? false,
      };
    });
}

export function visibleEmergencyCardSections(
  compiled: EmergencyCardCompiledSection[]
): EmergencyCardCompiledSection[] {
  return compiled.filter((section) => !section.hidden);
}
