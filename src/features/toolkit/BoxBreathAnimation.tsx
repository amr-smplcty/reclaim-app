import { useEffect, useRef } from 'react';
import { Animated, StyleSheet } from 'react-native';

import { useTheme } from '@/hooks/use-theme';
import { useReducedMotion } from '@/hooks/use-reduced-motion';

export type BreathPhase = 'inhale' | 'hold_in' | 'exhale' | 'hold_out';

interface Props {
  phase: BreathPhase;
  phaseSeconds: number;
}

// Expanding/contracting circle synced to box-breathing phases — the only slow
// motion (DESIGN_SYSTEM.md §5), no confetti, just a calm shape. Under
// prefers-reduced-motion the circle holds a steady mid-size and the phase copy
// carries the pacing instead (crossfade fallback).
export function BoxBreathAnimation({ phase, phaseSeconds }: Props) {
  const theme = useTheme();
  const reduced = useReducedMotion();
  const scale = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    if (reduced) {
      scale.setValue(0.8);
      return;
    }
    const expanded = phase === 'inhale' || phase === 'hold_in';
    const isTransition = phase === 'inhale' || phase === 'exhale';
    Animated.timing(scale, {
      toValue: expanded ? 1 : 0.6,
      duration: (isTransition ? phaseSeconds : 0.2) * 1000,
      useNativeDriver: true,
    }).start();
  }, [phase, phaseSeconds, scale, reduced]);

  return (
    <Animated.View
      style={[
        styles.circle,
        { backgroundColor: theme.surfaceRaised, borderColor: theme.accent, transform: [{ scale }] },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  circle: { width: 160, height: 160, borderRadius: 80, borderWidth: 2 },
});
