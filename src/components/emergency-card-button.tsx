import { Pressable, StyleSheet } from 'react-native';
import { router, type Href } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { useProgramStore } from '@/features/program/useProgramStore';
import { useTheme } from '@/hooks/use-theme';
import { radius } from '@/theme/tokens';

// Toolkit-header entry point into the real Emergency Card screen (Week 6
// Day 5, BACKLOG #27) — only shows once the card has actually been built
// (activates_screen), same "don't show what isn't real yet" rule as every
// other surface_in gate in this app.
export function EmergencyCardButton() {
  const theme = useTheme();
  const built = useProgramStore((s) => !!s.exerciseOutputs.emergency_card);

  if (!built) return null;

  return (
    <Pressable
      onPress={() => router.push('/(modals)/emergency-card' as Href)}
      accessibilityRole="button"
      accessibilityLabel="Open your Emergency Card"
      hitSlop={8}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: theme.accentTint, borderColor: theme.accent, opacity: pressed ? 0.7 : 1 },
      ]}
    >
      <ThemedText type="small" themeColor="accent" style={styles.label}>
        Emergency Card
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.chip,
    borderWidth: 1,
    marginLeft: 12,
  },
  label: {
    fontWeight: '700',
  },
});
