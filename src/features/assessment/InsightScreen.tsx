import { StyleSheet } from 'react-native';

import { PrimaryButton } from '@/components/primary-button';
import { ThemedText } from '@/components/themed-text';
import { OnboardingLayout } from '@/features/assessment/OnboardingLayout';
import { goNextFrom } from '@/features/assessment/navigation';
import { insightForStep } from '@/features/assessment/onboardingInsights';
import type { OnboardingStepId } from '@/features/assessment/useOnboardingStore';
import { Spacing } from '@/theme/tokens';

interface Props {
  step: OnboardingStepId;
}

// Insight interstitial (PRODUCT_SPEC §4 value arc) — copy always comes from
// content/onboarding_insights.json, never invented here. The step machine
// (useOnboardingStore.advance) only routes here when the matching trigger
// held, so a missing insight would mean the content pack and step machine
// have drifted apart.
export function InsightScreen({ step }: Props) {
  const insight = insightForStep(step);
  if (!insight) return null;

  return (
    <OnboardingLayout step={step} contentStyle={styles.content}>
      <ThemedText type="title" style={styles.title}>
        {insight.title}
      </ThemedText>
      <ThemedText type="default" themeColor="textSecondary" style={styles.body}>
        {insight.body}
      </ThemedText>
      <ThemedText type="small" themeColor="textSecondary" style={styles.citation}>
        {insight.citation_short}
      </ThemedText>
      <PrimaryButton label="Continue" onPress={() => goNextFrom(step)} />
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  content: { justifyContent: 'center', gap: Spacing.four },
  title: { marginBottom: Spacing.two },
  body: { marginBottom: Spacing.three },
  citation: { marginBottom: Spacing.four },
});
