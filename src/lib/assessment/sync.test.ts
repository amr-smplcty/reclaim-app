import { buildAssessmentHistoryRow } from '@/lib/assessment/sync';
import type { AssessmentEntry } from '@/features/assessment/useAssessmentHistoryStore';

describe('buildAssessmentHistoryRow', () => {
  it('maps an assessment entry to the assessment_history row shape, stamped with the user id', () => {
    const entry: AssessmentEntry = {
      id: 'local-1',
      timestamp: '2026-07-14T00:00:00.000Z',
      score: 27,
      band: 'C',
      timeframe: 'past_6_months',
      responses: [4, 4, 5, 5, 4, 5],
      instrumentVersion: '1.0.0',
    };

    expect(buildAssessmentHistoryRow('user-123', entry)).toEqual({
      user_id: 'user-123',
      score: 27,
      band: 'C',
      timeframe: 'past_6_months',
      responses: [4, 4, 5, 5, 4, 5],
      instrument_version: '1.0.0',
      recorded_at: '2026-07-14T00:00:00.000Z',
    });
  });
});
