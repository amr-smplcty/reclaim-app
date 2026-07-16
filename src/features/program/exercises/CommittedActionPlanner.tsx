import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { PrimaryButton } from '@/components/primary-button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { guardAllFreeText } from '@/lib/safety/guard';
import { useTheme } from '@/hooks/use-theme';
import { Spacing, radius } from '@/theme/tokens';
import type { CommittedActionPlannerOutput, CommittedActionPlannerPayload, DayOfWeek } from '@/types/program';
import { allActionsComplete, initializeActions, toggleDay } from '@/features/program/committedActionPlanner';

interface Props {
  payload: CommittedActionPlannerPayload;
  values: string[];
  onSubmit: (output: CommittedActionPlannerOutput) => void;
}

const DAYS: Array<{ id: DayOfWeek; label: string }> = [
  { id: 'mon', label: 'M' },
  { id: 'tue', label: 'T' },
  { id: 'wed', label: 'W' },
  { id: 'thu', label: 'T' },
  { id: 'fri', label: 'F' },
  { id: 'sat', label: 'S' },
  { id: 'sun', label: 'S' },
];

// One small action per core value (Week 4 Day 3). `values` comes from Day
// 2's save (values_core) — if that's somehow empty (Day 2 skipped), there's
// nothing to plan, so this degrades to a message rather than an empty form.
export function CommittedActionPlanner({ payload, values, onSubmit }: Props) {
  const theme = useTheme();
  const [actions, setActions] = useState(() => initializeActions(values));

  if (values.length === 0) {
    return (
      <ThemedView style={styles.emptyContainer}>
        <ThemedText type="default" themeColor="textSecondary">
          Complete yesterday's exercise first — your two core values feed this one.
        </ThemedText>
      </ThemedView>
    );
  }

  function updateAction(index: number, patch: Partial<(typeof actions)[number]>) {
    setActions((prev) => prev.map((a, i) => (i === index ? { ...a, ...patch } : a)));
  }

  const canSubmit = allActionsComplete(actions);

  function handleSubmit() {
    if (!guardAllFreeText(actions.map((a) => a.action).concat(actions.map((a) => a.if_then_anchor)))) return;
    onSubmit(actions);
  }

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
      <ThemedText type="small" themeColor="textSecondary" style={styles.sizeNote}>
        {payload.size_note}
      </ThemedText>
      {actions.map((action, index) => (
        <ThemedView key={action.id} style={[styles.card, { borderColor: theme.border }]}>
          <ThemedText type="subtitle" themeColor="accent" style={styles.valueLabel}>
            {action.value}
          </ThemedText>

          <ThemedText type="small" themeColor="textSecondary" style={styles.fieldLabel}>
            Your small action
          </ThemedText>
          <TextInput
            value={action.action}
            onChangeText={(text) => updateAction(index, { action: text })}
            placeholder="e.g. two-minute check-in text"
            placeholderTextColor={theme.textSecondary}
            style={[styles.input, { color: theme.textPrimary, borderColor: theme.border }]}
            accessibilityLabel={`${action.value} action`}
          />

          <ThemedText type="small" themeColor="textSecondary" style={styles.fieldLabel}>
            If-then anchor
          </ThemedText>
          <TextInput
            value={action.if_then_anchor}
            onChangeText={(text) => updateAction(index, { if_then_anchor: text })}
            placeholder="e.g. if it's 9pm, then..."
            placeholderTextColor={theme.textSecondary}
            style={[styles.input, { color: theme.textPrimary, borderColor: theme.border }]}
            accessibilityLabel={`${action.value} if-then anchor`}
          />

          <ThemedText type="small" themeColor="textSecondary" style={styles.fieldLabel}>
            Which days
          </ThemedText>
          <View style={styles.daysRow}>
            {DAYS.map((day) => {
              const selected = action.days_of_week.includes(day.id);
              return (
                <Pressable
                  key={day.id}
                  onPress={() => updateAction(index, { days_of_week: toggleDay(action.days_of_week, day.id) })}
                  accessibilityRole="button"
                  accessibilityLabel={`${action.value} on ${day.id}`}
                  accessibilityState={{ selected }}
                  style={[
                    styles.dayChip,
                    { backgroundColor: selected ? theme.accent : theme.surface, borderColor: selected ? theme.accent : theme.border },
                  ]}
                >
                  <ThemedText type="small" style={selected ? { color: theme.bg, fontWeight: '700' } : undefined}>
                    {day.label}
                  </ThemedText>
                </Pressable>
              );
            })}
          </View>
        </ThemedView>
      ))}
      <PrimaryButton label="Save" onPress={handleSubmit} disabled={!canSubmit} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  container: { paddingBottom: Spacing.six },
  sizeNote: { marginBottom: Spacing.three },
  card: { borderWidth: 1, borderRadius: radius.card, padding: Spacing.three, marginBottom: Spacing.three, gap: Spacing.one },
  valueLabel: { marginBottom: Spacing.one },
  fieldLabel: { marginTop: Spacing.two },
  input: { borderWidth: 1, borderRadius: 10, padding: 10, fontSize: 16 },
  daysRow: { flexDirection: 'row', gap: Spacing.one },
  dayChip: { width: 32, height: 32, borderRadius: radius.chip, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  emptyContainer: { flex: 1, justifyContent: 'center', padding: Spacing.four },
});
