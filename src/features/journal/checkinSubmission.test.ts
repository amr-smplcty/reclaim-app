import { buildCheckinEntry } from '@/features/journal/checkinSubmission';

describe('buildCheckinEntry — crisis guard on the evening check-in surface (CLINICAL_SPEC §6)', () => {
  const baseInput = {
    week: 1,
    day: 4,
    mood: 3,
    urgesToday: false,
    urgeCount: 0,
    promptText: 'How was today?',
    promptResponse: 'It was fine.',
  };

  it('blocks the entry when the free text is flagged unsafe', () => {
    expect(buildCheckinEntry(baseInput, () => false)).toBeNull();
  });

  it('returns the entry unchanged when the free text is safe', () => {
    expect(buildCheckinEntry(baseInput, () => true)).toEqual(baseInput);
  });

  it('checks the prompt response specifically, not other fields', () => {
    const isTextSafe = jest.fn((text: string) => text !== baseInput.promptResponse);
    buildCheckinEntry(baseInput, isTextSafe);
    expect(isTextSafe).toHaveBeenCalledWith(baseInput.promptResponse);
    expect(isTextSafe).toHaveBeenCalledTimes(1);
  });
});
