import { hasCompletePpcs6Responses, hasCompleteScreenerResponses } from '@/features/assessment/assessmentValidity';

describe('hasCompletePpcs6Responses', () => {
  it('is true for 6 in-range responses', () => {
    expect(hasCompletePpcs6Responses([1, 2, 3, 4, 5, 6])).toBe(true);
    expect(hasCompletePpcs6Responses([7, 7, 7, 7, 7, 7])).toBe(true);
  });

  it('is false for the default all-null state (paywall reset / never started)', () => {
    expect(hasCompletePpcs6Responses([null, null, null, null, null, null])).toBe(false);
  });

  it('is false when only some items are answered', () => {
    expect(hasCompletePpcs6Responses([1, 2, 3, null, null, null])).toBe(false);
  });

  it('is false for a wrong-length array', () => {
    expect(hasCompletePpcs6Responses([1, 2, 3, 4, 5])).toBe(false);
    expect(hasCompletePpcs6Responses([1, 2, 3, 4, 5, 6, 7])).toBe(false);
  });

  it('is false when a value is out of the 1-7 scale', () => {
    expect(hasCompletePpcs6Responses([0, 2, 3, 4, 5, 6])).toBe(false);
    expect(hasCompletePpcs6Responses([1, 2, 3, 4, 5, 8])).toBe(false);
  });
});

describe('hasCompleteScreenerResponses (PHQ-2 / GAD-2)', () => {
  it('is true for 2 in-range responses', () => {
    expect(hasCompleteScreenerResponses([0, 3])).toBe(true);
  });

  it('is false for the default all-null state', () => {
    expect(hasCompleteScreenerResponses([null, null])).toBe(false);
  });

  it('is false for a wrong-length or out-of-range array', () => {
    expect(hasCompleteScreenerResponses([0])).toBe(false);
    expect(hasCompleteScreenerResponses([0, 4])).toBe(false);
  });
});
