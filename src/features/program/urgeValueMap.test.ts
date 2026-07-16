import {
  allLogsTagged,
  buildMappedOutput,
  buildWorksheetOutput,
  hasSufficientLogs,
  resolveTagOptions,
  selectRecentLogs,
} from '@/features/program/urgeValueMap';
import type { UrgeLogEntry } from '@/features/toolkit/useToolkitStore';

function log(id: string): UrgeLogEntry {
  return { id, timestamp: '2026-01-01T00:00:00.000Z', intensity: 5, trigger: 'stress', location: '', whatHappenedNext: '' };
}

describe('hasSufficientLogs — the sufficient/insufficient gate (Week 4 Day 4)', () => {
  it('is false below min_logs', () => {
    expect(hasSufficientLogs([log('1'), log('2')], 3)).toBe(false);
  });

  it('is true at or above min_logs', () => {
    expect(hasSufficientLogs([log('1'), log('2'), log('3')], 3)).toBe(true);
    expect(hasSufficientLogs([log('1'), log('2'), log('3'), log('4')], 3)).toBe(true);
  });

  it('is false with zero logs', () => {
    expect(hasSufficientLogs([], 3)).toBe(false);
  });
});

describe('selectRecentLogs', () => {
  it('returns the most recent N logs, oldest-to-newest order preserved', () => {
    const logs = [log('1'), log('2'), log('3'), log('4'), log('5'), log('6')];
    expect(selectRecentLogs(logs, 5).map((l) => l.id)).toEqual(['2', '3', '4', '5', '6']);
  });

  it('returns everything when there are fewer logs than the cap', () => {
    const logs = [log('1'), log('2')];
    expect(selectRecentLogs(logs, 5)).toEqual(logs);
  });
});

describe('resolveTagOptions', () => {
  it('combines the users core values with the contents extra tags', () => {
    expect(resolveTagOptions(['Presence', 'Connection'], ['rest / relief'])).toEqual([
      'Presence',
      'Connection',
      'rest / relief',
    ]);
  });

  it('tolerates no core values yet (Day 2 skipped)', () => {
    expect(resolveTagOptions([], ['rest / relief'])).toEqual(['rest / relief']);
  });
});

describe('allLogsTagged', () => {
  it('is false until every shown log has a tag', () => {
    expect(allLogsTagged([log('1'), log('2')], { '1': 'Presence' })).toBe(false);
  });

  it('is true once every shown log has a tag', () => {
    expect(allLogsTagged([log('1'), log('2')], { '1': 'Presence', '2': 'rest / relief' })).toBe(true);
  });

  it('is false for an empty log list — nothing to submit', () => {
    expect(allLogsTagged([], {})).toBe(false);
  });
});

describe('buildMappedOutput / buildWorksheetOutput — the two mutually exclusive submission shapes', () => {
  it('mapped output carries entries and a null worksheetText', () => {
    expect(buildMappedOutput({ '1': 'Presence', '2': 'rest / relief' })).toEqual({
      entries: [
        { logId: '1', tag: 'Presence' },
        { logId: '2', tag: 'rest / relief' },
      ],
      worksheetText: null,
    });
  });

  it('worksheet output carries the free text and no entries', () => {
    expect(buildWorksheetOutput('Mostly loneliness, I think.')).toEqual({
      entries: [],
      worksheetText: 'Mostly loneliness, I think.',
    });
  });
});
