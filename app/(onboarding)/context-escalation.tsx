import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { ChoiceChip } from '@/components/choice-chip';
import { PrimaryButton } from '@/components/primary-button';
import { ThemedText } from '@/components/themed-text';
import { OnboardingLayout } from '@/features/assessment/OnboardingLayout';
import { goNextFrom } from '@/features/assessment/navigation';
import { useOnboardingStore, type EscalationAnswer } from '@/features/assessment/useOnboardingStore';
import { Spacing } from '@/theme/tokens';

// Escalation (yes/no/unsure) is named explicitly in CLINICAL_SPEC §2.4 — no
// content JSON needed for these 3 fixed options.
const OPTIONS: Array<{ value: EscalationAnswer; label: string }> = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
  { value: 'unsure', label: "I'm not sure" },
];

export default function ContextEscalationScreen() {
  const answers = useOnboardingStore((s) => s.answers);
  const updateAnswers = useOnboardingStore((s) => s.updateAnswers);
  const [selected, setSelected] = useState<EscalationAnswer | null>(answers.escalation);

  function handleNext() {
    updateAnswers({ escalation: selected });
    goNextFrom('context-escalation');
  }

  return (
    <OnboardingLayout step="context-escalation">
      <ThemedText type="title" style={styles.title}>
        Has it taken more porn to get the same effect over time?
      </ThemedText>
      <View>
        {OPTIONS.map((option) => (
          <ChoiceChip
            key={option.value}
            label={option.label}
            selected={selected === option.value}
            onPress={() => setSelected(option.value)}
          />
        ))}
      </View>
      <View style={styles.footer}>
        <PrimaryButton label="Next" onPress={handleNext} disabled={!selected} />
      </View>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  title: { marginBottom: Spacing.four },
  footer: { flex: 1, justifyContent: 'flex-end' },
});
