import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';

import { PrimaryButton } from '@/components/primary-button';
import { ThemedText } from '@/components/themed-text';
import { OnboardingLayout } from '@/features/assessment/OnboardingLayout';
import { goNextFrom, routeForStep } from '@/features/assessment/navigation';
import { useOnboardingStore } from '@/features/assessment/useOnboardingStore';
import { getPpcs6Band, PPCS6_SCORE_MAX, scorePpcs6 } from '@/features/assessment/scoring';
import { bandColorToken, scoreScaleFraction } from '@/features/assessment/resultsVisual';
import { hasCompletePpcs6Responses } from '@/features/assessment/assessmentValidity';
import { trackAssessmentCompleted } from '@/lib/analytics/events';
import { getPpcs6Assessment } from '@/lib/content';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/theme/tokens';

const { citation_short: citationShort } = getPpcs6Assessment();

// Recovery path for when this screen is reached with missing/invalid PPCS-6
// responses — e.g. a stale off-screen instance re-rendering after the
// onboarding store was reset elsewhere (paywall completion), or a corrupted
// resume-on-relaunch state. Never let the strict scorer's throw reach a
// render; send the user back to redo the assessment instead of a red screen.
function ResultsRecovery() {
  function handleContinue() {
    useOnboardingStore.getState().goToStep('ppcs6');
    router.replace(routeForStep('ppcs6'));
  }

  return (
    <OnboardingLayout step="results" showBack={false} contentStyle={styles.content}>
      <ThemedText type="title" style={styles.title}>
        Let's pick up where you left off.
      </ThemedText>
      <ThemedText type="default" themeColor="textSecondary" style={styles.subtitle}>
        Looks like your screening answers didn't come through. Let's finish
        those questions.
      </ThemedText>
      <PrimaryButton label="Continue" onPress={handleContinue} />
    </OnboardingLayout>
  );
}

// Results screen (PRODUCT_SPEC §4 step 7) — band table + framing from
// CLINICAL_SPEC §2.3, "the moment of clarity." Reworked per PRODUCT_SPEC §4's
// "payoff scene" framing: score plotted on a visual scale, band-colored from
// the token system. All legally-required copy below is unchanged.
export default function ResultsScreen() {
  const theme = useTheme();
  const answers = useOnboardingStore((s) => s.answers);

  if (!hasCompletePpcs6Responses(answers.ppcs6Responses)) {
    return <ResultsRecovery />;
  }

  const score = scorePpcs6(answers.ppcs6Responses);
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
  title: { marginBottom: Spacing.two },
  subtitle: { marginBottom: Spacing.four },
  score: { marginBottom: Spacing.two },
  scaleTrack: { height: 8, borderRadius: 4, overflow: 'hidden', marginBottom: Spacing.four },
  scaleFill: { height: 8, borderRadius: 4 },
  framing: { marginBottom: Spacing.four },
  chartPlaceholder: { marginBottom: Spacing.five, fontStyle: 'italic' },
  resourcesLink: { marginBottom: Spacing.four },
  legalFooter: { marginBottom: Spacing.four },
});
