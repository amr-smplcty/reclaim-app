import { PPCS6_SCORE_MAX, PPCS6_SCORE_MIN, type Ppcs6Band } from '@/features/assessment/scoring';
import type { ThemeColor } from '@/theme/tokens';

// Results screen "payoff scene" (PRODUCT_SPEC §4): score plotted on a visual
// scale, band-colored from the token system. Pure helpers so the mapping is
// unit-testable without rendering the screen.
export function scoreScaleFraction(score: number): number {
  return (score - PPCS6_SCORE_MIN) / (PPCS6_SCORE_MAX - PPCS6_SCORE_MIN);
}

// Bands A/B sit below the clinical cutoff (CLAUDE.md rule 3: PPCS-6 cutoff
// ≥20); C/D are at or above it. Only 3 semantic tokens exist, so C and D
// share "danger" — both already crossed the same threshold.
export function bandColorToken(band: Ppcs6Band): ThemeColor {
  switch (band) {
    case 'A':
      return 'success';
    case 'B':
      return 'caution';
    case 'C':
    case 'D':
      return 'danger';
  }
}
