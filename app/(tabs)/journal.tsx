import { useEffect, useMemo } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useJournalStore } from '@/features/journal/useJournalStore';
import { useProgramStore } from '@/features/program/useProgramStore';
import { useToolkitStore } from '@/features/toolkit/useToolkitStore';
import { assembleJournalTimeline, groupTimelineByDay } from '@/features/journal/timeline';
import { JournalEntryCard } from '@/features/journal/JournalEntryCard';
import { Spacing } from '@/constants/theme';

function formatDateLabel(dateKey: string): string {
  const date = new Date(`${dateKey}T00:00:00`);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (dateKey === today.toISOString().slice(0, 10)) return 'Today';
  if (dateKey === yesterday.toISOString().slice(0, 10)) return 'Yesterday';
  return date.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });
}

// Journal (PRODUCT_SPEC §5.4) — a unified, newest-first timeline of
// check-ins, urge logs, lapse debriefs, and lesson reflections, grouped by
// day. Each source stays owned by its own store; this just assembles a view.
export default function JournalScreen() {
  const checkins = useJournalStore((s) => s.checkins);
  const migrateLegacyCheckins = useJournalStore((s) => s.migrateLegacyCheckins);
  const urgeLogs = useToolkitStore((s) => s.urgeLogs);
  const lapseDebriefs = useToolkitStore((s) => s.lapseDebriefs);
  const reflections = useProgramStore((s) => s.reflections);

  useEffect(() => {
    migrateLegacyCheckins();
  }, [migrateLegacyCheckins]);

  const groups = useMemo(() => {
    const timeline = assembleJournalTimeline({ checkins, urgeLogs, lapseDebriefs, reflections });
    return groupTimelineByDay(timeline);
  }, [checkins, urgeLogs, lapseDebriefs, reflections]);

  if (groups.length === 0) {
    return (
      <ThemedView style={styles.emptyContainer}>
        <ThemedText type="title">Journal</ThemedText>
        <ThemedText type="default" themeColor="textSecondary">
          Your check-ins, urge logs, lapse debriefs, and lesson reflections will show up here as you go.
        </ThemedText>
      </ThemedView>
    );
  }

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.content}
      data={groups}
      keyExtractor={(group) => group.dateKey}
      ListHeaderComponent={
        <ThemedText type="title" style={styles.title}>
          Journal
        </ThemedText>
      }
      renderItem={({ item: group }) => (
        <View style={styles.group}>
          <ThemedText type="subtitle" style={styles.dateLabel}>
            {formatDateLabel(group.dateKey)}
          </ThemedText>
          {group.items.map((item) => (
            <JournalEntryCard key={item.id} item={item} />
          ))}
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: Spacing.four, paddingBottom: Spacing.six },
  title: { marginBottom: Spacing.four },
  group: { marginBottom: Spacing.four },
  dateLabel: { marginBottom: Spacing.two },
  emptyContainer: { flex: 1, padding: Spacing.four, justifyContent: 'center', gap: Spacing.two },
});
