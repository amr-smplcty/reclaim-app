import { render } from '@testing-library/react-native';

import { LetterWrite } from '@/features/program/exercises/LetterWrite';
import type { LetterWritePayload } from '@/types/program';

// Week 6 Day 1 revises the Week 1 lapse_letter in place (prefill_from);
// Week 6 Day 7's graduation_reflection has no prefill_from and must behave
// exactly like every other letter_write today (blank field).
describe('LetterWrite — prefill_from (Week 6 Day 1 revision)', () => {
  const revisionPayload: LetterWritePayload = {
    kind: 'letter_write',
    prompt: 'To me, in the hour after a slip (revised, with everything I know now):',
    min_chars: 100,
    save_to: 'lapse_letter',
    prefill_from: 'lapse_letter',
  };

  it('starts the field with the prior save when prefill_from resolves', async () => {
    const { getByDisplayValue } = await render(
      <LetterWrite payload={revisionPayload} prefillValue="My original Week 1 letter." onSubmit={jest.fn()} />
    );
    expect(getByDisplayValue('My original Week 1 letter.')).toBeTruthy();
  });

  it('starts blank when prefill_from is set but nothing was saved yet', async () => {
    const { getByPlaceholderText } = await render(
      <LetterWrite payload={revisionPayload} onSubmit={jest.fn()} />
    );
    expect(getByPlaceholderText('Write your letter').props.value).toBe('');
  });

  it('starts blank for a normal letter_write with no prefill_from at all (Week 6 Day 7)', async () => {
    const graduationPayload: LetterWritePayload = {
      kind: 'letter_write',
      prompt: 'To the me of six weeks ago, starting Day 1 tonight:',
      min_chars: 150,
      save_to: 'graduation_reflection',
      completes_program: true,
    };
    const { getByPlaceholderText } = await render(<LetterWrite payload={graduationPayload} onSubmit={jest.fn()} />);
    expect(getByPlaceholderText('Write your letter').props.value).toBe('');
  });
});
