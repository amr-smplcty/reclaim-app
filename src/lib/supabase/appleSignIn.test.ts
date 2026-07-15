import { shouldOfferAppleSignIn } from '@/lib/supabase/appleSignIn';

describe('shouldOfferAppleSignIn', () => {
  it('offers Apple sign-in on iOS when the native module reports available', () => {
    expect(shouldOfferAppleSignIn('ios', true)).toBe(true);
  });

  it('hides it on iOS when unavailable (e.g. Expo Go, no dev-client entitlement)', () => {
    expect(shouldOfferAppleSignIn('ios', false)).toBe(false);
  });

  it('hides it on any non-iOS platform regardless of the availability flag', () => {
    expect(shouldOfferAppleSignIn('android', true)).toBe(false);
    expect(shouldOfferAppleSignIn('web', true)).toBe(false);
  });
});
