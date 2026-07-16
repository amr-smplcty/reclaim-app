import { useEffect, useRef } from 'react';
import { AppState, StyleSheet, type AppStateStatus } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { PrimaryButton } from '@/components/primary-button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/use-theme';
import { authenticateForUnlock, isAppLockAvailable } from '@/features/lock/localAuth';
import { useLockStore } from '@/features/lock/useLockStore';
import { useSettingsStore } from '@/features/settings/useSettingsStore';
import { Spacing } from '@/theme/tokens';

// Wraps the whole app (app/_layout.tsx) so the lock screen can intercept any
// screen — cold start starts locked (useLockStore's own initial state), and
// returning from background re-locks after a grace period (lockPolicy.ts).
export function AppLockGate({ children }: { children: React.ReactNode }) {
  const theme = useTheme();
  const appLockEnabled = useSettingsStore((s) => s.appLockEnabled);
  const isLocked = useLockStore((s) => s.isLocked);
  const unlock = useLockStore((s) => s.unlock);
  const recordBackgrounded = useLockStore((s) => s.recordBackgrounded);
  const handleForeground = useLockStore((s) => s.handleForeground);
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (next: AppStateStatus) => {
      if (appState.current === 'active' && next !== 'active') {
        recordBackgrounded(Date.now());
      } else if (appState.current !== 'active' && next === 'active') {
        handleForeground(Date.now());
      }
      appState.current = next;
    });
    return () => subscription.remove();
  }, [recordBackgrounded, handleForeground]);

  // Never trap a user behind a lock screen hardware can't service (INC-2
  // standing rule) — if Face ID/passcode stops being available after the
  // toggle was turned on (e.g. biometrics later disabled in device Settings),
  // wave the lock through rather than leaving no way back in.
  useEffect(() => {
    if (!appLockEnabled || !isLocked) return;
    isAppLockAvailable().then((available) => {
      if (!available) {
        console.warn('[AppLockGate] App lock is enabled but no biometrics/passcode is available — unlocking.');
        unlock();
      }
    });
  }, [appLockEnabled, isLocked, unlock]);

  if (!appLockEnabled || !isLocked) {
    return <>{children}</>;
  }

  async function handleUnlockPress() {
    const success = await authenticateForUnlock();
    if (success) unlock();
  }

  return (
    <ThemedView style={styles.container}>
      <Ionicons name="lock-closed-outline" size={48} color={theme.textSecondary} style={styles.icon} />
      <ThemedText type="title" style={styles.title}>
        Reclaim is locked
      </ThemedText>
      <ThemedText type="default" themeColor="textSecondary" style={styles.subtitle}>
        Verify it's you to continue.
      </ThemedText>
      <PrimaryButton label="Unlock" onPress={handleUnlockPress} />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: Spacing.four, gap: Spacing.two },
  icon: { marginBottom: Spacing.two },
  title: { textAlign: 'center' },
  subtitle: { textAlign: 'center', marginBottom: Spacing.three },
});
