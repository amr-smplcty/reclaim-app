import Purchases from 'react-native-purchases';

// Entitlement id per CLAUDE.md — all program content gated behind this, Toolkit's
// Urge Surf + breather stay free (PRODUCT_SPEC §6 ethical floor).
export const REVENUECAT_ENTITLEMENT_ID = 'pro';

// react-native-purchases is a native module and does not run inside Expo Go —
// configure() should only be called from a custom dev client / EAS build (Epic 3).
export function configureRevenueCat(apiKey: string) {
  Purchases.configure({ apiKey });
}
