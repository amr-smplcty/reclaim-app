// Today can show at most ONE banner at a time — the no-shame welcome-back line
// must never stack with others (PRODUCT_SPEC §5.7). This is the single
// authority for that priority order (Epic 14):
//   crisis surfaces > re-assessment due > risky-window offer > welcome back
// Crisis is highest: a crisis surface is a full-screen interrupt, so when one
// is active no Today banner shows at all — the caller renders nothing for it.
export type BannerId = 'crisis' | 'reassessment_due' | 'risky_window_offer' | 'welcome_back';

const PRIORITY: BannerId[] = ['crisis', 'reassessment_due', 'risky_window_offer', 'welcome_back'];

export function resolveTopBanner(active: Partial<Record<BannerId, boolean>>): BannerId | null {
  return PRIORITY.find((id) => active[id]) ?? null;
}
