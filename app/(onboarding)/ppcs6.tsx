import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';

import { ChoiceChip } from '@/components/choice-chip';
import { ThemedText } from '@/components/themed-text';
import { OnboardingLayout } from '@/features/assessment/OnboardingLayout';
import { goNextFrom } from '@/features/assessment/navigation';
import { useOnboardingStore } from '@/features/assessment/useOnboardingStore';
import { getPpcs6Assessment } from '@/lib/content';
import { Spacing } from '@/theme/tokens';

const ppcs6 = getPpcs6Assessment();

// PPCS-6, one item per screen (PRODUCT_SPEC §4 step 5 / CLINICAL_SPEC §2).
// Item wording is TODO(content) until sourced verbatim from Bőthe et al. (2020).
export default function Ppcs6Screen() {
  const answers = useOnboardingStore((s) => s.answers);
  const updateAnswers = useOnboardingStore((s) => s.updateAnswers);
  const itemIndex = answers.ppcs6ItemIndex;
  const item = ppcs6.items[itemIndex];

  function selectResponse(value: number) {
    const responses = [...answers.ppcs6Responses];
    responses[itemIndex] = value;

    if (itemIndex < ppcs6.items.length - 1) {
      updateAnswers({ ppcs6Responses: responses, ppcs6ItemIndex: itemIndex + 1 });
      return;
    }

    updateAnswers({ ppcs6Responses: responses });
    goNextFrom('ppcs6');
  }

  function handleBack() {
    if (itemIndex > 0) {
      updateAnswers({ ppcs6ItemIndex: itemIndex - 1 });
      return;
    }
    router.back();
  }

  return (
    <OnboardingLayout step="ppcs6" showBack={false}>
      <View style={styles.backRow}>
        {itemIndex > 0 ? (
          <ThemedText type="link" themeColor="accent" onPress={handleBack}>
            Back
          </ThemedText>
        ) : null}
      </View>
      <ThemedText type="small" themeColor="accent" style={styles.badge}>
        Validated clinical screening instrument · {ppcs6.citation}
      </ThemedText>
      {itemIndex === 0 ? (
        <>
          <ThemedText type="small" themeColor="textSecondary" style={styles.definition}>
            {ppcs6.definition}
          </ThemedText>
          <ThemedText type="default" style={styles.timeframe}>
            {ppcs6.timeframe_instruction}
          </ThemedText>
        </>
      ) : null}
      <ThemedText type="small" themeColor="textSecondary">
        Question {itemIndex + 1} of {ppcs6.items.length}
      </ThemedText>
      <ThemedText type="title" style={styles.prompt}>
        {item.text}
      </ThemedText>
      <View>
        {ppcs6.scale_labels.map((label, i) => (
          <ChoiceChip
            key={label}
            label={label}
            selected={answers.ppcs6Responses[itemIndex] === i + 1}
            onPress={() => selectResponse(i + 1)}
          />
        ))}
      </View>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  backRow: { height: 20, marginBottom: Spacing.one },
  badge: { marginBottom: Spacing.three, fontWeight: '600' },
  definition: { marginBottom: Spacing.three },
  timeframe: { fontWeight: '600' },
  prompt: { marginTop: Spacing.two, marginBottom: Spacing.four },
});
