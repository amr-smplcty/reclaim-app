// Commitment Goals (CLINICAL_SPEC §9, PRODUCT_SPEC §5.5) — opt-in module,
// introduced end of Week 1. Pure state machine; the store layer just calls
// these and persists the result. All 6 hard design rules:
//   1. Opt-in only (enforced by the UI gate, not this module).
//   2. Stake process, not abstinence — computeDayCreditFraction weights
//      verifiable engagement (lesson, check-in) alongside self-reported
//      clean days, and a lapse-with-debrief still earns partial credit.
//   3. No confiscation, no zeroing — accumulatedCredit and jarTotal only
//      ever grow; a lapse delays the unlock (applyLapse), it never reduces
//      either.
//   4. Graduated ladder (shaping) — LADDER_TIERS, 3 completions to leave the
//      7-day tier, 1 each thereafter; demotion never happens automatically
//      (only stepDown, an explicit user action).
//   5. Copy tone lives in the UI layer, not here.
//   6. v2 real-money deposits are out of scope for v1.

export const LADDER_TIERS = [7, 14, 30, 90] as const;
export type LadderTier = (typeof LADDER_TIERS)[number];

// 7-day tier requires 3 completions to promote (shaping); every tier above
// it promotes after a single completion.
const PROMOTION_COMPLETIONS: Record<LadderTier, number> = { 7: 3, 14: 1, 30: 1, 90: Infinity };

const LAPSE_DELAY_DAYS = 2;

export interface DayCreditInput {
  lessonCompleted: boolean;
  checkinCompleted: boolean;
  cleanDay: boolean;
  // Only consulted when cleanDay is false — did the user complete the lapse
  // debrief? A lapse without one still isn't "zeroed" globally (the jar and
  // ladder tier are untouched), it just earns no credit for this component.
  lapseDebriefed: boolean;
}

export function computeDayCreditFraction(day: DayCreditInput): number {
  const lessonCredit = day.lessonCompleted ? 1 / 3 : 0;
  const checkinCredit = day.checkinCompleted ? 1 / 3 : 0;
  const cleanCredit = day.cleanDay ? 1 / 3 : day.lapseDebriefed ? 1 / 6 : 0;
  return lessonCredit + checkinCredit + cleanCredit;
}

export interface GoalHistoryEntry {
  tier: LadderTier;
  completedAt: string;
}

export interface CommitmentGoalState {
  tier: LadderTier;
  tierCompletions: number;
  accumulatedCredit: number;
  delayDays: number;
  lapseCount: number;
  startedAt: string;
  jarTotal: number;
  history: GoalHistoryEntry[];
}

export function createGoal(startedAt: string): CommitmentGoalState {
  return {
    tier: LADDER_TIERS[0],
    tierCompletions: 0,
    accumulatedCredit: 0,
    delayDays: 0,
    lapseCount: 0,
    startedAt,
    jarTotal: 0,
    history: [],
  };
}

export function requiredCreditDays(state: CommitmentGoalState): number {
  return state.tier + state.delayDays;
}

export function isGoalComplete(state: CommitmentGoalState): boolean {
  return state.accumulatedCredit >= requiredCreditDays(state);
}

export function recordDayCredit(
  state: CommitmentGoalState,
  day: DayCreditInput,
  dailyPledgeAmount: number
): CommitmentGoalState {
  const fraction = computeDayCreditFraction(day);
  return {
    ...state,
    accumulatedCredit: state.accumulatedCredit + fraction,
    jarTotal: state.jarTotal + fraction * dailyPledgeAmount,
  };
}

// A lapse delays the unlock — it never reduces accumulatedCredit or jarTotal
// (rule 3). Capped at the tier's own length, so a run of lapses can at most
// double the time required, never drag on indefinitely.
export function applyLapse(state: CommitmentGoalState): CommitmentGoalState {
  const cappedDelay = Math.min(state.delayDays + LAPSE_DELAY_DAYS, state.tier);
  return { ...state, delayDays: cappedDelay, lapseCount: state.lapseCount + 1 };
}

function nextTier(tier: LadderTier): LadderTier {
  const index = LADDER_TIERS.indexOf(tier);
  return index < LADDER_TIERS.length - 1 ? LADDER_TIERS[index + 1] : tier;
}

// Call after recordDayCredit each day; a no-op if the goal isn't complete
// yet. On completion, always logs to history (never zeroed) and starts a
// fresh credit cycle — promoting a tier once PROMOTION_COMPLETIONS is met,
// otherwise staying at the same tier for another cycle (the 7-day tier's
// x3 shaping). Tier 90 never has anywhere to promote to, so it just cycles
// in place forever.
export function promoteIfComplete(state: CommitmentGoalState, completedAt: string): CommitmentGoalState {
  if (!isGoalComplete(state)) return state;

  const tierCompletions = state.tierCompletions + 1;
  const history = [...state.history, { tier: state.tier, completedAt }];
  const promotes = tierCompletions >= PROMOTION_COMPLETIONS[state.tier];

  return {
    ...state,
    tier: promotes ? nextTier(state.tier) : state.tier,
    tierCompletions: promotes ? 0 : tierCompletions,
    accumulatedCredit: 0,
    delayDays: 0,
    history,
  };
}

// Demotion never happens automatically anywhere in this module — this is
// the ONLY way tier ever decreases, and it's only ever invoked by an
// explicit user action in the UI (CLINICAL_SPEC §9 rule 4).
export function stepDown(state: CommitmentGoalState): CommitmentGoalState {
  const index = LADDER_TIERS.indexOf(state.tier);
  const tier = index > 0 ? LADDER_TIERS[index - 1] : state.tier;
  return { ...state, tier, tierCompletions: 0, accumulatedCredit: 0, delayDays: 0 };
}
