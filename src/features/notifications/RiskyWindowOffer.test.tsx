import { fireEvent, render } from '@testing-library/react-native';

import { tick } from '../../../test-utils/asyncAct';
import { RiskyWindowOffer } from '@/features/notifications/RiskyWindowOffer';
import { useSettingsStore } from '@/features/settings/useSettingsStore';
import { useToolkitStore } from '@/features/toolkit/useToolkitStore';

function at(hour: number, day = 1): string {
  return new Date(2026, 0, day, hour, 0, 0).toISOString();
}

describe('RiskyWindowOffer — query-only renders (no interaction, safe to share a file with the interactive test below)', () => {
  afterEach(() => {
    useSettingsStore.getState().reset();
    useToolkitStore.getState().reset();
  });

  it('renders nothing below the eligibility threshold', async () => {
    const { queryByText } = await render(<RiskyWindowOffer />);
    expect(queryByText(/plan the next hour on purpose/)).toBeNull();
  });

  it('renders nothing once the offer has already been decided, even if eligible', async () => {
    for (let i = 1; i <= 5; i++) {
      useToolkitStore.getState().logUrge({ intensity: 5, trigger: 'boredom', location: 'home', whatHappenedNext: '' });
    }
    useSettingsStore.getState().decideRiskyWindowReminder(false);
    const { queryByText } = await render(<RiskyWindowOffer />);
    expect(queryByText(/plan the next hour on purpose/)).toBeNull();
  });
});

// One interactive (state-mutating, root-view-swapping) test per file (BACKLOG #38).
describe('RiskyWindowOffer — the gentle offer, once eligible', () => {
  afterEach(() => {
    useSettingsStore.getState().reset();
    useToolkitStore.getState().reset();
  });

  it('shows the offer once eligible, and "Yes, remind me" enables the reminder and dismisses the offer for good', async () => {
    // Force a real, non-mocked late-night cluster via the real store (same
    // shape as the Epic 7 practice-exclusion end-to-end test).
    const store = useToolkitStore.getState();
    store.logUrge({ intensity: 6, trigger: 'late_night', location: 'bed', whatHappenedNext: '' });
    // Use timestamps directly isn't possible via the store API, so rely on
    // logUrge's own "now" timestamp — instead, drive eligibility through
    // repeated logUrge calls, which all land "now." Since "now" in the test
    // runner may not be late night, assert on the generic offer copy pattern
    // instead of a specific window.
    for (let i = 0; i < 4; i++) {
      store.logUrge({ intensity: 5, trigger: 'boredom', location: 'home', whatHappenedNext: '' });
    }

    const { getByText } = await render(<RiskyWindowOffer />);
    expect(getByText(/plan the next hour on purpose\?/)).toBeTruthy();

    fireEvent.press(getByText('Yes, remind me'));
    await tick();

    expect(useSettingsStore.getState().riskyWindowReminderEnabled).toBe(true);
    expect(useSettingsStore.getState().riskyWindowOfferDecided).toBe(true);
  });
});
