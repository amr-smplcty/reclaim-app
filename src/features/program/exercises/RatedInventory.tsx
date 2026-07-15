import { useState } from 'react';
import { ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { PrimaryButton } from '@/components/primary-button';
import { ThemedText } from '@/components/themed-text';
import { guardAllFreeText } from '@/lib/safety/guard';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/theme/tokens';
import type { RatedInventoryOutput, RatedInventoryPayload } from '@/types/program';
import { NumberScale } from '@/features/program/exercises/NumberScale';

interface Props {
  payload: RatedInventoryPayload;
  onSubmit: (output: RatedInventoryOutput) => void;
}

export function RatedInventory({ payload, onSubmit }: Props) {
  const theme = useTheme();
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});

  const allRated = payload.areas.every((area) => ratings[area] !== undefined);
  const areasNeedingNotes = payload.areas.filter((area) => (ratings[area] ?? -1) >= payload.note_threshold);
  const allNotesFilled = areasNeedingNotes.every((area) => (notes[area] ?? '').trim().length > 0);
  const canSubmit = allRated && allNotesFilled;

  function handleSubmit() {
    if (!guardAllFreeText(Object.values(notes))) return;
    onSubmit({ ratings, notes });
  }

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
      {payload.areas.map((area) => (
        <View key={area} style={styles.areaBlock}>
          <ThemedText type="default" style={styles.areaLabel}>
            {area}
          </ThemedText>
          <NumberScale
            min={0}
            max={payload.scale_max}
            value={ratings[area] ?? null}
            onChange={(value) => setRatings((prev) => ({ ...prev, [area]: value }))}
          />
          {(ratings[area] ?? -1) >= payload.note_threshold ? (
            <TextInput
              value={notes[area] ?? ''}
              onChangeText={(text) => setNotes((prev) => ({ ...prev, [area]: text }))}
              placeholder="What does that cost look like?"
              placeholderTextColor={theme.textSecondary}
              multiline
              style={[styles.input, { color: theme.textPrimary, borderColor: theme.border }]}
              accessibilityLabel={`Note for ${area}`}
            />
          ) : null}
        </View>
      ))}
      <PrimaryButton label="Save" onPress={handleSubmit} disabled={!canSubmit} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  container: { paddingBottom: Spacing.six },
  areaBlock: { marginBottom: Spacing.four },
  areaLabel: { marginBottom: Spacing.two },
  input: { borderWidth: 1, borderRadius: 10, padding: 12, minHeight: 60, fontSize: 16, textAlignVertical: 'top', marginTop: Spacing.two },
});
