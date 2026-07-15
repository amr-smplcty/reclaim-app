import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { ChoiceChip } from '@/components/choice-chip';
import { PrimaryButton } from '@/components/primary-button';
import { ThemedText } from '@/components/themed-text';
import { OnboardingLayout } from '@/features/assessment/OnboardingLayout';
import { goNextFrom } from '@/features/assessment/navigation';
import { useOnboardingStore } from '@/features/assessment/useOnboardingStore';
import { getIntakeContent } from '@/lib/content';
import { Spacing } from '@/theme/tokens';

const { years_of_use: options } = getIntakeContent();

export default function ContextYearsScreen() {
  const answers = useOnboardingStore((s) => s.answers);
  const updateAnswers = useOnboardingStore((s) => s.updateAnswers);
  const [selected, setSelected] = useState<string | null>(answers.yearsOfUse);

  function handleNext() {
    updateAnswers({ yearsOfUse: selected });
    goNextFrom('context-years');
  }

  return (
    <OnboardingLayout step="context-years">
      <ThemedText type="title" style={styles.title}>
        How long has your porn use been going on?
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
