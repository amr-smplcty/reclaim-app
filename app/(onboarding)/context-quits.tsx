import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { ChoiceChip } from '@/components/choice-chip';
import { PrimaryButton } from '@/components/primary-button';
import { ThemedText } from '@/components/themed-text';
import { OnboardingLayout } from '@/features/assessment/OnboardingLayout';
import { goNextFrom } from '@/features/assessment/navigation';
import { useOnboardingStore } from '@/features/assessment/useOnboardingStore';
import { getIntakeContent } from '@/lib/content';
import { Spacing } from '@/constants/theme';

const { prior_quit_attempts: options } = getIntakeContent();

export default function ContextQuitsScreen() {
  const answers = useOnboardingStore((s) => s.answers);
  const updateAnswers = useOnboardingStore((s) => s.updateAnswers);
  const [selected, setSelected] = useState<string | null>(answers.priorQuitAttempts);

  function handleNext() {
    updateAnswers({ priorQuitAttempts: selected });
    goNextFrom('context-quits');
  }

  return (
    <OnboardingLayout step="context-quits">
      <ThemedText type="title" style={styles.title}>
        How many times have you tried to stop before?
      </ThemedText>
      <ScrollView showsVerticalScrollIndicator={false}>
        {options.map((option) => (
          <ChoiceChip key={option} label={option} selected={selected === option} onPress={() => setSelected(option)} />
        ))}
      </ScrollView>
      <View style={styles.footer}>
        <PrimaryButton label="Next" onPress={handleNext} disabled={!selected} />
      </View>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  title: { marginBottom: Spacing.four },
  footer: { paddingTop: Spacing.three },
});
