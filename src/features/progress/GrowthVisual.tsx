import { StyleSheet, View } from 'react-native';
import { Circle, Line, Svg } from 'react-native-svg';

import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import {
  computeGrowthScore,
  computeGrowthStage,
  GROWTH_STAGE_COUNT,
  type GrowthEvents,
} from '@/features/progress/growthStage';
import { Spacing } from '@/theme/tokens';

interface Props {
  events: GrowthEvents;
  width?: number;
  height?: number;
}

const STAGE_LABELS = ['Seed', 'Sprout', 'Sapling', 'Young tree', 'Full tree', 'Flourishing'];

// Growth visual (PRODUCT_SPEC §5.5) — minimal, slowly-evolving landscape
// driven strictly by practice events. Plain react-native-svg, token-colored,
// no gradients/confetti/bounce (CLAUDE.md rule 6). Can only grow: the stage
// is a pure function of ever-growing counters (growthStage.ts).
export function GrowthVisual({ events, width = 160, height = 160 }: Props) {
  const theme = useTheme();
  const stage = computeGrowthStage(computeGrowthScore(events));

  const groundY = height - 20;
  const trunkHeight = 10 + stage * 12;
  const trunkTopY = groundY - trunkHeight;
  const canopyRadius = 6 + stage * 6;
  const isFlourishing = stage === GROWTH_STAGE_COUNT - 1;

  return (
    <View style={styles.container}>
      <Svg width={width} height={height} accessibilityLabel={`Growth visual: ${STAGE_LABELS[stage]}`}>
        <Line x1={0} y1={groundY} x2={width} y2={groundY} stroke={theme.border} strokeWidth={1} />
        {stage > 0 ? (
          <Line x1={width / 2} y1={groundY} x2={width / 2} y2={trunkTopY} stroke={theme.textSecondary} strokeWidth={3} />
        ) : null}
        <Circle
          cx={width / 2}
          cy={stage === 0 ? groundY - 3 : trunkTopY}
          r={stage === 0 ? 3 : canopyRadius}
          fill={theme.accent}
        />
        {isFlourishing ? (
          <>
            <Circle cx={width / 2 - canopyRadius / 1.5} cy={trunkTopY - canopyRadius / 2} r={3} fill={theme.success} />
            <Circle cx={width / 2 + canopyRadius / 1.5} cy={trunkTopY - canopyRadius / 2} r={3} fill={theme.success} />
          </>
        ) : null}
      </Svg>
      <ThemedText type="small" themeColor="textSecondary" style={styles.label}>
        {STAGE_LABELS[stage]}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', gap: Spacing.one },
  label: { textAlign: 'center' },
});
