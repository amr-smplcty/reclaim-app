import { render } from '@testing-library/react-native';

import { ThemedText } from '@/components/themed-text';

describe('ThemedText', () => {
  it('renders its children', async () => {
    const { getByText } = await render(<ThemedText>Take back control</ThemedText>);
    expect(getByText('Take back control')).toBeTruthy();
  });
});
