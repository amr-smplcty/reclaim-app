import { annualSavingsPercent, toPaywallOfferingView } from '@/features/paywall/offerings';
import type { PurchasesOffering, PurchasesPackage } from 'react-native-purchases';

function makePackage(overrides: Partial<{ priceString: string; introPrice: unknown; packageType: string }> = {}): PurchasesPackage {
  return {
    identifier: '$rc_annual',
    packageType: overrides.packageType ?? 'ANNUAL',
    product: {
      priceString: overrides.priceString ?? '$49.99',
      title: 'Reclaim Annual',
      introPrice: 'introPrice' in overrides ? overrides.introPrice : { priceString: '$0.00' },
    },
  } as unknown as PurchasesPackage;
}

describe('toPaywallOfferingView', () => {
  it('returns null for both when there is no current offering', () => {
    expect(toPaywallOfferingView(null)).toEqual({ annual: null, monthly: null });
    expect(toPaywallOfferingView(undefined)).toEqual({ annual: null, monthly: null });
  });

  it('maps the annual and monthly convenience accessors into the paywall view', () => {
    const offering = {
      annual: makePackage({ priceString: '$49.99', packageType: 'ANNUAL' }),
      monthly: makePackage({ priceString: '$12.99', packageType: 'MONTHLY', introPrice: null }),
    } as unknown as PurchasesOffering;

    const view = toPaywallOfferingView(offering);
    expect(view.annual).toMatchObject({ priceString: '$49.99', packageType: 'ANNUAL', hasFreeTrial: true });
    expect(view.monthly).toMatchObject({ priceString: '$12.99', packageType: 'MONTHLY', hasFreeTrial: false });
  });

  it('leaves a missing package as null rather than throwing (e.g. offering configured with only one package)', () => {
    const offering = { annual: makePackage(), monthly: null } as unknown as PurchasesOffering;
    const view = toPaywallOfferingView(offering);
    expect(view.annual).not.toBeNull();
    expect(view.monthly).toBeNull();
  });
});

describe('annualSavingsPercent — PRODUCT_SPEC §6 "save X%" framing, computed from real fetched prices', () => {
  it('computes the real percentage matching the spec-quoted pricing ($12.99/mo vs $49.99/yr)', () => {
    const view = toPaywallOfferingView({
      annual: makePackage({ priceString: '$49.99' }),
      monthly: makePackage({ priceString: '$12.99', packageType: 'MONTHLY' }),
    } as unknown as PurchasesOffering);

    // $12.99 * 12 = $155.88; $49.99 / $155.88 = ~68% savings.
    expect(annualSavingsPercent(view)).toBe(68);
  });

  it('returns null when either package is missing rather than dividing by a missing price', () => {
    expect(annualSavingsPercent({ annual: null, monthly: null })).toBeNull();
    const onlyAnnual = toPaywallOfferingView({ annual: makePackage(), monthly: null } as unknown as PurchasesOffering);
    expect(annualSavingsPercent(onlyAnnual)).toBeNull();
  });
});
