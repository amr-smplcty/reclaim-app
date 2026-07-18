import { fireEvent, render } from '@testing-library/react-native';

import { tick } from '../../../test-utils/asyncAct';
import { ToolkitHome } from '@/features/toolkit/ToolkitHome';
import { useSubscriptionStore } from '@/features/paywall/useSubscriptionStore';

jest.mock('expo-router', () => ({
  router: { push: jest.fn() },
}));

// One interactive test per file (BACKLOG #38) — see ToolkitHome.test.tsx for
// the "no entitlement" counterpart.
describe('ToolkitHome — pro entitlement active', () => {
  afterEach(() => {
    useSubscriptionStore.getState().reset();
  });

  it('unlocks every tool once the real subscription store reports the pro entitlement', async () => {
    useSubscriptionStore.setState({ hasProEntitlement: true });
    const { getByText, getByLabelText } = await render(<ToolkitHome />);

    fireEvent.press(getByText('5'));
    await tick();

    expect(getByLabelText('Defusion').props.accessibilityState.disabled).toBe(false);
    expect(getByLabelText('Shift Environment').props.accessibilityState.disabled).toBe(false);
    expect(getByLabelText('10-Minute Shift').props.accessibilityState.disabled).toBe(false);
  });
});
