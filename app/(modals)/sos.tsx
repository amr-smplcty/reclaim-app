import { Pressable, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { ThemedView } from '@/components/themed-view';
import { ToolkitHome } from '@/features/toolkit/ToolkitHome';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';

// SOS opens the exact same Toolkit as the tab (CLAUDE.md: reachable in ≤2
// taps from every screen, must load instantly).
export default function SosScreen() {
  const theme = useTheme();

  return (
    <ThemedView style={styles.container}>
      <View style={styles.closeRow}>
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Close"
          hitSlop={8}
          style={[styles.closeButton, { backgroundColor: theme.backgroundElement }]}
        >
          <Ionicons name="close" size={20} color={theme.text} />
        </Pressable>
      </View>
      <ToolkitHome />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  closeRow: { alignItems: 'flex-end', padding: Spacing.four, paddingBottom: 0 },
  closeButton: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
});
