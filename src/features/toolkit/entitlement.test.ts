import { canUseTool, isFreeForeverTool, TOOL_LABELS, TOOL_ROUTES, type ToolId } from '@/features/toolkit/entitlement';

const ALL_TOOLS: ToolId[] = ['urge_surf', 'breather', 'defusion', 'shift_environment', 'ten_minute_shift'];

describe('isFreeForeverTool — PRODUCT_SPEC §6 ethical floor', () => {
  it('is true for Urge Surf and Breather', () => {
    expect(isFreeForeverTool('urge_surf')).toBe(true);
    expect(isFreeForeverTool('breather')).toBe(true);
  });

  it('is false for the other tools', () => {
    expect(isFreeForeverTool('defusion')).toBe(false);
    expect(isFreeForeverTool('shift_environment')).toBe(false);
    expect(isFreeForeverTool('ten_minute_shift')).toBe(false);
  });
});

describe('canUseTool', () => {
  it('always allows free-forever tools, entitled or not', () => {
    expect(canUseTool('urge_surf', false)).toBe(true);
    expect(canUseTool('urge_surf', true)).toBe(true);
    expect(canUseTool('breather', false)).toBe(true);
  });

  it('gates the other tools on entitlement', () => {
    expect(canUseTool('defusion', false)).toBe(false);
    expect(canUseTool('defusion', true)).toBe(true);
    expect(canUseTool('ten_minute_shift', false)).toBe(false);
    expect(canUseTool('ten_minute_shift', true)).toBe(true);
  });
});

describe('TOOL_ROUTES / TOOL_LABELS', () => {
  it('has a route and a label for every tool (tool_practice needs to launch any of them)', () => {
    for (const tool of ALL_TOOLS) {
      expect(typeof TOOL_ROUTES[tool]).toBe('string');
      expect(typeof TOOL_LABELS[tool]).toBe('string');
      expect(TOOL_LABELS[tool].length).toBeGreaterThan(0);
    }
  });
});
