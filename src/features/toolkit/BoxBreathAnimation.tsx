import { useEffect, useRef } from 'react';
import { Animated, StyleSheet } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

export type BreathPhase = 'inhale' | 'hold_in' | 'exhale' | 'hold_out';

interface Props {
  phase: BreathPhase;
  phaseSeconds: number;
}

// Expanding/contracting circle synced to box-breathing phases — no confetti,
// just a slow, calm shape.
export function BoxBreathAnimation({ phase, phaseSeconds }: Props) {
  const theme = useTheme();
  const scale = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    const expanded = phase === 'inhale' || phase === 'hold_in';
    const isTransition = phase === 'inhale' || phase === 'exhale';
    Animated.timing(scale, {
      toValue: expanded ? 1 : 0.6,
      duration: (isTransition ? phaseSeconds : 0.2) * 1000,
      useNativeDriver: true,
    }).start();
  }, [phase, phaseSeconds, scale]);

  return (
    <Animated.View
      style={[
        styles.circle,
        { backgroundColor: theme.backgroundElement, borderColor: theme.accent, transform: [{ scale }] },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  circle: { width: 160, height: 160, borderRadius: 80, borderWidth: 2 },
});
