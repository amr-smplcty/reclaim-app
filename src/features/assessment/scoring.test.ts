import {
  scorePpcs6,
  getPpcs6Band,
  scorePhq2,
  scoreGad2,
  isMoodElevated,
  calculateAge,
  isMinor,
} from '@/features/assessment/scoring';

describe('scorePpcs6', () => {
  it('sums 6 items', () => {
    expect(scorePpcs6([1, 1, 1, 1, 1, 1])).toBe(6);
    expect(scorePpcs6([7, 7, 7, 7, 7, 7])).toBe(42);
    expect(scorePpcs6([3, 4, 5, 2, 1, 6])).toBe(21);
  });

  it('throws if not exactly 6 responses', () => {
    expect(() => scorePpcs6([1, 2, 3])).toThrow();
    expect(() => scorePpcs6([1, 2, 3, 4, 5, 6, 7])).toThrow();
  });

  it('throws if any item is outside the 1-7 scale', () => {
    expect(() => scorePpcs6([0, 1, 1, 1, 1, 1])).toThrow();
    expect(() => scorePpcs6([1, 1, 1, 1, 1, 8])).toThrow();
  });
});

describe('getPpcs6Band — CLINICAL_SPEC §2.3 table, exhaustive', () => {
  it('band A: 6-13, Low indication', () => {
    for (const score of [6, 10, 13]) {
      const result = getPpcs6Band(score);
      expect(result.band).toBe('A');
      expect(result.label).toBe('Low indication');
      expect(result.showResourcesLink).toBe(false);
    }
  });

  it('band B: 14-19, Emerging risk', () => {
    for (const score of [14, 17, 19]) {
      const result = getPpcs6Band(score);
      expect(result.band).toBe('B');
      expect(result.label).toBe('Emerging risk');
      expect(result.showResourcesLink).toBe(false);
    }
  });

  it('band C: 20-28, Likely problematic use', () => {
    for (const score of [20, 24, 28]) {
      const result = getPpcs6Band(score);
      expect(result.band).toBe('C');
      expect(result.label).toBe('Likely problematic use');
      expect(result.showResourcesLink).toBe(false);
    }
  });

  it('band D: 29-42, High severity, recommends professional support', () => {
    for (const score of [29, 35, 42]) {
      const result = getPpcs6Band(score);
      expect(result.band).toBe('D');
      expect(result.label).toBe('High severity');
      expect(result.showResourcesLink).toBe(true);
    }
  });

  it('boundary transitions land in the correct band', () => {
    expect(getPpcs6Band(13).band).toBe('A');
    expect(getPpcs6Band(14).band).toBe('B');
    expect(getPpcs6Band(19).band).toBe('B');
    expect(getPpcs6Band(20).band).toBe('C');
    expect(getPpcs6Band(28).band).toBe('C');
    expect(getPpcs6Band(29).band).toBe('D');
  });

  it('throws outside the valid 6-42 range', () => {
    expect(() => getPpcs6Band(5)).toThrow();
    expect(() => getPpcs6Band(43)).toThrow();
  });
});

describe('scorePhq2 / scoreGad2', () => {
  it('sums 2 items on a 0-3 scale', () => {
    expect(scorePhq2([0, 0])).toBe(0);
    expect(scorePhq2([3, 3])).toBe(6);
    expect(scoreGad2([1, 2])).toBe(3);
  });

  it('throws if not exactly 2 responses or outside 0-3', () => {
    expect(() => scorePhq2([1])).toThrow();
    expect(() => scorePhq2([1, 4])).toThrow();
    expect(() => scoreGad2([-1, 1])).toThrow();
  });
});

describe('isMoodElevated — cutoff ≥3 on either screener', () => {
  it('is false when both are below 3', () => {
    expect(isMoodElevated(2, 2)).toBe(false);
  });

  it('is true when either reaches 3', () => {
    expect(isMoodElevated(3, 0)).toBe(true);
    expect(isMoodElevated(0, 3)).toBe(true);
    expect(isMoodElevated(3, 3)).toBe(true);
  });
});

describe('calculateAge', () => {
  it('computes full years elapsed', () => {
    expect(calculateAge(new Date('2000-06-15'), new Date('2026-06-15'))).toBe(26);
    expect(calculateAge(new Date('2000-06-15'), new Date('2026-06-14'))).toBe(25);
    expect(calculateAge(new Date('2008-07-10'), new Date('2026-07-10'))).toBe(18);
    expect(calculateAge(new Date('2008-07-11'), new Date('2026-07-10'))).toBe(17);
  });
});

describe('isMinor', () => {
  it('is true under 18, false at or above 18', () => {
    expect(isMinor(17)).toBe(true);
    expect(isMinor(0)).toBe(true);
    expect(isMinor(18)).toBe(false);
    expect(isMinor(40)).toBe(false);
  });
});
