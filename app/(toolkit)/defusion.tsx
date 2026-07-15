import { useState } from 'react';
import { StyleSheet, TextInput } from 'react-native';
import { router } from 'expo-router';

import { CompletionBadge } from '@/components/completion-badge';
import { PrimaryButton } from '@/components/primary-button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { guardFreeText } from '@/lib/safety/guard';
import { PostToolRating } from '@/features/toolkit/PostToolRating';
import { useToolkitStore } from '@/features/toolkit/useToolkitStore';
import { describeDelta } from '@/features/toolkit/suggestion';
import { trackUrgeToolUsed } from '@/lib/analytics/events';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/theme/tokens';

type Step = 'input' | 'reframe1' | 'reframe2' | 'closing' | 'rate';

// ACT defusion drill (CLINICAL_SPEC §5.3) — reframe copy is verbatim.
export default function DefusionScreen() {
  const theme = useTheme();
  const activeSession = useToolkitStore((s) => s.activeSession);
  const logToolUse = useToolkitStore((s) => s.logToolUse);
  const clearSession = useToolkitStore((s) => s.clearSession);

  const [thought, setThought] = useState('');
  const [step, setStep] = useState<Step>('input');
  const [result, setResult] = useState<{ pre: number; post: number } | null>(null);

  function handleThoughtSubmit() {
    if (!guardFreeText(thought)) return;
    setStep('reframe1');
  }

  function handleRate(postIntensity: number) {
    const preIntensity = activeSession?.preIntensity ?? postIntensity;
    logToolUse('defusion', preIntensity, postIntensity);
    trackUrgeToolUsed('defusion', preIntensity, postIntensity - preIntensity);
    clearSession();
    setResult({ pre: preIntensity, post: postIntensity });
  }

  if (result) {
    return (
      <ThemedView style={styles.completeContainer}>
        <CompletionBadge label={`The urge is ${describeDelta(result.pre, result.post)}.`} />
        <PrimaryButton label="Done" onPress={() => router.back()} />
      </ThemedView>
    );
  }

  if (step === 'rate') {
    return (
      <ThemedView style={styles.container}>
        <PostToolRating onSubmit={handleRate} />
      </ThemedView>
    );
  }

  if (step === 'input') {
    return (
      <ThemedView style={styles.container}>
        <ThemedText type="title" style={styles.title}>
          What's the thought?
        </ThemedText>
        <TextInput
          value={thought}
          onChangeText={setThought}
          placeholder="Type the thought as it came to you"
          placeholderTextColor={theme.textSecondary}
          multiline
          style={[styles.input, { color: theme.textPrimary, borderColor: theme.border }]}
          accessibilityLabel="The thought"
        />
        <PrimaryButton label="Next" onPress={handleThoughtSubmit} disabled={thought.trim().length === 0} />
      </ThemedView>
    );
  }

  if (step === 'reframe1') {
    return (
      <ThemedView style={styles.container}>
        <ThemedText type="subtitle" style={styles.centered}>
          You are having the thought that:
        </ThemedText>
        <ThemedText type="title" style={styles.centered}>
          {thought}
        </ThemedText>
        <PrimaryButton label="Next" onPress={() => setStep('reframe2')} />
      </ThemedView>
    );
  }

  if (step === 'reframe2') {
    return (
      <ThemedView style={styles.container}>
        <ThemedText type="subtitle" style={styles.centered}>
          You are noticing that you're having the thought that:
        </ThemedText>
        <ThemedText type="title" style={styles.centered}>
          {thought}
        </ThemedText>
        <PrimaryButton label="Next" onPress={() => setStep('closing')} />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.centered}>
        Carry it with you and do the next right thing anyway.
      </ThemedText>
      <PrimaryButton label="Continue" onPress={() => setStep('rate')} />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: Spacing.four, alignItems: 'center', justifyContent: 'center', gap: Spacing.five },
  title: { marginBottom: Spacing.two },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 14,
    minHeight: 100,
    fontSize: 16,
    textAlignVertical: 'top',
    width: '100%',
  },
  centered: { textAlign: 'center' },
  completeContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: Spacing.five, padding: Spacing.four },
});
