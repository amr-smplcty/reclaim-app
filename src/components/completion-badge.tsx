import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { motion, space } from '@/theme/tokens';

interface Props {
  label: string;
}

// Calm completion state — the celebration settle (DESIGN_SYSTEM.md §5): one
// gentle settle, no confetti, no repeat, no sound. Honors prefers-reduced-
// motion with a plain crossfade (no scale).
export function CompletionBadge({ label }: Props) {
  const theme = useTheme();
  const reduced = useReducedMotion();
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(reduced ? 1 : 0.9)).current;

  useEffect(() => {
    if (reduced) {
      // Crossfade fallback only.
      Animated.timing(opacity, {
        toValue: 1,
        duration: motion.durations.reducedFade,
        useNativeDriver: true,
      }).start();
      return;
    }
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: motion.durations.celebration,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 1,
        duration: motion.durations.celebration,
        easing: Easing.bezier(...motion.easings.celebration),
        useNativeDriver: true,
      }),
    ]).start();
  }, [opacity, scale, reduced]);

  return (
    <Animated.View style={[styles.container, { opacity, transform: [{ scale }] }]}>
      <Ionicons name="checkmark-circle-outline" size={40} color={theme.accent} />
      <ThemedText type="default" themeColor="textSecondary" style={styles.label}>
        {label}
      </ThemedText>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', gap: space.sm },
  label: { textAlign: 'center' },
});
