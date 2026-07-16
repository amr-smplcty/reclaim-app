import { fireEvent, render } from '@testing-library/react-native';

import { tick } from '../../../../test-utils/asyncAct';
import { MaintenanceSetup } from '@/features/program/exercises/MaintenanceSetup';
import type { MaintenanceSetupPayload } from '@/types/program';

const payload: MaintenanceSetupPayload = {
  kind: 'maintenance_setup',
  checkin_cadence_options: ['Daily', 'Weekdays', '3 evenings a week', 'Weekly'],
  reassessment_reminder: { default: true, interval_days: 14 },
  weekly_booster: { default: true },
  save_to: 'maintenance_plan',
};

// One interactive test per file (BACKLOG #38).
describe('MaintenanceSetup — Week 6 Day 6', () => {
  it('defaults both toggles on, requires a cadence choice, and submits the chosen plan', async () => {
    const onSubmit = jest.fn();
    const { getByText, getByLabelText } = await render(<MaintenanceSetup payload={payload} onSubmit={onSubmit} />);

    // Reassessment reminder + weekly booster both default on per payload.
    expect(getByLabelText('Re-assessment reminder').props.value).toBe(true);
    expect(getByLabelText('Weekly booster').props.value).toBe(true);

    // Can't submit before a cadence is picked.
    expect(getByText('Save my maintenance plan').parent?.props.accessibilityState.disabled).toBe(true);

    fireEvent.press(getByText('3 evenings a week'));
    await tick();

    // Opt out of the weekly booster — respected, not force-defaulted.
    fireEvent(getByLabelText('Weekly booster'), 'valueChange', false);
    await tick();

    expect(getByText('Save my maintenance plan').parent?.props.accessibilityState.disabled).toBe(false);
    fireEvent.press(getByText('Save my maintenance plan'));
    await tick();

    expect(onSubmit).toHaveBeenCalledWith({
      cadence: '3 evenings a week',
      reassessmentReminderEnabled: true,
      weeklyBoosterEnabled: false,
    });
  });
});
