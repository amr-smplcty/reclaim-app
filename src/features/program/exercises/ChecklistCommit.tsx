import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { PrimaryButton } from '@/components/primary-button';
import { ThemedText } from '@/components/themed-text';
import { guardAllFreeText } from '@/lib/safety/guard';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';
import { EditableList } from '@/features/program/exercises/EditableList';
import type { ChecklistCommitOutput, ChecklistCommitPayload } from '@/types/program';

interface Props {
  payload: ChecklistCommitPayload;
  onSubmit: (output: ChecklistCommitOutput) => void;
}

// Environment audit + a fixed number of written commitments (CLINICAL_SPEC
// Week 2 Day 4) — followup_next_day is handled by Today, not here.
export function ChecklistCommit({ payload, onSubmit }: Props) {
  const theme = useTheme();
  const [audit, setAudit] = useState<Record<string, boolean>>({});
  const [commitments, setCommitments] = useState<string[]>([]);

  function toggle(item: string) {
    setAudit((prev) => ({ ...prev, [item]: !prev[item] }));
  }

  const canSubmit = commitments.length >= payload.commit_count;

  function handleSubmit() {
    if (!guardAllFreeText(commitments)) return;
    onSubmit({ audit, commitments });
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <ThemedText type="subtitle" style={styles.sectionTitle}>
        What's true right now?
      </ThemedText>
      {payload.audit_items.map((item) => (
        <Pressable
          key={item}
          onPress={() => toggle(item)}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: !!audit[item] }}
          accessibilityLabel={item}
          style={[styles.item, { borderColor: theme.border }]}
        >
          <Ionicons
            name={audit[item] ? 'checkbox' : 'square-outline'}
            size={20}
            color={audit[item] ? theme.accent : theme.textSecondary}
          />
          <ThemedText type="default" style={styles.itemLabel}>
            {item}
          </ThemedText>
        </Pressable>
      ))}

      <ThemedText type="subtitle" style={styles.commitTitle}>
        {payload.commit_prompt}
      </ThemedText>
      <ThemedText type="small" themeColor="textSecondary" style={styles.hint}>
        Exactly {payload.commit_count} — specific and doable tonight.
      </ThemedText>
      <EditableList items={commitments} onChange={setCommitments} addPlaceholder="A concrete change" />
      <PrimaryButton label="Commit" onPress={handleSubmit} disabled={!canSubmit} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { paddingBottom: Spacing.six },
  sectionTitle: { marginBottom: Spacing.two },
  item: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, borderBottomWidth: 1, paddingVertical: Spacing.two },
  itemLabel: { flex: 1 },
  commitTitle: { marginTop: Spacing.four, marginBottom: Spacing.one },
  hint: { marginBottom: Spacing.two },
});
