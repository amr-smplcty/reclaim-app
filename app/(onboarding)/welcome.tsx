import { StyleSheet } from 'react-native';

import { PrimaryButton } from '@/components/primary-button';
import { ThemedText } from '@/components/themed-text';
import { OnboardingLayout } from '@/features/assessment/OnboardingLayout';
import { goNextFrom } from '@/features/assessment/navigation';
import { Spacing } from '@/constants/theme';

export default function WelcomeScreen() {
  return (
    <OnboardingLayout step="welcome" contentStyle={styles.content}>
      <ThemedText type="title" style={styles.title}>
        A science-based program to take back control.
      </ThemedText>
      <PrimaryButton label="Start assessment" onPress={() => goNextFrom('welcome')} />
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  content: { justifyContent: 'flex-end', gap: Spacing.five },
  title: { marginBottom: Spacing.four },
});
