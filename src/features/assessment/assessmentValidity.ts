import {
  PPCS6_ITEM_COUNT,
  PPCS6_ITEM_MAX,
  PPCS6_ITEM_MIN,
  SCREENER_ITEM_COUNT,
  SCREENER_ITEM_MAX,
  SCREENER_ITEM_MIN,
} from '@/features/assessment/scoring';

// Scoring functions in scoring.ts are deliberately strict and throw on
// invalid input (CLAUDE.md rule 3 — correctness matters there). These guards
// let a screen check completeness/validity *before* calling a scorer, so a
// consumer can degrade gracefully instead of letting that throw reach a
// render. Type predicates so callers get a narrowed `number[]` for free.
function isCompleteResponseSet(
  responses: Array<number | null>,
  count: number,
  min: number,
  max: number
): responses is number[] {
  return responses.length === count && responses.every((r) => typeof r === 'number' && r >= min && r <= max);
}

export function hasCompletePpcs6Responses(responses: Array<number | null>): responses is number[] {
  return isCompleteResponseSet(responses, PPCS6_ITEM_COUNT, PPCS6_ITEM_MIN, PPCS6_ITEM_MAX);
}

export function hasCompleteScreenerResponses(responses: Array<number | null>): responses is number[] {
  return isCompleteResponseSet(responses, SCREENER_ITEM_COUNT, SCREENER_ITEM_MIN, SCREENER_ITEM_MAX);
}
