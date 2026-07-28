import { Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { radius } from '@/theme/tokens';

// Persistent header entry point into the Toolkit (PRODUCT_SPEC §3) — must stay
// reachable in ≤2 taps from every screen. Uses the caution token, not a red
// danger color (CLAUDE.md rule 6: muted, never neon/alarming).
export function SosButton() {
  const theme = useTheme();

  return (
    <Pressable
      onPress={() => router.push('/(modals)/sos')}
      accessibilityRole="button"
      accessibilityLabel="Open SOS urge support tools"
      // Crisis target deliberately enlarged past the 44pt minimum (§10).
      hitSlop={{ top: 14, bottom: 14, left: 14, right: 14 }}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: theme.surfaceRaised, borderColor: theme.caution, opacity: pressed ? 0.7 : 1 },
      ]}
    >
      <ThemedText type="small" themeColor="caution" style={styles.label}>
        SOS
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.sm,
    borderWidth: 1,
    marginRight: 12,
  },
  label: {
    fontWeight: '700',
  },
});
