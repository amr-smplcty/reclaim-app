import { StyleSheet, View } from 'react-native';

import { PrimaryButton } from '@/components/primary-button';
import { ThemedText } from '@/components/themed-text';
import { OnboardingLayout } from '@/features/assessment/OnboardingLayout';
import { goNextFrom } from '@/features/assessment/navigation';
import { useOnboardingStore } from '@/features/assessment/useOnboardingStore';
import { getPpcs6Band, PPCS6_SCORE_MAX, scorePpcs6 } from '@/features/assessment/scoring';
import { bandColorToken, scoreScaleFraction } from '@/features/assessment/resultsVisual';
import { trackAssessmentCompleted } from '@/lib/analytics/events';
import { getPpcs6Assessment } from '@/lib/content';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/theme/tokens';

const { citation_short: citationShort } = getPpcs6Assessment();

// Results screen (PRODUCT_SPEC §4 step 7) — band table + framing from
// CLINICAL_SPEC §2.3, "the moment of clarity." Reworked per PRODUCT_SPEC §4's
// "payoff scene" framing: score plotted on a visual scale, band-colored from
// the token system. All legally-required copy below is unchanged.
export default function ResultsScreen() {
  const theme = useTheme();
  const answers = useOnboardingStore((s) => s.answers);
  const score = scorePpcs6(answers.ppcs6Responses as number[]);
  const bandInfo = getPpcs6Band(score);
  const bandColor = theme[bandColorToken(bandInfo.band)];

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
        {score} / {PPCS6_SCORE_MAX} · {bandInfo.label}
      </ThemedText>
      <View style={[styles.scaleTrack, { backgroundColor: theme.surface }]}>
        <View style={[styles.scaleFill, { backgroundColor: bandColor, width: `${scoreScaleFraction(score) * 100}%` }]} />
      </View>
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
      <ThemedText type="small" themeColor="textSecondary" style={styles.legalFooter}>
        Screening result, not a diagnosis. Based on the PPCS-6 ({citationShort}).
        If your struggles feel bigger than an app, a licensed professional is
        the right next step — and that's a strong move, not a defeat.
      </ThemedText>
      <PrimaryButton label="Continue" onPress={handleNext} />
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  content: { justifyContent: 'center', gap: Spacing.two },
  score: { marginBottom: Spacing.two },
  scaleTrack: { height: 8, borderRadius: 4, overflow: 'hidden', marginBottom: Spacing.four },
  scaleFill: { height: 8, borderRadius: 4 },
  framing: { marginBottom: Spacing.four },
  chartPlaceholder: { marginBottom: Spacing.five, fontStyle: 'italic' },
  resourcesLink: { marginBottom: Spacing.four },
  legalFooter: { marginBottom: Spacing.four },
});
