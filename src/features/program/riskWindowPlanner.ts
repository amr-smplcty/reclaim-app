// Pure pieces behind RiskWindowPlanner.tsx (Week 5 Day 6) — derives the
// user's risk windows from their own Week 2 saves and lets them plant one
// activity per window, chosen from their own plans or free text.

import type { ChainBuilderOutput, MultiSelectWriteOutput, RiskWindowPlannerOutput } from '@/types/program';

// windows_source: ["trigger_map_external", "chain_analysis"] — every
// selected external trigger, plus the single weakest link in the user's
// chain (the "cheapest early exit," itself a risk point worth planting
// something into). De-duplicated in case the two happen to overlap.
export function deriveRiskWindows(
  triggerMapExternal: MultiSelectWriteOutput | undefined,
  chainAnalysis: ChainBuilderOutput | undefined
): string[] {
  const fromTriggers = triggerMapExternal?.selected ?? [];
  const fromChain = chainAnalysis?.weakest_link ? [chainAnalysis.weakest_link] : [];
  return Array.from(new Set([...fromTriggers, ...fromChain]));
}

// plant_options_sources names four differently-shaped saves (a
// committed_action_planner output for movement_plan, guided_list outputs
// for the rest) — this reads whichever shape shows up and returns plain
// activity strings from any of them.
export function extractPlantOptions(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .map((item) => (typeof item === 'string' ? item : (item as { action?: string })?.action))
      .filter((item): item is string => !!item);
  }
  if (value && typeof value === 'object' && Array.isArray((value as Record<string, unknown>).items)) {
    return (value as Record<string, unknown>).items as string[];
  }
  return [];
}

export function resolvePlantOptions(sources: string[], outputs: Record<string, unknown>): string[] {
  const all = sources.flatMap((key) => extractPlantOptions(outputs[key]));
  return Array.from(new Set(all));
}

export function allWindowsPlanted(windows: string[], plants: Record<string, string>): boolean {
  return windows.length > 0 && windows.every((w) => !!plants[w]?.trim());
}

export function buildPlannedOutput(windows: string[], plants: Record<string, string>): RiskWindowPlannerOutput {
  return {
    plants: windows.map((window) => ({ window, plant: plants[window] })),
    worksheetText: null,
  };
}

export function buildWorksheetOutput(text: string): RiskWindowPlannerOutput {
  return { plants: [], worksheetText: text };
}
