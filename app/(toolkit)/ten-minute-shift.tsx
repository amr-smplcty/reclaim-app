import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';

import { ChoiceChip } from '@/components/choice-chip';
import { CompletionBadge } from '@/components/completion-badge';
import { PrimaryButton } from '@/components/primary-button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { guardAllFreeText } from '@/lib/safety/guard';
import { CountdownRing } from '@/features/toolkit/CountdownRing';
import { PostToolRating } from '@/features/toolkit/PostToolRating';
import { EditableList } from '@/features/program/exercises/EditableList';
import { useProgramStore } from '@/features/program/useProgramStore';
import { resolveShiftListSeed } from '@/features/program/shiftList';
import { useToolkitStore } from '@/features/toolkit/useToolkitStore';
import { describeDelta, shouldOfferUrgeSurfEscalation } from '@/features/toolkit/suggestion';
import { trackUrgeToolUsed } from '@/lib/analytics/events';
import { Spacing } from '@/theme/tokens';
import type { GuidedListOutput } from '@/types/program';

const TOTAL_SECONDS = 600;
const MIN_SHIFT_LIST_ITEMS = 5;

type Step = 'build_list' | 'pick_activity' | 'counting' | 'rate' | 'done';

// 10-Minute Shift (CLINICAL_SPEC §5.5). The shift list lives at the program
// store's exerciseOutputs.shift_list — the same key Week 2 Day 6's "My Shift
// List" exercise reads/writes (BACKLOG #14), so building it here first and
// reaching W2D6 later (or vice versa) merges instead of overwriting.
export default function TenMinuteShiftScreen() {
  const { practice } = useLocalSearchParams<{ practice?: string }>();
  const isPractice = practice === 'true';

  const activeSession = useToolkitStore((s) => s.activeSession);
  const shiftListOutput = useProgramStore((s) => s.getExerciseOutput<GuidedListOutput>('shift_list'));
  const saveExerciseOutput = useProgramStore((s) => s.saveExerciseOutput);
  const logToolUse = useToolkitStore((s) => s.logToolUse);
  const startSession = useToolkitStore((s) => s.startSession);
  const clearSession = useToolkitStore((s) => s.clearSession);

  const shiftList = resolveShiftListSeed(shiftListOutput);
  const [draftList, setDraftList] = useState<string[]>(shiftList);
  const [selectedActivity, setSelectedActivity] = useState<string | null>(null);
  const [remaining, setRemaining] = useState(TOTAL_SECONDS);
  const [step, setStep] = useState<Step>(shiftList.length > 0 ? 'pick_activity' : 'build_list');
  const [result, setResult] = useState<{ pre: number; post: number } | null>(null);

  useEffect(() => {
    if (step !== 'counting' || remaining <= 0) return;
    const interval = setInterval(() => setRemaining((r) => Math.max(0, r - 1)), 1000);
    return () => clearInterval(interval);
  }, [step, remaining]);

  useEffect(() => {
    if (step === 'counting' && remaining <= 0) setStep('rate');
  }, [step, remaining]);

  function handleSaveList() {
    if (!guardAllFreeText(draftList)) return;
    saveExerciseOutput('shift_list', { items: draftList });
    setStep('pick_activity');
  }

  function handleRate(postIntensity: number) {
    const preIntensity = activeSession?.preIntensity ?? postIntensity;
    logToolUse('ten_minute_shift', preIntensity, postIntensity, isPractice);
    trackUrgeToolUsed('ten_minute_shift', preIntensity, postIntensity - preIntensity);
    clearSession();
    setResult({ pre: preIntensity, post: postIntensity });
    setStep('done');
  }

  function handleEscalate() {
    if (result) startSession(result.post);
    router.replace('/(toolkit)/urge-surf');
  }

  if (step === 'done' && result) {
    const offerEscalation = shouldOfferUrgeSurfEscalation(result.pre, result.post);
    return (
      <ThemedView style={styles.completeContainer}>
        {offerEscalation ? (
          <>
            <ThemedText type="subtitle" style={styles.centered}>
              Still there? That's okay — no shame in that.
            </ThemedText>
            <PrimaryButton label="Try Urge Surf" onPress={handleEscalate} />
            <PrimaryButton label="I'm okay for now" onPress={() => router.back()} />
          </>
        ) : (
          <>
            <CompletionBadge label="You just proved the urge passes without you obeying it." />
            <PrimaryButton label="Done" onPress={() => router.back()} />
          </>
        )}
      </ThemedView>
    );
  }

  if (step === 'rate') {
    return (
      <ThemedView style={styles.container}>
        <PostToolRating onSubmit={handleRate} />
      </ThemedView>
    );
  }

  if (step === 'counting') {
    return (
      <ThemedView style={styles.container}>
        <CountdownRing remainingSeconds={remaining} totalSeconds={TOTAL_SECONDS} />
        <ThemedText type="subtitle" style={styles.centered}>
          {selectedActivity}
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary" style={styles.centered}>
          Urges crest and fall on their own, usually within minutes, when you don't feed them.
        </ThemedText>
      </ThemedView>
    );
  }

  if (step === 'pick_activity') {
    return (
      <ThemedView style={styles.container}>
        <ThemedText type="title" style={styles.title}>
          Pick one thing to do for 10 minutes
        </ThemedText>
        <View>
          {shiftList.map((item: string) => (
            <ChoiceChip
              key={item}
              label={item}
              selected={selectedActivity === item}
              onPress={() => setSelectedActivity(item)}
            />
          ))}
        </View>
        <PrimaryButton label="Start 10 minutes" onPress={() => setStep('counting')} disabled={!selectedActivity} />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>
        Build your shift list
      </ThemedText>
      <ThemedText type="small" themeColor="textSecondary" style={styles.hint}>
        At least {MIN_SHIFT_LIST_ITEMS} concrete, immediately-available alternatives — include at least one
        physical one (a walk, pushups, a shower).
      </ThemedText>
      <EditableList items={draftList} onChange={setDraftList} addPlaceholder="Add an activity" />
      <PrimaryButton label="Save list" onPress={handleSaveList} disabled={draftList.length < MIN_SHIFT_LIST_ITEMS} />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: Spacing.four, justifyContent: 'center', gap: Spacing.four },
  title: { marginBottom: Spacing.one },
  hint: { marginBottom: Spacing.three },
  centered: { textAlign: 'center' },
  completeContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: Spacing.four, padding: Spacing.four },
});
