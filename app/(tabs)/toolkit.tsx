import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';

// Placeholder for Toolkit (PRODUCT_SPEC §5.3) — Urge Surf, breather, defusion,
// environment shift, and urge logging ship in Epic 5 (must load instantly, offline-first).
export default function ToolkitScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Toolkit</ThemedText>
      <ThemedText type="default" themeColor="textSecondary">
        Urge-management tools will appear here — always available, even mid-crisis.
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: Spacing.four, gap: Spacing.two },
});
