import { fireEvent, render, waitFor } from '@testing-library/react-native';

import { MultiSelectWrite } from '@/features/program/exercises/MultiSelectWrite';
import type { MultiSelectWritePayload } from '@/types/program';

// select_count: 0 (content/week2.json's trigger_map_external/internal) —
// "select every one that applies," not a fixed count. Real bug found while
// integrating Week 5's risk_window_planner (which needs real
// trigger_map_external data): the old cap check
// `prev.length >= payload.select_count` was always true when select_count
// was 0, so no option could ever be selected at all. See INCIDENTS.md.
// Split into its own file per BACKLOG #38's one-interactive-test-per-file
// convention — see MultiSelectWrite.test.tsx for the fixed-count coverage.
// Uses waitFor (polls until it passes) instead of the fixed-delay tick()
// helper — this test proved flaky under full-suite worker contention with a
// fixed delay; polling is the robust fix rather than guessing a longer one.
describe('MultiSelectWrite — select_count: 0 (unlimited)', () => {
  const unlimitedPayload: MultiSelectWritePayload = {
    kind: 'multi_select_write',
    select_options: ['A', 'B', 'C'],
    select_count: 0,
    write_prompt: 'Why?',
    save_to: 'x',
  };

  it('allows selecting every option and submits once at least one is picked plus free text', async () => {
    const onSubmit = jest.fn();
    const { getByText, getByPlaceholderText } = await render(
      <MultiSelectWrite payload={unlimitedPayload} options={unlimitedPayload.select_options!} onSubmit={onSubmit} />
    );

    expect(getByText('Save').parent?.props.accessibilityState.disabled).toBe(true);

    fireEvent.press(getByText('A'));
    await waitFor(() => expect(getByText('A').parent?.props.accessibilityState.selected).toBe(true));

    fireEvent.press(getByText('C'));
    await waitFor(() => expect(getByText('C').parent?.props.accessibilityState.selected).toBe(true));

    expect(getByText('B').parent?.props.accessibilityState.selected).toBe(false);

    fireEvent.changeText(getByPlaceholderText('Write your answer'), 'Both of these.');
    await waitFor(() => expect(getByText('Save').parent?.props.accessibilityState.disabled).toBe(false));

    fireEvent.press(getByText('Save'));
    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith({ selected: ['A', 'C'], write: 'Both of these.' }));
  });
});
