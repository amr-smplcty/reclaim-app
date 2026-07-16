import { useMemo } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/use-theme';
import { getProgramModules } from '@/lib/content/week';
import { useProgramStore } from '@/features/program/useProgramStore';
import { dayKey, findProgramDay } from '@/features/program/progression';
import { computeSessionArcProgress } from '@/features/program/sessionArc';
import { resolveChecklistFollowup } from '@/features/program/checklistFollowup';
import { DailyCard } from '@/features/program/DailyCard';
import { CommitmentFollowupCard } from '@/features/program/CommitmentFollowupCard';
import { Spacing } from '@/theme/tokens';
import type { CommitmentBuilderOutput } from '@/types/program';

// Today (PRODUCT_SPEC §5.1) — daily card stack. Progression advances on
// completion, not calendar: whatever day the store says is current, that's
// what shows here, with no "you're behind" framing for missed days.
export default function TodayScreen() {
  const theme = useTheme();
  const position = useProgramStore((s) => s.position);
  const completions = useProgramStore((s) => s.completions);
  const exerciseOutputs = useProgramStore((s) => s.exerciseOutputs);
  const commitmentFollowups = useProgramStore((s) => s.commitmentFollowups);
  const recordCommitmentFollowup = useProgramStore((s) => s.recordCommitmentFollowup);

  const day = useMemo(() => findProgramDay(getProgramModules(), position), [position]);

  const completion = completions[dayKey(position)];
  const commitment = exerciseOutputs.commitment_statement as CommitmentBuilderOutput | undefined;

  // Generic scan for any previous day's checklist_commit exercise that asked
  // for a next-day follow-up — content/week2.json Day 4 and
  // content/week5.json Day 2 today, proven independent in
  // checklistFollowup.test.ts, not hardcoded to either.
  const followup = resolveChecklistFollowup(position, getProgramModules(), exerciseOutputs, commitmentFollowups);
  const sessionProgress = computeSessionArcProgress(completion);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <ThemedText type="small" themeColor="textSecondary">
        Week {position.week} · Day {position.day}
      </ThemedText>
      <ThemedText type="title" style={styles.heading}>
        Today
      </ThemedText>
      <ThemedText type="default" themeColor="textSecondary" style={styles.subheading}>
        Pick up right where you left off — no rush, no penalty for a day you missed.
      </ThemedText>

      {commitment ? (
        <ThemedView style={styles.pinnedCard}>
          <ThemedText type="small" themeColor="accent" style={styles.pinnedLabel}>
            Your commitment
          </ThemedText>
          <ThemedText type="default" themeColor="textSecondary" numberOfLines={3}>
            {commitment.statement}
          </ThemedText>
        </ThemedView>
      ) : null}

      {followup.shouldShow && followup.output ? (
        <CommitmentFollowupCard
          commitments={followup.output.commitments}
          onAnswer={(answer) => followup.key && recordCommitmentFollowup(followup.key, answer)}
        />
      ) : null}

      {!day ? (
        <ThemedView style={styles.emptyState}>
          <ThemedText type="subtitle">More content coming soon</ThemedText>
          <ThemedText type="default" themeColor="textSecondary">
            Week {position.week} isn't written yet — check back soon for the next part of the program.
          </ThemedText>
        </ThemedView>
      ) : (
        <>
          <View style={styles.sessionArc}>
            <ThemedText type="small" themeColor="textSecondary" style={styles.sessionArcLabel}>
              Today's session · ~10 min · {sessionProgress.completedCount} of {sessionProgress.totalCount} done
            </ThemedText>
            <View style={[styles.sessionArcTrack, { backgroundColor: theme.surface }]}>
              <View
                style={[
                  styles.sessionArcFill,
                  { backgroundColor: theme.accent, width: `${(sessionProgress.completedCount / sessionProgress.totalCount) * 100}%` },
                ]}
              />
            </View>
          </View>
          <DailyCard
            title={day.lesson.title}
            subtitle={`${day.lesson.read_minutes} min lesson`}
            complete={completion?.lessonComplete ?? false}
            onPress={() => router.push('/(program)/lesson')}
          />
          <DailyCard
            title={day.exercise.title}
            subtitle="Today's exercise"
            complete={completion?.exerciseComplete ?? false}
            onPress={() => router.push('/(program)/exercise')}
          />
          <DailyCard
            title="Evening check-in"
            subtitle="A quick end-of-day reflection"
            complete={completion?.checkinComplete ?? false}
            onPress={() => router.push('/(program)/checkin')}
          />
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: Spacing.four, paddingBottom: Spacing.six },
  heading: { marginTop: Spacing.one, marginBottom: Spacing.two },
  subheading: { marginBottom: Spacing.four },
  pinnedCard: { borderRadius: 12, padding: Spacing.three, marginBottom: Spacing.four, gap: Spacing.one },
  pinnedLabel: { fontWeight: '700' },
  emptyState: { gap: Spacing.two, paddingVertical: Spacing.five },
  sessionArc: { marginBottom: Spacing.three, gap: Spacing.one },
  sessionArcLabel: {},
  sessionArcTrack: { height: 4, borderRadius: 2, overflow: 'hidden' },
  sessionArcFill: { height: 4, borderRadius: 2 },
});
