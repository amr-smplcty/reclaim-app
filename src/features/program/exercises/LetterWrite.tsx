import { useState } from 'react';
import { ScrollView, StyleSheet, TextInput } from 'react-native';

import { PrimaryButton } from '@/components/primary-button';
import { ThemedText } from '@/components/themed-text';
import { guardFreeText } from '@/lib/safety/guard';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/theme/tokens';
import type { LetterWriteOutput, LetterWritePayload } from '@/types/program';

interface Props {
  payload: LetterWritePayload;
  onSubmit: (output: LetterWriteOutput) => void;
}

export function LetterWrite({ payload, onSubmit }: Props) {
  const theme = useTheme();
  const [text, setText] = useState('');

  const canSubmit = text.trim().length >= payload.min_chars;

  function handleSubmit() {
    if (!guardFreeText(text)) return;
    onSubmit(text);
  }

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
      <ThemedText type="subtitle" style={styles.prompt}>
        {payload.prompt}
      </ThemedText>
      <TextInput
        value={text}
        onChangeText={setText}
        placeholder="Write your letter"
        placeholderTextColor={theme.textSecondary}
        multiline
        style={[styles.input, { color: theme.textPrimary, borderColor: theme.border }]}
        accessibilityLabel={payload.prompt}
      />
      <ThemedText type="small" themeColor="textSecondary" style={styles.counter}>
        {text.trim().length} / {payload.min_chars} characters minimum
      </ThemedText>
      <PrimaryButton label="Save" onPress={handleSubmit} disabled={!canSubmit} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  container: { paddingBottom: Spacing.six },
  prompt: { marginBottom: Spacing.two },
  input: { borderWidth: 1, borderRadius: 10, padding: 14, minHeight: 160, fontSize: 16, textAlignVertical: 'top' },
  counter: { marginTop: Spacing.two, marginBottom: Spacing.four },
});
