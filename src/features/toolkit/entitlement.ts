import type { Href } from 'expo-router';

export type ToolId = 'urge_surf' | 'breather' | 'defusion' | 'shift_environment' | 'ten_minute_shift';

// Ethical floor (PRODUCT_SPEC §6): never paywall someone mid-crisis. Real
// entitlement comes from RevenueCat once Epic 3 (blocked on Apple Developer
// enrollment) lands — until then callers pass a stand-in `hasProEntitlement`.
const FREE_FOREVER_TOOLS: ToolId[] = ['urge_surf', 'breather'];

export function isFreeForeverTool(tool: ToolId): boolean {
  return FREE_FOREVER_TOOLS.includes(tool);
}

export function canUseTool(tool: ToolId, hasProEntitlement: boolean): boolean {
  return isFreeForeverTool(tool) || hasProEntitlement;
}

// Shared id -> route/label maps — used by ToolkitHome's tool list and by the
// tool_practice exercise (Week 3, CLINICAL_SPEC §4) to launch any named tool
// in practice mode from a lesson exercise.
export const TOOL_ROUTES: Record<ToolId, Href> = {
  urge_surf: '/(toolkit)/urge-surf' as Href,
  breather: '/(toolkit)/breather' as Href,
  defusion: '/(toolkit)/defusion' as Href,
  shift_environment: '/(toolkit)/shift-environment' as Href,
  ten_minute_shift: '/(toolkit)/ten-minute-shift' as Href,
};

export const TOOL_LABELS: Record<ToolId, string> = {
  urge_surf: 'Urge Surf',
  breather: '90-Second Breather',
  defusion: 'Defusion',
  shift_environment: 'Shift Environment',
  ten_minute_shift: '10-Minute Shift',
};
