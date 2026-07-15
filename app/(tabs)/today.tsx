import { useMemo } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { router } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { getProgramModules } from '@/lib/content/week';
import { useProgramStore } from '@/features/program/useProgramStore';
import { dayKey, findProgramDay, previousPosition } from '@/features/program/progression';
import { DailyCard } from '@/features/program/DailyCard';
import { CommitmentFollowupCard } from '@/features/program/CommitmentFollowupCard';
import { Spacing } from '@/theme/tokens';
import type { ChecklistCommitOutput, ChecklistCommitPayload, CommitmentBuilderOutput } from '@/types/program';

// Today (PRODUCT_SPEC §5.1) — daily card stack. Progression advances on
// completion, not calendar: whatever day the store says is current, that's
// what shows here, with no "you're behind" framing for missed days.
export default function TodayScreen() {
  const position = useProgramStore((s) => s.position);
  const completions = useProgramStore((s) => s.completions);
  const exerciseOutputs = useProgramStore((s) => s.exerciseOutputs);
  const commitmentFollowups = useProgramStore((s) => s.commitmentFollowups);
  const recordCommitmentFollowup = useProgramStore((s) => s.recordCommitmentFollowup);

  const day = useMemo(() => findProgramDay(getProgramModules(), position), [position]);

  const completion = completions[dayKey(position)];
  const commitment = exerciseOutputs.commitment_statement as CommitmentBuilderOutput | undefined;

  // Generic scan for any previous day's checklist_commit exercise that asked
  // for a next-day follow-up (currently Week 2 Day 4) — not hardcoded to a
  // specific day, so it keeps working if a future week reuses the pattern.
  const previousDayPosition = previousPosition(position);
  const previousDay = previousDayPosition ? findProgramDay(getProgramModules(), previousDayPosition) : undefined;
  const previousPayload =
    previousDay?.exercise.payload?.kind === 'checklist_commit'
      ? (previousDay.exercise.payload as unknown as ChecklistCommitPayload)
      : undefined;
  const previousKey = previousDayPosition ? dayKey(previousDayPosition) : null;
  const alreadyAnsweredFollowup = previousKey ? !!commitmentFollowups[previousKey] : true;
  const followupOutput = previousPayload
    ? (exerciseOutputs[previousPayload.save_to] as ChecklistCommitOutput | undefined)
    : undefined;
  const showFollowup = !!previousPayload?.followup_next_day && !!followupOutput && !alreadyAnsweredFollowup;

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

      {showFollowup && followupOutput ? (
        <CommitmentFollowupCard
          commitments={followupOutput.commitments}
          onAnswer={(answer) => previousKey && recordCommitmentFollowup(previousKey, answer)}
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
});
