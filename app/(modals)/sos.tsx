import { Pressable, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { SafeAreaScreen } from '@/components/safe-area-screen';
import { ToolkitHome } from '@/features/toolkit/ToolkitHome';
import { useTheme } from '@/hooks/use-theme';
import { space } from '@/theme/tokens';

// SOS opens the exact same Toolkit as the tab (CLAUDE.md: reachable in ≤2
// taps from every screen, must load instantly).
export default function SosScreen() {
  const theme = useTheme();

  return (
    // Card modal clears the status bar on iOS; the bottom edge inset keeps the
    // Toolkit's content/CTAs above the home indicator (fix-device-qa-1).
    <SafeAreaScreen style={styles.container} edges={['bottom']}>
      <View style={styles.closeRow}>
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Close"
          hitSlop={8}
          style={[styles.closeButton, { backgroundColor: theme.surfaceRaised }]}
        >
          <Ionicons name="close" size={20} color={theme.textPrimary} />
        </Pressable>
      </View>
      <ToolkitHome />
    </SafeAreaScreen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  closeRow: { alignItems: 'flex-end', padding: space.xl, paddingBottom: 0 },
  closeButton: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
});
