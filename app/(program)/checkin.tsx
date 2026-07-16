import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { router } from 'expo-router';

import { ChoiceChip } from '@/components/choice-chip';
import { CompletionBadge } from '@/components/completion-badge';
import { PrimaryButton } from '@/components/primary-button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { getAllCheckinPrompts, getCheckinIntegratedActionKeys } from '@/lib/content/week';
import { NumberScale } from '@/features/program/exercises/NumberScale';
import { buildCheckinEntry } from '@/features/journal/checkinSubmission';
import { actionsForToday, dayOfWeekKeyFor } from '@/features/journal/committedActionCheckin';
import { useJournalStore } from '@/features/journal/useJournalStore';
import { useProgramStore } from '@/features/program/useProgramStore';
import { dayKey } from '@/features/program/progression';
import { dateKeyOf } from '@/features/progress/dailyCreditReconciliation';
import { trackCheckinCompleted } from '@/lib/analytics/events';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/theme/tokens';
import type { CommittedActionPlannerOutput } from '@/types/program';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

// Full evening check-in (PRODUCT_SPEC §5.4): mood (5-point), urges today
// (y/n + count), one rotating free-text prompt. Replaces the Epic 4
// lightweight version (BACKLOG #11) — this is the only check-in system now.
export default function CheckinScreen() {
  const theme = useTheme();
  const position = useProgramStore((s) => s.position);
  const completions = useProgramStore((s) => s.completions);
  const completeCheckin = useProgramStore((s) => s.completeCheckin);
  const exerciseOutputs = useProgramStore((s) => s.exerciseOutputs);
  const programCompletedAt = useProgramStore((s) => s.programCompletedAt);
  const checkins = useJournalStore((s) => s.checkins);
  const addCheckin = useJournalStore((s) => s.addCheckin);

  // Post-graduation (CLINICAL_SPEC §4 maintenance mode), `position` is
  // frozen at whatever day followed Week 6 Day 7 — it never advances again,
  // since there's no more lesson/exercise to complete. Gating "already
  // checked in" by dayKey(position) would then only ever allow ONE check-in
  // for the rest of the user's life. Maintenance check-ins gate by calendar
  // date instead, same as the rest of maintenance mode's clock.
  const isMaintenance = !!programCompletedAt;
  const todayKey = dateKeyOf(new Date().toISOString());

  const [mood, setMood] = useState<number | null>(null);
  const [urgesToday, setUrgesToday] = useState<boolean | null>(null);
  const [urgeCount, setUrgeCount] = useState<number | null>(null);
  const [promptResponse, setPromptResponse] = useState('');
  const [actionStatus, setActionStatus] = useState<Record<string, boolean>>({});
  const [done, setDone] = useState(false);

  // checkin_integration (Week 4 Day 3's committed_actions, Week 5 Day 3's
  // movement_plan, generically scanned — not hardcoded to either key) —
  // only for actions actually scheduled today, merged across every
  // integrated save. Optional and shame-free: nothing here blocks submitting.
  const committedActions = getCheckinIntegratedActionKeys().flatMap(
    (key) => (exerciseOutputs[key] as CommittedActionPlannerOutput | undefined) ?? []
  );
  const todaysActions = actionsForToday(committedActions, dayOfWeekKeyFor(new Date()));

  const prompt = useMemo(() => {
    const prompts = getAllCheckinPrompts();
    // In maintenance mode `position` is frozen, so the week/day rotation
    // below would repeat the same prompt forever — rotate by calendar day
    // instead, which keeps changing.
    const dayIndex = isMaintenance
      ? Math.floor(Date.now() / MS_PER_DAY)
      : (position.week - 1) * 7 + (position.day - 1);
    return prompts[((dayIndex % prompts.length) + prompts.length) % prompts.length];
  }, [position, isMaintenance]);

  const alreadyComplete = isMaintenance
    ? checkins.some((c) => dateKeyOf(c.timestamp) === todayKey)
    : completions[dayKey(position)]?.checkinComplete ?? false;

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
      committedActionStatus: Object.keys(actionStatus).length > 0 ? actionStatus : undefined,
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

      {todaysActions.length > 0 ? (
        <>
          <ThemedText type="subtitle" style={styles.prompt}>
            Did today's committed actions happen?
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary" style={styles.hint}>
            No judgment either way — just tracking your votes.
          </ThemedText>
          {todaysActions.map((action) => (
            <View key={action.id} style={styles.actionRow}>
              <ThemedText type="default" style={styles.actionLabel}>
                {action.action}
              </ThemedText>
              <View style={styles.row}>
                <ChoiceChip
                  label="Yes"
                  selected={actionStatus[action.id] === true}
                  onPress={() => setActionStatus((prev) => ({ ...prev, [action.id]: true }))}
                />
                <ChoiceChip
                  label="No"
                  selected={actionStatus[action.id] === false}
                  onPress={() => setActionStatus((prev) => ({ ...prev, [action.id]: false }))}
                />
              </View>
            </View>
          ))}
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
        style={[styles.input, { color: theme.textPrimary, borderColor: theme.border }]}
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
  actionRow: { marginTop: Spacing.two, gap: Spacing.one },
  actionLabel: { marginBottom: Spacing.half },
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
