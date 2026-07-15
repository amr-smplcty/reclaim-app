import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';

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
import { trackReassessmentCompleted } from '@/lib/analytics/events';
import { Spacing } from '@/theme/tokens';

const ppcs6 = getPpcs6Assessment();

// Re-assessment (CLINICAL_SPEC §2.2, PRODUCT_SPEC §5.5) — every 14 days, a
// "past 2 weeks" retake, clearly labelled as a trend snapshot rather than the
// validated 6-month administration. All 6 items on one screen (not one per
// screen like onboarding) so it's completable in under 90 seconds.
export default function ReassessmentScreen() {
  const theme = useTheme();
  const [responses, setResponses] = useState<Array<number | null>>(Array(ppcs6.items.length).fill(null));
  const [result, setResult] = useState<{ score: number; delta: number | null } | null>(null);

  const canSubmit = responses.every((r) => r !== null);

  function selectResponse(itemIndex: number, value: number) {
    setResponses((prev) => {
      const next = [...prev];
      next[itemIndex] = value;
      return next;
    });
  }

  function handleSubmit() {
    if (!hasCompletePpcs6Responses(responses)) return;
    const entry = useAssessmentHistoryStore.getState().recordAssessment(responses, 'past_2_weeks');
    const delta = scoreDelta(useAssessmentHistoryStore.getState().entries);
    trackReassessmentCompleted(entry.score, delta);
    setResult({ score: entry.score, delta });
  }

  if (result) {
    const bandInfo = getPpcs6Band(result.score);
    const bandColor = theme[bandColorToken(bandInfo.band)];

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
});
