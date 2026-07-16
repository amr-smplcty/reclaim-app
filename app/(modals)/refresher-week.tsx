import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { router, type Href } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { MarkdownBody } from '@/components/markdown-body';
import { PrimaryButton } from '@/components/primary-button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/use-theme';
import { Spacing, radius } from '@/theme/tokens';
import { getProgramModules } from '@/lib/content/week';
import { assembleRefresherWeekFromModules } from '@/features/program/refresher';
import { useRefresherStore } from '@/features/program/useRefresherStore';

// The accepted refresher week (CLINICAL_SPEC §4 refresher-week offer) — a
// review, not a graded replay: read each day's lesson again, optionally
// redo its exercise (updates your real plan — the "tune-up" IS the point),
// or just mark it reviewed. Entirely separate from the main program's
// position/completions, which a refresher must never advance or alter.
export default function RefresherWeekScreen() {
  const theme = useTheme();
  const days = assembleRefresherWeekFromModules(getProgramModules());
  const completedLessonIds = useRefresherStore((s) => s.completedLessonIds);
  const markDayReviewed = useRefresherStore((s) => s.markDayReviewed);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const reviewedCount = days.filter((d) => completedLessonIds[d.day.lesson.id]).length;
  const allReviewed = days.length > 0 && reviewedCount === days.length;

  return (
    <ThemedView style={styles.container}>
      <View style={styles.closeRow}>
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Close"
          hitSlop={8}
          style={[styles.closeButton, { backgroundColor: theme.surface }]}
        >
          <Ionicons name="close" size={20} color={theme.textPrimary} />
        </Pressable>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <ThemedText type="title" style={styles.heading}>
          Refresher week
        </ThemedText>
        <ThemedText type="default" themeColor="textSecondary" style={styles.intro}>
          The greatest hits of your pattern and urge skills — one week, tune-up done. Nothing here is new.
        </ThemedText>

        {allReviewed ? (
          <ThemedView style={[styles.doneBanner, { borderColor: theme.accent, backgroundColor: theme.accentTint }]}>
            <ThemedText type="default" themeColor="accent">
              Refresher complete.
            </ThemedText>
          </ThemedView>
        ) : (
          <ThemedText type="small" themeColor="textSecondary" style={styles.progressNote}>
            {reviewedCount} of {days.length} reviewed
          </ThemedText>
        )}

        {days.map((refresherDay, index) => {
          const { day, week } = refresherDay;
          const reviewed = !!completedLessonIds[day.lesson.id];
          const isOpen = expandedIndex === index;

          return (
            <ThemedView key={day.lesson.id} style={[styles.dayCard, { borderColor: theme.border }]}>
              <Pressable
                onPress={() => setExpandedIndex(isOpen ? null : index)}
                accessibilityRole="button"
                accessibilityLabel={day.lesson.title}
                accessibilityState={{ expanded: isOpen }}
                style={styles.dayHeader}
              >
                <View style={styles.dayHeaderText}>
                  <ThemedText type="subtitle">{day.lesson.title}</ThemedText>
                </View>
                <Ionicons
                  name={reviewed ? 'checkmark-circle' : 'chevron-forward'}
                  size={22}
                  color={reviewed ? theme.accent : theme.textSecondary}
                />
              </Pressable>

              {isOpen ? (
                <View style={styles.dayBody}>
                  <MarkdownBody>{day.lesson.body_md}</MarkdownBody>
                  <ThemedText type="small" themeColor="accent" style={styles.exerciseLabel}>
                    {day.exercise.title}
                  </ThemedText>
                  <View style={styles.dayActions}>
                    <PrimaryButton
                      label="Redo the exercise"
                      onPress={() => router.push(`/(program)/exercise?refresherWeek=${week}&refresherDay=${day.day}` as Href)}
                    />
                    <Pressable
                      onPress={() => markDayReviewed(day.lesson.id)}
                      accessibilityRole="button"
                      accessibilityLabel={`Mark ${day.lesson.title} reviewed`}
                      style={styles.markReviewedButton}
                    >
                      <ThemedText type="default" themeColor={reviewed ? 'textSecondary' : 'accent'} style={styles.markReviewedLabel}>
                        {reviewed ? 'Reviewed' : 'Mark reviewed'}
                      </ThemedText>
                    </Pressable>
                  </View>
                </View>
              ) : null}
            </ThemedView>
          );
        })}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  closeRow: { alignItems: 'flex-end', padding: Spacing.four, paddingBottom: 0 },
  closeButton: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  content: { padding: Spacing.four, paddingTop: Spacing.two, paddingBottom: Spacing.six, gap: Spacing.three },
  heading: { marginBottom: Spacing.one },
  intro: { marginBottom: Spacing.two },
  progressNote: { marginBottom: Spacing.two },
  doneBanner: { borderWidth: 1, borderRadius: 12, padding: Spacing.three, marginBottom: Spacing.two, alignItems: 'center' },
  dayCard: { borderWidth: 1, borderRadius: radius.card, padding: Spacing.three, gap: Spacing.two },
  dayHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  dayHeaderText: { flex: 1 },
  dayBody: { gap: Spacing.two },
  exerciseLabel: { fontWeight: '700' },
  dayActions: { gap: Spacing.two, alignItems: 'stretch' },
  markReviewedButton: { paddingVertical: Spacing.two, alignItems: 'center' },
  markReviewedLabel: { fontWeight: '600' },
});
