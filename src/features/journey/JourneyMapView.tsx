import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { MarkdownBody } from '@/components/markdown-body';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/use-theme';
import { Spacing, radius } from '@/theme/tokens';
import { useProgramStore } from '@/features/program/useProgramStore';
import { getJourneyContent, getWeeklyIntro } from '@/lib/content/journey';
import {
  canReadWeeklyIntro,
  deriveJourneyMap,
  upcomingLabelFor,
  type JourneyNodeView,
} from '@/features/journey/journeyMap';

interface Props {
  // Preview mode (the beginning sequence's screen 4): non-interactive, no
  // expandable intros — just the road at a glance.
  preview?: boolean;
}

// The journey map (PRODUCT_SPEC §5.7): calm 6-node path + maintenance node.
// Completed / current (with day dots) / upcoming (title+subtitle visible, a
// "Starts after Week N" label, NO padlock — locks read as paywall). Tapping a
// reached (completed/current) node re-opens that week's kickoff intro; an
// upcoming node shows title+subtitle only.
export function JourneyMap({ preview = false }: Props) {
  const position = useProgramStore((s) => s.position);
  const programCompletedAt = useProgramStore((s) => s.programCompletedAt);
  const content = getJourneyContent().journey_map;
  const view = deriveJourneyMap(content, position, programCompletedAt);
  const [expandedWeek, setExpandedWeek] = useState<number | null>(null);

  return (
    <View style={styles.container}>
      <ThemedText type="subtitle" style={styles.heading}>
        {view.heading}
      </ThemedText>
      {view.nodes.map((node) => (
        <WeekNode
          key={node.week}
          node={node}
          content={content}
          preview={preview}
          expanded={expandedWeek === node.week}
          onToggle={() => setExpandedWeek((w) => (w === node.week ? null : node.week))}
        />
      ))}
      <MaintenanceNode
        title={view.maintenance.title}
        subtitle={view.maintenance.subtitle}
        state={view.maintenance.state}
        currentLabel={content.current_label}
        upcomingLabel={upcomingLabelFor(content, 7)}
      />
    </View>
  );
}

function WeekNode({
  node,
  content,
  preview,
  expanded,
  onToggle,
}: {
  node: JourneyNodeView;
  content: ReturnType<typeof getJourneyContent>['journey_map'];
  preview: boolean;
  expanded: boolean;
  onToggle: () => void;
}) {
  const theme = useTheme();
  const reachable = canReadWeeklyIntro(node.state);
  const intro = getWeeklyIntro(node.week); // undefined for Week 1 (its intro is the beginning sequence)
  const canExpand = !preview && reachable && !!intro;

  const borderColor = node.state === 'current' ? theme.accent : theme.border;
  const dotColor = node.state === 'upcoming' ? theme.textDisabled : theme.accent;

  return (
    <ThemedView style={[styles.node, { borderColor }]}>
      <Pressable
        onPress={canExpand ? onToggle : undefined}
        disabled={!canExpand}
        accessibilityRole={canExpand ? 'button' : undefined}
        accessibilityLabel={`Week ${node.week}: ${node.title}`}
        accessibilityState={canExpand ? { expanded } : undefined}
      >
        <View style={styles.nodeHeaderRow}>
          <View style={styles.nodeTitleCol}>
            <ThemedText type="small" themeColor={node.state === 'upcoming' ? 'textSecondary' : 'accent'}>
              {node.state === 'completed'
                ? content.completed_label
                : node.state === 'current'
                  ? content.current_label
                  : upcomingLabelFor(content, node.week)}
            </ThemedText>
            <ThemedText type="default" style={styles.nodeTitle}>
              {node.title}
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {node.subtitle}
            </ThemedText>
          </View>
        </View>
        {node.dayDots ? (
          <View style={styles.dotsRow} accessibilityLabel={`Day ${node.dayDots.currentDay} of ${node.dayDots.total}`}>
            {Array.from({ length: node.dayDots.total }, (_, i) => (
              <View
                key={i}
                style={[styles.dot, { backgroundColor: i < node.dayDots!.currentDay ? dotColor : theme.surface }]}
              />
            ))}
          </View>
        ) : null}
      </Pressable>
      {canExpand && expanded && intro ? (
        <View style={styles.introBody}>
          <MarkdownBody>{intro.body}</MarkdownBody>
        </View>
      ) : null}
    </ThemedView>
  );
}

function MaintenanceNode({
  title,
  subtitle,
  state,
  currentLabel,
  upcomingLabel,
}: {
  title: string;
  subtitle: string;
  state: string;
  currentLabel: string;
  upcomingLabel: string;
}) {
  const theme = useTheme();
  return (
    <ThemedView style={[styles.node, { borderColor: state === 'current' ? theme.accent : theme.border }]}>
      <ThemedText type="small" themeColor={state === 'upcoming' ? 'textSecondary' : 'accent'}>
        {state === 'current' ? currentLabel : upcomingLabel}
      </ThemedText>
      <ThemedText type="default" style={styles.nodeTitle}>
        {title}
      </ThemedText>
      <ThemedText type="small" themeColor="textSecondary">
        {subtitle}
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { gap: Spacing.two },
  heading: { marginBottom: Spacing.one },
  node: { borderWidth: 1, borderRadius: radius.card, padding: Spacing.three, gap: Spacing.one },
  nodeHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  nodeTitleCol: { flex: 1, gap: 2 },
  nodeTitle: { fontWeight: '600' },
  dotsRow: { flexDirection: 'row', gap: Spacing.one, marginTop: Spacing.two },
  dot: { width: 8, height: 8, borderRadius: 4 },
  introBody: { marginTop: Spacing.two },
});
