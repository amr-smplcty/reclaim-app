import { fireEvent, render, waitFor } from '@testing-library/react-native';

import { tick } from '../../test-utils/asyncAct';
import { useAppStore } from '@/stores/useAppStore';
import { useSubscriptionStore } from '@/features/paywall/useSubscriptionStore';
import PaywallScreen from '../../app/(onboarding)/paywall';

const mockReplace = jest.fn();
jest.mock('expo-router', () => ({
  router: { canGoBack: () => false, push: jest.fn(), replace: (...args: unknown[]) => mockReplace(...args), back: jest.fn() },
}));

jest.mock('@/lib/revenuecat/availability', () => ({ isRevenueCatAvailable: () => true }));

const mockRestorePurchases = jest.fn();
// INC-11: reference outer mock* variables only through a closure, never directly.
jest.mock('@/lib/revenuecat/client', () => ({
  REVENUECAT_ENTITLEMENT_ID: 'pro',
  fetchCustomerInfo: () => Promise.resolve({ entitlements: { active: {} } }),
  fetchOfferings: () =>
    Promise.resolve({
      current: {
        annual: { identifier: '$rc_annual', packageType: 'ANNUAL', product: { priceString: '$49.99', title: 'Annual', introPrice: {} } },
        monthly: { identifier: '$rc_monthly', packageType: 'MONTHLY', product: { priceString: '$12.99', title: 'Monthly', introPrice: null } },
      },
    }),
  purchasePackage: jest.fn(),
  restorePurchases: (...args: unknown[]) => mockRestorePurchases(...args),
}));

// One interactive test per file (BACKLOG #38).
describe('PaywallScreen — restore purchases', () => {
  afterEach(() => {
    useAppStore.setState({ hasOnboarded: false });
    useSubscriptionStore.getState().reset();
    mockRestorePurchases.mockReset();
    mockReplace.mockClear();
  });

  it('shows a gentle message (no throw) when there is nothing to restore', async () => {
    mockRestorePurchases.mockResolvedValue(null);

    const { getByText } = await render(<PaywallScreen />);
    await waitFor(() => expect(getByText('Restore purchases')).toBeTruthy());

    expect(() => fireEvent.press(getByText('Restore purchases'))).not.toThrow();
    await tick();

    await waitFor(() => expect(getByText('Nothing to restore right now.')).toBeTruthy());
    expect(mockReplace).not.toHaveBeenCalled();
  });
});
