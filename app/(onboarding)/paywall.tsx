import { StyleSheet } from 'react-native';
import { router } from 'expo-router';

import { PrimaryButton } from '@/components/primary-button';
import { ThemedText } from '@/components/themed-text';
import { OnboardingLayout } from '@/features/assessment/OnboardingLayout';
import { useOnboardingStore } from '@/features/assessment/useOnboardingStore';
import { useAppStore } from '@/stores/useAppStore';
import { Spacing } from '@/constants/theme';

// Placeholder for step 11 (PRODUCT_SPEC §4 / §6) — real RevenueCat paywall,
// pricing, and trial wiring land in Epic 3.
export default function PaywallScreen() {
  const setHasOnboarded = useAppStore((s) => s.setHasOnboarded);
  const resetOnboarding = useOnboardingStore((s) => s.reset);

  function handleContinue() {
    setHasOnboarded(true);
    resetOnboarding();
    router.replace('/(tabs)/today');
  }

  return (
    <OnboardingLayout step="paywall" contentStyle={styles.content}>
      <ThemedText type="title" style={styles.title}>
        Paywall
      </ThemedText>
      <ThemedText type="default" themeColor="textSecondary">
        Pricing, trial, and RevenueCat wiring land in Epic 3.
      </ThemedText>
      <PrimaryButton label="Continue" onPress={handleContinue} />
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  content: { justifyContent: 'center', gap: Spacing.four },
  title: { marginBottom: Spacing.two },
});
