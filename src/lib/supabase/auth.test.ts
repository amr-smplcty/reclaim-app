import { continueWithoutAccountDev } from '@/lib/supabase/auth';

describe('continueWithoutAccountDev', () => {
  const originalDev = __DEV__;

  afterEach(() => {
    // @ts-expect-error — __DEV__ is a read-only global in real RN, writable here for the test double
    __DEV__ = originalDev;
  });

  it('returns a local-only marker (no user id) in development', () => {
    // @ts-expect-error — see above
    __DEV__ = true;
    expect(continueWithoutAccountDev()).toEqual({ user: { id: undefined } });
  });

  it('throws outside development so it can never reach a production build', () => {
    // @ts-expect-error — see above
    __DEV__ = false;
    expect(() => continueWithoutAccountDev()).toThrow();
  });
});
