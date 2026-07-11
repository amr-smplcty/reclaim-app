import { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { router } from 'expo-router';

import { PrimaryButton } from '@/components/primary-button';
import { ThemedText } from '@/components/themed-text';
import { OnboardingLayout } from '@/features/assessment/OnboardingLayout';
import { goNextFrom } from '@/features/assessment/navigation';
import { useOnboardingStore } from '@/features/assessment/useOnboardingStore';
import { calculateAge, isMinor } from '@/features/assessment/scoring';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';

// Age gate (PRODUCT_SPEC §4 step 2 / CLINICAL_SPEC §6 minor detection) — under-18
// exits to resources and never enters the program in v1.
export default function AgeScreen() {
  const theme = useTheme();
  const updateAnswers = useOnboardingStore((s) => s.updateAnswers);
  const setIsMinor = useOnboardingStore((s) => s.setIsMinor);

  const [day, setDay] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const [error, setError] = useState<string | null>(null);

  const canSubmit = day.length > 0 && month.length > 0 && year.length === 4;

  function handleNext() {
    const dob = new Date(Number(year), Number(month) - 1, Number(day));
    const validDayOfMonth = dob.getDate() === Number(day) && dob.getMonth() === Number(month) - 1;
    if (Number.isNaN(dob.getTime()) || !validDayOfMonth || dob > new Date()) {
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
      <View style={styles.row}>
        <TextInput
          value={day}
          onChangeText={setDay}
          placeholder="DD"
          placeholderTextColor={theme.textSecondary}
          keyboardType="number-pad"
          maxLength={2}
          style={[styles.input, { color: theme.text, borderColor: theme.border }]}
          accessibilityLabel="Day of birth"
        />
        <TextInput
          value={month}
          onChangeText={setMonth}
          placeholder="MM"
          placeholderTextColor={theme.textSecondary}
          keyboardType="number-pad"
          maxLength={2}
          style={[styles.input, { color: theme.text, borderColor: theme.border }]}
          accessibilityLabel="Month of birth"
        />
        <TextInput
          value={year}
          onChangeText={setYear}
          placeholder="YYYY"
          placeholderTextColor={theme.textSecondary}
          keyboardType="number-pad"
          maxLength={4}
          style={[styles.input, styles.yearInput, { color: theme.text, borderColor: theme.border }]}
          accessibilityLabel="Year of birth"
        />
      </View>
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
  row: { flexDirection: 'row', gap: Spacing.two },
  input: { borderWidth: 1, borderRadius: 10, paddingVertical: 12, paddingHorizontal: 14, width: 64, fontSize: 16 },
  yearInput: { width: 90 },
  error: { marginTop: Spacing.two },
  spacer: { flex: 1 },
});
