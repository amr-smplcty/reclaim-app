import { useAssessmentHistoryStore } from '@/features/assessment/useAssessmentHistoryStore';
import { getPpcs6Assessment } from '@/lib/content';

describe('useAssessmentHistoryStore', () => {
  afterEach(() => {
    useAssessmentHistoryStore.getState().reset();
  });

  it('starts empty', () => {
    expect(useAssessmentHistoryStore.getState().entries).toEqual([]);
  });

  it('records an assessment with a computed score and band', () => {
    const entry = useAssessmentHistoryStore
      .getState()
      .recordAssessment([7, 7, 7, 7, 7, 7], 'past_6_months');

    expect(entry.score).toBe(42);
    expect(entry.band).toBe('D');
    expect(entry.timeframe).toBe('past_6_months');
    expect(useAssessmentHistoryStore.getState().entries).toEqual([entry]);
  });

  it('never overwrites — every call appends a new entry', () => {
    useAssessmentHistoryStore.getState().recordAssessment([7, 7, 7, 7, 7, 7], 'past_6_months');
    useAssessmentHistoryStore.getState().recordAssessment([1, 1, 1, 1, 1, 1], 'past_2_weeks');

    const { entries } = useAssessmentHistoryStore.getState();
    expect(entries).toHaveLength(2);
    expect(entries[0].score).toBe(42);
    expect(entries[1].score).toBe(6);
  });

  it('assigns each entry a unique id and a timestamp', () => {
    const a = useAssessmentHistoryStore.getState().recordAssessment([4, 4, 4, 4, 4, 4], 'past_6_months');
    const b = useAssessmentHistoryStore.getState().recordAssessment([4, 4, 4, 4, 4, 4], 'past_2_weeks');

    expect(a.id).not.toBe(b.id);
    expect(typeof a.timestamp).toBe('string');
  });

  it('stamps the PPCS-6 content-pack version onto every record — a future wording change can never make an old score ambiguous', () => {
    const entry = useAssessmentHistoryStore.getState().recordAssessment([4, 4, 4, 4, 4, 4], 'past_6_months');
    expect(entry.instrumentVersion).toBe(getPpcs6Assessment().content_version);
    expect(typeof entry.instrumentVersion).toBe('string');
    expect(entry.instrumentVersion.length).toBeGreaterThan(0);
  });

  it('records every required persistence field: score, band, per-item responses, instrument version, timestamp', () => {
    const responses = [1, 2, 3, 4, 5, 6];
    const entry = useAssessmentHistoryStore.getState().recordAssessment(responses, 'past_6_months');
    expect(entry).toMatchObject({
      score: 21,
      band: 'C',
      responses,
      instrumentVersion: expect.any(String),
      timestamp: expect.any(String),
    });
  });
});
