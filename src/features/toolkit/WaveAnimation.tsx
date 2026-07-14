import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { useTheme } from '@/hooks/use-theme';

const WAVE_WIDTH = 400;
const WAVE_HEIGHT = 80;
const WAVE_PATH = `M0,${WAVE_HEIGHT / 2} C ${WAVE_WIDTH * 0.25},${WAVE_HEIGHT * 0.1} ${WAVE_WIDTH * 0.25},${WAVE_HEIGHT * 0.9} ${WAVE_WIDTH * 0.5},${WAVE_HEIGHT / 2} C ${WAVE_WIDTH * 0.75},${WAVE_HEIGHT * 0.1} ${WAVE_WIDTH * 0.75},${WAVE_HEIGHT * 0.9} ${WAVE_WIDTH},${WAVE_HEIGHT / 2} L ${WAVE_WIDTH},${WAVE_HEIGHT} L 0,${WAVE_HEIGHT} Z`;

// Calm looping wave (Urge Surf) — two copies of the same path scrolled
// side-by-side for a seamless infinite-scroll illusion, no per-frame redraw.
export function WaveAnimation() {
  const theme = useTheme();
  const translateX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(translateX, {
        toValue: -WAVE_WIDTH,
        duration: 4000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    loop.start();
    return () => loop.stop();
  }, [translateX]);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.track, { transform: [{ translateX }] }]}>
        <Svg width={WAVE_WIDTH} height={WAVE_HEIGHT}>
          <Path d={WAVE_PATH} fill={theme.accent} opacity={0.5} />
        </Svg>
        <Svg width={WAVE_WIDTH} height={WAVE_HEIGHT}>
          <Path d={WAVE_PATH} fill={theme.accent} opacity={0.5} />
        </Svg>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { height: WAVE_HEIGHT, width: '100%', overflow: 'hidden' },
  track: { flexDirection: 'row', width: WAVE_WIDTH * 2 },
});
