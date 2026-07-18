import { create } from 'zustand';
import type { CustomerInfo, PurchasesPackage } from 'react-native-purchases';

import {
  fetchCustomerInfo,
  fetchOfferings,
  purchasePackage as purchasePackageClient,
  restorePurchases as restorePurchasesClient,
  REVENUECAT_ENTITLEMENT_ID,
} from '@/lib/revenuecat/client';
import { toPaywallOfferingView, type PaywallOfferingView } from '@/features/paywall/offerings';
import { trackSubscriptionStarted, trackTrialStarted } from '@/lib/analytics/events';

export type SubscriptionStatus = 'loading' | 'ready' | 'unavailable';

export interface PurchaseResult {
  success: boolean;
  cancelled?: boolean;
  error?: string;
}

interface EntitlementFields {
  hasProEntitlement: boolean;
  willRenew: boolean;
  expirationDate: string | null;
}

const NO_ENTITLEMENT: EntitlementFields = { hasProEntitlement: false, willRenew: false, expirationDate: null };

// CustomerInfo.entitlements.active[id] carries willRenew/expirationDate/
// periodType per RevenueCat's SDK — undefined means the entitlement isn't
// active (never purchased, expired, or unavailable/degraded customerInfo).
function deriveEntitlement(customerInfo: CustomerInfo | null): EntitlementFields {
  const entitlement = customerInfo?.entitlements.active[REVENUECAT_ENTITLEMENT_ID];
  if (!entitlement) return NO_ENTITLEMENT;
  return {
    hasProEntitlement: true,
    willRenew: entitlement.willRenew,
    expirationDate: entitlement.expirationDate ?? null,
  };
}

interface RawOfferingPackages {
  annual: PurchasesPackage | null;
  monthly: PurchasesPackage | null;
}

interface SubscriptionState extends EntitlementFields {
  status: SubscriptionStatus;
  offering: PaywallOfferingView;
  // The real SDK packages backing `offering`'s simplified view — purchase()
  // needs the actual PurchasesPackage, which the display-only view can't
  // carry (see offerings.ts's toPaywallOfferingView).
  rawOffering: RawOfferingPackages | null;
  refreshEntitlement: () => Promise<void>;
  loadOfferings: () => Promise<void>;
  purchase: (pkg: PurchasesPackage) => Promise<PurchaseResult>;
  restore: () => Promise<PurchaseResult>;
  reset: () => void;
}

const initialState = {
  status: 'loading' as SubscriptionStatus,
  offering: { annual: null, monthly: null } as PaywallOfferingView,
  rawOffering: null as RawOfferingPackages | null,
  ...NO_ENTITLEMENT,
};

// Single source of truth for the "pro" entitlement (BACKLOG #1 / PRODUCT_SPEC
// §6) — every consumer (Toolkit gating, Settings subscription status, the
// paywall itself) reads from here instead of a hardcoded flag. INC-2:
// refreshEntitlement/loadOfferings degrade to 'unavailable'/empty offerings
// rather than throwing when RevenueCat's native module is absent (Expo Go).
export const useSubscriptionStore = create<SubscriptionState>()((set) => ({
  ...initialState,

  refreshEntitlement: async () => {
    const customerInfo = await fetchCustomerInfo();
    if (!customerInfo) {
      set({ status: 'unavailable' });
      return;
    }
    set({ status: 'ready', ...deriveEntitlement(customerInfo) });
  },

  loadOfferings: async () => {
    const offerings = await fetchOfferings();
    const current = offerings?.current;
    set({
      offering: toPaywallOfferingView(current),
      rawOffering: current ? { annual: current.annual ?? null, monthly: current.monthly ?? null } : null,
    });
  },

  purchase: async (pkg) => {
    const result = await purchasePackageClient(pkg);
    if (result.kind === 'cancelled') return { success: false, cancelled: true };
    if (result.kind === 'error') return { success: false, error: result.message };

    const derived = deriveEntitlement(result.customerInfo);
    set({ status: 'ready', ...derived });

    if (derived.hasProEntitlement) {
      // periodType is only observable client-side at the moment of purchase —
      // a later trial->paid conversion happens server-side and isn't
      // something this client call can see, so "TRIAL" here is the only
      // client-detectable signal for trial_started vs. a real paid start.
      const entitlement = result.customerInfo.entitlements.active[REVENUECAT_ENTITLEMENT_ID];
      if (entitlement?.periodType === 'TRIAL') {
        trackTrialStarted();
      } else {
        trackSubscriptionStarted(pkg.packageType === 'ANNUAL' ? 'annual' : 'monthly');
      }
    }

    return { success: derived.hasProEntitlement };
  },

  restore: async () => {
    const customerInfo = await restorePurchasesClient();
    if (!customerInfo) return { success: false, error: 'Nothing to restore right now.' };
    const derived = deriveEntitlement(customerInfo);
    set({ status: 'ready', ...derived });
    return { success: derived.hasProEntitlement };
  },

  reset: () => set(initialState),
}));
