import { Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';

// Persistent header entry point into the Toolkit (PRODUCT_SPEC §3) — must stay
// reachable in ≤2 taps from every screen.
export function SosButton() {
  const theme = useTheme();

  return (
    <Pressable
      onPress={() => router.push('/(modals)/sos')}
      accessibilityRole="button"
      accessibilityLabel="Open SOS urge support tools"
      hitSlop={8}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: theme.backgroundElement, opacity: pressed ? 0.7 : 1 },
      ]}
    >
      <ThemedText type="small" themeColor="accent" style={styles.label}>
        SOS
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 12,
  },
  label: {
    fontWeight: '700',
  },
});
