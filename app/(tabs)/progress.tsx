import { useEffect } from 'react';
import { Pressable, ScrollView, StyleSheet } from 'react-native';
import { router, type Href } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/use-theme';
import { useProgramStore } from '@/features/program/useProgramStore';
import { isDayComplete } from '@/features/program/progression';
import { useJournalStore } from '@/features/journal/useJournalStore';
import { useToolkitStore } from '@/features/toolkit/useToolkitStore';
import { useAssessmentHistoryStore } from '@/features/assessment/useAssessmentHistoryStore';
import { daysUntilNextReassessment, formatScoreDelta, isReassessmentDue, scoreDelta } from '@/features/assessment/reassessment';
import { PpcsTrendChart } from '@/features/progress/PpcsTrendChart';
import { UrgeBarsChart } from '@/features/progress/UrgeBarsChart';
import { buildUrgeEventTimestamps, findDominantTimeWindow, formatTimeClusterInsight } from '@/features/progress/patternInsights';
import { computeUnlockedMilestones, MILESTONES } from '@/features/progress/milestones';
import { GrowthVisual } from '@/features/progress/GrowthVisual';
import { computeWeeklyConsistency } from '@/features/progress/weeklyConsistency';
import { CommitmentGoalsSection } from '@/features/progress/CommitmentGoalsSection';
import { useCommitmentGoalsStore } from '@/features/progress/useCommitmentGoalsStore';
import { computeDayCreditInputForDate, dateKeyOf } from '@/features/progress/dailyCreditReconciliation';
import { Spacing } from '@/theme/tokens';
import type {
  CommitmentBuilderOutput,
  EmergencyCardOutput,
  LetterWriteOutput,
  ProfileBuilderOutput,
  RiskWindowPlannerOutput,
} from '@/types/program';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

// Progress (PRODUCT_SPEC §5.5) — PPCS-6 score trend, urge patterns,
// milestones, calm gamification layer, and Commitment Goals. Charts are
// plain react-native-svg only (INCIDENTS.md INC-2 — no victory-native/Skia,
// Expo-Go-incompatible native modules).
export default function ProgressScreen() {
  const theme = useTheme();

  const position = useProgramStore((s) => s.position);
  const completions = useProgramStore((s) => s.completions);
  const getExerciseOutput = useProgramStore((s) => s.getExerciseOutput);
  const patternProfile = getExerciseOutput<ProfileBuilderOutput>('pattern_profile');
  // Week 3 Day 7's urge_script is a commitment_builder output ({statement,
  // signature, signed_at}), same shape Week 1 Day 7 saves — never a bare
  // string, even though only .statement ever gets displayed.
  const urgeScript = getExerciseOutput<CommitmentBuilderOutput>('urge_script');
  // Week 4 Day 7's letter surfaces here and joins Emergency Card data
  // (surface_in: ["progress_tab", "emergency_card"]) — there's no dedicated
  // Emergency Card screen yet (BACKLOG #27), so this is the one place it's
  // shown today; it's already tagged and ready to feed that screen once built.
  const becomingLetter = getExerciseOutput<LetterWriteOutput>('becoming_letter');
  // Week 5 Day 6's planted risk windows (surface_in: ["progress_tab"]).
  const weeklyArchitecture = getExerciseOutput<RiskWindowPlannerOutput>('weekly_architecture');
  // Week 5 Day 7's Foundations — same profile_builder shape as pattern_profile
  // (surface_in: ["progress_tab"]), shown alongside it.
  const foundationsProfile = getExerciseOutput<ProfileBuilderOutput>('foundations_profile');
  // Week 6 Day 4's assembled relapse-prevention plan (surface_in: ["progress_tab"]).
  const relapsePreventionPlan = getExerciseOutput<ProfileBuilderOutput>('relapse_prevention_plan');
  // Week 6 Day 5's Emergency Card (surface_in: ["progress_tab"], BACKLOG #27)
  // — a link into the real screen, not the raw data, once it's built.
  const emergencyCard = getExerciseOutput<EmergencyCardOutput>('emergency_card');
  // Week 6 Day 7's graduation reflection (surface_in: ["progress_tab"]).
  const graduationReflection = getExerciseOutput<LetterWriteOutput>('graduation_reflection');

  const checkins = useJournalStore((s) => s.checkins);
  const urgeLogs = useToolkitStore((s) => s.urgeLogs);
  const toolUses = useToolkitStore((s) => s.toolUses);
  const lapseDebriefs = useToolkitStore((s) => s.lapseDebriefs);

  const assessmentEntries = useAssessmentHistoryStore((s) => s.entries);
  const recordDailyCredit = useCommitmentGoalsStore((s) => s.recordDailyCredit);

  // Reconcile yesterday's Commitment Goal credit once per Progress view —
  // idempotent per calendar day (see useCommitmentGoalsStore.recordDailyCredit).
  useEffect(() => {
    const yesterday = new Date(Date.now() - MS_PER_DAY);
    const yesterdayKey = dateKeyOf(yesterday.toISOString());
    const input = computeDayCreditInputForDate(yesterdayKey, {
      completions,
      checkinDateKeys: checkins.map((c) => dateKeyOf(c.timestamp)),
      lapseDebriefDateKeys: lapseDebriefs.map((l) => dateKeyOf(l.timestamp)),
    });
    recordDailyCredit(input, yesterdayKey);
    // Intentionally runs once per screen visit — recordDailyCredit itself
    // guards against double-crediting the same day.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const latestEntry = assessmentEntries[assessmentEntries.length - 1];
  const reassessmentDue = latestEntry ? isReassessmentDue(latestEntry.timestamp, new Date()) : false;
  const daysUntilDue = latestEntry ? daysUntilNextReassessment(latestEntry.timestamp, new Date()) : null;
  const delta = scoreDelta(assessmentEntries);

  const urgeEventTimestamps = buildUrgeEventTimestamps({
    urgeLogTimestamps: urgeLogs.map((u) => u.timestamp),
    toolUses,
  });
  const timeCluster = findDominantTimeWindow(urgeEventTimestamps);

  const day1Completion = completions['1-1'];
  const unlockedMilestones = computeUnlockedMilestones({
    day1LessonComplete: !!day1Completion?.lessonComplete,
    day1ExerciseComplete: !!day1Completion?.exerciseComplete,
    urgesSurfedCount: toolUses.length,
    assessmentHistoryCount: assessmentEntries.length,
    patternProfileComplete: !!patternProfile,
    urgeScriptWritten: !!urgeScript,
  });

  const sessionsCompleted = Object.values(completions).filter(isDayComplete).length;
  const growthEvents = {
    sessionsCompleted,
    urgesSurfed: toolUses.length,
    debriefsDone: lapseDebriefs.length,
    checkins: checkins.length,
  };

  const activityTimestamps = [
    ...checkins.map((c) => c.timestamp),
    ...urgeLogs.map((u) => u.timestamp),
    ...toolUses.map((t) => t.timestamp),
    ...Object.values(completions)
      .map((c) => c.lastActivityAt)
      .filter((t): t is string => !!t),
  ];
  const weeklyConsistency = computeWeeklyConsistency(activityTimestamps, new Date());

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <ThemedText type="title">Progress</ThemedText>
      <ThemedText type="default" themeColor="textSecondary" style={styles.subheading}>
        Week {position.week} · Day {position.day}
      </ThemedText>

      {reassessmentDue ? (
        <Pressable
          onPress={() => router.push('/(modals)/reassessment')}
          style={[styles.dueBanner, { backgroundColor: theme.surfaceRaised, borderColor: theme.accent }]}
        >
          <ThemedText type="default" style={styles.dueBannerText}>
            Time for your trend check-in — under 90 seconds.
          </ThemedText>
        </Pressable>
      ) : daysUntilDue !== null && daysUntilDue > 0 ? (
        <ThemedText type="small" themeColor="textSecondary" style={styles.dueSoon}>
          Next re-assessment in {daysUntilDue} day{daysUntilDue === 1 ? '' : 's'}.
        </ThemedText>
      ) : null}

      <ThemedText type="subtitle" style={styles.sectionTitle}>
        Your score trend
      </ThemedText>
      <PpcsTrendChart entries={assessmentEntries} />
      {delta !== null ? (
        <ThemedText type="default" themeColor="textSecondary" style={styles.deltaText}>
          {formatScoreDelta(delta)} since your last check.
        </ThemedText>
      ) : null}

      <ThemedText type="subtitle" style={styles.sectionTitle}>
        This week
      </ThemedText>
      <ThemedText type="default" style={styles.consistencyText}>
        {weeklyConsistency.daysActive} of {weeklyConsistency.daysTotal} days engaged
      </ThemedText>

      <ThemedText type="subtitle" style={styles.sectionTitle}>
        Your growth
      </ThemedText>
      <GrowthVisual events={growthEvents} />

      {unlockedMilestones.length > 0 ? (
        <>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Milestones
          </ThemedText>
          <ThemedView style={styles.milestonesRow}>
            {MILESTONES.filter((m) => unlockedMilestones.includes(m.id)).map((m) => (
              <ThemedView key={m.id} style={[styles.milestoneChip, { borderColor: theme.accent }]}>
                <ThemedText type="small" themeColor="accent">
                  {m.label}
                </ThemedText>
              </ThemedView>
            ))}
          </ThemedView>
        </>
      ) : null}

      <ThemedText type="subtitle" style={styles.sectionTitle}>
        Urge patterns
      </ThemedText>
      <UrgeBarsChart urgeLogs={urgeLogs} />
      {timeCluster ? (
        <ThemedText type="default" themeColor="textSecondary" style={styles.insightText}>
          {formatTimeClusterInsight(timeCluster)}
        </ThemedText>
      ) : null}

      <CommitmentGoalsSection />

      {patternProfile ? <ProfileCard title="Your Pattern Profile" profile={patternProfile} /> : null}

      {becomingLetter ? (
        <ThemedView style={styles.profileCard}>
          <ThemedText type="subtitle" style={styles.profileTitle}>
            The person you're becoming
          </ThemedText>
          <ThemedText type="default" themeColor="textSecondary">
            {becomingLetter}
          </ThemedText>
        </ThemedView>
      ) : null}

      {weeklyArchitecture ? (
        <ThemedView style={styles.profileCard}>
          <ThemedText type="subtitle" style={styles.profileTitle}>
            Your Weekly Architecture
          </ThemedText>
          {weeklyArchitecture.plants.length > 0 ? (
            weeklyArchitecture.plants.map((p) => (
              <ThemedView key={p.window} style={styles.section}>
                <ThemedText type="small" themeColor="accent" style={styles.sectionLabel}>
                  {p.window}
                </ThemedText>
                <ThemedText type="default" themeColor="textSecondary">
                  {p.plant}
                </ThemedText>
              </ThemedView>
            ))
          ) : (
            <ThemedText type="default" themeColor="textSecondary">
              {weeklyArchitecture.worksheetText}
            </ThemedText>
          )}
        </ThemedView>
      ) : null}

      {foundationsProfile ? <ProfileCard title="Your Foundations" profile={foundationsProfile} /> : null}

      {relapsePreventionPlan ? <ProfileCard title="Your Relapse-Prevention Plan" profile={relapsePreventionPlan} /> : null}

      {emergencyCard ? (
        <Pressable
          onPress={() => router.push('/(modals)/emergency-card' as Href)}
          accessibilityRole="button"
          accessibilityLabel="Open your Emergency Card"
          style={[styles.emergencyCardCard, { borderColor: theme.accent, backgroundColor: theme.accentTint }]}
        >
          <ThemedText type="subtitle" themeColor="accent">
            Your Emergency Card
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            One tap away, whenever you need it.
          </ThemedText>
        </Pressable>
      ) : null}

      {graduationReflection ? (
        <ThemedView style={styles.profileCard}>
          <ThemedText type="subtitle" style={styles.profileTitle}>
            Your graduation reflection
          </ThemedText>
          <ThemedText type="default" themeColor="textSecondary">
            {graduationReflection}
          </ThemedText>
        </ThemedView>
      ) : null}
    </ScrollView>
  );
}

function ProfileCard({ title, profile }: { title: string; profile: ProfileBuilderOutput }) {
  return (
    <ThemedView style={styles.profileCard}>
      <ThemedText type="subtitle" style={styles.profileTitle}>
        {title}
      </ThemedText>
      {profile.sections.map((section) => (
        <ThemedView key={section.title} style={styles.section}>
          <ThemedText type="small" themeColor="accent" style={styles.sectionLabel}>
            {section.title}
          </ThemedText>
          <ThemedText type="default" themeColor="textSecondary">
            {section.content}
          </ThemedText>
        </ThemedView>
      ))}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: Spacing.four, paddingBottom: Spacing.six },
  subheading: { marginBottom: Spacing.three },
  dueBanner: { borderWidth: 1, borderRadius: 12, padding: Spacing.three, marginBottom: Spacing.four },
  dueBannerText: { fontWeight: '600' },
  dueSoon: { marginBottom: Spacing.four },
  sectionTitle: { marginTop: Spacing.four, marginBottom: Spacing.two },
  deltaText: { marginTop: Spacing.two },
  consistencyText: { marginBottom: Spacing.one },
  milestonesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  milestoneChip: { borderWidth: 1, borderRadius: 999, paddingVertical: 6, paddingHorizontal: 12 },
  insightText: { marginTop: Spacing.two },
  profileCard: { gap: Spacing.three, marginTop: Spacing.four },
  emergencyCardCard: { borderWidth: 1, borderRadius: 12, padding: Spacing.three, marginTop: Spacing.four, gap: Spacing.one },
  profileTitle: { marginBottom: Spacing.one },
  section: { gap: 2, marginBottom: Spacing.two },
  sectionLabel: { fontWeight: '700' },
});
