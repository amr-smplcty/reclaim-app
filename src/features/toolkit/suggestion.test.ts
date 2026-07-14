import { suggestToolForIntensity, describeDelta, shouldOfferUrgeSurfEscalation } from '@/features/toolkit/suggestion';

describe('suggestToolForIntensity — CLINICAL_SPEC §5.1 threshold', () => {
  it('suggests Urge Surf at or above 6', () => {
    expect(suggestToolForIntensity(6)).toBe('urge_surf');
    expect(suggestToolForIntensity(7)).toBe('urge_surf');
    expect(suggestToolForIntensity(10)).toBe('urge_surf');
  });

  it('suggests Breather below 6', () => {
    expect(suggestToolForIntensity(5)).toBe('breather');
    expect(suggestToolForIntensity(1)).toBe('breather');
  });

  it('throws outside the 1-10 scale', () => {
    expect(() => suggestToolForIntensity(0)).toThrow();
    expect(() => suggestToolForIntensity(11)).toThrow();
  });
});

describe('describeDelta — better/same/worse framing over the numeric delta', () => {
  it('is "better" when the post rating is lower', () => {
    expect(describeDelta(8, 4)).toBe('better');
  });

  it('is "same" when unchanged', () => {
    expect(describeDelta(5, 5)).toBe('same');
  });

  it('is "worse" when the post rating is higher', () => {
    expect(describeDelta(4, 6)).toBe('worse');
  });
});

describe('shouldOfferUrgeSurfEscalation — CLINICAL_SPEC §5.5', () => {
  it('offers escalation when the post rating is at or above the pre rating', () => {
    expect(shouldOfferUrgeSurfEscalation(5, 5)).toBe(true);
    expect(shouldOfferUrgeSurfEscalation(4, 7)).toBe(true);
  });

  it('does not offer escalation when the urge improved', () => {
    expect(shouldOfferUrgeSurfEscalation(8, 3)).toBe(false);
  });
});
