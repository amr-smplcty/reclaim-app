import { useLockStore } from '@/features/lock/useLockStore';
import { APP_LOCK_GRACE_PERIOD_MS } from '@/features/lock/lockPolicy';

describe('useLockStore — app-lock runtime state (PRODUCT_SPEC §5.6)', () => {
  beforeEach(() => {
    // Not persisted (cold start always relocks by construction — the store's
    // initial state below IS the cold-start state), so tests reset by hand.
    useLockStore.setState({ isLocked: true, backgroundedAt: null });
  });

  it('starts locked, as a fresh module load (cold start) would be', () => {
    expect(useLockStore.getState().isLocked).toBe(true);
    expect(useLockStore.getState().backgroundedAt).toBeNull();
  });

  it('unlock() clears the locked state', () => {
    useLockStore.getState().unlock();
    expect(useLockStore.getState().isLocked).toBe(false);
  });

  it('recordBackgrounded stamps the backgrounded time without locking', () => {
    useLockStore.getState().unlock();
    useLockStore.getState().recordBackgrounded(1_000_000);
    expect(useLockStore.getState().backgroundedAt).toBe(1_000_000);
    expect(useLockStore.getState().isLocked).toBe(false);
  });

  it('handleForeground relocks once the grace period has elapsed', () => {
    useLockStore.getState().unlock();
    useLockStore.getState().recordBackgrounded(1_000_000);

    useLockStore.getState().handleForeground(1_000_000 + APP_LOCK_GRACE_PERIOD_MS);

    expect(useLockStore.getState().isLocked).toBe(true);
    expect(useLockStore.getState().backgroundedAt).toBeNull();
  });

  it('handleForeground leaves an unlocked app unlocked inside the grace period', () => {
    useLockStore.getState().unlock();
    useLockStore.getState().recordBackgrounded(1_000_000);

    useLockStore.getState().handleForeground(1_000_000 + 1_000);

    expect(useLockStore.getState().isLocked).toBe(false);
    expect(useLockStore.getState().backgroundedAt).toBeNull();
  });

  it('handleForeground is a no-op when the app was never backgrounded', () => {
    useLockStore.getState().unlock();
    useLockStore.getState().handleForeground(1_000_000);
    expect(useLockStore.getState().isLocked).toBe(false);
  });
});
