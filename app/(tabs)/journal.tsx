import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';

// Placeholder for Journal (PRODUCT_SPEC §5.4) — check-ins, urge logs, lapse
// debriefs, and lesson reflections land in Epic 6.
export default function JournalScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Journal</ThemedText>
      <ThemedText type="default" themeColor="textSecondary">
        Your check-ins, urge logs, and reflections will appear here.
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: Spacing.four, gap: Spacing.two },
});
