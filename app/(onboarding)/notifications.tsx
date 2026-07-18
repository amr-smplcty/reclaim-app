import { StyleSheet } from 'react-native';

import { PrimaryButton } from '@/components/primary-button';
import { ThemedText } from '@/components/themed-text';
import { OnboardingLayout } from '@/features/assessment/OnboardingLayout';
import { goNextFrom } from '@/features/assessment/navigation';
import { useOnboardingStore } from '@/features/assessment/useOnboardingStore';
import { requestNotificationPermission } from '@/lib/notifications/availability';
import { Spacing } from '@/theme/tokens';

// PRODUCT_SPEC §4 step 9 — permission primer, then the OS prompt. Actual
// reminder scheduling (daily/risky-window/re-assessment, PRODUCT_SPEC §7,
// Epic 13) is driven by useNotificationScheduler, mounted at the app root —
// it picks up and schedules automatically the moment permission is granted.
export default function NotificationsScreen() {
  const updateAnswers = useOnboardingStore((s) => s.updateAnswers);

  async function handleEnable() {
    // INC-2: availability-checked, graceful either way — requestNotificationPermission
    // never throws, so there's nothing to catch here.
    await requestNotificationPermission();
    updateAnswers({ notificationsRequested: true });
    goNextFrom('notifications');
  }

  return (
    <OnboardingLayout step="notifications" contentStyle={styles.content}>
      <ThemedText type="title" style={styles.title}>
        Stay on track
      </ThemedText>
      <ThemedText type="default" themeColor="textSecondary" style={styles.subtitle}>
        So we can check in daily, and be there at your risky times.
      </ThemedText>
      <PrimaryButton label="Enable notifications" onPress={handleEnable} />
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  content: { justifyContent: 'center', gap: Spacing.four },
  title: { marginBottom: Spacing.two },
  subtitle: { marginBottom: Spacing.two },
});
