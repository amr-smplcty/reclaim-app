import { fireEvent, render, waitFor } from '@testing-library/react-native';

import { tick } from '../../test-utils/asyncAct';
import { useOnboardingStore } from '@/features/assessment/useOnboardingStore';
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

// One interactive test per file (BACKLOG #38) — purchase success is its own
// distinct branch of the state machine from failure/restore (see the
// sibling paywall-purchase-failure.test.tsx / paywall-restore.test.tsx).
describe('PaywallScreen — purchase succeeds', () => {
  afterEach(() => {
    useOnboardingStore.getState().reset();
    useAppStore.setState({ hasOnboarded: false });
    useSubscriptionStore.getState().reset();
    mockPurchasePackage.mockReset();
    mockReplace.mockClear();
  });

  it('purchase -> entitlement refresh -> continue into the app (annual, default-selected)', async () => {
    mockPurchasePackage.mockResolvedValue({
      kind: 'success',
      customerInfo: { entitlements: { active: { pro: { willRenew: true, expirationDate: null, periodType: 'NORMAL' } } } },
    });

    const { getByText } = await render(<PaywallScreen />);
    await waitFor(() => expect(getByText('Start free trial')).toBeTruthy());

    fireEvent.press(getByText('Start free trial'));
    await tick();

    expect(mockPurchasePackage).toHaveBeenCalledWith(expect.objectContaining({ identifier: '$rc_annual' }));
    await waitFor(() => expect(useAppStore.getState().hasOnboarded).toBe(true));
    expect(mockReplace).toHaveBeenCalledWith('/(tabs)/today');
    expect(useOnboardingStore.getState().currentStep).toBe('welcome');
  });
});
