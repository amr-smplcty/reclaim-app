import Purchases, {
  type CustomerInfo,
  type PurchasesOfferings,
  type PurchasesPackage,
} from 'react-native-purchases';

import { isRevenueCatAvailable } from '@/lib/revenuecat/availability';

// Entitlement id per CLAUDE.md — all program content gated behind this, Toolkit's
// Urge Surf + breather stay free (PRODUCT_SPEC §6 ethical floor).
export const REVENUECAT_ENTITLEMENT_ID = 'pro';

// react-native-purchases is a native module and does not run inside Expo Go —
// configure() should only be called from a custom dev client / EAS build (Epic 3).
export function configureRevenueCat(apiKey: string) {
  if (!isRevenueCatAvailable()) return;
  Purchases.configure({ apiKey });
}

export type PurchaseOutcome =
  | { kind: 'success'; customerInfo: CustomerInfo }
  | { kind: 'cancelled' }
  | { kind: 'error'; message: string };

// Every wrapper below is INC-2 availability-checked and try/catch-guarded —
// none of them ever throw. Callers (useSubscriptionStore) get a plain
// null/outcome value to branch on instead (INC-8: no user-facing throws).
export async function fetchCustomerInfo(): Promise<CustomerInfo | null> {
  if (!isRevenueCatAvailable()) return null;
  try {
    return await Purchases.getCustomerInfo();
  } catch {
    return null;
  }
}

export async function fetchOfferings(): Promise<PurchasesOfferings | null> {
  if (!isRevenueCatAvailable()) return null;
  try {
    return await Purchases.getOfferings();
  } catch {
    return null;
  }
}

export async function purchasePackage(pkg: PurchasesPackage): Promise<PurchaseOutcome> {
  if (!isRevenueCatAvailable()) return { kind: 'error', message: 'Purchases are unavailable in this build.' };
  try {
    const result = await Purchases.purchasePackage(pkg);
    return { kind: 'success', customerInfo: result.customerInfo };
  } catch (e) {
    const error = e as { userCancelled?: boolean; message?: string };
    if (error?.userCancelled) return { kind: 'cancelled' };
    return { kind: 'error', message: error?.message ?? 'Purchase failed. Please try again.' };
  }
}

export async function restorePurchases(): Promise<CustomerInfo | null> {
  if (!isRevenueCatAvailable()) return null;
  try {
    return await Purchases.restorePurchases();
  } catch {
    return null;
  }
}
