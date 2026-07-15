import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';

import { PrimaryButton } from '@/components/primary-button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/use-theme';
import { useProgramStore } from '@/features/program/useProgramStore';
import { useCommitmentGoalsStore } from '@/features/progress/useCommitmentGoalsStore';
import { requiredCreditDays } from '@/features/progress/commitmentGoals';
import { Spacing } from '@/theme/tokens';

// Commitment Goals (CLINICAL_SPEC §9, PRODUCT_SPEC §5.5) — opt-in only,
// offered starting end of Week 1 (never before). Calm, saving-toward-a-
// life-you-want framing throughout; no fines/punishment language.
export function CommitmentGoalsSection() {
  const theme = useTheme();
  const week1Complete = useProgramStore((s) => s.position.week >= 2);
  const optedIn = useCommitmentGoalsStore((s) => s.optedIn);
  const goal = useCommitmentGoalsStore((s) => s.goal);
  const rewardName = useCommitmentGoalsStore((s) => s.rewardName);
  const stepDownGoal = useCommitmentGoalsStore((s) => s.stepDownGoal);

  if (!optedIn) {
    if (!week1Complete) return null;

    return (
      <ThemedView style={styles.card}>
        <ThemedText type="subtitle" style={styles.cardTitle}>
          Want an extra reason to show up?
        </ThemedText>
        <ThemedText type="default" themeColor="textSecondary" style={styles.cardBody}>
          Commitment Goals let you save toward something you want, a little
          each day you engage with the program. Fully optional.
        </ThemedText>
        <PrimaryButton
          label="Set up a goal"
          onPress={() => router.push('/(modals)/commitment-goals-setup')}
        />
      </ThemedView>
    );
  }

  if (!goal) return null;

  const required = requiredCreditDays(goal);
  const progressFraction = Math.min(1, goal.accumulatedCredit / required);

  return (
    <ThemedView style={styles.card}>
      <ThemedText type="small" themeColor="accent" style={styles.tierLabel}>
        {goal.tier}-day goal
      </ThemedText>
      <ThemedText type="subtitle" style={styles.cardTitle}>
        Saving toward: {rewardName}
      </ThemedText>
      <View style={[styles.track, { backgroundColor: theme.surface }]}>
        <View style={[styles.fill, { backgroundColor: theme.accent, width: `${progressFraction * 100}%` }]} />
      </View>
      <ThemedText type="small" themeColor="textSecondary" style={styles.progressLabel}>
        {goal.accumulatedCredit.toFixed(1)} / {required} days toward your next unlock
      </ThemedText>
      <ThemedText type="default" style={styles.jarTotal}>
        ${goal.jarTotal.toFixed(2)} saved so far
      </ThemedText>
      <ThemedText type="small" themeColor="accent" onPress={stepDownGoal}>
        Step down a level
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: { gap: Spacing.two, marginBottom: Spacing.four },
  cardTitle: { marginBottom: Spacing.one },
  cardBody: { marginBottom: Spacing.three },
  tierLabel: { fontWeight: '700' },
  track: { height: 8, borderRadius: 4, overflow: 'hidden', marginTop: Spacing.one },
  fill: { height: 8, borderRadius: 4 },
  progressLabel: { marginBottom: Spacing.one },
  jarTotal: { fontWeight: '700', marginBottom: Spacing.two },
});
