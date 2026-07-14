import { useState } from 'react';
import { ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { PrimaryButton } from '@/components/primary-button';
import { ThemedText } from '@/components/themed-text';
import { guardAllFreeText } from '@/lib/safety/guard';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';
import type { DualSliderWriteOutput, DualSliderWritePayload } from '@/types/program';
import { NumberScale } from '@/features/program/exercises/NumberScale';

interface Props {
  payload: DualSliderWritePayload;
  onSubmit: (output: DualSliderWriteOutput) => void;
}

export function DualSliderWrite({ payload, onSubmit }: Props) {
  const theme = useTheme();
  const [sliderValues, setSliderValues] = useState<Record<string, number>>({});
  const [writes, setWrites] = useState<string[]>(payload.write_prompts.map(() => ''));

  const allSlidersSet = payload.sliders.every((s) => sliderValues[s.label] !== undefined);
  const allWritesFilled = writes.every((w) => w.trim().length > 0);
  const canSubmit = allSlidersSet && allWritesFilled;

  function setWriteAt(index: number, text: string) {
    setWrites((prev) => prev.map((w, i) => (i === index ? text : w)));
  }

  function handleSubmit() {
    if (!guardAllFreeText(writes)) return;
    onSubmit({ sliders: sliderValues, writes });
  }

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
      {payload.sliders.map((slider) => (
        <View key={slider.label} style={styles.sliderBlock}>
          <ThemedText type="default" style={styles.sliderLabel}>
            {slider.label}
          </ThemedText>
          <NumberScale
            min={slider.min}
            max={slider.max}
            value={sliderValues[slider.label] ?? null}
            onChange={(value) => setSliderValues((prev) => ({ ...prev, [slider.label]: value }))}
          />
        </View>
      ))}

      {payload.write_prompts.map((prompt, index) => (
        <View key={prompt} style={styles.writeBlock}>
          <ThemedText type="subtitle" style={styles.prompt}>
            {prompt}
          </ThemedText>
          <TextInput
            value={writes[index]}
            onChangeText={(text) => setWriteAt(index, text)}
            placeholder="Write your answer"
            placeholderTextColor={theme.textSecondary}
            multiline
            style={[styles.input, { color: theme.text, borderColor: theme.border }]}
            accessibilityLabel={prompt}
          />
        </View>
      ))}

      <PrimaryButton label="Save" onPress={handleSubmit} disabled={!canSubmit} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  container: { paddingBottom: Spacing.six },
  sliderBlock: { marginBottom: Spacing.four },
  sliderLabel: { marginBottom: Spacing.two },
  writeBlock: { marginBottom: Spacing.four },
  prompt: { marginBottom: Spacing.two },
  input: { borderWidth: 1, borderRadius: 10, padding: 14, minHeight: 80, fontSize: 16, textAlignVertical: 'top' },
});
