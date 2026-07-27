const mockInvoke = jest.fn();
const mockSignOut = jest.fn();
const mockDeleteEq = jest.fn();

// INC-11: jest.mock factories reference outer vars only through closures, and
// only `mock`-prefixed names are allowed out-of-scope — so the .from().delete()
// .eq() chain is built inline here rather than via an unprefixed helper.
jest.mock('@/lib/supabase/client', () => ({
  supabase: {
    from: () => ({ delete: () => ({ eq: (col: string, val: string) => mockDeleteEq(col, val) }) }),
    functions: { invoke: (...args: unknown[]) => mockInvoke(...args) },
    auth: { signOut: (...args: unknown[]) => mockSignOut(...args) },
  },
}));

import { deleteAccountRemotely } from '@/features/settings/deleteAccount';

describe('deleteAccountRemotely — Edge Function invocation path (BACKLOG #40)', () => {
  let warnSpy: jest.SpyInstance;

  beforeEach(() => {
    mockInvoke.mockReset().mockResolvedValue({ data: { success: true }, error: null });
    mockSignOut.mockReset().mockResolvedValue({ error: null });
    mockDeleteEq.mockReset().mockResolvedValue({ error: null });
    warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    warnSpy.mockRestore();
  });

  it('invokes the delete-account function BEFORE signing out, so the session JWT is still available to authenticate it', async () => {
    const order: string[] = [];
    mockInvoke.mockImplementation(async () => {
      order.push('invoke');
      return { data: { success: true }, error: null };
    });
    mockSignOut.mockImplementation(async () => {
      order.push('signOut');
      return { error: null };
    });

    await deleteAccountRemotely('user-123');

    expect(mockInvoke).toHaveBeenCalledWith('delete-account', { method: 'POST' });
    expect(order).toEqual(['invoke', 'signOut']);
  });

  it('still deletes the client-reachable table rows (defense-in-depth) alongside the function call', async () => {
    await deleteAccountRemotely('user-123');
    expect(mockDeleteEq).toHaveBeenCalledWith('user_id', 'user-123'); // legal_acceptances + assessment_history
    expect(mockDeleteEq).toHaveBeenCalledTimes(2);
  });

  it('completes gracefully (no throw) when the function is NOT yet deployed, logging the residual-auth-row gap', async () => {
    mockInvoke.mockResolvedValue({ data: null, error: { message: 'Function not found' } });

    await expect(deleteAccountRemotely('user-123')).resolves.toBeUndefined();

    // Session still ended and rows still deleted — current behavior preserved.
    expect(mockSignOut).toHaveBeenCalledTimes(1);
    expect(mockDeleteEq).toHaveBeenCalledTimes(2);
    // The gap is logged, not swallowed silently.
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('delete-account Edge Function unavailable'),
      'Function not found'
    );
  });

  it('does not warn about the function when it IS reachable', async () => {
    await deleteAccountRemotely('user-123');
    const warnedAboutFunction = warnSpy.mock.calls.some(
      (call) => typeof call[0] === 'string' && call[0].includes('delete-account Edge Function unavailable')
    );
    expect(warnedAboutFunction).toBe(false);
  });
});
