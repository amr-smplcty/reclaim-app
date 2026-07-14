import { useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';

import { PrimaryButton } from '@/components/primary-button';
import { ThemedText } from '@/components/themed-text';
import { guardAllFreeText } from '@/lib/safety/guard';
import { Spacing } from '@/constants/theme';
import type { GuidedListOutput, GuidedListPayload } from '@/types/program';
import { EditableList } from '@/features/program/exercises/EditableList';

interface Props {
  payload: GuidedListPayload;
  onSubmit: (output: GuidedListOutput) => void;
  initialItems?: string[];
}

// Pre-fills from any existing save at this payload's save_to key rather than
// starting blank — resuming a guided_list exercise merges with prior work
// instead of discarding it (this is how shift_list reconciles the in-tool
// 10-Minute Shift builder with Week 2 Day 6, BACKLOG #14).
export function GuidedList({ payload, onSubmit, initialItems }: Props) {
  const [items, setItems] = useState<string[]>(initialItems ?? []);
  const canSubmit = items.length >= payload.min_items;

  function handleSubmit() {
    if (!guardAllFreeText(items)) return;
    onSubmit({ items });
  }

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
      <ThemedText type="subtitle" style={styles.prompt}>
        {payload.prompt}
      </ThemedText>
      <ThemedText type="small" themeColor="textSecondary" style={styles.hint}>
        At least {payload.min_items} — tap a suggestion or add your own.
      </ThemedText>
      <EditableList items={items} onChange={setItems} suggestions={payload.suggestions} />
      <PrimaryButton label="Save" onPress={handleSubmit} disabled={!canSubmit} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  container: { paddingBottom: Spacing.six },
  prompt: { marginBottom: Spacing.one },
  hint: { marginBottom: Spacing.three },
});
