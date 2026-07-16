import { useState } from 'react';
import { ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { ChoiceChip } from '@/components/choice-chip';
import { PrimaryButton } from '@/components/primary-button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { guardFreeText } from '@/lib/safety/guard';
import { useTheme } from '@/hooks/use-theme';
import { Spacing, radius } from '@/theme/tokens';
import type { UrgeValueMapOutput, UrgeValueMapPayload } from '@/types/program';
import type { UrgeLogEntry } from '@/features/toolkit/useToolkitStore';
import {
  allLogsTagged,
  buildMappedOutput,
  buildWorksheetOutput,
  hasSufficientLogs,
  resolveTagOptions,
  selectRecentLogs,
} from '@/features/program/urgeValueMap';

interface Props {
  payload: UrgeValueMapPayload;
  urgeLogs: UrgeLogEntry[];
  valuesCore: string[];
  onSubmit: (output: UrgeValueMapOutput) => void;
}

// Dual-mode by construction (Week 4 Day 4 notes_for_engineering): below
// min_logs there isn't enough real data to map, so this degrades to a
// free-text worksheet instead of a near-empty, unconvincing tagging list.
export function UrgeValueMap({ payload, urgeLogs, valuesCore, onSubmit }: Props) {
  const theme = useTheme();
  const [tags, setTags] = useState<Record<string, string>>({});
  const [worksheetText, setWorksheetText] = useState('');

  if (!hasSufficientLogs(urgeLogs, payload.min_logs)) {
    function handleWorksheetSubmit() {
      if (!guardFreeText(worksheetText)) return;
      onSubmit(buildWorksheetOutput(worksheetText));
    }

    return (
      <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
        <ThemedText type="default" themeColor="textSecondary" style={styles.notice}>
          You haven't logged {payload.min_logs} urges yet, so there's not quite enough of your own data to map. Take a
          guess instead — what's the honest answer been lately?
        </ThemedText>
        <TextInput
          value={worksheetText}
          onChangeText={setWorksheetText}
          placeholder="What have your urges mostly been asking for?"
          placeholderTextColor={theme.textSecondary}
          multiline
          style={[styles.input, { color: theme.textPrimary, borderColor: theme.border }]}
          accessibilityLabel="What have your urges mostly been asking for?"
        />
        <PrimaryButton label="Save" onPress={handleWorksheetSubmit} disabled={worksheetText.trim().length === 0} />
      </ScrollView>
    );
  }

  const recentLogs = selectRecentLogs(urgeLogs);
  const tagOptions = resolveTagOptions(valuesCore, payload.extra_tags);
  const canSubmit = allLogsTagged(recentLogs, tags);

  function handleMappedSubmit() {
    onSubmit(buildMappedOutput(tags));
  }

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
      <ThemedText type="small" themeColor="textSecondary" style={styles.notice}>
        For each, what was it actually asking for?
      </ThemedText>
      {recentLogs.map((log) => (
        <ThemedView key={log.id} style={[styles.logCard, { borderColor: theme.border }]}>
          <ThemedText type="default">
            Intensity {log.intensity} · {log.trigger.replace('_', ' ')}
          </ThemedText>
          <View style={styles.tagRow}>
            {tagOptions.map((tag) => (
              <ChoiceChip
                key={tag}
                label={tag}
                selected={tags[log.id] === tag}
                onPress={() => setTags((prev) => ({ ...prev, [log.id]: tag }))}
              />
            ))}
          </View>
        </ThemedView>
      ))}
      <PrimaryButton label="Save" onPress={handleMappedSubmit} disabled={!canSubmit} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  container: { paddingBottom: Spacing.six },
  notice: { marginBottom: Spacing.three },
  input: { borderWidth: 1, borderRadius: 10, padding: 14, minHeight: 120, fontSize: 16, textAlignVertical: 'top', marginBottom: Spacing.four },
  logCard: { borderWidth: 1, borderRadius: radius.card, padding: Spacing.three, marginBottom: Spacing.three, gap: Spacing.two },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.one },
});
