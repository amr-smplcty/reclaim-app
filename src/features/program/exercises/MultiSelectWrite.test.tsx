import { fireEvent, render } from '@testing-library/react-native';

import { tick } from '../../../../test-utils/asyncAct';
import { MultiSelectWrite } from '@/features/program/exercises/MultiSelectWrite';
import type { MultiSelectWritePayload } from '@/types/program';

// One interactive test per file (BACKLOG #38) — this project's test
// environment corrupted a second render() call in the same test file even
// though this component has no conditional root-view swap, so the
// documented trigger condition is narrower than the real one. See
// MultiSelectWriteUnlimited.test.tsx for the select_count: 0 coverage.
describe('MultiSelectWrite — fixed select_count', () => {
  const fixedCountPayload: MultiSelectWritePayload = {
    kind: 'multi_select_write',
    select_options: ['A', 'B', 'C'],
    select_count: 2,
    write_prompt: 'Why?',
    save_to: 'x',
  };

  it('caps selection at exactly select_count and requires exactly that many to submit', async () => {
    const onSubmit = jest.fn();
    const { getByText, getByPlaceholderText } = await render(
      <MultiSelectWrite payload={fixedCountPayload} options={fixedCountPayload.select_options!} onSubmit={onSubmit} />
    );

    fireEvent.press(getByText('A'));
    await tick();
    fireEvent.press(getByText('B'));
    await tick();
    fireEvent.changeText(getByPlaceholderText('Write your answer'), 'Both of these.');
    await tick();
    expect(getByText('Save').parent?.props.accessibilityState.disabled).toBe(false);

    fireEvent.press(getByText('Save'));
    await tick();
    expect(onSubmit).toHaveBeenCalledWith({ selected: ['A', 'B'], write: 'Both of these.' });

    // No-op cap check kept as the final interaction — a fireEvent.press whose
    // setState bails out (returns the same array reference) can otherwise
    // cause a *later* tick()-flushed update to be missed by the next
    // assertion in this test environment (see INCIDENTS.md).
    fireEvent.press(getByText('C'));
    await tick();
    expect(getByText('C').parent?.props.accessibilityState.selected).toBe(false);
  });
});
