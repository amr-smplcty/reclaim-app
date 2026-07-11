import { StyleSheet } from 'react-native';

import { PrimaryButton } from '@/components/primary-button';
import { ThemedText } from '@/components/themed-text';
import { OnboardingLayout } from '@/features/assessment/OnboardingLayout';
import { goNextFrom } from '@/features/assessment/navigation';
import { useOnboardingStore } from '@/features/assessment/useOnboardingStore';
import { getPpcs6Band, scorePpcs6 } from '@/features/assessment/scoring';
import { trackAssessmentCompleted } from '@/lib/analytics/events';
import { Spacing } from '@/constants/theme';

// Results screen (PRODUCT_SPEC §4 step 7) — band table + framing from
// CLINICAL_SPEC §2.3, "the moment of clarity."
export default function ResultsScreen() {
  const answers = useOnboardingStore((s) => s.answers);
  const score = scorePpcs6(answers.ppcs6Responses as number[]);
  const bandInfo = getPpcs6Band(score);

  function handleNext() {
    trackAssessmentCompleted(score, bandInfo.band);
    goNextFrom('results');
  }

  return (
    <OnboardingLayout step="results" contentStyle={styles.content}>
      <ThemedText type="small" themeColor="textSecondary">
        Your score
      </ThemedText>
      <ThemedText type="title" style={styles.score}>
        {score} · {bandInfo.label}
      </ThemedText>
      <ThemedText type="default" style={styles.framing}>
        {bandInfo.framing}
      </ThemedText>
      <ThemedText type="default" themeColor="textSecondary" style={styles.chartPlaceholder}>
        We'll re-measure every 2 weeks — this number going down is your real
        progress.
      </ThemedText>
      {bandInfo.showResourcesLink ? (
        <ThemedText type="link" themeColor="accent" style={styles.resourcesLink}>
          Find professional support resources
        </ThemedText>
      ) : null}
      <PrimaryButton label="Continue" onPress={handleNext} />
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  content: { justifyContent: 'center', gap: Spacing.two },
  score: { marginBottom: Spacing.three },
  framing: { marginBottom: Spacing.four },
  chartPlaceholder: { marginBottom: Spacing.five, fontStyle: 'italic' },
  resourcesLink: { marginBottom: Spacing.four },
});
