// Growth visual (PRODUCT_SPEC §5.5) — a minimal landscape/tree driven
// strictly by practice behaviors the user controls (process), never by
// outcomes like clean days. Every input is an append-only counter, and the
// score/stage mapping is pure addition + a floor division, so growth can
// only ever go up — there is no operation anywhere that subtracts.

export interface GrowthEvents {
  sessionsCompleted: number;
  urgesSurfed: number;
  debriefsDone: number;
  checkins: number;
}

export function computeGrowthScore(events: GrowthEvents): number {
  return events.sessionsCompleted + events.urgesSurfed + events.debriefsDone + events.checkins;
}

// Discrete visual stages (seed -> sprout -> sapling -> young tree -> full
// tree -> flourishing) — calm, not a slot-machine meter.
export const GROWTH_STAGE_COUNT = 6;
const SCORE_PER_STAGE = 8;

export function computeGrowthStage(score: number): number {
  return Math.min(GROWTH_STAGE_COUNT - 1, Math.floor(score / SCORE_PER_STAGE));
}
