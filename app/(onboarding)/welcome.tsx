import { Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/use-theme';
import { useAppStore } from '@/stores/useAppStore';
import { Spacing } from '@/constants/theme';

// Placeholder for onboarding step 1 (PRODUCT_SPEC §4). The full 11-step flow —
// age gate, motivations, PPCS-6, PHQ-2/GAD-2, results, paywall — lands in Epic 2.
export default function WelcomeScreen() {
  const theme = useTheme();
  const setHasOnboarded = useAppStore((s) => s.setHasOnboarded);

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>
        A science-based program to take back control.
      </ThemedText>
      <Pressable
        onPress={() => {
          setHasOnboarded(true);
          router.replace('/(tabs)/today');
        }}
        accessibilityRole="button"
        accessibilityLabel="Start assessment"
        style={({ pressed }) => [
          styles.cta,
          { backgroundColor: theme.accent, opacity: pressed ? 0.85 : 1 },
        ]}
      >
        <ThemedText type="link" style={styles.ctaLabel}>
          Start assessment
        </ThemedText>
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: Spacing.four,
    gap: Spacing.five,
  },
  title: { marginBottom: Spacing.four },
  cta: {
    paddingVertical: Spacing.three,
    borderRadius: 12,
    alignItems: 'center',
  },
  ctaLabel: { color: '#101113', fontWeight: '700' },
});
