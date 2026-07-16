import { fireEvent, render } from '@testing-library/react-native';

import { tick } from '../../../../test-utils/asyncAct';
import { EmergencyCardBuilder } from '@/features/program/exercises/EmergencyCardBuilder';
import type { EmergencyCardBuilderPayload } from '@/types/program';

// One interactive test per file (BACKLOG #38).
describe('EmergencyCardBuilder — Week 6 Day 5', () => {
  const payload: EmergencyCardBuilderPayload = {
    kind: 'emergency_card_builder',
    sections_default_order: [
      { title: 'My line', source: 'emergency_card_line' },
      { title: 'My urge script', source: 'urge_script' },
      { title: 'Coach lines', source: 'inner_coach_lines' },
    ],
    editable: true,
    save_to: 'emergency_card',
    activates_screen: true,
    surface_in: ['toolkit_header', 'lapse_debrief', 'progress_tab'],
  };

  const outputs = {
    emergency_card_line: 'what this program can give me back',
    urge_script: { statement: 'Breathe, name it, choose.', signature: 'A', signed_at: '2026-01-01T00:00:00.000Z' },
    inner_coach_lines: { items: ['One hard hour, not a verdict.'] },
  };

  it('reorders (move up), hides a section, and submits the resulting structure', async () => {
    const onSubmit = jest.fn();
    const { getByLabelText, getByText } = await render(
      <EmergencyCardBuilder payload={payload} sourceOutputs={outputs} onSubmit={onSubmit} />
    );

    // Move "Coach lines" (index 2) up once -> becomes index 1.
    fireEvent.press(getByLabelText('Move Coach lines up'));
    await tick();

    // Hide "My urge script".
    fireEvent.press(getByLabelText('Hide My urge script'));
    await tick();

    fireEvent.press(getByText('Activate my Emergency Card'));
    await tick();

    expect(onSubmit).toHaveBeenCalledWith({
      sections: [
        { source: 'emergency_card_line', hidden: false },
        { source: 'inner_coach_lines', hidden: false },
        { source: 'urge_script', hidden: true },
      ],
    });
  });
});
