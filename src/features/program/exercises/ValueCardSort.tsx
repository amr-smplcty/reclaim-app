import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { PrimaryButton } from '@/components/primary-button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/use-theme';
import { Spacing, radius } from '@/theme/tokens';
import type { ValueCardSortOutput, ValueCardSortPayload } from '@/types/program';
import {
  applyKeepDecision,
  finalizeTop5,
  isSortComplete,
  needsRanking,
  toggleRank,
  type SortState,
} from '@/features/program/valueCardSort';

interface Props {
  payload: ValueCardSortPayload;
  onSubmit: (output: ValueCardSortOutput) => void;
}

// Two native phases, no gesture library needed: review the deck one card at
// a time (keep/discard), then — only if there's actually something to rank
// — tap the keepers in the order that matters most (a numbered badge marks
// each pick; tap again to un-rank).
export function ValueCardSort({ payload, onSubmit }: Props) {
  const theme = useTheme();
  const [sortState, setSortState] = useState<SortState>({ index: 0, kept: [] });
  const [ranked, setRanked] = useState<string[]>([]);

  const sortDone = isSortComplete(sortState, payload.deck.length);

  function handleDecision(keep: boolean) {
    setSortState((prev) => applyKeepDecision(prev, payload.deck, keep));
  }

  function startOver() {
    setSortState({ index: 0, kept: [] });
    setRanked([]);
  }

  function handleSave(top5: string[]) {
    onSubmit({ kept: sortState.kept, top5 });
  }

  if (!sortDone) {
    const card = payload.deck[sortState.index];
    return (
      <View style={styles.container}>
        <ThemedText type="small" themeColor="textSecondary" style={styles.progress}>
          {sortState.index + 1} of {payload.deck.length}
        </ThemedText>
        <ThemedView style={[styles.card, { borderColor: theme.border }]}>
          <ThemedText type="title" style={styles.cardLabel}>
            {card.label}
          </ThemedText>
          <ThemedText type="default" themeColor="textSecondary">
            {card.hint}
          </ThemedText>
        </ThemedView>
        <View style={styles.decisionRow}>
          <Pressable
            onPress={() => handleDecision(false)}
            accessibilityRole="button"
            accessibilityLabel="Not for me"
            style={[styles.decisionButton, { borderColor: theme.border }]}
          >
            <ThemedText type="default" themeColor="textSecondary">
              Not for me
            </ThemedText>
          </Pressable>
          <Pressable
            onPress={() => handleDecision(true)}
            accessibilityRole="button"
            accessibilityLabel="Keep"
            style={[styles.decisionButton, { backgroundColor: theme.accent, borderColor: theme.accent }]}
          >
            <ThemedText type="default" style={{ color: theme.bg, fontWeight: '700' }}>
              Keep
            </ThemedText>
          </Pressable>
        </View>
      </View>
    );
  }

  if (sortState.kept.length === 0) {
    return (
      <View style={styles.container}>
        <ThemedText type="subtitle" style={styles.emptyTitle}>
          You didn't keep any this time.
        </ThemedText>
        <ThemedText type="default" themeColor="textSecondary" style={styles.emptyBody}>
          That's alright — go back through and be honest about what actually matters, even if it's uncomfortable.
        </ThemedText>
        <PrimaryButton label="Start over" onPress={startOver} />
      </View>
    );
  }

  if (!needsRanking(sortState.kept, payload.keep_count)) {
    const top5 = finalizeTop5(sortState.kept, ranked, payload.keep_count);
    return (
      <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
        <ThemedText type="subtitle" style={styles.rankTitle}>
          Your values
        </ThemedText>
        {top5.map((label) => (
          <ThemedText key={label} type="default" style={styles.confirmItem}>
            {label}
          </ThemedText>
        ))}
        <PrimaryButton label="Save" onPress={() => handleSave(top5)} />
      </ScrollView>
    );
  }

  const canSave = ranked.length === payload.keep_count;

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
      <ThemedText type="subtitle" style={styles.rankTitle}>
        Tap your top {payload.keep_count}, in order
      </ThemedText>
      <ThemedText type="small" themeColor="textSecondary" style={styles.rankHint}>
        {ranked.length} of {payload.keep_count} picked — tap again to change your mind.
      </ThemedText>
      {sortState.kept.map((label) => {
        const rank = ranked.indexOf(label);
        const isRanked = rank !== -1;
        return (
          <Pressable
            key={label}
            onPress={() => setRanked((prev) => toggleRank(prev, label, payload.keep_count))}
            accessibilityRole="button"
            accessibilityLabel={label}
            accessibilityState={{ selected: isRanked }}
            style={[
              styles.rankRow,
              { borderColor: isRanked ? theme.accent : theme.border, backgroundColor: isRanked ? theme.accentTint : 'transparent' },
            ]}
          >
            {isRanked ? (
              <View style={[styles.rankBadge, { backgroundColor: theme.accent }]}>
                <ThemedText type="small" style={{ color: theme.bg, fontWeight: '700' }}>
                  {rank + 1}
                </ThemedText>
              </View>
            ) : (
              <View style={[styles.rankBadge, styles.rankBadgeEmpty, { borderColor: theme.border }]} />
            )}
            <ThemedText type="default">{label}</ThemedText>
          </Pressable>
        );
      })}
      <PrimaryButton label="Save" onPress={() => handleSave(ranked)} disabled={!canSave} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  container: { flex: 1, paddingBottom: Spacing.six },
  progress: { marginBottom: Spacing.three, textAlign: 'center' },
  card: { borderWidth: 1, borderRadius: radius.card, padding: Spacing.five, gap: Spacing.two, marginBottom: Spacing.five },
  cardLabel: { marginBottom: Spacing.one },
  decisionRow: { flexDirection: 'row', gap: Spacing.two },
  decisionButton: {
    flex: 1,
    borderWidth: 1,
    borderRadius: radius.button,
    paddingVertical: 16,
    alignItems: 'center',
  },
  emptyTitle: { marginBottom: Spacing.two },
  emptyBody: { marginBottom: Spacing.four },
  rankTitle: { marginBottom: Spacing.one },
  rankHint: { marginBottom: Spacing.three },
  confirmItem: { paddingVertical: Spacing.two },
  rankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    borderWidth: 1,
    borderRadius: radius.chip,
    padding: Spacing.two,
    marginBottom: Spacing.two,
  },
  rankBadge: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  rankBadgeEmpty: { borderWidth: 1 },
});
