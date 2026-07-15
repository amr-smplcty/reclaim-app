import { ScrollView, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';

import { ChoiceChip } from '@/components/choice-chip';
import { PrimaryButton } from '@/components/primary-button';
import { ThemedText } from '@/components/themed-text';
import { OnboardingLayout } from '@/features/assessment/OnboardingLayout';
import { goNextFrom } from '@/features/assessment/navigation';
import { useOnboardingStore } from '@/features/assessment/useOnboardingStore';
import { getContentPack } from '@/lib/content';
import { isMoodElevated, scoreGad2, scorePhq2 } from '@/features/assessment/scoring';
import { Spacing } from '@/theme/tokens';

const { phq2, gad2, mood_stem: moodStem } = getContentPack().assessments;

interface ScreenerBlockProps {
  items: string[];
  scaleLabels: string[];
  responses: Array<number | null>;
  onSelect: (itemIndex: number, value: number) => void;
}

function ScreenerBlock({ items, scaleLabels, responses, onSelect }: ScreenerBlockProps) {
  return (
    <>
      {items.map((text, itemIndex) => (
        <View key={itemIndex} style={styles.block}>
          <ThemedText type="default" style={styles.prompt}>
            {text}
          </ThemedText>
          <View style={styles.optionsRow}>
            {scaleLabels.map((label, value) => (
              <ChoiceChip
                key={label}
                label={label}
                selected={responses[itemIndex] === value}
                onPress={() => onSelect(itemIndex, value)}
              />
            ))}
          </View>
        </View>
      ))}
    </>
  );
}

// PHQ-2 + GAD-2, one combined screen (PRODUCT_SPEC §4 step 6). If either scores
// ≥3, route through the supportive interstitial before results (CLINICAL_SPEC §3).
export default function MoodScreen() {
  const answers = useOnboardingStore((s) => s.answers);
  const updateAnswers = useOnboardingStore((s) => s.updateAnswers);

  const allAnswered =
    answers.phq2Responses.every((r) => r !== null) && answers.gad2Responses.every((r) => r !== null);

  function handleNext() {
    const phq2Score = scorePhq2(answers.phq2Responses as number[]);
    const gad2Score = scoreGad2(answers.gad2Responses as number[]);

    if (isMoodElevated(phq2Score, gad2Score)) {
      router.push('/(onboarding)/mood-interstitial');
      return;
    }
    goNextFrom('mood');
  }

  return (
    <OnboardingLayout step="mood">
      <ScrollView showsVerticalScrollIndicator={false}>
        <ThemedText type="title" style={styles.title}>
          {moodStem}
        </ThemedText>
        <ScreenerBlock
          items={phq2.items}
          scaleLabels={phq2.scale_labels}
          responses={answers.phq2Responses}
          onSelect={(i, v) => {
            const responses = [...answers.phq2Responses];
            responses[i] = v;
            updateAnswers({ phq2Responses: responses });
          }}
        />
        <ScreenerBlock
          items={gad2.items}
          scaleLabels={gad2.scale_labels}
          responses={answers.gad2Responses}
          onSelect={(i, v) => {
            const responses = [...answers.gad2Responses];
            responses[i] = v;
            updateAnswers({ gad2Responses: responses });
          }}
        />
      </ScrollView>
      <View style={styles.footer}>
        <PrimaryButton label="Next" onPress={handleNext} disabled={!allAnswered} />
      </View>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  title: { marginBottom: Spacing.four },
  block: { marginBottom: Spacing.four },
  prompt: { marginBottom: Spacing.two },
  optionsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.one },
  footer: { paddingTop: Spacing.three },
});
