import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { ChoiceChip } from '@/components/choice-chip';
import { PrimaryButton } from '@/components/primary-button';
import { ThemedText } from '@/components/themed-text';
import { guardAllFreeText } from '@/lib/safety/guard';
import { Spacing } from '@/constants/theme';
import { collectComparisonLines } from '@/features/program/exerciseHelpers';
import { EditableList } from '@/features/program/exercises/EditableList';
import type {
  DecisionalBalanceComparePayload,
  EmergencyCardLineOutput,
  GuidedListOutput,
  RatedInventoryOutput,
} from '@/types/program';

interface Props {
  payload: DecisionalBalanceComparePayload;
  benefits: GuidedListOutput | undefined;
  costs: RatedInventoryOutput | undefined;
  onSubmit: (output: EmergencyCardLineOutput) => void;
}

export function DecisionalBalanceCompare({ payload, benefits, costs, onSubmit }: Props) {
  const [gains, setGains] = useState<string[]>([]);
  const [hardestLine, setHardestLine] = useState<string | null>(null);

  const costLines = useMemo(
    () => (costs ? Object.entries(costs.notes).map(([area, note]) => `${area}: ${note}`) : []),
    [costs]
  );
  const candidates = useMemo(() => collectComparisonLines(benefits, costs, gains), [benefits, costs, gains]);

  const canSubmit = gains.length >= 3 && !!hardestLine;

  function handleSubmit() {
    if (!guardAllFreeText(gains)) return;
    onSubmit(hardestLine as string);
  }

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
      <View style={styles.column}>
        <ThemedText type="subtitle" style={styles.columnTitle}>
          What it gives you
        </ThemedText>
        {(benefits?.items ?? []).map((line) => (
          <ThemedText key={line} type="default" themeColor="textSecondary" style={styles.line}>
            • {line}
          </ThemedText>
        ))}
      </View>

      <View style={styles.column}>
        <ThemedText type="subtitle" style={styles.columnTitle}>
          What it's costing you
        </ThemedText>
        {costLines.map((line) => (
          <ThemedText key={line} type="default" themeColor="textSecondary" style={styles.line}>
            • {line}
          </ThemedText>
        ))}
      </View>

      <ThemedText type="subtitle" style={styles.columnTitle}>
        {payload.gain_prompt}
      </ThemedText>
      <EditableList items={gains} onChange={setGains} addPlaceholder="Add what you'd gain" />

      <ThemedText type="subtitle" style={styles.columnTitle}>
        {payload.hardest_line_prompt}
      </ThemedText>
      <View>
        {candidates.map((line) => (
          <ChoiceChip key={line} label={line} selected={hardestLine === line} onPress={() => setHardestLine(line)} />
        ))}
      </View>

      <PrimaryButton label="Save" onPress={handleSubmit} disabled={!canSubmit} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  container: { paddingBottom: Spacing.six },
  column: { marginBottom: Spacing.four },
  columnTitle: { marginBottom: Spacing.two },
  line: { marginBottom: Spacing.one },
});
