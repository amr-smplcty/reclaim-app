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
import { useAssessmentHistoryStore } from '@/features/assessment/useAssessmentHistoryStore';
import { trackAssessmentCompleted } from '@/lib/analytics/events';
import { getPpcs6Assessment } from '@/lib/content';
import { useTheme } from '@/hooks/use-theme';
import { space } from '@/theme/tokens';

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

  const responses: number[] = answers.ppcs6Responses;
  const score = scorePpcs6(responses);
  const bandInfo = getPpcs6Band(score);
  const bandColor = theme[bandColorToken(bandInfo.band)];

  function handleNext() {
    // First entry in the permanent assessment history (Epic 7) — this is the
    // fix for the gap INC-8 exposed: the score used to live only in
    // useOnboardingStore.answers, which paywall completion later resets to
    // null. Recorded here (on explicit continue), not in the render body, so
    // re-renders of this screen never append duplicates.
    useAssessmentHistoryStore.getState().recordAssessment(responses, 'past_6_months');
    trackAssessmentCompleted(score, bandInfo.band);
    goNextFrom('results');
  }

  return (
    <OnboardingLayout step="results" contentStyle={styles.content}>
      {/* Deviation (a) from DESIGN_SYSTEM guardrail 8: the PPCS-6 is a
          validated instrument (CLINICAL_SPEC §2), so the number is kept — but
          the BAND leads as the plain-language headline and the number sits
          below as supporting detail, never a bare or rankable figure. */}
      <ThemedText type="small" themeColor="textSecondary">
        Your score
      </ThemedText>
      <ThemedText type="title" style={styles.score}>
        {bandInfo.label}
      </ThemedText>
      <View style={[styles.scaleTrack, { backgroundColor: theme.surfaceRaised }]}>
        <View style={[styles.scaleFill, { backgroundColor: bandColor, width: `${scoreScaleFraction(score) * 100}%` }]} />
      </View>
      <ThemedText type="small" themeColor="textSecondary" style={styles.scoreDetail}>
        {score} / {PPCS6_SCORE_MAX}
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
  content: { justifyContent: 'center', gap: space.sm },
  title: { marginBottom: space.sm },
  subtitle: { marginBottom: space.xl },
  score: { marginBottom: space.sm },
  scaleTrack: { height: 8, borderRadius: 4, overflow: 'hidden', marginBottom: space.sm },
  scaleFill: { height: 8, borderRadius: 4 },
  scoreDetail: { marginBottom: space.xl },
  framing: { marginBottom: space.xl },
  chartPlaceholder: { marginBottom: space.xxl, fontStyle: 'italic' },
  resourcesLink: { marginBottom: space.xl },
  legalFooter: { marginBottom: space.xl },
});
