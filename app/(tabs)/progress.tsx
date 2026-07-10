import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';

// Placeholder for Progress (PRODUCT_SPEC §5.5) — PPCS-6 score trend, urge
// frequency/intensity, and pattern insights land in Epic 7 (re-assessment engine).
export default function ProgressScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Progress</ThemedText>
      <ThemedText type="default" themeColor="textSecondary">
        Your clinical score trend and patterns will appear here.
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: Spacing.four, gap: Spacing.two },
});
