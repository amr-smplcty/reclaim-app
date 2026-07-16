import { fireEvent, render } from '@testing-library/react-native';

import { tick } from '../../test-utils/asyncAct';
import { useProgramStore } from '@/features/program/useProgramStore';
import { useJournalStore } from '@/features/journal/useJournalStore';
import { dayOfWeekKeyFor } from '@/features/journal/committedActionCheckin';
import CheckinScreen from '../../app/(program)/checkin';

jest.mock('expo-router', () => ({
  router: { canGoBack: () => false, push: jest.fn(), replace: jest.fn(), back: jest.fn() },
}));

const ALL_DAYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const;

// Week 4 Day 3's checkin_integration (PRODUCT_SPEC / CLINICAL_SPEC §4) — one
// interactive test per file (BACKLOG #38). Uses the real current weekday
// (via the same dayOfWeekKeyFor the screen uses) rather than mocking Date,
// so this stays correct on whatever day it actually runs.
describe('CheckinScreen — committed-action check-in flow', () => {
  afterEach(() => {
    useProgramStore.getState().reset();
    useJournalStore.getState().reset();
  });

  it("asks about today's scheduled committed actions only, and saves the shame-free yes/no", async () => {
    const today = dayOfWeekKeyFor(new Date());
    const otherDay = ALL_DAYS.find((d) => d !== today)!;

    useProgramStore.setState({ position: { week: 4, day: 3 } });
    useProgramStore.getState().saveExerciseOutput('committed_actions', [
      { id: 'w4-action-0', value: 'Presence', action: 'Phone away at dinner', if_then_anchor: 'At dinner', days_of_week: [today] },
      { id: 'w4-action-1', value: 'Connection', action: 'Text her at 9pm', if_then_anchor: 'At 9pm', days_of_week: [otherDay] },
    ]);

    const { getByText, queryByText, getAllByText, getByPlaceholderText } = await render(<CheckinScreen />);

    expect(getByText("Did today's committed actions happen?")).toBeTruthy();
    expect(getByText('Phone away at dinner')).toBeTruthy();
    expect(queryByText('Text her at 9pm')).toBeNull();

    // Render order puts "Any urges today?" Yes/No before the committed-action
    // row's own Yes/No, so index 0 is urgesToday and index 1 is the action.
    fireEvent.press(getByText('3')); // mood
    fireEvent.press(getAllByText('No')[0]); // "Any urges today?" -> No
    await tick();
    fireEvent.press(getAllByText('Yes')[1]); // the committed action's Yes
    await tick();
    fireEvent.changeText(getByPlaceholderText('Write as much or as little as you want'), 'Good day overall.');
    await tick();

    fireEvent.press(getByText('Save'));
    await tick();

    const checkins = useJournalStore.getState().checkins;
    expect(checkins).toHaveLength(1);
    expect(checkins[0].committedActionStatus).toEqual({ 'w4-action-0': true });
  });
});
