import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/theme/tokens';
import { useProgramStore } from '@/features/program/useProgramStore';
import { getEmergencyCardBuilderPayload } from '@/lib/content/week';
import { compileEmergencyCardSections, visibleEmergencyCardSections } from '@/features/program/emergencyCard';
import { EmergencyCardView } from '@/features/toolkit/EmergencyCardView';
import type { EmergencyCardOutput } from '@/types/program';

// The real Emergency Card screen (Week 6 Day 5, BACKLOG #27) — reachable
// from the Toolkit header, the lapse debrief, and Progress. Nothing on it
// is new; it's six weeks of the user's own calmest wisdom, one tap away.
export default function EmergencyCardScreen() {
  const theme = useTheme();
  const exerciseOutputs = useProgramStore((s) => s.exerciseOutputs);
  const payload = getEmergencyCardBuilderPayload();
  const saved = exerciseOutputs.emergency_card as EmergencyCardOutput | undefined;

  const compiled = payload ? compileEmergencyCardSections(payload.sections_default_order, saved?.sections, exerciseOutputs) : [];
  const visible = visibleEmergencyCardSections(compiled);

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
          Emergency Card
        </ThemedText>
        {!payload || !saved ? (
          <ThemedText type="default" themeColor="textSecondary">
            Your Emergency Card isn't built yet — it's Week 6 Day 5's exercise. Once you build it, it lives here,
            one tap away.
          </ThemedText>
        ) : (
          <EmergencyCardView sections={visible} />
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  closeRow: { alignItems: 'flex-end', padding: Spacing.four, paddingBottom: 0 },
  closeButton: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  content: { padding: Spacing.four, paddingTop: Spacing.two, paddingBottom: Spacing.six },
  heading: { marginBottom: Spacing.three },
});
