import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';

import { PrimaryButton } from '@/components/primary-button';
import { ThemedText } from '@/components/themed-text';
import { DateOfBirthField } from '@/components/date-of-birth-field';
import { OnboardingLayout } from '@/features/assessment/OnboardingLayout';
import { goNextFrom } from '@/features/assessment/navigation';
import { useOnboardingStore } from '@/features/assessment/useOnboardingStore';
import { calculateAge, isMinor } from '@/features/assessment/scoring';
import { Spacing } from '@/theme/tokens';

// Age gate (PRODUCT_SPEC §4 step 2 / CLINICAL_SPEC §6 minor detection) — under-18
// exits to resources and never enters the program in v1. Input method is a
// native date picker (with manual DD/MM/YYYY fallback in the field component,
// INC-2); the age-gate DECISION logic below is unchanged from the text-field
// version (BACKLOG #17).
export default function AgeScreen() {
  const updateAnswers = useOnboardingStore((s) => s.updateAnswers);
  const setIsMinor = useOnboardingStore((s) => s.setIsMinor);

  const [dob, setDob] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = dob !== null;

  function handleNext() {
    if (!dob || dob > new Date()) {
      setError('Enter a valid date of birth.');
      return;
    }
    setError(null);

    const age = calculateAge(dob, new Date());
    const minor = isMinor(age);
    updateAnswers({ dobIso: dob.toISOString() });
    setIsMinor(minor);

    if (minor) {
      router.replace('/(onboarding)/resources');
      return;
    }
    goNextFrom('age');
  }

  return (
    <OnboardingLayout step="age">
      <ThemedText type="title" style={styles.title}>
        When were you born?
      </ThemedText>
      <ThemedText type="default" themeColor="textSecondary" style={styles.subtitle}>
        This app is intended for adults 18 and older.
      </ThemedText>
      <DateOfBirthField value={dob} onChange={setDob} />
      {error ? (
        <ThemedText type="small" themeColor="accent" style={styles.error}>
          {error}
        </ThemedText>
      ) : null}
      <View style={styles.spacer} />
      <PrimaryButton label="Next" onPress={handleNext} disabled={!canSubmit} />
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  title: { marginBottom: Spacing.two },
  subtitle: { marginBottom: Spacing.five },
  error: { marginTop: Spacing.two },
  spacer: { flex: 1 },
});
