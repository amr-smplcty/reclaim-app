import { render } from '@testing-library/react-native';
import { Text } from 'react-native';

import { KeyboardAwareScrollView } from '@/components/keyboard-aware-scroll-view';

describe('KeyboardAwareScrollView', () => {
  it('renders its children', async () => {
    const { getByText } = await render(
      <KeyboardAwareScrollView>
        <Text>field</Text>
      </KeyboardAwareScrollView>
    );
    expect(getByText('field')).toBeTruthy();
  });

  it('configures the scroll view for tap-outside-to-dismiss and drag-to-dismiss', async () => {
    // testID flows through {...rest} onto the underlying ScrollView.
    const { getByTestId } = await render(
      <KeyboardAwareScrollView testID="kasv">
        <Text>field</Text>
      </KeyboardAwareScrollView>
    );
    const scroll = getByTestId('kasv');
    // "handled": a tap outside the input (on empty space/buttons) dismisses the
    // keyboard while button presses still fire.
    expect(scroll.props.keyboardShouldPersistTaps).toBe('handled');
    expect(scroll.props.keyboardDismissMode).toBe('interactive');
  });
});
