import { buildAcceptanceRecords } from '@/lib/legal/acceptance';
import { PRIVACY_VERSION, TOU_VERSION } from '@/lib/legal/versions';

describe('buildAcceptanceRecords', () => {
  it('builds one record per document, stamped with the given timestamp', () => {
    const acceptedAt = '2026-07-14T00:00:00.000Z';
    const records = buildAcceptanceRecords(acceptedAt);

    expect(records).toEqual([
      { doc: 'tou', doc_version: TOU_VERSION, accepted_at: acceptedAt },
      { doc: 'privacy', doc_version: PRIVACY_VERSION, accepted_at: acceptedAt },
    ]);
  });
});
