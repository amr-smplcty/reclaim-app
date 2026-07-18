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

const mockPurchasePackage = jest.fn();
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
  purchasePackage: (...args: unknown[]) => mockPurchasePackage(...args),
  restorePurchases: jest.fn(),
}));

// One interactive test per file (BACKLOG #38).
describe('PaywallScreen — purchase fails or is cancelled', () => {
  afterEach(() => {
    useAppStore.setState({ hasOnboarded: false });
    useSubscriptionStore.getState().reset();
    mockPurchasePackage.mockReset();
    mockReplace.mockClear();
  });

  it('shows an inline error and never navigates, crashes, or throws on a real failure (INC-8)', async () => {
    mockPurchasePackage.mockResolvedValue({ kind: 'error', message: 'Payment declined' });

    const { getByText } = await render(<PaywallScreen />);
    await waitFor(() => expect(getByText('Start free trial')).toBeTruthy());

    expect(() => fireEvent.press(getByText('Start free trial'))).not.toThrow();
    await tick();

    await waitFor(() => expect(getByText('Payment declined')).toBeTruthy());
    expect(mockReplace).not.toHaveBeenCalled();
    expect(useAppStore.getState().hasOnboarded).toBe(false);
  });
});
