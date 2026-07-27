import { Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/use-theme';
import { RiskyWindowOffer } from '@/features/notifications/RiskyWindowOffer';
import { useAssessmentHistoryStore } from '@/features/assessment/useAssessmentHistoryStore';
import { useToolkitStore } from '@/features/toolkit/useToolkitStore';
import { useSettingsStore } from '@/features/settings/useSettingsStore';
import { useProgramStore } from '@/features/program/useProgramStore';
import { useJournalStore } from '@/features/journal/useJournalStore';
import { isReassessmentDue } from '@/features/assessment/reassessment';
import { evaluateRiskyWindowEligibility } from '@/lib/notifications/riskyWindow';
import { resolveTopBanner } from '@/features/journey/banners';
import { lastActivityTimestamp, selectWelcomeBackLine, shouldShowWelcomeBack } from '@/features/journey/welcomeBack';
import { getJourneyContent } from '@/lib/content/journey';
import { Spacing, radius } from '@/theme/tokens';

// The single top-of-Today banner slot. Enforces the PRODUCT_SPEC §5.7
// "never stacks" rule via banners.resolveTopBanner's priority order
// (crisis > re-assessment due > risky-window offer > welcome back). Crisis is
// a full-screen interrupt (navigated to on crisis language), never a Today
// banner, so it's not among the flags here — but the priority still guarantees
// only one banner renders.
export function TodayTopBanner() {
  const theme = useTheme();
  const assessmentEntries = useAssessmentHistoryStore((s) => s.entries);
  const urgeLogs = useToolkitStore((s) => s.urgeLogs);
  const toolUses = useToolkitStore((s) => s.toolUses);
  const riskyWindowOfferDecided = useSettingsStore((s) => s.riskyWindowOfferDecided);
  const completions = useProgramStore((s) => s.completions);
  const checkins = useJournalStore((s) => s.checkins);

  const now = new Date();

  const latestAssessment = assessmentEntries.at(-1);
  const reassessmentDue = latestAssessment ? isReassessmentDue(latestAssessment.timestamp, now) : false;

  const riskyEligible =
    !riskyWindowOfferDecided &&
    evaluateRiskyWindowEligibility(urgeLogs.map((u) => u.timestamp), toolUses).eligible;

  const lastActivity = lastActivityTimestamp(
    Object.values(completions).map((c) => c.lastActivityAt),
    checkins.map((c) => c.timestamp)
  );
  const welcomeBack = shouldShowWelcomeBack(lastActivity, now);

  const top = resolveTopBanner({
    reassessment_due: reassessmentDue,
    risky_window_offer: riskyEligible,
    welcome_back: welcomeBack,
  });

  if (top === 'reassessment_due') {
    return (
      <Pressable
        onPress={() => router.push('/(modals)/reassessment')}
        accessibilityRole="button"
        accessibilityLabel="Time for your trend check-in"
        style={[styles.banner, { backgroundColor: theme.surfaceRaised, borderColor: theme.accent }]}
      >
        <ThemedText type="default" style={styles.bannerText}>
          Time for your trend check-in — under 90 seconds.
        </ThemedText>
      </Pressable>
    );
  }

  if (top === 'risky_window_offer') {
    return <RiskyWindowOffer />;
  }

  if (top === 'welcome_back') {
    const line = selectWelcomeBackLine(getJourneyContent().welcome_back, now);
    if (!line) return null;
    return (
      <ThemedView style={[styles.welcomeBack, { borderColor: theme.border }]}>
        <ThemedText type="default" themeColor="textSecondary">
          {line}
        </ThemedText>
      </ThemedView>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  banner: { borderWidth: 1, borderRadius: radius.card, padding: Spacing.three, marginBottom: Spacing.four },
  bannerText: { fontWeight: '600' },
  welcomeBack: { borderWidth: 1, borderRadius: radius.card, padding: Spacing.three, marginBottom: Spacing.four },
});
