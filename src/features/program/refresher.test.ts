import { assembleRefresherWeek, assembleRefresherWeekFromModules, shouldOfferRefresherWeek } from '@/features/program/refresher';
import { getProgramModules } from '@/lib/content/week';
import type { AssessmentEntry } from '@/features/assessment/useAssessmentHistoryStore';
import type { ProgramModule } from '@/types/content';

function entry(partial: Partial<AssessmentEntry> & Pick<AssessmentEntry, 'id' | 'timestamp' | 'score' | 'timeframe'>): AssessmentEntry {
  return { band: 'A', responses: [], instrumentVersion: '1.0.0', ...partial };
}

describe('shouldOfferRefresherWeek — CLINICAL_SPEC §4: score rises >= 6 across two consecutive re-assessments', () => {
  it('is false with fewer than two re-assessments (only the onboarding baseline)', () => {
    const entries = [entry({ id: 'baseline', timestamp: '2026-01-01T00:00:00.000Z', score: 20, timeframe: 'past_6_months' })];
    expect(shouldOfferRefresherWeek(entries)).toBe(false);
  });

  it('is false with exactly one re-assessment (needs two to measure a rise between)', () => {
    const entries = [
      entry({ id: 'baseline', timestamp: '2026-01-01T00:00:00.000Z', score: 20, timeframe: 'past_6_months' }),
      entry({ id: 'r1', timestamp: '2026-01-15T00:00:00.000Z', score: 22, timeframe: 'past_2_weeks' }),
    ];
    expect(shouldOfferRefresherWeek(entries)).toBe(false);
  });

  it('is false when the rise between the two most recent re-assessments is under 6', () => {
    const entries = [
      entry({ id: 'baseline', timestamp: '2026-01-01T00:00:00.000Z', score: 20, timeframe: 'past_6_months' }),
      entry({ id: 'r1', timestamp: '2026-01-15T00:00:00.000Z', score: 14, timeframe: 'past_2_weeks' }),
      entry({ id: 'r2', timestamp: '2026-01-29T00:00:00.000Z', score: 19, timeframe: 'past_2_weeks' }),
    ];
    expect(shouldOfferRefresherWeek(entries)).toBe(false);
  });

  it('is true when the rise between the two most recent re-assessments is exactly 6', () => {
    const entries = [
      entry({ id: 'r1', timestamp: '2026-01-15T00:00:00.000Z', score: 10, timeframe: 'past_2_weeks' }),
      entry({ id: 'r2', timestamp: '2026-01-29T00:00:00.000Z', score: 16, timeframe: 'past_2_weeks' }),
    ];
    expect(shouldOfferRefresherWeek(entries)).toBe(true);
  });

  it('is true when the rise exceeds 6', () => {
    const entries = [
      entry({ id: 'r1', timestamp: '2026-01-15T00:00:00.000Z', score: 8, timeframe: 'past_2_weeks' }),
      entry({ id: 'r2', timestamp: '2026-01-29T00:00:00.000Z', score: 20, timeframe: 'past_2_weeks' }),
    ];
    expect(shouldOfferRefresherWeek(entries)).toBe(true);
  });

  it('is false when the score fell or held steady (never offers on improvement)', () => {
    const entries = [
      entry({ id: 'r1', timestamp: '2026-01-15T00:00:00.000Z', score: 20, timeframe: 'past_2_weeks' }),
      entry({ id: 'r2', timestamp: '2026-01-29T00:00:00.000Z', score: 12, timeframe: 'past_2_weeks' }),
    ];
    expect(shouldOfferRefresherWeek(entries)).toBe(false);
  });

  it('ignores the onboarding baseline entry — only compares the two most recent TRUE re-assessments', () => {
    // Baseline (past_6_months) is high, then two close re-assessments with a
    // small rise between them — the baseline must never be one side of the delta.
    const entries = [
      entry({ id: 'baseline', timestamp: '2026-01-01T00:00:00.000Z', score: 5, timeframe: 'past_6_months' }),
      entry({ id: 'r1', timestamp: '2026-01-15T00:00:00.000Z', score: 20, timeframe: 'past_2_weeks' }),
      entry({ id: 'r2', timestamp: '2026-01-29T00:00:00.000Z', score: 21, timeframe: 'past_2_weeks' }),
    ];
    expect(shouldOfferRefresherWeek(entries)).toBe(false);
  });

  it('is order-independent — sorts by timestamp, not array order', () => {
    const entries = [
      entry({ id: 'r2', timestamp: '2026-01-29T00:00:00.000Z', score: 20, timeframe: 'past_2_weeks' }),
      entry({ id: 'r1', timestamp: '2026-01-15T00:00:00.000Z', score: 10, timeframe: 'past_2_weeks' }),
    ];
    expect(shouldOfferRefresherWeek(entries)).toBe(true);
  });
});

describe('assembleRefresherWeek — interleaved Week 2 + Week 3 days, 7 total', () => {
  const week2: ProgramModule = {
    week: 2,
    title: 'Know Your Pattern',
    days: Array.from({ length: 7 }, (_, i) => ({
      day: i + 1,
      lesson: { id: `w2d${i + 1}_lesson`, title: `W2D${i + 1}`, body_md: 'x', read_minutes: 3, audio_url: null, reflection: { type: 'free_text', prompt: 'p' } },
      exercise: { id: `w2d${i + 1}_ex`, type: 'worksheet', title: `W2D${i + 1} exercise`, steps: ['s'], payload: { kind: 'guided_list', save_to: 'x' } },
    })),
  };
  const week3: ProgramModule = {
    week: 3,
    title: 'Ride the Urge',
    days: Array.from({ length: 7 }, (_, i) => ({
      day: i + 1,
      lesson: { id: `w3d${i + 1}_lesson`, title: `W3D${i + 1}`, body_md: 'x', read_minutes: 3, audio_url: null, reflection: { type: 'free_text', prompt: 'p' } },
      exercise: { id: `w3d${i + 1}_ex`, type: 'worksheet', title: `W3D${i + 1} exercise`, steps: ['s'], payload: { kind: 'guided_list', save_to: 'x' } },
    })),
  };

  it('produces exactly 7 days, interleaved starting with Week 2', () => {
    const days = assembleRefresherWeek(week2, week3);
    expect(days).toHaveLength(7);
    expect(days.map((d) => d.day.lesson.id)).toEqual([
      'w2d1_lesson',
      'w3d1_lesson',
      'w2d2_lesson',
      'w3d2_lesson',
      'w2d3_lesson',
      'w3d3_lesson',
      'w2d4_lesson',
    ]);
  });

  it('carries the original week number alongside each day, for redo deep-links', () => {
    const days = assembleRefresherWeek(week2, week3);
    expect(days.map((d) => d.week)).toEqual([2, 3, 2, 3, 2, 3, 2]);
  });

  it('reuses the real day objects unmodified — no content invented or altered', () => {
    const days = assembleRefresherWeek(week2, week3);
    expect(days[0].day).toBe(week2.days[0]);
    expect(days[1].day).toBe(week3.days[0]);
  });
});

describe('assembleRefresherWeekFromModules — real content/week2.json + week3.json', () => {
  it('assembles 7 real days from the actual loaded program', () => {
    const days = assembleRefresherWeekFromModules(getProgramModules());
    expect(days).toHaveLength(7);
    expect(days[0].day.lesson.id).toBe('w2d1_lesson');
    expect(days[1].day.lesson.id).toBe('w3d1_lesson');
    expect(days[6].day.lesson.id).toBe('w2d4_lesson');
  });

  it('degrades to an empty list, never throws, if a required week is missing', () => {
    expect(assembleRefresherWeekFromModules([])).toEqual([]);
  });
});
