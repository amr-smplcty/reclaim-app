import { PPCS6_SCORE_MAX, PPCS6_SCORE_MIN, type Ppcs6Band } from '@/features/assessment/scoring';
import type { ThemeColor } from '@/theme/tokens';

// Results screen "payoff scene" (PRODUCT_SPEC §4): score plotted on a visual
// scale, band-colored from the token system. Pure helpers so the mapping is
// unit-testable without rendering the screen.
export function scoreScaleFraction(score: number): number {
  return (score - PPCS6_SCORE_MIN) / (PPCS6_SCORE_MAX - PPCS6_SCORE_MIN);
}

// Bands A/B sit below the clinical cutoff (CLAUDE.md rule 3: PPCS-6 cutoff
// ≥20); C/D are at or above it. Per DESIGN_SYSTEM Guardrail 2 ("no error-red
// for user behaviour"), a person's honest starting score is not an error
// state, so C/D use `caution` (warm ochre — "this is data worth attention"),
// never `destructive`/red, which would read as shame at the results reveal.
// Color never carries the meaning alone (DESIGN_SYSTEM §10): the band label
// and its plain-language framing distinguish B (below cutoff, emerging) from
// C/D (at/above it). `destructive` stays reserved for irreversible data
// actions only (delete account/journal).
export function bandColorToken(band: Ppcs6Band): ThemeColor {
  switch (band) {
    case 'A':
      return 'success';
    case 'B':
    case 'C':
    case 'D':
      return 'caution';
  }
}
