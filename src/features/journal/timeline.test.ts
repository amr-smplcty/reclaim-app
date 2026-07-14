import { assembleJournalTimeline, groupTimelineByDay, type JournalTimelineItem } from '@/features/journal/timeline';

describe('assembleJournalTimeline — unified, newest first', () => {
  it('merges checkins, urge logs, lapse debriefs, and lesson reflections sorted by timestamp descending', () => {
    const sources = {
      checkins: [
        {
          id: 'c1',
          type: 'checkin' as const,
          timestamp: '2026-07-10T09:00:00.000Z',
          week: 1,
          day: 1,
          mood: 3,
          urgesToday: false,
          urgeCount: 0,
          promptText: 'p',
          promptResponse: 'r',
        },
      ],
      urgeLogs: [
        {
          id: 'u1',
          timestamp: '2026-07-10T20:00:00.000Z',
          intensity: 7,
          trigger: 'stress' as const,
          location: 'home',
          whatHappenedNext: 'used breather',
        },
      ],
      lapseDebriefs: [
        {
          id: 'l1',
          timestamp: '2026-07-09T22:00:00.000Z',
          answers: {
            beforeChips: [],
            beforeFreeText: '',
            feelingChips: [],
            whatFailed: 'tool_not_used' as const,
            changeNextTime: 'x',
          },
        },
      ],
      reflections: {
        w1d1_lesson: { type: 'free_text' as const, value: 'reflection text', timestamp: '2026-07-10T08:00:00.000Z' },
      },
    };

    const timeline = assembleJournalTimeline(sources);
    expect(timeline.map((item) => item.type)).toEqual(['urge_log', 'checkin', 'lesson_reflection', 'lapse_debrief']);
    expect(timeline.map((item) => item.timestamp)).toEqual([
      '2026-07-10T20:00:00.000Z',
      '2026-07-10T09:00:00.000Z',
      '2026-07-10T08:00:00.000Z',
      '2026-07-09T22:00:00.000Z',
    ]);
  });

  it('returns an empty timeline when nothing exists yet', () => {
    expect(assembleJournalTimeline({ checkins: [], urgeLogs: [], lapseDebriefs: [], reflections: {} })).toEqual([]);
  });

  it('tags each lesson reflection with its lesson id', () => {
    const timeline = assembleJournalTimeline({
      checkins: [],
      urgeLogs: [],
      lapseDebriefs: [],
      reflections: { w2d3_lesson: { type: 'single_choice', value: 'Somewhere in the middle drift', timestamp: '2026-07-10T08:00:00.000Z' } },
    });
    expect(timeline[0].entry).toMatchObject({ lessonId: 'w2d3_lesson', value: 'Somewhere in the middle drift' });
  });
});

describe('groupTimelineByDay — day grouping preserves newest-first order', () => {
  it('groups items by calendar date, with groups ordered newest-first', () => {
    const timeline: JournalTimelineItem[] = [
      { id: 'a', type: 'checkin', timestamp: '2026-07-10T20:00:00.000Z', entry: {} as never },
      { id: 'b', type: 'urge_log', timestamp: '2026-07-10T09:00:00.000Z', entry: {} as never },
      { id: 'c', type: 'lapse_debrief', timestamp: '2026-07-09T22:00:00.000Z', entry: {} as never },
    ];

    const groups = groupTimelineByDay(timeline);
    expect(groups.map((g) => g.dateKey)).toEqual(['2026-07-10', '2026-07-09']);
    expect(groups[0].items).toHaveLength(2);
    expect(groups[1].items).toHaveLength(1);
  });

  it('returns no groups for an empty timeline', () => {
    expect(groupTimelineByDay([])).toEqual([]);
  });
});
