import { fireEvent, render } from '@testing-library/react-native';

import { tick } from '../../test-utils/asyncAct';
import { useProgramStore } from '@/features/program/useProgramStore';
import { useJournalStore } from '@/features/journal/useJournalStore';
import { dateKeyOf } from '@/features/progress/dailyCreditReconciliation';
import CheckinScreen from '../../app/(program)/checkin';

jest.mock('expo-router', () => ({
  router: { canGoBack: () => false, push: jest.fn(), replace: jest.fn(), back: jest.fn() },
}));

// Post-graduation, `position` is frozen (there's no more day to advance
// into) — gating "already checked in" by dayKey(position) would allow
// exactly one maintenance-mode check-in ever. This is the regression test
// for that fix: calendar-date gating instead.
describe('CheckinScreen — maintenance mode (post-graduation) check-ins', () => {
  afterEach(() => {
    useProgramStore.getState().reset();
    useJournalStore.getState().reset();
  });

  it('allows a fresh check-in today even though the frozen position already shows checkinComplete from a prior day', async () => {
    useProgramStore.setState({
      position: { week: 7, day: 1 },
      programCompletedAt: '2026-01-01T00:00:00.000Z',
      completions: {
        // Simulates yesterday's maintenance check-in having stamped the
        // (permanently frozen) 7-1 completion key.
        '7-1': { lessonComplete: true, exerciseComplete: true, checkinComplete: true, lastActivityAt: '2026-01-01T00:00:00.000Z' },
      },
    });

    const { getByText, getByPlaceholderText, queryByText } = await render(<CheckinScreen />);

    // Not stuck on "Check-in saved." from the stale completions flag.
    expect(queryByText('Check-in saved.')).toBeNull();
    expect(getByText('Evening check-in')).toBeTruthy();

    fireEvent.press(getByText('4'));
    fireEvent.press(getByText('No'));
    await tick();
    fireEvent.changeText(getByPlaceholderText('Write as much or as little as you want'), 'Steady week.');
    await tick();
    fireEvent.press(getByText('Save'));
    await tick();

    const checkins = useJournalStore.getState().checkins;
    expect(checkins).toHaveLength(1);
    expect(dateKeyOf(checkins[0].timestamp)).toBe(dateKeyOf(new Date().toISOString()));
  });
});
