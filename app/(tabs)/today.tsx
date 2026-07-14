import { useMemo } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { router } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { getWeekContent } from '@/lib/content/week';
import { useProgramStore } from '@/features/program/useProgramStore';
import { dayKey } from '@/features/program/progression';
import { DailyCard } from '@/features/program/DailyCard';
import { Spacing } from '@/constants/theme';
import type { CommitmentBuilderOutput } from '@/types/program';

// Today (PRODUCT_SPEC §5.1) — daily card stack. Progression advances on
// completion, not calendar: whatever day the store says is current, that's
// what shows here, with no "you're behind" framing for missed days.
export default function TodayScreen() {
  const position = useProgramStore((s) => s.position);
  const completions = useProgramStore((s) => s.completions);
  const exerciseOutputs = useProgramStore((s) => s.exerciseOutputs);

  const day = useMemo(() => {
    const week = getWeekContent().modules.find((m) => m.week === position.week);
    return week?.days.find((d) => d.day === position.day);
  }, [position]);

  const completion = completions[dayKey(position)];
  const commitment = exerciseOutputs.commitment_statement as CommitmentBuilderOutput | undefined;

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
