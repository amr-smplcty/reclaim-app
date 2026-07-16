import { fireEvent, render } from '@testing-library/react-native';

import { tick } from '../../test-utils/asyncAct';
import { useProgramStore } from '@/features/program/useProgramStore';
import ExerciseScreen from '../../app/(program)/exercise';

const mockReplace = jest.fn();
jest.mock('expo-router', () => ({
  router: { canGoBack: () => false, push: jest.fn(), replace: (...args: unknown[]) => mockReplace(...args), back: jest.fn() },
  useLocalSearchParams: () => ({}),
}));

// Week 6 Day 7's letter_write (completes_program: true) — CLINICAL_SPEC §4
// "the graduation flow must feel like an ending": a calm completion moment,
// then straight into Today's maintenance shape (BACKLOG #16's final state).
describe('ExerciseScreen — Week 6 Day 7 graduation', () => {
  afterEach(() => {
    useProgramStore.getState().reset();
    mockReplace.mockClear();
  });

  it('shows the calm graduation moment (not the generic "Exercise saved" screen) and stamps programCompletedAt', async () => {
    useProgramStore.setState({ position: { week: 6, day: 7 } });

    const { getByText, getByPlaceholderText, queryByText } = await render(<ExerciseScreen />);

    const longLetter = 'Dear me, six weeks ago — '.repeat(10);
    fireEvent.changeText(getByPlaceholderText('Write your letter'), longLetter);
    await tick();
    fireEvent.press(getByText('Save'));
    await tick();

    expect(queryByText('Exercise saved.')).toBeNull();
    expect(getByText('Program complete.')).toBeTruthy();
    expect(
      getByText('This completes the program. Maintenance mode begins — lighter, steady, yours. Congratulations. Genuinely.')
    ).toBeTruthy();

    expect(useProgramStore.getState().programCompletedAt).not.toBeNull();
    expect(useProgramStore.getState().exerciseOutputs.graduation_reflection).toBe(longLetter);

    fireEvent.press(getByText('Continue'));
    await tick();
    expect(mockReplace).toHaveBeenCalledWith('/(tabs)/today');
  });
});
