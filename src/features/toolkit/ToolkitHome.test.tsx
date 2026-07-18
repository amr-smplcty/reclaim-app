import { fireEvent, render } from '@testing-library/react-native';

import { tick } from '../../../test-utils/asyncAct';
import { ToolkitHome } from '@/features/toolkit/ToolkitHome';
import { useSubscriptionStore } from '@/features/paywall/useSubscriptionStore';

jest.mock('expo-router', () => ({
  router: { push: jest.fn() },
}));

// PRODUCT_SPEC §6 ethical floor: Urge Surf + Breather stay free forever,
// regardless of entitlement — must never regress once the real RevenueCat
// entitlement store replaces the hardcoded HAS_PRO_ENTITLEMENT (BACKLOG #1).
// One interactive test per file (BACKLOG #38) — see ToolkitHome.entitled.test.tsx
// for the "has pro entitlement" counterpart.
describe('ToolkitHome — no entitlement', () => {
  afterEach(() => {
    useSubscriptionStore.getState().reset();
  });

  it('keeps Urge Surf and Breather enabled with no entitlement, and locks the other three', async () => {
    useSubscriptionStore.setState({ hasProEntitlement: false });
    const { getByText, getByLabelText } = await render(<ToolkitHome />);

    fireEvent.press(getByText('5'));
    await tick();

    expect(getByLabelText('Urge Surf').props.accessibilityState.disabled).toBe(false);
    expect(getByLabelText('90-Second Breather').props.accessibilityState.disabled).toBe(false);
    expect(getByLabelText('Defusion').props.accessibilityState.disabled).toBe(true);
    expect(getByLabelText('Shift Environment').props.accessibilityState.disabled).toBe(true);
    expect(getByLabelText('10-Minute Shift').props.accessibilityState.disabled).toBe(true);
  });
});
