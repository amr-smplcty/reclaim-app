import { render } from '@testing-library/react-native';

import ReassessmentScreen from '../../app/(modals)/reassessment';

jest.mock('expo-router', () => ({
  router: { canGoBack: () => false, push: jest.fn(), replace: jest.fn(), back: jest.fn() },
}));

describe('ReassessmentScreen framing', () => {
  it('shows the 2-week framing, not the 6-month one', async () => {
    const { getByText } = await render(<ReassessmentScreen />);
    expect(getByText('Thinking about the past 2 weeks...')).toBeTruthy();
  });
});
