import type { PurchasesOffering, PurchasesPackage } from 'react-native-purchases';

export interface SubscriptionPackageView {
  identifier: string;
  packageType: string;
  priceString: string;
  title: string;
  hasFreeTrial: boolean;
}

export interface PaywallOfferingView {
  annual: SubscriptionPackageView | null;
  monthly: SubscriptionPackageView | null;
}

function toPackageView(pkg: PurchasesPackage): SubscriptionPackageView {
  const product = pkg.product as unknown as { priceString: string; title: string; introPrice?: unknown };
  return {
    identifier: pkg.identifier,
    packageType: pkg.packageType,
    priceString: product.priceString,
    title: product.title,
    hasFreeTrial: product.introPrice != null,
  };
}

// PRODUCT_SPEC §6 — annual highlighted (default), monthly secondary. Reads
// RevenueCat's own annual/monthly convenience accessors on the current
// offering rather than guessing package identity from availablePackages order.
export function toPaywallOfferingView(offering: PurchasesOffering | null | undefined): PaywallOfferingView {
  if (!offering) return { annual: null, monthly: null };
  return {
    annual: offering.annual ? toPackageView(offering.annual) : null,
    monthly: offering.monthly ? toPackageView(offering.monthly) : null,
  };
}

// PRODUCT_SPEC §6 — "save 68%" framing on annual, computed from the real
// fetched prices rather than a hardcoded percentage, so it can never drift
// out of sync with an actual App Store Connect price change.
export function annualSavingsPercent(view: PaywallOfferingView): number | null {
  if (!view.annual || !view.monthly) return null;
  const annualPrice = parsePriceNumber(view.annual.priceString);
  const monthlyPrice = parsePriceNumber(view.monthly.priceString);
  if (annualPrice == null || monthlyPrice == null || monthlyPrice === 0) return null;

  const yearlyIfMonthly = monthlyPrice * 12;
  const savings = (1 - annualPrice / yearlyIfMonthly) * 100;
  return Math.round(savings);
}

function parsePriceNumber(priceString: string): number | null {
  const match = priceString.match(/[\d.,]+/);
  if (!match) return null;
  const normalized = match[0].replace(/,/g, '');
  const value = Number(normalized);
  return Number.isFinite(value) ? value : null;
}
