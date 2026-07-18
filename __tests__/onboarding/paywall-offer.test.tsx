import { render, waitFor } from '@testing-library/react-native';

import { useAssessmentHistoryStore } from '@/features/assessment/useAssessmentHistoryStore';
import { useSubscriptionStore } from '@/features/paywall/useSubscriptionStore';
import PaywallScreen from '../../app/(onboarding)/paywall';

const mockReplace = jest.fn();
jest.mock('expo-router', () => ({
  router: { canGoBack: () => false, push: jest.fn(), replace: (...args: unknown[]) => mockReplace(...args), back: jest.fn() },
}));

jest.mock('@/lib/revenuecat/availability', () => ({ isRevenueCatAvailable: () => true }));

const mockFetchCustomerInfo = jest.fn();
const mockFetchOfferings = jest.fn();
// INC-11: reference outer mock* variables only through a closure, never directly.
jest.mock('@/lib/revenuecat/client', () => ({
  REVENUECAT_ENTITLEMENT_ID: 'pro',
  fetchCustomerInfo: (...args: unknown[]) => mockFetchCustomerInfo(...args),
  fetchOfferings: (...args: unknown[]) => mockFetchOfferings(...args),
  purchasePackage: jest.fn(),
  restorePurchases: jest.fn(),
}));

function annualPackage() {
  return { identifier: '$rc_annual', packageType: 'ANNUAL', product: { priceString: '$49.99', title: 'Annual', introPrice: {} } };
}
function monthlyPackage() {
  return { identifier: '$rc_monthly', packageType: 'MONTHLY', product: { priceString: '$12.99', title: 'Monthly', introPrice: null } };
}

// Query-only renders (no interaction) — the real paywall's state machine:
// loading -> offer shown, personalized with the score, both plans + trial +
// savings framing rendered, per PRODUCT_SPEC §6. Safe to share a file since
// nothing here presses/swaps a conditional root view (BACKLOG #38).
describe('PaywallScreen (RevenueCat available) — loading and offer states', () => {
  afterEach(() => {
    useAssessmentHistoryStore.getState().reset();
    useSubscriptionStore.getState().reset();
    mockFetchCustomerInfo.mockReset();
    mockFetchOfferings.mockReset();
    mockReplace.mockClear();
  });

  it('shows the loading state (no plan pricing yet) before offerings resolve', async () => {
    mockFetchCustomerInfo.mockReturnValue(new Promise(() => {})); // never resolves
    mockFetchOfferings.mockReturnValue(new Promise(() => {}));
    const { queryByText } = await render(<PaywallScreen />);
    expect(queryByText(/\$\d/)).toBeNull();
    expect(queryByText('Subscribe')).toBeNull();
  });

  it('renders both plans with the personalized score, save-percent framing, and the trial note', async () => {
    useAssessmentHistoryStore.setState({
      entries: [
        {
          id: '1',
          timestamp: '2026-01-01T00:00:00.000Z',
          score: 27,
          band: 'C',
          timeframe: 'past_6_months',
          responses: [5, 5, 5, 4, 4, 4],
          instrumentVersion: '1.0.0',
        },
      ],
    });
    mockFetchCustomerInfo.mockResolvedValue({ entitlements: { active: {} } });
    mockFetchOfferings.mockResolvedValue({ current: { annual: annualPackage(), monthly: monthlyPackage() } });

    const { getByText } = await render(<PaywallScreen />);

    await waitFor(() => expect(getByText('Your score: 27.')).toBeTruthy());
    expect(getByText('$49.99/year')).toBeTruthy();
    expect(getByText('$12.99/month')).toBeTruthy();
    expect(getByText('Save 68%')).toBeTruthy();
    expect(getByText('7-day free trial, then billed yearly')).toBeTruthy();
  });

  it('never navigates away while entitlement is still unresolved (false by default)', async () => {
    mockFetchCustomerInfo.mockResolvedValue({ entitlements: { active: {} } });
    mockFetchOfferings.mockResolvedValue({ current: { annual: annualPackage(), monthly: monthlyPackage() } });

    await render(<PaywallScreen />);
    await waitFor(() => expect(mockFetchCustomerInfo).toHaveBeenCalled());
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('auto-continues into the app if the customer is already entitled on mount (e.g. a restored session)', async () => {
    mockFetchCustomerInfo.mockResolvedValue({
      entitlements: { active: { pro: { willRenew: true, expirationDate: null, periodType: 'NORMAL' } } },
    });
    mockFetchOfferings.mockResolvedValue({ current: { annual: annualPackage(), monthly: monthlyPackage() } });

    await render(<PaywallScreen />);
    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith('/(tabs)/today'));
  });
});
