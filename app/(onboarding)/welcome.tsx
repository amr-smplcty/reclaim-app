import { StyleSheet } from 'react-native';

import { PrimaryButton } from '@/components/primary-button';
import { ThemedText } from '@/components/themed-text';
import { OnboardingLayout } from '@/features/assessment/OnboardingLayout';
import { goNextFrom } from '@/features/assessment/navigation';
import { Spacing } from '@/theme/tokens';

export default function WelcomeScreen() {
  return (
    <OnboardingLayout step="welcome" showBack={false} contentStyle={styles.content}>
      <ThemedText type="title" style={styles.title}>
        A science-based program to take back control.
      </ThemedText>
      <ThemedText type="default" themeColor="textSecondary" style={styles.contract}>
        3 minutes. 14 questions — 6 from a validated screening instrument. You
        get your score, what it means, and a plan built on your answers.
      </ThemedText>
      <PrimaryButton label="Start assessment" onPress={() => goNextFrom('welcome')} />
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  content: { justifyContent: 'flex-end', gap: Spacing.five },
  title: { marginBottom: Spacing.two },
  contract: { marginBottom: Spacing.four },
});
