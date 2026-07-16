import { useRefresherStore } from '@/features/program/useRefresherStore';

// "declining is respected without nagging" (CLINICAL_SPEC §4 refresher-week
// offer) — a decision is keyed by the specific AssessmentEntry.id that
// triggered it, so it's never re-shown for that same trigger, but a LATER,
// separate qualifying rise (a new entry id) can offer again.
describe('useRefresherStore — offer decisions (no-nag decline) and day-review tracking', () => {
  afterEach(() => {
    useRefresherStore.getState().reset();
  });

  it('has no decision recorded for an entry that was never offered', () => {
    expect(useRefresherStore.getState().offerDecisions.someEntryId).toBeUndefined();
  });

  it('records a decline, and it is retrievable by the same entry id', () => {
    useRefresherStore.getState().recordOfferDecision('entry-1', 'declined');
    expect(useRefresherStore.getState().offerDecisions['entry-1']).toBe('declined');
  });

  it('records an accept independently of any decline for a different entry', () => {
    useRefresherStore.getState().recordOfferDecision('entry-1', 'declined');
    useRefresherStore.getState().recordOfferDecision('entry-2', 'accepted');
    expect(useRefresherStore.getState().offerDecisions).toEqual({
      'entry-1': 'declined',
      'entry-2': 'accepted',
    });
  });

  it('a later decision for a NEW triggering entry does not overwrite or get blocked by an earlier decline', () => {
    useRefresherStore.getState().recordOfferDecision('entry-1', 'declined');
    // A fresh qualifying rise later produces a new entry id — the offer can
    // resurface and be decided independently.
    useRefresherStore.getState().recordOfferDecision('entry-2', 'declined');
    expect(useRefresherStore.getState().offerDecisions['entry-1']).toBe('declined');
    expect(useRefresherStore.getState().offerDecisions['entry-2']).toBe('declined');
  });

  it('marks a refresher day reviewed by its lesson id', () => {
    useRefresherStore.getState().markDayReviewed('w2d1_lesson');
    expect(useRefresherStore.getState().completedLessonIds.w2d1_lesson).toBe(true);
  });

  it('reset clears both decisions and reviewed days', () => {
    useRefresherStore.getState().recordOfferDecision('entry-1', 'accepted');
    useRefresherStore.getState().markDayReviewed('w2d1_lesson');
    useRefresherStore.getState().reset();
    expect(useRefresherStore.getState().offerDecisions).toEqual({});
    expect(useRefresherStore.getState().completedLessonIds).toEqual({});
  });
});
