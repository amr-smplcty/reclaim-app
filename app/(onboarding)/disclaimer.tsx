import { StyleSheet } from 'react-native';

import { PrimaryButton } from '@/components/primary-button';
import { ThemedText } from '@/components/themed-text';
import { OnboardingLayout } from '@/features/assessment/OnboardingLayout';
import { goNextFrom } from '@/features/assessment/navigation';
import { Spacing } from '@/theme/tokens';

// Wellness disclaimer interstitial (PRODUCT_SPEC §4 step 5) — exact text from
// LEGAL_COMPLIANCE §6, verbatim, pending attorney sign-off. Do not reword.
export default function DisclaimerScreen() {
  return (
    <OnboardingLayout step="disclaimer" contentStyle={styles.content}>
      <ThemedText type="title" style={styles.title}>
        A quick, important note.
      </ThemedText>
      <ThemedText type="default" themeColor="textSecondary">
        Reclaim is a self-guided educational program built on published
        research. It is not therapy, medical care, or a diagnosis, and it's
        not a substitute for a licensed professional. The questionnaire
        you're about to take is a research-validated screening tool — it
        shows where you stand, not a diagnosis. If you're ever in crisis,
        call or text 988 (US) or your local emergency number.
      </ThemedText>
      <PrimaryButton label="I understand" onPress={() => goNextFrom('disclaimer')} />
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  content: { justifyContent: 'center', gap: Spacing.four },
  title: { marginBottom: Spacing.two },
});
