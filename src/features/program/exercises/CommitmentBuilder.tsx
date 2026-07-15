import { useState } from 'react';
import { ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { PrimaryButton } from '@/components/primary-button';
import { ThemedText } from '@/components/themed-text';
import { guardFreeText } from '@/lib/safety/guard';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/theme/tokens';
import { resolveCommitmentTemplate } from '@/features/program/exerciseHelpers';
import type { CommitmentBuilderOutput, CommitmentBuilderPayload } from '@/types/program';

interface Props {
  payload: CommitmentBuilderPayload;
  outputs: Record<string, unknown>;
  lapseLetter: string | undefined;
  onSubmit: (output: CommitmentBuilderOutput) => void;
}

function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

// Renders any commitment_builder payload — Week 1 Day 7's signed commitment
// and Week 3 Day 7's unsigned, word-capped urge_script both go through the
// same generic template resolution (exerciseHelpers.resolveCommitmentTemplate).
export function CommitmentBuilder({ payload, outputs, lapseLetter, onSubmit }: Props) {
  const theme = useTheme();
  const assembled = resolveCommitmentTemplate(payload, outputs);

  const [statement, setStatement] = useState(assembled);
  const [signature, setSignature] = useState('');

  const needsSignature = payload.signature_required;
  const words = wordCount(statement);
  const overWordLimit = payload.max_words !== undefined && words > payload.max_words;
  const canSubmit = statement.trim().length > 0 && (!needsSignature || signature.trim().length > 0) && !overWordLimit;

  function handleSubmit() {
    if (!guardFreeText(statement)) return;
    onSubmit({ statement, signature, signed_at: new Date().toISOString() });
  }

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
      <ThemedText type="small" themeColor="textSecondary" style={styles.hint}>
        Edit anything that doesn't sound like you.
      </ThemedText>
      <TextInput
        value={statement}
        onChangeText={setStatement}
        multiline
        style={[styles.statementInput, { color: theme.textPrimary, borderColor: theme.border }]}
        accessibilityLabel="Your commitment statement"
      />
      {payload.max_words !== undefined ? (
        <ThemedText
          type="small"
          themeColor={overWordLimit ? 'danger' : 'textSecondary'}
          style={styles.wordCount}
        >
          {words} / {payload.max_words} words
        </ThemedText>
      ) : null}

      {lapseLetter ? (
        <View style={[styles.referenceBlock, { borderColor: theme.border }]}>
          <ThemedText type="small" themeColor="textSecondary" style={styles.referenceLabel}>
            Your letter to yourself, from Day 6:
          </ThemedText>
          <ThemedText type="default" themeColor="textSecondary">
            {lapseLetter}
          </ThemedText>
        </View>
      ) : null}

      {needsSignature ? (
        <>
          <ThemedText type="subtitle" style={styles.signaturePrompt}>
            Sign your name
          </ThemedText>
          <TextInput
            value={signature}
            onChangeText={setSignature}
            placeholder="Your name"
            placeholderTextColor={theme.textSecondary}
            style={[styles.signatureInput, { color: theme.textPrimary, borderColor: theme.border }]}
            accessibilityLabel="Signature"
          />
        </>
      ) : null}

      <PrimaryButton label={needsSignature ? 'Sign & save' : 'Save'} onPress={handleSubmit} disabled={!canSubmit} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  container: { paddingBottom: Spacing.six },
  hint: { marginBottom: Spacing.two },
  statementInput: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 14,
    minHeight: 160,
    fontSize: 16,
    textAlignVertical: 'top',
    marginBottom: Spacing.two,
  },
  wordCount: { marginBottom: Spacing.four, textAlign: 'right' },
  referenceBlock: { borderWidth: 1, borderRadius: 10, padding: Spacing.three, marginBottom: Spacing.four, gap: Spacing.one },
  referenceLabel: { fontWeight: '600' },
  signaturePrompt: { marginBottom: Spacing.two },
  signatureInput: { borderWidth: 1, borderRadius: 10, padding: 14, fontSize: 16, marginBottom: Spacing.four },
});
