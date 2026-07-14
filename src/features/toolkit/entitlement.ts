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
