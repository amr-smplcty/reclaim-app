import { canUseTool, isFreeForeverTool } from '@/features/toolkit/entitlement';

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
