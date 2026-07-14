import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { router } from 'expo-router';

import { ChoiceChip } from '@/components/choice-chip';
import { CompletionBadge } from '@/components/completion-badge';
import { PrimaryButton } from '@/components/primary-button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { getAllCheckinPrompts } from '@/lib/content/week';
import { NumberScale } from '@/features/program/exercises/NumberScale';
import { buildCheckinEntry } from '@/features/journal/checkinSubmission';
import { useJournalStore } from '@/features/journal/useJournalStore';
import { useProgramStore } from '@/features/program/useProgramStore';
import { dayKey } from '@/features/program/progression';
import { trackCheckinCompleted } from '@/lib/analytics/events';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';

// Full evening check-in (PRODUCT_SPEC §5.4): mood (5-point), urges today
// (y/n + count), one rotating free-text prompt. Replaces the Epic 4
// lightweight version (BACKLOG #11) — this is the only check-in system now.
export default function CheckinScreen() {
  const theme = useTheme();
  const position = useProgramStore((s) => s.position);
  const completions = useProgramStore((s) => s.completions);
  const completeCheckin = useProgramStore((s) => s.completeCheckin);
  const addCheckin = useJournalStore((s) => s.addCheckin);

  const [mood, setMood] = useState<number | null>(null);
  const [urgesToday, setUrgesToday] = useState<boolean | null>(null);
  const [urgeCount, setUrgeCount] = useState<number | null>(null);
  const [promptResponse, setPromptResponse] = useState('');
  const [done, setDone] = useState(false);

  const prompt = useMemo(() => {
    const prompts = getAllCheckinPrompts();
    const globalDayIndex = (position.week - 1) * 7 + (position.day - 1);
    return prompts[globalDayIndex % prompts.length];
  }, [position]);

  const alreadyComplete = completions[dayKey(position)]?.checkinComplete ?? false;

  const canSubmit =
    mood !== null && urgesToday !== null && (!urgesToday || urgeCount !== null) && promptResponse.trim().length > 0;

  function handleSubmit() {
    const entry = buildCheckinEntry({
      week: position.week,
      day: position.day,
      mood: mood as number,
      urgesToday: urgesToday as boolean,
      urgeCount: urgesToday ? (urgeCount as number) : 0,
      promptText: prompt,
      promptResponse,
    });
    if (!entry) return;

    addCheckin(entry);
    completeCheckin(position.week, position.day);
    trackCheckinCompleted();
    setDone(true);
  }

  if (done || alreadyComplete) {
    return (
      <ThemedView style={styles.completeContainer}>
        <CompletionBadge label="Check-in saved." />
        <PrimaryButton label="Back to Today" onPress={() => router.back()} />
      </ThemedView>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <ThemedText type="title" style={styles.title}>
        Evening check-in
      </ThemedText>

      <ThemedText type="subtitle" style={styles.prompt}>
        How's your mood right now?
      </ThemedText>
      <NumberScale min={1} max={5} value={mood} onChange={setMood} />

      <ThemedText type="subtitle" style={styles.prompt}>
        Any urges today?
      </ThemedText>
      <View style={styles.row}>
        <ChoiceChip label="Yes" selected={urgesToday === true} onPress={() => setUrgesToday(true)} />
        <ChoiceChip
          label="No"
          selected={urgesToday === false}
          onPress={() => {
            setUrgesToday(false);
            setUrgeCount(null);
          }}
        />
      </View>
      {urgesToday ? (
        <>
          <ThemedText type="small" themeColor="textSecondary" style={styles.hint}>
            How many?
          </ThemedText>
          <NumberScale min={0} max={10} value={urgeCount} onChange={setUrgeCount} />
        </>
      ) : null}

      <ThemedText type="subtitle" style={styles.prompt}>
        {prompt}
      </ThemedText>
      <TextInput
        value={promptResponse}
        onChangeText={setPromptResponse}
        placeholder="Write as much or as little as you want"
        placeholderTextColor={theme.textSecondary}
        multiline
        style={[styles.input, { color: theme.text, borderColor: theme.border }]}
        accessibilityLabel={prompt}
      />

      <PrimaryButton label="Save" onPress={handleSubmit} disabled={!canSubmit} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: Spacing.four, paddingBottom: Spacing.six },
  title: { marginBottom: Spacing.three },
  prompt: { marginTop: Spacing.four, marginBottom: Spacing.two },
  row: { flexDirection: 'row', gap: Spacing.two },
  hint: { marginTop: Spacing.two, marginBottom: Spacing.one },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 14,
    minHeight: 120,
    fontSize: 16,
    textAlignVertical: 'top',
    marginBottom: Spacing.four,
  },
  completeContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: Spacing.five, padding: Spacing.four },
});
