import { useEffect, useRef } from 'react';
import { Animated, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';

interface Props {
  label: string;
}

// Calm completion state — a subtle fade/scale, deliberately not confetti
// (CLAUDE.md design language: no gamified celebration).
export function CompletionBadge({ label }: Props) {
  const theme = useTheme();
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();
  }, [opacity, scale]);

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
  container: { alignItems: 'center', gap: Spacing.two },
  label: { textAlign: 'center' },
});
