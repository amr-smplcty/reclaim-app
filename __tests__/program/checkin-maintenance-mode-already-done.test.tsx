import { render } from '@testing-library/react-native';

import { useProgramStore } from '@/features/program/useProgramStore';
import { useJournalStore } from '@/features/journal/useJournalStore';
import CheckinScreen from '../../app/(program)/checkin';

jest.mock('expo-router', () => ({
  router: { canGoBack: () => false, push: jest.fn(), replace: jest.fn(), back: jest.fn() },
}));

// Split into its own file per BACKLOG #38 (a second render() in the same
// file as an interactive root-view-swapping test corrupts this environment).
describe('CheckinScreen — maintenance mode, second check-in same day', () => {
  afterEach(() => {
    useProgramStore.getState().reset();
    useJournalStore.getState().reset();
  });

  it('blocks a second maintenance check-in on the same calendar day', async () => {
    const nowIso = new Date().toISOString();
    useProgramStore.setState({
      position: { week: 7, day: 1 },
      programCompletedAt: '2026-01-01T00:00:00.000Z',
    });
    useJournalStore.setState({
      checkins: [
        {
          id: 'existing',
          type: 'checkin',
          timestamp: nowIso,
          week: 7,
          day: 1,
          mood: 3,
          urgesToday: false,
          urgeCount: 0,
          promptText: 'x',
          promptResponse: 'already done today',
        },
      ],
    });

    const { getByText } = await render(<CheckinScreen />);
    expect(getByText('Check-in saved.')).toBeTruthy();
  });
});
