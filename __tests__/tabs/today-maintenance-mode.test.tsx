import { fireEvent, render } from '@testing-library/react-native';

import { useProgramStore } from '@/features/program/useProgramStore';
import { useSettingsStore } from '@/features/settings/useSettingsStore';
import { useJournalStore } from '@/features/journal/useJournalStore';
import { useRefresherStore } from '@/features/program/useRefresherStore';
import TodayScreen from '../../app/(tabs)/today';

const mockPush = jest.fn();
jest.mock('expo-router', () => ({
  router: { canGoBack: () => false, push: (...args: unknown[]) => mockPush(...args), replace: jest.fn(), back: jest.fn() },
}));

// CLINICAL_SPEC §4 "Post-program maintenance mode" — Today switches shape
// entirely once programCompletedAt is set (Week 6 Day 7's completes_program).
describe('TodayScreen — maintenance mode assembly', () => {
  afterEach(() => {
    useProgramStore.getState().reset();
    useSettingsStore.getState().reset();
    useJournalStore.getState().reset();
    useRefresherStore.getState().reset();
    mockPush.mockClear();
  });

  it('shows the normal day/lesson/exercise stack while the program is still in progress', async () => {
    const { getByText, queryByText } = await render(<TodayScreen />);
    expect(getByText('Week 1 · Day 1')).toBeTruthy();
    expect(queryByText('Maintenance mode')).toBeNull();
  });

  it('switches to maintenance shape once the program is complete: booster card, cadence note, reachable check-in, no lesson/exercise cards', async () => {
    useProgramStore.setState({
      position: { week: 7, day: 1 },
      programCompletedAt: '2026-01-01T00:00:00.000Z',
    });
    useSettingsStore.getState().setMaintenancePlan({
      cadence: '3 evenings a week',
      reassessmentReminderEnabled: true,
      weeklyBoosterEnabled: true,
    });

    const { getByText, queryByText } = await render(<TodayScreen />);

    expect(getByText('Maintenance mode')).toBeTruthy();
    expect(getByText('Checking in 3 evenings a week.')).toBeTruthy();
    expect(getByText("This week's booster")).toBeTruthy();
    expect(getByText('Evening check-in')).toBeTruthy();

    // No stale day-content or "more content coming soon" empty state.
    expect(queryByText('More content coming soon')).toBeNull();
    expect(queryByText("Today's exercise")).toBeNull();

    fireEvent.press(getByText('Evening check-in'));
    expect(mockPush).toHaveBeenCalledWith('/(program)/checkin');
  });

  it('respects an opted-out weekly booster (Week 6 Day 6) — no booster card, check-in still shown', async () => {
    useProgramStore.setState({
      position: { week: 7, day: 1 },
      programCompletedAt: '2026-01-01T00:00:00.000Z',
    });
    useSettingsStore.getState().setMaintenancePlan({
      cadence: 'Weekly',
      reassessmentReminderEnabled: true,
      weeklyBoosterEnabled: false,
    });

    const { getByText, queryByText } = await render(<TodayScreen />);
    expect(queryByText("This week's booster")).toBeNull();
    expect(getByText('Evening check-in')).toBeTruthy();
  });

  it('surfaces a resume link for an accepted-but-unfinished refresher week', async () => {
    useProgramStore.setState({ position: { week: 7, day: 1 }, programCompletedAt: '2026-01-01T00:00:00.000Z' });
    useRefresherStore.getState().recordOfferDecision('entry-1', 'accepted');
    useRefresherStore.getState().markDayReviewed('w2d1_lesson');

    const { getByText } = await render(<TodayScreen />);
    expect(getByText('Continue your refresher week')).toBeTruthy();
    expect(getByText('1 of 7 reviewed')).toBeTruthy();
  });

  it('hides the resume link once every refresher day is reviewed', async () => {
    useProgramStore.setState({ position: { week: 7, day: 1 }, programCompletedAt: '2026-01-01T00:00:00.000Z' });
    useRefresherStore.getState().recordOfferDecision('entry-1', 'accepted');
    // Real lesson ids from the interleaved Week 2/3 assembly (refresher.test.ts).
    ['w2d1_lesson', 'w3d1_lesson', 'w2d2_lesson', 'w3d2_lesson', 'w2d3_lesson', 'w3d3_lesson', 'w2d4_lesson'].forEach(
      (id) => useRefresherStore.getState().markDayReviewed(id)
    );

    const { queryByText } = await render(<TodayScreen />);
    expect(queryByText('Continue your refresher week')).toBeNull();
  });

  it('shows no resume link when the offer was declined, not accepted', async () => {
    useProgramStore.setState({ position: { week: 7, day: 1 }, programCompletedAt: '2026-01-01T00:00:00.000Z' });
    useRefresherStore.getState().recordOfferDecision('entry-1', 'declined');

    const { queryByText } = await render(<TodayScreen />);
    expect(queryByText('Continue your refresher week')).toBeNull();
  });
});
