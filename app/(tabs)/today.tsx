import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { router, type Href } from 'expo-router';

import { MarkdownBody } from '@/components/markdown-body';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/use-theme';
import { getBoosterLessons, getProgramModules } from '@/lib/content/week';
import { useProgramStore } from '@/features/program/useProgramStore';
import { useJournalStore } from '@/features/journal/useJournalStore';
import { useSettingsStore } from '@/features/settings/useSettingsStore';
import { useRefresherStore } from '@/features/program/useRefresherStore';
import { dayKey, findProgramDay } from '@/features/program/progression';
import { computeSessionArcProgress } from '@/features/program/sessionArc';
import { resolveChecklistFollowup } from '@/features/program/checklistFollowup';
import { assembleMaintenanceToday } from '@/features/program/maintenance';
import { assembleRefresherWeekFromModules } from '@/features/program/refresher';
import { dateKeyOf } from '@/features/progress/dailyCreditReconciliation';
import { DailyCard } from '@/features/program/DailyCard';
import { CommitmentFollowupCard } from '@/features/program/CommitmentFollowupCard';
import { RiskyWindowOffer } from '@/features/notifications/RiskyWindowOffer';
import { fastForwardCurrentDay } from '@/features/dev/devFastForward';
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
  const programCompletedAt = useProgramStore((s) => s.programCompletedAt);
  const maintenancePlan = useSettingsStore((s) => s.maintenancePlan);
  const checkins = useJournalStore((s) => s.checkins);
  const refresherOfferDecisions = useRefresherStore((s) => s.offerDecisions);
  const refresherCompletedLessonIds = useRefresherStore((s) => s.completedLessonIds);

  const day = useMemo(() => findProgramDay(getProgramModules(), position), [position]);

  const completion = completions[dayKey(position)];
  const commitment = exerciseOutputs.commitment_statement as CommitmentBuilderOutput | undefined;

  // Generic scan for any previous day's checklist_commit exercise that asked
  // for a next-day follow-up — content/week2.json Day 4 and
  // content/week5.json Day 2 today, proven independent in
  // checklistFollowup.test.ts, not hardcoded to either.
  const followup = resolveChecklistFollowup(position, getProgramModules(), exerciseOutputs, commitmentFollowups);
  const sessionProgress = computeSessionArcProgress(completion);

  if (programCompletedAt) {
    // Post-graduation (CLINICAL_SPEC §4 maintenance mode) — `position` is
    // frozen past the last authored day, so this replaces the day/lesson/
    // exercise stack entirely rather than falling into the "more content
    // coming soon" empty state below.
    const maintenanceView = assembleMaintenanceToday(getBoosterLessons(), programCompletedAt, new Date(), maintenancePlan);
    const todayKey = dateKeyOf(new Date().toISOString());
    const checkedInToday = checkins.some((c) => dateKeyOf(c.timestamp) === todayKey);

    // An accepted-but-unfinished refresher week (CLINICAL_SPEC §4 offer,
    // reassessment.tsx) stays reachable here rather than only right after
    // accepting it — closing app mid-refresher shouldn't lose the thread.
    const refresherDays = assembleRefresherWeekFromModules(getProgramModules());
    const refresherReviewedCount = refresherDays.filter((d) => refresherCompletedLessonIds[d.day.lesson.id]).length;
    const hasUnfinishedAcceptedRefresher =
      Object.values(refresherOfferDecisions).includes('accepted') &&
      refresherDays.length > 0 &&
      refresherReviewedCount < refresherDays.length;

    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <ThemedText type="small" themeColor="textSecondary">
          Maintenance mode
        </ThemedText>
        <ThemedText type="title" style={styles.heading}>
          Today
        </ThemedText>
        <ThemedText type="default" themeColor="textSecondary" style={styles.subheading}>
          Lighter now — steady, yours. About ten minutes a week holds everything you built.
        </ThemedText>

        <RiskyWindowOffer />

        {maintenanceView.cadence ? (
          <ThemedText type="small" themeColor="textSecondary" style={styles.cadenceNote}>
            Checking in {maintenanceView.cadence.toLowerCase()}.
          </ThemedText>
        ) : null}

        {maintenanceView.booster ? (
          <ThemedView style={[styles.boosterCard, { borderColor: theme.border }]}>
            <ThemedText type="small" themeColor="accent" style={styles.pinnedLabel}>
              This week's booster
            </ThemedText>
            <ThemedText type="subtitle" style={styles.boosterTitle}>
              {maintenanceView.booster.title}
            </ThemedText>
            <MarkdownBody>{maintenanceView.booster.body_md}</MarkdownBody>
          </ThemedView>
        ) : null}

        <DailyCard
          title="Evening check-in"
          subtitle="A quick end-of-day reflection"
          complete={checkedInToday}
          onPress={() => router.push('/(program)/checkin')}
        />

        {hasUnfinishedAcceptedRefresher ? (
          <Pressable
            onPress={() => router.push('/(modals)/refresher-week' as Href)}
            accessibilityRole="button"
            accessibilityLabel="Continue your refresher week"
            style={[styles.refresherLink, { borderColor: theme.accent, backgroundColor: theme.accentTint }]}
          >
            <ThemedText type="default" themeColor="accent">
              Continue your refresher week
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {refresherReviewedCount} of {refresherDays.length} reviewed
            </ThemedText>
          </Pressable>
        ) : null}
      </ScrollView>
    );
  }

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

      <RiskyWindowOffer />

      {__DEV__ ? (
        <Pressable
          onPress={() => fastForwardCurrentDay()}
          accessibilityRole="button"
          accessibilityLabel="Fast-forward today (dev)"
          hitSlop={8}
          style={styles.devFastForward}
        >
          <ThemedText type="small" themeColor="textSecondary">
            Fast-forward today (dev)
          </ThemedText>
        </Pressable>
      ) : null}

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
  devFastForward: { marginBottom: Spacing.three },
  pinnedLabel: { fontWeight: '700' },
  emptyState: { gap: Spacing.two, paddingVertical: Spacing.five },
  sessionArc: { marginBottom: Spacing.three, gap: Spacing.one },
  sessionArcLabel: {},
  sessionArcTrack: { height: 4, borderRadius: 2, overflow: 'hidden' },
  sessionArcFill: { height: 4, borderRadius: 2 },
  cadenceNote: { marginBottom: Spacing.three },
  boosterCard: { borderWidth: 1, borderRadius: 12, padding: Spacing.three, marginBottom: Spacing.four, gap: Spacing.one },
  boosterTitle: { marginBottom: Spacing.one },
  refresherLink: { borderWidth: 1, borderRadius: 12, padding: Spacing.three, marginTop: Spacing.three, gap: 2 },
});
