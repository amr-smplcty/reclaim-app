import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { router, type Href } from 'expo-router';

import { ChoiceChip } from '@/components/choice-chip';
import { PrimaryButton } from '@/components/primary-button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/use-theme';
import { getPpcs6Assessment } from '@/lib/content';
import { getPpcs6Band, PPCS6_SCORE_MAX } from '@/features/assessment/scoring';
import { hasCompletePpcs6Responses } from '@/features/assessment/assessmentValidity';
import { useAssessmentHistoryStore } from '@/features/assessment/useAssessmentHistoryStore';
import { formatScoreDelta, scoreDelta } from '@/features/assessment/reassessment';
import { bandColorToken, scoreScaleFraction } from '@/features/assessment/resultsVisual';
import { shouldOfferRefresherWeek } from '@/features/program/refresher';
import { useRefresherStore } from '@/features/program/useRefresherStore';
import { trackReassessmentCompleted } from '@/lib/analytics/events';
import { getCurrentUserId } from '@/lib/supabase/auth';
import { recordAssessmentRemotely } from '@/lib/assessment/sync';
import { Spacing } from '@/theme/tokens';

const ppcs6 = getPpcs6Assessment();

// Re-assessment (CLINICAL_SPEC §2.2, PRODUCT_SPEC §5.5) — every 14 days, a
// "past 2 weeks" retake, clearly labelled as a trend snapshot rather than the
// validated 6-month administration. All 6 items on one screen (not one per
// screen like onboarding) so it's completable in under 90 seconds.
export default function ReassessmentScreen() {
  const theme = useTheme();
  const [responses, setResponses] = useState<Array<number | null>>(Array(ppcs6.items.length).fill(null));
  const [result, setResult] = useState<{ score: number; delta: number | null; entryId: string } | null>(null);
  const offerDecisions = useRefresherStore((s) => s.offerDecisions);
  const recordOfferDecision = useRefresherStore((s) => s.recordOfferDecision);

  const canSubmit = responses.every((r) => r !== null);

  function selectResponse(itemIndex: number, value: number) {
    setResponses((prev) => {
      const next = [...prev];
      next[itemIndex] = value;
      return next;
    });
  }

  async function handleSubmit() {
    if (!hasCompletePpcs6Responses(responses)) return;
    const entry = useAssessmentHistoryStore.getState().recordAssessment(responses, 'past_2_weeks');
    const delta = scoreDelta(useAssessmentHistoryStore.getState().entries);
    trackReassessmentCompleted(entry.score, delta);
    setResult({ score: entry.score, delta, entryId: entry.id });

    // Best-effort sync, same pattern as legal acceptance — only if a
    // session already exists; the local encrypted store is the record of
    // truth either way.
    const userId = await getCurrentUserId();
    if (userId) await recordAssessmentRemotely(userId, entry);
  }

  if (result) {
    const bandInfo = getPpcs6Band(result.score);
    const bandColor = theme[bandColorToken(bandInfo.band)];

    // Refresher-week offer (CLINICAL_SPEC §4): only when this specific
    // re-assessment's >=6-point rise hasn't already been decided — a
    // decline is permanent for THIS trigger ("respected without nagging"),
    // but a later, separate qualifying rise (a new entry id) can offer again.
    const offerRefresher =
      shouldOfferRefresherWeek(useAssessmentHistoryStore.getState().entries) && !offerDecisions[result.entryId];

    return (
      <ThemedView style={styles.resultContainer}>
        <ThemedText type="small" themeColor="textSecondary">
          Your trend snapshot
        </ThemedText>
        <ThemedText type="title" style={styles.score}>
          {result.score} / {PPCS6_SCORE_MAX} · {bandInfo.label}
        </ThemedText>
        <View style={[styles.scaleTrack, { backgroundColor: theme.surface }]}>
          <View
            style={[styles.scaleFill, { backgroundColor: bandColor, width: `${scoreScaleFraction(result.score) * 100}%` }]}
          />
        </View>
        {result.delta !== null ? (
          <ThemedText type="default" themeColor="textSecondary" style={styles.delta}>
            {formatScoreDelta(result.delta)} since your last check.
          </ThemedText>
        ) : null}

        {offerRefresher ? (
          <ThemedView style={[styles.refresherOffer, { borderColor: theme.accent, backgroundColor: theme.accentTint }]}>
            <ThemedText type="default" themeColor="accent" style={styles.refresherTitle}>
              Want a refresher week?
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary" style={styles.refresherBody}>
              The greatest hits of your pattern and urge skills — one week, tune-up done.
            </ThemedText>
            <View style={styles.refresherActions}>
              <PrimaryButton
                label="Start the refresher"
                onPress={() => {
                  recordOfferDecision(result.entryId, 'accepted');
                  router.push('/(modals)/refresher-week' as Href);
                }}
              />
              <Pressable
                onPress={() => recordOfferDecision(result.entryId, 'declined')}
                accessibilityRole="button"
                accessibilityLabel="Not now"
                style={styles.declineButton}
              >
                <ThemedText type="link" themeColor="textSecondary">
                  Not now
                </ThemedText>
              </Pressable>
            </View>
          </ThemedView>
        ) : null}

        <PrimaryButton label="Done" onPress={() => router.back()} />
      </ThemedView>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <ThemedText type="title" style={styles.title}>
        Quick trend check
      </ThemedText>
      <ThemedText type="default" themeColor="textSecondary" style={styles.instruction}>
        {ppcs6.timeframe_instruction_reassessment}
      </ThemedText>
      <ThemedText type="small" themeColor="textSecondary" style={styles.note}>
        {ppcs6.reassessment_note}
      </ThemedText>

      {ppcs6.items.map((item, itemIndex) => (
        <View key={item.id} style={styles.block}>
          <ThemedText type="default" style={styles.prompt}>
            {item.text}
          </ThemedText>
          <View style={styles.optionsRow}>
            {ppcs6.scale_labels.map((label, i) => (
              <ChoiceChip
                key={label}
                label={label}
                selected={responses[itemIndex] === i + 1}
                onPress={() => selectResponse(itemIndex, i + 1)}
              />
            ))}
          </View>
        </View>
      ))}

      <PrimaryButton label="Submit" onPress={handleSubmit} disabled={!canSubmit} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: Spacing.four, paddingBottom: Spacing.six },
  title: { marginBottom: Spacing.two },
  instruction: { marginBottom: Spacing.two, fontWeight: '600' },
  note: { marginBottom: Spacing.four },
  block: { marginBottom: Spacing.four },
  prompt: { marginBottom: Spacing.two },
  optionsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.one },
  resultContainer: { flex: 1, justifyContent: 'center', padding: Spacing.four, gap: Spacing.two },
  score: { marginBottom: Spacing.two },
  scaleTrack: { height: 8, borderRadius: 4, overflow: 'hidden', marginBottom: Spacing.three },
  scaleFill: { height: 8, borderRadius: 4 },
  delta: { marginBottom: Spacing.four },
  refresherOffer: { borderWidth: 1, borderRadius: 12, padding: Spacing.three, marginBottom: Spacing.four, gap: Spacing.two },
  refresherTitle: { fontWeight: '700' },
  refresherBody: {},
  refresherActions: { gap: Spacing.two, alignItems: 'stretch' },
  declineButton: { alignItems: 'center', paddingVertical: Spacing.two },
});
