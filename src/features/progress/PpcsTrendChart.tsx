import { StyleSheet, View } from 'react-native';
import { Circle, Line, Polyline, Svg } from 'react-native-svg';

import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { buildTrendPoints } from '@/features/progress/chartData';
import { PPCS6_CUTOFF, PPCS6_SCORE_MAX, PPCS6_SCORE_MIN } from '@/features/assessment/scoring';
import type { AssessmentEntry } from '@/features/assessment/useAssessmentHistoryStore';
import { Spacing } from '@/theme/tokens';

interface Props {
  entries: AssessmentEntry[];
  width?: number;
  height?: number;
}

// PPCS-6 trend chart (PRODUCT_SPEC §5.5) — plain react-native-svg only, no
// victory-native/Skia (INCIDENTS.md INC-2: Expo-Go-incompatible native
// modules). Calm and token-colored: one accent line, a muted dashed
// reference line at the clinical cutoff, no gradients (CLAUDE.md rule 6).
export function PpcsTrendChart({ entries, width = 320, height = 140 }: Props) {
  const theme = useTheme();
  const points = buildTrendPoints(entries, width, height);

  if (points.length === 0) {
    return (
      <View style={[styles.empty, { height }]}>
        <ThemedText type="small" themeColor="textSecondary">
          Your score trend will appear here after your first re-assessment.
        </ThemedText>
      </View>
    );
  }

  const cutoffFraction = (PPCS6_SCORE_MAX - PPCS6_CUTOFF) / (PPCS6_SCORE_MAX - PPCS6_SCORE_MIN);
  const cutoffY = 12 + cutoffFraction * (height - 24);
  const polylinePoints = points.map((p) => `${p.x},${p.y}`).join(' ');

  return (
    <Svg width={width} height={height} accessibilityLabel="PPCS-6 score trend chart">
      <Line x1={0} y1={cutoffY} x2={width} y2={cutoffY} stroke={theme.border} strokeWidth={1} strokeDasharray="4,4" />
      {points.length > 1 ? <Polyline points={polylinePoints} fill="none" stroke={theme.accent} strokeWidth={2} /> : null}
      {points.map((p) => (
        <Circle key={p.timestamp} cx={p.x} cy={p.y} r={4} fill={theme.accent} />
      ))}
    </Svg>
  );
}

const styles = StyleSheet.create({
  empty: { justifyContent: 'center', alignItems: 'center', paddingHorizontal: Spacing.four },
});
