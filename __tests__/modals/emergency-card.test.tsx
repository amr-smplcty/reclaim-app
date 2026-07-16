import { render } from '@testing-library/react-native';

import { useProgramStore } from '@/features/program/useProgramStore';
import EmergencyCardScreen from '../../app/(modals)/emergency-card';

jest.mock('expo-router', () => ({
  router: { canGoBack: () => false, push: jest.fn(), replace: jest.fn(), back: jest.fn() },
}));

describe('EmergencyCardScreen — Week 6 Day 5 / BACKLOG #27', () => {
  afterEach(() => {
    useProgramStore.getState().reset();
  });

  it('shows a calm not-built-yet state before the card exists', async () => {
    const { getByText } = await render(<EmergencyCardScreen />);
    expect(getByText(/isn't built yet/)).toBeTruthy();
  });

  it('renders the real, saved card from actual exercise outputs, hiding sections the user hid', async () => {
    useProgramStore.getState().saveExerciseOutput('emergency_card_line', 'what this program can give me back');
    useProgramStore.getState().saveExerciseOutput('urge_script', {
      statement: 'Breathe, name it, choose the next ten minutes.',
      signature: 'A',
      signed_at: '2026-01-01T00:00:00.000Z',
    });
    useProgramStore.getState().saveExerciseOutput('tool_ranking', 'Breather, then Urge Surf');
    useProgramStore.getState().saveExerciseOutput('shift_list', { items: ['Cold shower', 'Push-ups'] });
    useProgramStore.getState().saveExerciseOutput('relapse_prevention_plan', {
      sections: [{ title: 'My person', content: 'My brother — text "rough night", he calls.' }],
    });
    useProgramStore.getState().saveExerciseOutput('inner_coach_lines', { items: ['One hard hour, not a verdict.'] });
    useProgramStore.getState().saveExerciseOutput('lapse_letter', 'Hey — that was a data point, not a verdict.');
    useProgramStore.getState().saveExerciseOutput('emergency_card', {
      sections: [
        { source: 'emergency_card_line', hidden: false },
        { source: 'urge_script', hidden: false },
        { source: 'tool_ranking', hidden: false },
        { source: 'shift_list', hidden: false },
        { source: 'relapse_prevention_plan.person', hidden: false },
        { source: 'inner_coach_lines', hidden: true },
        { source: 'lapse_letter', hidden: false },
      ],
    });

    const { getByText, queryByText } = await render(<EmergencyCardScreen />);

    expect(getByText('what this program can give me back')).toBeTruthy();
    expect(getByText('90-Second Breather')).toBeTruthy();
    expect(getByText('Urge Surf')).toBeTruthy();
    expect(getByText('My brother — text "rough night", he calls.')).toBeTruthy();
    // Hidden section never renders.
    expect(queryByText('Coach lines')).toBeNull();
    // Collapsed section's title shows, but its body text is closed by default.
    expect(getByText('If it happened: my letter')).toBeTruthy();
    expect(queryByText('Hey — that was a data point, not a verdict.')).toBeNull();
  });
});
