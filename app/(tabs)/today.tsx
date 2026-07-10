import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';

// Placeholder for Today (PRODUCT_SPEC §5.1) — daily card stack (lesson, exercise,
// evening check-in) and program-day header land with the program engine (Epic 4).
export default function TodayScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Today</ThemedText>
      <ThemedText type="default" themeColor="textSecondary">
        Your daily lesson, exercise, and evening check-in will appear here.
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: Spacing.four, gap: Spacing.two },
});
