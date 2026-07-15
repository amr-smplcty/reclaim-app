import { useState } from 'react';
import { ScrollView, StyleSheet, TextInput } from 'react-native';

import { PrimaryButton } from '@/components/primary-button';
import { ThemedText } from '@/components/themed-text';
import { guardFreeText } from '@/lib/safety/guard';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/theme/tokens';

interface Props {
  steps: string[];
  onSubmit: (output: { response: string }) => void;
}

// Sequential-worksheet fallback for any payload.kind this engine doesn't
// recognize yet (content/week1.json's notes_for_engineering) — future content
// keeps working even before the renderer catches up.
export function WorksheetFallback({ steps, onSubmit }: Props) {
  const theme = useTheme();
  const [response, setResponse] = useState('');

  function handleSubmit() {
    if (!guardFreeText(response)) return;
    onSubmit({ response });
  }

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
      {steps.map((step, index) => (
        <ThemedText key={step} type="default" style={styles.step}>
          {index + 1}. {step}
        </ThemedText>
      ))}
      <TextInput
        value={response}
        onChangeText={setResponse}
        placeholder="Your response"
        placeholderTextColor={theme.textSecondary}
        multiline
        style={[styles.input, { color: theme.textPrimary, borderColor: theme.border }]}
        accessibilityLabel="Your response"
      />
      <PrimaryButton label="Save" onPress={handleSubmit} disabled={response.trim().length === 0} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  container: { paddingBottom: Spacing.six },
  step: { marginBottom: Spacing.two },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 14,
    minHeight: 100,
    fontSize: 16,
    textAlignVertical: 'top',
    marginTop: Spacing.three,
    marginBottom: Spacing.four,
  },
});
