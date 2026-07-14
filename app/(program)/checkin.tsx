import { useMemo, useState } from 'react';
import { StyleSheet, TextInput } from 'react-native';
import { router } from 'expo-router';

import { CompletionBadge } from '@/components/completion-badge';
import { PrimaryButton } from '@/components/primary-button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { getAllCheckinPrompts } from '@/lib/content/week';
import { guardFreeText } from '@/lib/safety/guard';
import { useProgramStore } from '@/features/program/useProgramStore';
import { dayKey } from '@/features/program/progression';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';

// Evening check-in prompt (PRODUCT_SPEC §5.1c) — a single rotating question.
// The full mood/urge-count check-in form lives in Journal (Epic 6); this is
// just Today's lightweight entry point.
export default function CheckinScreen() {
  const theme = useTheme();
  const position = useProgramStore((s) => s.position);
  const completions = useProgramStore((s) => s.completions);
  const completeCheckin = useProgramStore((s) => s.completeCheckin);

  const [response, setResponse] = useState('');
  const [justCompleted, setJustCompleted] = useState(false);

  const prompt = useMemo(() => {
    const prompts = getAllCheckinPrompts();
    const globalDayIndex = (position.week - 1) * 7 + (position.day - 1);
    return prompts[globalDayIndex % prompts.length];
  }, [position]);

  const alreadyComplete = completions[dayKey(position)]?.checkinComplete ?? false;

  function handleSubmit() {
    if (!guardFreeText(response)) return;
    completeCheckin(position.week, position.day, response);
    setJustCompleted(true);
  }

  if (justCompleted || alreadyComplete) {
    return (
      <ThemedView style={styles.completeContainer}>
        <CompletionBadge label="Check-in saved." />
        <PrimaryButton label="Back to Today" onPress={() => router.back()} />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.prompt}>
        {prompt}
      </ThemedText>
      <TextInput
        value={response}
        onChangeText={setResponse}
        placeholder="Write as much or as little as you want"
        placeholderTextColor={theme.textSecondary}
        multiline
        style={[styles.input, { color: theme.text, borderColor: theme.border }]}
        accessibilityLabel={prompt}
      />
      <PrimaryButton label="Save" onPress={handleSubmit} disabled={response.trim().length === 0} />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: Spacing.four },
  prompt: { marginBottom: Spacing.four },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 14,
    minHeight: 140,
    fontSize: 16,
    textAlignVertical: 'top',
    marginBottom: Spacing.four,
  },
  completeContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: Spacing.five, padding: Spacing.four },
});
