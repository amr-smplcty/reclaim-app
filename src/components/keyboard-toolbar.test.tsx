import { render } from '@testing-library/react-native';
import { Platform } from 'react-native';

import { KeyboardToolbar } from '@/components/keyboard-toolbar';

describe('KeyboardToolbar', () => {
  const originalOS = Platform.OS;

  afterEach(() => {
    Object.defineProperty(Platform, 'OS', { get: () => originalOS, configurable: true });
  });

  it('renders nothing while the keyboard is hidden (no keyboard height yet)', async () => {
    Object.defineProperty(Platform, 'OS', { get: () => 'ios', configurable: true });
    const { queryByLabelText } = await render(<KeyboardToolbar />);
    expect(queryByLabelText('Dismiss keyboard')).toBeNull();
  });

  it('is iOS-only — renders nothing on Android (which has its own keyboard dismiss key)', async () => {
    Object.defineProperty(Platform, 'OS', { get: () => 'android', configurable: true });
    const { queryByLabelText } = await render(<KeyboardToolbar />);
    expect(queryByLabelText('Dismiss keyboard')).toBeNull();
  });
});
