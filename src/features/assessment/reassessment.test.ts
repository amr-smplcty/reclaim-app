import {
  REASSESSMENT_INTERVAL_DAYS,
  daysUntilNextReassessment,
  formatScoreDelta,
  isReassessmentDue,
  scoreDelta,
} from '@/features/assessment/reassessment';
import type { AssessmentEntry } from '@/features/assessment/useAssessmentHistoryStore';

function entryAt(timestamp: string, score: number): AssessmentEntry {
  return { id: timestamp, timestamp, score, band: 'C', timeframe: 'past_6_months', responses: [4, 4, 4, 4, 4, 4] };
}

describe('isReassessmentDue', () => {
  it('is true when no assessment has ever been taken', () => {
    expect(isReassessmentDue(null, new Date('2026-01-15'))).toBe(true);
  });

  it('is false before 14 days have elapsed', () => {
    expect(isReassessmentDue('2026-01-01T00:00:00.000Z', new Date('2026-01-10T00:00:00.000Z'))).toBe(false);
  });

  it('is true exactly at 14 days', () => {
    expect(isReassessmentDue('2026-01-01T00:00:00.000Z', new Date('2026-01-15T00:00:00.000Z'))).toBe(true);
  });

  it('is true well past 14 days (overdue)', () => {
    expect(isReassessmentDue('2026-01-01T00:00:00.000Z', new Date('2026-02-01T00:00:00.000Z'))).toBe(true);
  });
});

describe('daysUntilNextReassessment', () => {
  it('returns the full interval right after an assessment', () => {
    expect(daysUntilNextReassessment('2026-01-01T00:00:00.000Z', new Date('2026-01-01T00:00:00.000Z'))).toBe(
      REASSESSMENT_INTERVAL_DAYS
    );
  });

  it('counts down as days pass', () => {
    expect(daysUntilNextReassessment('2026-01-01T00:00:00.000Z', new Date('2026-01-10T00:00:00.000Z'))).toBe(5);
  });

  it('goes negative once overdue', () => {
    expect(daysUntilNextReassessment('2026-01-01T00:00:00.000Z', new Date('2026-01-20T00:00:00.000Z'))).toBe(-5);
  });
});

describe('scoreDelta', () => {
  it('is null with fewer than 2 entries', () => {
    expect(scoreDelta([])).toBeNull();
    expect(scoreDelta([entryAt('2026-01-01', 27)])).toBeNull();
  });

  it('is negative when the score improved (fell)', () => {
    const entries = [entryAt('2026-01-01', 27), entryAt('2026-01-15', 21)];
    expect(scoreDelta(entries)).toBe(-6);
  });

  it('is positive when the score rose', () => {
    const entries = [entryAt('2026-01-01', 20), entryAt('2026-01-15', 24)];
    expect(scoreDelta(entries)).toBe(4);
  });

  it('compares the two most recent entries regardless of array order', () => {
    const entries = [entryAt('2026-01-15', 21), entryAt('2026-01-01', 27)];
    expect(scoreDelta(entries)).toBe(-6);
  });
});

describe('formatScoreDelta', () => {
  it('frames an improvement with a minus sign', () => {
    expect(formatScoreDelta(-6)).toBe('−6 points');
  });

  it('frames a rise with a plus sign', () => {
    expect(formatScoreDelta(4)).toBe('+4 points');
  });

  it('frames no change plainly', () => {
    expect(formatScoreDelta(0)).toBe('No change');
  });
});
