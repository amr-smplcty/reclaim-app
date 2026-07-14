import { useState } from 'react';
import { ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { PrimaryButton } from '@/components/primary-button';
import { ThemedText } from '@/components/themed-text';
import { guardFreeText } from '@/lib/safety/guard';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';
import { buildAnchorWhySummary } from '@/features/program/exerciseHelpers';
import type { CommitmentBuilderOutput, CommitmentBuilderPayload, MultiSelectWriteOutput } from '@/types/program';

interface Props {
  payload: CommitmentBuilderPayload;
  anchorWhy: MultiSelectWriteOutput | undefined;
  emergencyCardLine: string | undefined;
  lapseLetter: string | undefined;
  onSubmit: (output: CommitmentBuilderOutput) => void;
}

export function CommitmentBuilder({ payload, anchorWhy, emergencyCardLine, lapseLetter, onSubmit }: Props) {
  const theme = useTheme();
  const assembled = payload.template
    .replace('{anchor_why_summary}', buildAnchorWhySummary(anchorWhy))
    .replace('{emergency_card_line}', emergencyCardLine || 'what this program can give me back');

  const [statement, setStatement] = useState(assembled);
  const [signature, setSignature] = useState('');

  const needsSignature = payload.signature_required;
  const canSubmit = statement.trim().length > 0 && (!needsSignature || signature.trim().length > 0);

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
        style={[styles.statementInput, { color: theme.text, borderColor: theme.border }]}
        accessibilityLabel="Your commitment statement"
      />

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
            style={[styles.signatureInput, { color: theme.text, borderColor: theme.border }]}
            accessibilityLabel="Signature"
          />
        </>
      ) : null}

      <PrimaryButton label="Sign & save" onPress={handleSubmit} disabled={!canSubmit} />
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
    marginBottom: Spacing.four,
  },
  referenceBlock: { borderWidth: 1, borderRadius: 10, padding: Spacing.three, marginBottom: Spacing.four, gap: Spacing.one },
  referenceLabel: { fontWeight: '600' },
  signaturePrompt: { marginBottom: Spacing.two },
  signatureInput: { borderWidth: 1, borderRadius: 10, padding: 14, fontSize: 16, marginBottom: Spacing.four },
});
