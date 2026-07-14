import { useState } from 'react';
import { ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { ChoiceChip } from '@/components/choice-chip';
import { PrimaryButton } from '@/components/primary-button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { guardAllFreeText } from '@/lib/safety/guard';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';
import type { IfThenBuilderOutput, IfThenBuilderPayload, IfThenPlan } from '@/types/program';

interface Props {
  payload: IfThenBuilderPayload;
  referenceSummaries: string[];
  onSubmit: (output: IfThenBuilderOutput) => void;
}

// Implementation-intention plans (CLINICAL_SPEC Week 2 Day 5) — the user's
// trigger maps and chain are shown for reference, per the exercise steps.
export function IfThenBuilder({ payload, referenceSummaries, onSubmit }: Props) {
  const theme = useTheme();
  const [plans, setPlans] = useState<IfThenPlan[]>(
    Array.from({ length: payload.plan_count }, () => ({ if_text: '', then_text: '' }))
  );

  function updatePlan(index: number, patch: Partial<IfThenPlan>) {
    setPlans((prev) => prev.map((p, i) => (i === index ? { ...p, ...patch } : p)));
  }

  const canSubmit = plans.every((p) => p.if_text.trim().length > 0 && p.then_text.trim().length > 0);

  function handleSubmit() {
    if (!guardAllFreeText(plans.flatMap((p) => [p.if_text, p.then_text]))) return;
    onSubmit(plans);
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {referenceSummaries.length > 0 ? (
        <ThemedView style={[styles.referenceBlock, { borderColor: theme.border }]}>
          <ThemedText type="small" themeColor="accent" style={styles.referenceLabel}>
            For reference
          </ThemedText>
          {referenceSummaries.map((summary, index) => (
            <ThemedText key={index} type="small" themeColor="textSecondary">
              {summary}
            </ThemedText>
          ))}
        </ThemedView>
      ) : null}

      {plans.map((plan, index) => (
        <View key={index} style={styles.planBlock}>
          <ThemedText type="subtitle" style={styles.planTitle}>
            Plan {index + 1}
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary" style={styles.label}>
            If…
          </ThemedText>
          <TextInput
            value={plan.if_text}
            onChangeText={(text) => updatePlan(index, { if_text: text })}
            placeholder="If I notice..."
            placeholderTextColor={theme.textSecondary}
            style={[styles.input, { color: theme.text, borderColor: theme.border }]}
            accessibilityLabel={`Plan ${index + 1} trigger`}
          />
          <ThemedText type="small" themeColor="textSecondary" style={styles.label}>
            Then…
          </ThemedText>
          <View>
            {payload.then_suggestions.map((suggestion) => (
              <ChoiceChip
                key={suggestion}
                label={suggestion}
                selected={plan.then_text === suggestion}
                onPress={() => updatePlan(index, { then_text: suggestion })}
              />
            ))}
          </View>
          <TextInput
            value={payload.then_suggestions.includes(plan.then_text) ? '' : plan.then_text}
            onChangeText={(text) => updatePlan(index, { then_text: text })}
            placeholder="Or write your own"
            placeholderTextColor={theme.textSecondary}
            style={[styles.input, { color: theme.text, borderColor: theme.border }]}
            accessibilityLabel={`Plan ${index + 1} action, custom`}
          />
        </View>
      ))}

      <PrimaryButton label="Save" onPress={handleSubmit} disabled={!canSubmit} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { paddingBottom: Spacing.six },
  referenceBlock: { borderWidth: 1, borderRadius: 10, padding: Spacing.three, marginBottom: Spacing.four, gap: Spacing.one },
  referenceLabel: { fontWeight: '700' },
  planBlock: { marginBottom: Spacing.five },
  planTitle: { marginBottom: Spacing.two },
  label: { marginBottom: Spacing.one, marginTop: Spacing.two },
  input: { borderWidth: 1, borderRadius: 10, padding: 12, fontSize: 16, marginBottom: Spacing.two },
});
