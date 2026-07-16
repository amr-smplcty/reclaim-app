import { APP_LOCK_GRACE_PERIOD_MS, shouldLockOnForeground } from '@/features/lock/lockPolicy';

describe('shouldLockOnForeground — app-lock grace period (PRODUCT_SPEC §5.6)', () => {
  it('does not lock when the app was never backgrounded this session', () => {
    expect(shouldLockOnForeground(null, 1_000_000)).toBe(false);
  });

  it('does not lock when returning well inside the grace period', () => {
    const backgroundedAt = 1_000_000;
    const now = backgroundedAt + 1_000; // 1s later, comfortably inside the window
    expect(shouldLockOnForeground(backgroundedAt, now)).toBe(false);
  });

  it('does not lock the instant before the grace period elapses', () => {
    const backgroundedAt = 1_000_000;
    const now = backgroundedAt + APP_LOCK_GRACE_PERIOD_MS - 1;
    expect(shouldLockOnForeground(backgroundedAt, now)).toBe(false);
  });

  it('locks exactly at the grace period boundary', () => {
    const backgroundedAt = 1_000_000;
    const now = backgroundedAt + APP_LOCK_GRACE_PERIOD_MS;
    expect(shouldLockOnForeground(backgroundedAt, now)).toBe(true);
  });

  it('locks well after the grace period has elapsed', () => {
    const backgroundedAt = 1_000_000;
    const now = backgroundedAt + APP_LOCK_GRACE_PERIOD_MS * 10;
    expect(shouldLockOnForeground(backgroundedAt, now)).toBe(true);
  });

  it('respects a custom grace period override', () => {
    const backgroundedAt = 1_000_000;
    const now = backgroundedAt + 5_000;
    expect(shouldLockOnForeground(backgroundedAt, now, 10_000)).toBe(false);
    expect(shouldLockOnForeground(backgroundedAt, now, 5_000)).toBe(true);
  });

  it('never locks on clock skew where now precedes backgroundedAt', () => {
    const backgroundedAt = 1_000_000;
    const now = backgroundedAt - 5_000;
    expect(shouldLockOnForeground(backgroundedAt, now)).toBe(false);
  });
});
