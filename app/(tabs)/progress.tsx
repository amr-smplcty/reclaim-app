import { ScrollView, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useProgramStore } from '@/features/program/useProgramStore';
import { Spacing } from '@/constants/theme';
import type { ProfileBuilderOutput } from '@/types/program';

// Placeholder for Progress (PRODUCT_SPEC §5.5) — PPCS-6 score trend, urge
// patterns, and milestones land in Epic 7. The Pattern Profile (Week 2 Day 7,
// profile_builder) already surfaces here per its
// surface_in: ["progress_tab", "emergency_card"] — the Emergency Card UI
// itself doesn't exist yet (that's Week 6 content, not authored).
export default function ProgressScreen() {
  const patternProfile = useProgramStore((s) => s.getExerciseOutput<ProfileBuilderOutput>('pattern_profile'));

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <ThemedText type="title">Progress</ThemedText>
      <ThemedText type="default" themeColor="textSecondary" style={styles.placeholder}>
        Your clinical score trend and urge patterns will appear here.
      </ThemedText>

      {patternProfile ? (
        <ThemedView style={styles.profileCard}>
          <ThemedText type="subtitle" style={styles.profileTitle}>
            Your Pattern Profile
          </ThemedText>
          {patternProfile.sections.map((section) => (
            <ThemedView key={section.title} style={styles.section}>
              <ThemedText type="small" themeColor="accent" style={styles.sectionTitle}>
                {section.title}
              </ThemedText>
              <ThemedText type="default" themeColor="textSecondary">
                {section.content}
              </ThemedText>
            </ThemedView>
          ))}
        </ThemedView>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: Spacing.four, paddingBottom: Spacing.six },
  placeholder: { marginBottom: Spacing.four },
  profileCard: { gap: Spacing.three },
  profileTitle: { marginBottom: Spacing.one },
  section: { gap: 2, marginBottom: Spacing.two },
  sectionTitle: { fontWeight: '700' },
});
