import { useState } from 'react';
import { ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { router } from 'expo-router';

import { ChoiceChip } from '@/components/choice-chip';
import { PrimaryButton } from '@/components/primary-button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { guardAllFreeText } from '@/lib/safety/guard';
import { NumberScale } from '@/features/program/exercises/NumberScale';
import { useToolkitStore, type Trigger } from '@/features/toolkit/useToolkitStore';
import { trackUrgeLogged } from '@/lib/analytics/events';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';

const TRIGGERS: Array<{ id: Trigger; label: string }> = [
  { id: 'stress', label: 'Stress' },
  { id: 'boredom', label: 'Boredom' },
  { id: 'loneliness', label: 'Loneliness' },
  { id: 'late_night', label: 'Late night' },
  { id: 'saw_trigger', label: 'Saw a trigger' },
  { id: 'other', label: 'Other' },
];

// Log the urge (PRODUCT_SPEC §5.3) — 30-second structured log.
export default function LogUrgeScreen() {
  const theme = useTheme();
  const logUrge = useToolkitStore((s) => s.logUrge);

  const [intensity, setIntensity] = useState<number | null>(null);
  const [trigger, setTrigger] = useState<Trigger | null>(null);
  const [location, setLocation] = useState('');
  const [whatHappenedNext, setWhatHappenedNext] = useState('');
  const [saved, setSaved] = useState(false);

  const canSubmit = intensity !== null && trigger !== null;

  function handleSubmit() {
    if (!guardAllFreeText([location, whatHappenedNext])) return;
    logUrge({ intensity: intensity as number, trigger: trigger as Trigger, location, whatHappenedNext });
    trackUrgeLogged(trigger as Trigger, intensity as number);
    setSaved(true);
  }

  if (saved) {
    return (
      <ThemedView style={styles.completeContainer}>
        <ThemedText type="title">Logged.</ThemedText>
        <ThemedText type="default" themeColor="textSecondary" style={styles.centered}>
          This feeds your Progress patterns over time.
        </ThemedText>
        <PrimaryButton label="Done" onPress={() => router.back()} />
      </ThemedView>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <ThemedText type="title" style={styles.title}>
        Log the urge
      </ThemedText>

      <ThemedText type="subtitle" style={styles.prompt}>
        Intensity
      </ThemedText>
      <NumberScale min={1} max={10} value={intensity} onChange={setIntensity} />

      <ThemedText type="subtitle" style={styles.prompt}>
        What triggered it?
      </ThemedText>
      <View>
        {TRIGGERS.map((t) => (
          <ChoiceChip key={t.id} label={t.label} selected={trigger === t.id} onPress={() => setTrigger(t.id)} />
        ))}
      </View>

      <ThemedText type="subtitle" style={styles.prompt}>
        Where were you?
      </ThemedText>
      <TextInput
        value={location}
        onChangeText={setLocation}
        placeholder="e.g. bedroom, at work"
        placeholderTextColor={theme.textSecondary}
        style={[styles.input, { color: theme.text, borderColor: theme.border }]}
        accessibilityLabel="Location"
      />

      <ThemedText type="subtitle" style={styles.prompt}>
        What happened next?
      </ThemedText>
      <TextInput
        value={whatHappenedNext}
        onChangeText={setWhatHappenedNext}
        placeholder="What did you do?"
        placeholderTextColor={theme.textSecondary}
        multiline
        style={[styles.input, styles.multiline, { color: theme.text, borderColor: theme.border }]}
        accessibilityLabel="What happened next"
      />

      <PrimaryButton label="Save" onPress={handleSubmit} disabled={!canSubmit} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: Spacing.four, paddingBottom: Spacing.six },
  title: { marginBottom: Spacing.four },
  prompt: { marginTop: Spacing.three, marginBottom: Spacing.two },
  input: { borderWidth: 1, borderRadius: 10, padding: 12, fontSize: 16, marginBottom: Spacing.two },
  multiline: { minHeight: 80, textAlignVertical: 'top' },
  completeContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: Spacing.four, padding: Spacing.four },
  centered: { textAlign: 'center' },
});
