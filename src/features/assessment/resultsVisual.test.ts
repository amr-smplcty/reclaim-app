import { bandColorToken, scoreScaleFraction } from '@/features/assessment/resultsVisual';
import { PPCS6_SCORE_MAX, PPCS6_SCORE_MIN } from '@/features/assessment/scoring';

describe('scoreScaleFraction', () => {
  it('is 0 at the minimum possible score', () => {
    expect(scoreScaleFraction(PPCS6_SCORE_MIN)).toBe(0);
  });

  it('is 1 at the maximum possible score', () => {
    expect(scoreScaleFraction(PPCS6_SCORE_MAX)).toBe(1);
  });

  it('is a proportional fraction in between', () => {
    // 24 is a third of the way from 6 to 42 (36-point range)
    expect(scoreScaleFraction(18)).toBeCloseTo(1 / 3);
  });
});

describe('bandColorToken', () => {
  it('uses success for band A (below cutoff)', () => {
    expect(bandColorToken('A')).toBe('success');
  });

  it('uses caution for band B (below cutoff, emerging)', () => {
    expect(bandColorToken('B')).toBe('caution');
  });

  // DESIGN_SYSTEM Guardrail 2: a starting score is not an error, so C/D use
  // caution (not destructive/red). Band label + framing carry the distinction.
  it('uses caution for bands C and D (at/above the clinical cutoff), never destructive', () => {
    expect(bandColorToken('C')).toBe('caution');
    expect(bandColorToken('D')).toBe('caution');
  });

  it('never colors an assessment band with destructive (reserved for data actions)', () => {
    for (const band of ['A', 'B', 'C', 'D'] as const) {
      expect(bandColorToken(band)).not.toBe('destructive');
    }
  });
});
