import { StyleSheet } from 'react-native';
import * as Notifications from 'expo-notifications';

import { PrimaryButton } from '@/components/primary-button';
import { ThemedText } from '@/components/themed-text';
import { OnboardingLayout } from '@/features/assessment/OnboardingLayout';
import { goNextFrom } from '@/features/assessment/navigation';
import { useOnboardingStore } from '@/features/assessment/useOnboardingStore';
import { Spacing } from '@/constants/theme';

// PRODUCT_SPEC §4 step 9 — permission primer, then the OS prompt. Actual
// reminder scheduling (daily/risky-window/re-assessment, PRODUCT_SPEC §7) is Epic 9.
export default function NotificationsScreen() {
  const updateAnswers = useOnboardingStore((s) => s.updateAnswers);

  async function handleEnable() {
    try {
      await Notifications.requestPermissionsAsync();
    } catch {
      // Permission dialog unavailable (e.g. simulator without push capability) — proceed regardless.
    }
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
