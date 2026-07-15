import { useAssessmentHistoryStore } from '@/features/assessment/useAssessmentHistoryStore';

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
});
