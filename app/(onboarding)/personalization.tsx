import { StyleSheet } from 'react-native';

import { PrimaryButton } from '@/components/primary-button';
import { ThemedText } from '@/components/themed-text';
import { OnboardingLayout } from '@/features/assessment/OnboardingLayout';
import { goNextFrom } from '@/features/assessment/navigation';
import { useOnboardingStore } from '@/features/assessment/useOnboardingStore';
import { getIntakeContent } from '@/lib/content';
import { Spacing } from '@/theme/tokens';

// PRODUCT_SPEC §4 step 8 — "Your plan: 6 weeks, ~10 min/day, focused on [top motivations]."
export default function PersonalizationScreen() {
  const answers = useOnboardingStore((s) => s.answers);
  const { motivations } = getIntakeContent();

  const selectedLabels = motivations
    .filter((m) => answers.motivations.includes(m.id as never))
    .map((m) => m.label)
    .join(', ');

  return (
    <OnboardingLayout step="personalization" contentStyle={styles.content}>
      <ThemedText type="title" style={styles.title}>
        Your plan
      </ThemedText>
      <ThemedText type="default">
        6 weeks, ~10 min/day, focused on {selectedLabels || 'building a program that works for you'}.
      </ThemedText>
      <PrimaryButton label="Continue" onPress={() => goNextFrom('personalization')} />
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  content: { justifyContent: 'center', gap: Spacing.four },
  title: { marginBottom: Spacing.two },
});
