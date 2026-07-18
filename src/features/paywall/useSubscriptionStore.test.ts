const mockFetchCustomerInfo = jest.fn();
const mockFetchOfferings = jest.fn();
const mockPurchasePackage = jest.fn();
const mockRestorePurchases = jest.fn();
const mockTrackTrialStarted = jest.fn();
const mockTrackSubscriptionStarted = jest.fn();

// INC-11: reference outer mock* variables only through a closure, never directly.
jest.mock('@/lib/revenuecat/client', () => ({
  REVENUECAT_ENTITLEMENT_ID: 'pro',
  fetchCustomerInfo: (...args: unknown[]) => mockFetchCustomerInfo(...args),
  fetchOfferings: (...args: unknown[]) => mockFetchOfferings(...args),
  purchasePackage: (...args: unknown[]) => mockPurchasePackage(...args),
  restorePurchases: (...args: unknown[]) => mockRestorePurchases(...args),
}));
jest.mock('@/lib/analytics/events', () => ({
  trackTrialStarted: (...args: unknown[]) => mockTrackTrialStarted(...args),
  trackSubscriptionStarted: (...args: unknown[]) => mockTrackSubscriptionStarted(...args),
}));

import { useSubscriptionStore } from '@/features/paywall/useSubscriptionStore';
import type { CustomerInfo, PurchasesPackage } from 'react-native-purchases';

function customerInfoWithEntitlement(overrides: Partial<{ willRenew: boolean; expirationDate: string | null; periodType: string }> = {}): CustomerInfo {
  return {
    entitlements: {
      active: {
        pro: {
          willRenew: overrides.willRenew ?? true,
          expirationDate: overrides.expirationDate ?? '2027-01-01T00:00:00.000Z',
          periodType: overrides.periodType ?? 'NORMAL',
        },
      },
    },
  } as unknown as CustomerInfo;
}

function customerInfoNoEntitlement(): CustomerInfo {
  return { entitlements: { active: {} } } as unknown as CustomerInfo;
}

function annualPackage(): PurchasesPackage {
  return { identifier: '$rc_annual', packageType: 'ANNUAL', product: {} } as unknown as PurchasesPackage;
}

function monthlyPackage(): PurchasesPackage {
  return { identifier: '$rc_monthly', packageType: 'MONTHLY', product: {} } as unknown as PurchasesPackage;
}

describe('useSubscriptionStore — entitlement store (mocked SDK)', () => {
  beforeEach(() => {
    mockFetchCustomerInfo.mockReset();
    mockFetchOfferings.mockReset();
    mockPurchasePackage.mockReset();
    mockRestorePurchases.mockReset();
    mockTrackTrialStarted.mockReset();
    mockTrackSubscriptionStarted.mockReset();
    useSubscriptionStore.getState().reset();
  });

  describe('refreshEntitlement', () => {
    it('marks the entitlement active when the customer info has it', async () => {
      mockFetchCustomerInfo.mockResolvedValue(customerInfoWithEntitlement());
      await useSubscriptionStore.getState().refreshEntitlement();
      const state = useSubscriptionStore.getState();
      expect(state.status).toBe('ready');
      expect(state.hasProEntitlement).toBe(true);
      expect(state.willRenew).toBe(true);
    });

    it('marks the entitlement inactive when customer info has no active "pro" entry', async () => {
      mockFetchCustomerInfo.mockResolvedValue(customerInfoNoEntitlement());
      await useSubscriptionStore.getState().refreshEntitlement();
      expect(useSubscriptionStore.getState().hasProEntitlement).toBe(false);
    });

    it('degrades to "unavailable" (never throws) when the client returns null (INC-2, e.g. Expo Go)', async () => {
      mockFetchCustomerInfo.mockResolvedValue(null);
      await expect(useSubscriptionStore.getState().refreshEntitlement()).resolves.not.toThrow();
      expect(useSubscriptionStore.getState().status).toBe('unavailable');
      expect(useSubscriptionStore.getState().hasProEntitlement).toBe(false);
    });
  });

  describe('loadOfferings', () => {
    it('maps the fetched current offering into the paywall view', async () => {
      mockFetchOfferings.mockResolvedValue({
        current: { annual: annualPackage(), monthly: monthlyPackage() },
      });
      await useSubscriptionStore.getState().loadOfferings();
      const { offering } = useSubscriptionStore.getState();
      expect(offering.annual?.identifier).toBe('$rc_annual');
      expect(offering.monthly?.identifier).toBe('$rc_monthly');
    });

    it('leaves an empty offering (never throws) when the client returns null', async () => {
      mockFetchOfferings.mockResolvedValue(null);
      await expect(useSubscriptionStore.getState().loadOfferings()).resolves.not.toThrow();
      expect(useSubscriptionStore.getState().offering).toEqual({ annual: null, monthly: null });
    });
  });

  describe('purchase', () => {
    it('activates the entitlement and tracks subscription_started{plan} on a normal (non-trial) purchase', async () => {
      mockPurchasePackage.mockResolvedValue({ kind: 'success', customerInfo: customerInfoWithEntitlement() });
      const result = await useSubscriptionStore.getState().purchase(annualPackage());

      expect(result).toEqual({ success: true });
      expect(useSubscriptionStore.getState().hasProEntitlement).toBe(true);
      expect(mockTrackSubscriptionStarted).toHaveBeenCalledWith('annual');
      expect(mockTrackTrialStarted).not.toHaveBeenCalled();
    });

    it('tracks trial_started (not subscription_started) when the resulting entitlement is a trial period', async () => {
      mockPurchasePackage.mockResolvedValue({
        kind: 'success',
        customerInfo: customerInfoWithEntitlement({ periodType: 'TRIAL' }),
      });
      await useSubscriptionStore.getState().purchase(annualPackage());

      expect(mockTrackTrialStarted).toHaveBeenCalledTimes(1);
      expect(mockTrackSubscriptionStarted).not.toHaveBeenCalled();
    });

    it('handles user cancellation gracefully — no throw, no crash, entitlement unchanged (INC-8)', async () => {
      mockPurchasePackage.mockResolvedValue({ kind: 'cancelled' });
      const result = await useSubscriptionStore.getState().purchase(monthlyPackage());

      expect(result).toEqual({ success: false, cancelled: true });
      expect(useSubscriptionStore.getState().hasProEntitlement).toBe(false);
    });

    it('handles a purchase error gracefully — no throw, readable error message (INC-8)', async () => {
      mockPurchasePackage.mockResolvedValue({ kind: 'error', message: 'Payment declined' });
      const result = await useSubscriptionStore.getState().purchase(monthlyPackage());

      expect(result).toEqual({ success: false, error: 'Payment declined' });
      expect(useSubscriptionStore.getState().hasProEntitlement).toBe(false);
    });
  });

  describe('restore', () => {
    it('restores and activates the entitlement when the customer previously purchased', async () => {
      mockRestorePurchases.mockResolvedValue(customerInfoWithEntitlement());
      const result = await useSubscriptionStore.getState().restore();
      expect(result.success).toBe(true);
      expect(useSubscriptionStore.getState().hasProEntitlement).toBe(true);
    });

    it('reports failure without throwing when there is nothing to restore or the client is unavailable', async () => {
      mockRestorePurchases.mockResolvedValue(null);
      const result = await useSubscriptionStore.getState().restore();
      expect(result.success).toBe(false);
      expect(useSubscriptionStore.getState().hasProEntitlement).toBe(false);
    });
  });
});
