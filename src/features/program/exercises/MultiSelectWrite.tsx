import { useState } from 'react';
import { ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { ChoiceChip } from '@/components/choice-chip';
import { PrimaryButton } from '@/components/primary-button';
import { ThemedText } from '@/components/themed-text';
import { guardFreeText } from '@/lib/safety/guard';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/theme/tokens';
import type { MultiSelectWriteOutput, MultiSelectWritePayload } from '@/types/program';

interface Props {
  payload: MultiSelectWritePayload;
  onSubmit: (output: MultiSelectWriteOutput) => void;
}

export function MultiSelectWrite({ payload, onSubmit }: Props) {
  const theme = useTheme();
  const [selected, setSelected] = useState<string[]>([]);
  const [write, setWrite] = useState('');

  function toggle(option: string) {
    setSelected((prev) => {
      if (prev.includes(option)) return prev.filter((o) => o !== option);
      if (prev.length >= payload.select_count) return prev;
      return [...prev, option];
    });
  }

  const canSubmit = selected.length === payload.select_count && write.trim().length > 0;

  function handleSubmit() {
    if (!guardFreeText(write)) return;
    onSubmit({ selected, write });
  }

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
      <ThemedText type="small" themeColor="textSecondary" style={styles.hint}>
        Pick exactly {payload.select_count}
      </ThemedText>
      <View>
        {payload.select_options.map((option) => (
          <ChoiceChip key={option} label={option} selected={selected.includes(option)} onPress={() => toggle(option)} />
        ))}
      </View>

      <ThemedText type="subtitle" style={styles.prompt}>
        {payload.write_prompt}
      </ThemedText>
      <TextInput
        value={write}
        onChangeText={setWrite}
        placeholder="Write your answer"
        placeholderTextColor={theme.textSecondary}
        multiline
        style={[styles.input, { color: theme.textPrimary, borderColor: theme.border }]}
        accessibilityLabel={payload.write_prompt}
      />

      <PrimaryButton label="Save" onPress={handleSubmit} disabled={!canSubmit} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  container: { paddingBottom: Spacing.six },
  hint: { marginBottom: Spacing.two },
  prompt: { marginTop: Spacing.four, marginBottom: Spacing.two },
  input: { borderWidth: 1, borderRadius: 10, padding: 14, minHeight: 90, fontSize: 16, textAlignVertical: 'top', marginBottom: Spacing.four },
});
