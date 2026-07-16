import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { router, type Href } from 'expo-router';

import { ChoiceChip } from '@/components/choice-chip';
import { PrimaryButton } from '@/components/primary-button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { guardAllFreeText } from '@/lib/safety/guard';
import { useProgramStore } from '@/features/program/useProgramStore';
import type { EmergencyCardOutput } from '@/types/program';
import { useToolkitStore, type LapseFailureMode, type Trigger } from '@/features/toolkit/useToolkitStore';
import { useCommitmentGoalsStore } from '@/features/progress/useCommitmentGoalsStore';
import { trackLapseLogged } from '@/lib/analytics/events';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/theme/tokens';
import type { GuidedListOutput } from '@/types/program';

const BEFORE_CHIPS: Array<{ id: Trigger; label: string }> = [
  { id: 'stress', label: 'Stress' },
  { id: 'boredom', label: 'Boredom' },
  { id: 'loneliness', label: 'Loneliness' },
  { id: 'late_night', label: 'Late night' },
  { id: 'saw_trigger', label: 'Saw a trigger' },
  { id: 'other', label: 'Other' },
];

const FEELING_CHIPS = ['Stressed', 'Lonely', 'Bored', 'Anxious', 'Numb', 'Tired', 'Something else'];

const FAILURE_MODES: Array<{ id: LapseFailureMode; label: string }> = [
  { id: 'tool_not_used', label: "Didn't use a tool" },
  { id: 'used_but_overwhelmed', label: 'Used a tool, but felt overwhelmed' },
  { id: 'didnt_want_to_stop', label: "Didn't want to stop" },
];

// Lapse debrief (CLINICAL_SPEC §5.4) — 4 structured questions, surfaces the
// user's own Week 1 Day 6 letter, appends to relapse-prevention data. No
// streak-reset mechanics anywhere — the program simply continues.
export default function LapseDebriefScreen() {
  const theme = useTheme();
  const lapseLetter = useProgramStore((s) => s.getExerciseOutput<string>('lapse_letter'));
  // Week 4 Day 6's guided_list surface_in: ["lapse_debrief"] — the user's own
  // critic-to-coach rewrites, shown alongside the Week 1 letter.
  const innerCoachLines = useProgramStore((s) => s.getExerciseOutput<GuidedListOutput>('inner_coach_lines'));
  // Week 6 Day 5's Emergency Card (surface_in: ["lapse_debrief"], BACKLOG #27)
  // — only once it's actually been built.
  const emergencyCard = useProgramStore((s) => s.getExerciseOutput<EmergencyCardOutput>('emergency_card'));
  const logLapseDebrief = useToolkitStore((s) => s.logLapseDebrief);

  const [beforeChips, setBeforeChips] = useState<Trigger[]>([]);
  const [beforeFreeText, setBeforeFreeText] = useState('');
  const [feelingChips, setFeelingChips] = useState<string[]>([]);
  const [whatFailed, setWhatFailed] = useState<LapseFailureMode | null>(null);
  const [changeNextTime, setChangeNextTime] = useState('');
  const [done, setDone] = useState(false);

  function toggleBefore(id: Trigger) {
    setBeforeChips((prev) => (prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]));
  }

  function toggleFeeling(label: string) {
    setFeelingChips((prev) => (prev.includes(label) ? prev.filter((c) => c !== label) : [...prev, label]));
  }

  const canSubmit =
    beforeChips.length > 0 && feelingChips.length > 0 && whatFailed !== null && changeNextTime.trim().length > 0;

  function handleSubmit() {
    if (!guardAllFreeText([beforeFreeText, changeNextTime])) return;
    logLapseDebrief({
      beforeChips,
      beforeFreeText,
      feelingChips,
      whatFailed: whatFailed as LapseFailureMode,
      changeNextTime,
    });
    trackLapseLogged();
    // CLINICAL_SPEC §9 rule 3: a lapse (with its debrief completed, right
    // here) delays the Commitment Goal unlock — it never zeroes the jar or
    // the ladder tier. No-op if the user hasn't opted into the module.
    useCommitmentGoalsStore.getState().applyLapseToGoal();
    setDone(true);
  }

  if (done) {
    return (
      <ThemedView style={styles.completeContainer}>
        <ThemedText type="title" style={styles.centered}>
          A lapse is a data point, not a verdict.
        </ThemedText>
        <ThemedText type="default" themeColor="textSecondary" style={styles.centered}>
          Your plan just got smarter.
        </ThemedText>
        <PrimaryButton label="Back to Toolkit" onPress={() => router.back()} />
      </ThemedView>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <ThemedText type="title" style={styles.title}>
        It happened
      </ThemedText>
      <ThemedText type="default" themeColor="textSecondary" style={styles.intro}>
        No judgment here — just a quick debrief so your plan gets smarter.
      </ThemedText>

      {emergencyCard ? (
        <Pressable
          onPress={() => router.push('/(modals)/emergency-card' as Href)}
          accessibilityRole="button"
          accessibilityLabel="Open your Emergency Card"
          style={[styles.emergencyCardLink, { borderColor: theme.accent, backgroundColor: theme.accentTint }]}
        >
          <ThemedText type="default" themeColor="accent" style={styles.letterLabel}>
            Open your Emergency Card
          </ThemedText>
        </Pressable>
      ) : null}

      {lapseLetter ? (
        <ThemedView style={[styles.letterBlock, { borderColor: theme.border }]}>
          <ThemedText type="small" themeColor="accent" style={styles.letterLabel}>
            Your letter to yourself
          </ThemedText>
          <ThemedText type="default" themeColor="textSecondary">
            {lapseLetter}
          </ThemedText>
        </ThemedView>
      ) : null}

      {innerCoachLines && innerCoachLines.items.length > 0 ? (
        <ThemedView style={[styles.letterBlock, { borderColor: theme.border }]}>
          <ThemedText type="small" themeColor="accent" style={styles.letterLabel}>
            Your coach, not your critic
          </ThemedText>
          {innerCoachLines.items.map((line) => (
            <ThemedText key={line} type="default" themeColor="textSecondary">
              {line}
            </ThemedText>
          ))}
        </ThemedView>
      ) : null}

      <ThemedText type="subtitle" style={styles.prompt}>
        What was happening in the hour before?
      </ThemedText>
      <View>
        {BEFORE_CHIPS.map((c) => (
          <ChoiceChip key={c.id} label={c.label} selected={beforeChips.includes(c.id)} onPress={() => toggleBefore(c.id)} />
        ))}
      </View>
      <TextInput
        value={beforeFreeText}
        onChangeText={setBeforeFreeText}
        placeholder="Anything else about that hour?"
        placeholderTextColor={theme.textSecondary}
        multiline
        style={[styles.input, { color: theme.textPrimary, borderColor: theme.border }]}
        accessibilityLabel="What was happening in the hour before"
      />

      <ThemedText type="subtitle" style={styles.prompt}>
        What did you feel right before?
      </ThemedText>
      <View>
        {FEELING_CHIPS.map((f) => (
          <ChoiceChip key={f} label={f} selected={feelingChips.includes(f)} onPress={() => toggleFeeling(f)} />
        ))}
      </View>

      <ThemedText type="subtitle" style={styles.prompt}>
        What did you skip, or what failed?
      </ThemedText>
      <View>
        {FAILURE_MODES.map((f) => (
          <ChoiceChip key={f.id} label={f.label} selected={whatFailed === f.id} onPress={() => setWhatFailed(f.id)} />
        ))}
      </View>

      <ThemedText type="subtitle" style={styles.prompt}>
        What's one thing to change for next time?
      </ThemedText>
      <TextInput
        value={changeNextTime}
        onChangeText={setChangeNextTime}
        placeholder="Your answer feeds your relapse-prevention plan"
        placeholderTextColor={theme.textSecondary}
        multiline
        style={[styles.input, { color: theme.textPrimary, borderColor: theme.border }]}
        accessibilityLabel="What's one thing to change for next time"
      />

      <PrimaryButton label="Save" onPress={handleSubmit} disabled={!canSubmit} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: Spacing.four, paddingBottom: Spacing.six },
  title: { marginBottom: Spacing.two },
  intro: { marginBottom: Spacing.four },
  letterBlock: { borderWidth: 1, borderRadius: 10, padding: Spacing.three, marginBottom: Spacing.four, gap: Spacing.one },
  emergencyCardLink: { borderWidth: 1, borderRadius: 10, padding: Spacing.three, marginBottom: Spacing.four, alignItems: 'center' },
  letterLabel: { fontWeight: '700' },
  prompt: { marginTop: Spacing.three, marginBottom: Spacing.two },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    minHeight: 70,
    fontSize: 16,
    textAlignVertical: 'top',
    marginBottom: Spacing.two,
  },
  completeContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: Spacing.three, padding: Spacing.four },
  centered: { textAlign: 'center' },
});
