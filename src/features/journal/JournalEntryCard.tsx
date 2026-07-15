import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/theme/tokens';
import type { JournalTimelineItem } from '@/features/journal/timeline';

const ICONS: Record<JournalTimelineItem['type'], keyof typeof Ionicons.glyphMap> = {
  checkin: 'moon-outline',
  urge_log: 'pulse-outline',
  lapse_debrief: 'refresh-outline',
  lesson_reflection: 'book-outline',
};

const LABELS: Record<JournalTimelineItem['type'], string> = {
  checkin: 'Evening check-in',
  urge_log: 'Urge logged',
  lapse_debrief: 'Lapse debrief',
  lesson_reflection: 'Lesson reflection',
};

function formatTime(timestamp: string): string {
  return new Date(timestamp).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

function summaryFor(item: JournalTimelineItem): string {
  switch (item.type) {
    case 'checkin':
      return item.entry.promptResponse || 'No response written.';
    case 'urge_log':
      return `Intensity ${item.entry.intensity}/10 · ${item.entry.trigger.replace(/_/g, ' ')}`;
    case 'lapse_debrief':
      return item.entry.answers.changeNextTime || 'Debrief completed.';
    case 'lesson_reflection':
      return item.entry.value;
    default:
      return '';
  }
}

interface Props {
  item: JournalTimelineItem;
}

// Type-distinct visual treatment for the unified timeline (PRODUCT_SPEC §5.4)
// — a small icon + label per entry type, same card shell otherwise.
export function JournalEntryCard({ item }: Props) {
  const theme = useTheme();

  return (
    <ThemedView style={[styles.card, { borderColor: theme.border }]}>
      <View style={styles.header}>
        <Ionicons name={ICONS[item.type]} size={18} color={theme.accent} />
        <ThemedText type="small" themeColor="accent" style={styles.label}>
          {LABELS[item.type]}
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {formatTime(item.timestamp)}
        </ThemedText>
      </View>
      <ThemedText type="default" themeColor="textSecondary" numberOfLines={3}>
        {summaryFor(item)}
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: 12, padding: Spacing.three, marginBottom: Spacing.three, gap: Spacing.one },
  header: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, marginBottom: Spacing.one },
  label: { flex: 1, fontWeight: '700' },
});
