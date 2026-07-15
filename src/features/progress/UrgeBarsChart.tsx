import { StyleSheet, View } from 'react-native';
import { Rect, Svg } from 'react-native-svg';

import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { buildWeeklyBars } from '@/features/progress/chartData';
import { Spacing } from '@/theme/tokens';

interface Props {
  urgeLogs: Array<{ timestamp: string; intensity: number }>;
  weeksToShow?: number;
  width?: number;
  height?: number;
}

const BAR_GAP = 4;

// Weekly urge frequency (PRODUCT_SPEC §5.5) — plain react-native-svg, token-
// colored bars, no gradients (CLAUDE.md rule 6). Bar height reflects urge
// count that week; taller ≠ worse, just more logged — this is a frequency
// view, not a score.
export function UrgeBarsChart({ urgeLogs, weeksToShow = 6, width = 320, height = 100 }: Props) {
  const theme = useTheme();
  const bars = buildWeeklyBars(urgeLogs, new Date(), weeksToShow);

  if (bars.every((bar) => bar.count === 0)) {
    return (
      <View style={[styles.empty, { height }]}>
        <ThemedText type="small" themeColor="textSecondary">
          Log an urge to start seeing your weekly pattern here.
        </ThemedText>
      </View>
    );
  }

  const maxCount = Math.max(1, ...bars.map((bar) => bar.count));
  const barWidth = width / bars.length;

  return (
    <Svg width={width} height={height} accessibilityLabel="Weekly urge frequency chart">
      {bars.map((bar, index) => {
        const barHeight = (bar.count / maxCount) * (height - 8);
        const x = index * barWidth + BAR_GAP / 2;
        const y = height - barHeight;
        return <Rect key={index} x={x} y={y} width={barWidth - BAR_GAP} height={barHeight} rx={3} fill={theme.accent} />;
      })}
    </Svg>
  );
}

const styles = StyleSheet.create({
  empty: { justifyContent: 'center', alignItems: 'center', paddingHorizontal: Spacing.four },
});
