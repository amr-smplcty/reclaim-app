import { buildDateFromParts } from '@/features/assessment/dobInput';

describe('buildDateFromParts — manual DD/MM/YYYY fallback validation', () => {
  it('builds a valid date from complete, valid parts', () => {
    const date = buildDateFromParts('15', '6', '2000');
    expect(date).not.toBeNull();
    expect(date!.getFullYear()).toBe(2000);
    expect(date!.getMonth()).toBe(5); // June (0-indexed)
    expect(date!.getDate()).toBe(15);
  });

  it('returns null while any part is incomplete (year must be 4 digits)', () => {
    expect(buildDateFromParts('', '6', '2000')).toBeNull();
    expect(buildDateFromParts('15', '', '2000')).toBeNull();
    expect(buildDateFromParts('15', '6', '20')).toBeNull();
  });

  it('rejects a day-of-month rollover (31 Feb is not a real date)', () => {
    expect(buildDateFromParts('31', '2', '2000')).toBeNull();
  });

  it('rejects a future date of birth', () => {
    const nextYear = new Date().getFullYear() + 1;
    expect(buildDateFromParts('1', '1', String(nextYear))).toBeNull();
  });

  it('rejects non-numeric parts', () => {
    expect(buildDateFromParts('ab', '6', '2000')).toBeNull();
  });
});
