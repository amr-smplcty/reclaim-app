import { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { router } from 'expo-router';

import { PrimaryButton } from '@/components/primary-button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/use-theme';
import { useCommitmentGoalsStore } from '@/features/progress/useCommitmentGoalsStore';
import { Spacing } from '@/theme/tokens';

// Commitment Goals opt-in setup (CLINICAL_SPEC §9 rule 1: opt-in only,
// never part of the default program). "This is you paying yourself" framing
// — saving toward something you want, never fines/punishment language.
export default function CommitmentGoalsSetupScreen() {
  const theme = useTheme();
  const optIn = useCommitmentGoalsStore((s) => s.optIn);

  const [rewardName, setRewardName] = useState('');
  const [pledgeText, setPledgeText] = useState('');

  const pledgeAmount = Number(pledgeText);
  const canSubmit = rewardName.trim().length > 0 && pledgeText.trim().length > 0 && pledgeAmount > 0;

  function handleStart() {
    optIn(rewardName.trim(), pledgeAmount);
    router.back();
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>
        Start a Commitment Goal
      </ThemedText>
      <ThemedText type="default" themeColor="textSecondary" style={styles.subtitle}>
        This is you paying yourself. Name something you want, pledge a
        little toward it each day you show up, and watch it add up.
      </ThemedText>

      <ThemedText type="subtitle" style={styles.label}>
        What are you saving toward?
      </ThemedText>
      <TextInput
        value={rewardName}
        onChangeText={setRewardName}
        placeholder="e.g. a weekend trip, new shoes"
        placeholderTextColor={theme.textSecondary}
        style={[styles.input, { color: theme.textPrimary, borderColor: theme.border }]}
        accessibilityLabel="What you're saving toward"
      />

      <ThemedText type="subtitle" style={styles.label}>
        How much per day you show up?
      </ThemedText>
      <TextInput
        value={pledgeText}
        onChangeText={setPledgeText}
        placeholder="e.g. 5"
        placeholderTextColor={theme.textSecondary}
        keyboardType="decimal-pad"
        style={[styles.input, { color: theme.textPrimary, borderColor: theme.border }]}
        accessibilityLabel="Daily pledge amount"
      />

      <View style={styles.footer}>
        <PrimaryButton label="Start my goal" onPress={handleStart} disabled={!canSubmit} />
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: Spacing.four },
  title: { marginBottom: Spacing.two },
  subtitle: { marginBottom: Spacing.five },
  label: { marginBottom: Spacing.two },
  input: { borderWidth: 1, borderRadius: 10, padding: 12, fontSize: 16, marginBottom: Spacing.four },
  footer: { flex: 1, justifyContent: 'flex-end' },
});
