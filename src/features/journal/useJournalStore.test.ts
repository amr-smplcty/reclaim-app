import { useJournalStore } from '@/features/journal/useJournalStore';
import { useProgramStore } from '@/features/program/useProgramStore';

describe('useJournalStore — full check-in data model (PRODUCT_SPEC §5.4)', () => {
  afterEach(() => {
    useJournalStore.getState().reset();
    useProgramStore.getState().reset();
  });

  it('starts with no checkins', () => {
    expect(useJournalStore.getState().checkins).toEqual([]);
  });

  it('adds a full check-in entry: mood, urges y/n + count, rotating prompt', () => {
    useJournalStore.getState().addCheckin({
      week: 1,
      day: 2,
      mood: 4,
      urgesToday: true,
      urgeCount: 2,
      promptText: 'How was today?',
      promptResponse: 'Pretty good, actually.',
    });

    const { checkins } = useJournalStore.getState();
    expect(checkins).toHaveLength(1);
    expect(checkins[0]).toMatchObject({
      type: 'checkin',
      week: 1,
      day: 2,
      mood: 4,
      urgesToday: true,
      urgeCount: 2,
      promptText: 'How was today?',
      promptResponse: 'Pretty good, actually.',
    });
    expect(typeof checkins[0].id).toBe('string');
    expect(typeof checkins[0].timestamp).toBe('string');
  });

  it('persists urgeCount of 0 when there were no urges', () => {
    useJournalStore.getState().addCheckin({
      week: 1,
      day: 3,
      mood: 3,
      urgesToday: false,
      urgeCount: 0,
      promptText: 'p',
      promptResponse: 'r',
    });
    expect(useJournalStore.getState().checkins[0].urgeCount).toBe(0);
  });
});

describe('useJournalStore — legacy check-in migration (BACKLOG #11)', () => {
  afterEach(() => {
    useJournalStore.getState().reset();
    useProgramStore.getState().reset();
  });

  it('does nothing when there is no legacy data, and marks migration done', () => {
    useJournalStore.getState().migrateLegacyCheckins();
    expect(useJournalStore.getState().checkins).toEqual([]);
    expect(useJournalStore.getState().hasMigratedLegacyCheckins).toBe(true);
  });

  it('migrates legacy checkinResponses into full checkin entries with honest defaults', () => {
    // Simulate pre-Epic-6 persisted data sitting on the program store.
    useProgramStore.setState({ checkinResponses: { '1-3': 'It was a hard day.' } } as never);

    useJournalStore.getState().migrateLegacyCheckins();

    const { checkins } = useJournalStore.getState();
    expect(checkins).toHaveLength(1);
    expect(checkins[0]).toMatchObject({
      week: 1,
      day: 3,
      mood: 3,
      urgesToday: false,
      urgeCount: 0,
      promptResponse: 'It was a hard day.',
    });
  });

  it('is idempotent — running it twice does not duplicate entries', () => {
    useProgramStore.setState({ checkinResponses: { '1-3': 'It was a hard day.' } } as never);
    useJournalStore.getState().migrateLegacyCheckins();
    useJournalStore.getState().migrateLegacyCheckins();
    expect(useJournalStore.getState().checkins).toHaveLength(1);
  });

  it('migrates multiple legacy entries', () => {
    useProgramStore.setState({
      checkinResponses: { '1-1': 'Day one.', '1-2': 'Day two.' },
    } as never);
    useJournalStore.getState().migrateLegacyCheckins();
    expect(useJournalStore.getState().checkins).toHaveLength(2);
  });
});
