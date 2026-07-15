import { useState } from 'react';
import { ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { router } from 'expo-router';

import { ChoiceChip } from '@/components/choice-chip';
import { PrimaryButton } from '@/components/primary-button';
import { ThemedText } from '@/components/themed-text';
import { OnboardingLayout } from '@/features/assessment/OnboardingLayout';
import { goNextFrom } from '@/features/assessment/navigation';
import { useOnboardingStore, type MotivationTag } from '@/features/assessment/useOnboardingStore';
import { getIntakeContent, getCrisisPatterns } from '@/lib/content';
import { detectSafetySignal } from '@/lib/safety/detect';
import { trackCrisisLanguageDetected, trackIllegalContentDisclosed } from '@/lib/analytics/events';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/theme/tokens';

const { motivations } = getIntakeContent();

// Step 3 (PRODUCT_SPEC §4) — the "other" free text is the one onboarding entry
// point that needs crisis/illegal-content screening (CLINICAL_SPEC §6).
export default function MotivationScreen() {
  const theme = useTheme();
  const answers = useOnboardingStore((s) => s.answers);
  const updateAnswers = useOnboardingStore((s) => s.updateAnswers);
  const clearMotivationOther = useOnboardingStore((s) => s.clearMotivationOther);

  const [selected, setSelected] = useState<MotivationTag[]>(answers.motivations);
  const [otherText, setOtherText] = useState(answers.motivationOther);

  const showOtherInput = selected.includes('other');
  const canSubmit = selected.length > 0 && (!showOtherInput || otherText.trim().length > 0);

  function toggle(tag: MotivationTag) {
    setSelected((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  }

  function handleNext() {
    updateAnswers({ motivations: selected, motivationOther: otherText });

    if (otherText.trim()) {
      const signal = detectSafetySignal(otherText, getCrisisPatterns());
      if (signal) {
        clearMotivationOther();
        if (signal === 'crisis') trackCrisisLanguageDetected();
        else trackIllegalContentDisclosed();
        router.push({ pathname: '/(modals)/safety-resources', params: { type: signal } });
        return;
      }
    }

    goNextFrom('motivation');
  }

  return (
    <OnboardingLayout step="motivation">
      <ThemedText type="title" style={styles.title}>
        What's driving you to change your porn use right now?
      </ThemedText>
      <ThemedText type="default" themeColor="textSecondary" style={styles.subtitle}>
        Select all that apply.
      </ThemedText>
      <ScrollView showsVerticalScrollIndicator={false}>
        {motivations.map((m) => (
          <ChoiceChip
            key={m.id}
            label={m.label}
            selected={selected.includes(m.id as MotivationTag)}
            onPress={() => toggle(m.id as MotivationTag)}
          />
        ))}
        {showOtherInput ? (
          <TextInput
            value={otherText}
            onChangeText={setOtherText}
            placeholder="Tell us more"
            placeholderTextColor={theme.textSecondary}
            multiline
            style={[styles.input, { color: theme.textPrimary, borderColor: theme.border }]}
            accessibilityLabel="Other motivation, free text"
          />
        ) : null}
      </ScrollView>
      <View style={styles.footer}>
        <PrimaryButton label="Next" onPress={handleNext} disabled={!canSubmit} />
      </View>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  title: { marginBottom: Spacing.two },
  subtitle: { marginBottom: Spacing.four },
  input: { borderWidth: 1, borderRadius: 10, padding: 14, minHeight: 80, fontSize: 16, textAlignVertical: 'top' },
  footer: { paddingTop: Spacing.three },
});
