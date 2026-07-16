// Privacy is a feature (PRODUCT_SPEC §5.6) — many users hide this app.
// Locking on every brief backgrounding (a notification swipe, a quick
// app-switch) would be more annoying than protective, so a short grace
// period is allowed before a returning app demands re-authentication.
// Not sourced from any spec number — worth a founder sanity check, same as
// BACKLOG #36's other engineering-chosen thresholds.
export const APP_LOCK_GRACE_PERIOD_MS = 30_000;

export function shouldLockOnForeground(
  backgroundedAt: number | null,
  now: number,
  gracePeriodMs: number = APP_LOCK_GRACE_PERIOD_MS
): boolean {
  if (backgroundedAt === null) return false;
  return now - backgroundedAt >= gracePeriodMs;
}
