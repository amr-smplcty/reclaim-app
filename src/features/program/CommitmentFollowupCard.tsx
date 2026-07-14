import { StyleSheet, View } from 'react-native';

import { ChoiceChip } from '@/components/choice-chip';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import type { CommitmentFollowupAnswer } from '@/types/program';

interface Props {
  commitments: string[];
  onAnswer: (answer: CommitmentFollowupAnswer) => void;
}

// Next-day follow-up for a checklist_commit exercise's followup_next_day
// (CLINICAL_SPEC Week 2 Day 4/5) — same neutral tone regardless of the
// answer, no shame copy on "no."
export function CommitmentFollowupCard({ commitments, onAnswer }: Props) {
  return (
    <ThemedView style={styles.card}>
      <ThemedText type="subtitle" style={styles.title}>
        Last time, you committed to:
      </ThemedText>
      {commitments.map((commitment) => (
        <ThemedText key={commitment} type="default" themeColor="textSecondary">
          • {commitment}
        </ThemedText>
      ))}
      <ThemedText type="default" style={styles.question}>
        Did they happen?
      </ThemedText>
      <View style={styles.answerRow}>
        <ChoiceChip label="Yes" selected={false} onPress={() => onAnswer('yes')} />
        <ChoiceChip label="Partly" selected={false} onPress={() => onAnswer('partly')} />
        <ChoiceChip label="No" selected={false} onPress={() => onAnswer('no')} />
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 12, padding: Spacing.three, marginBottom: Spacing.four, gap: Spacing.one },
  title: { marginBottom: Spacing.one },
  question: { marginTop: Spacing.two, marginBottom: Spacing.two },
  answerRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
});
