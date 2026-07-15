import { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import { router } from 'expo-router';

import { CompletionBadge } from '@/components/completion-badge';
import { PrimaryButton } from '@/components/primary-button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { getContentPack } from '@/lib/content';
import { BoxBreathAnimation, type BreathPhase } from '@/features/toolkit/BoxBreathAnimation';
import { PostToolRating } from '@/features/toolkit/PostToolRating';
import { useToolkitStore } from '@/features/toolkit/useToolkitStore';
import { describeDelta } from '@/features/toolkit/suggestion';
import { trackUrgeToolUsed } from '@/lib/analytics/events';
import { Spacing } from '@/theme/tokens';

const { total_seconds: totalSeconds, cycle_seconds: cycleSeconds } = getContentPack().toolkit.breather;
const CYCLE_LENGTH = cycleSeconds.inhale + cycleSeconds.hold_in + cycleSeconds.exhale + cycleSeconds.hold_out;

const PHASE_LABEL: Record<BreathPhase, string> = {
  inhale: 'Breathe in',
  hold_in: 'Hold',
  exhale: 'Breathe out',
  hold_out: 'Hold',
};

function currentPhase(elapsed: number): { phase: BreathPhase } {
  const t = elapsed % CYCLE_LENGTH;
  if (t < cycleSeconds.inhale) return { phase: 'inhale' };
  if (t < cycleSeconds.inhale + cycleSeconds.hold_in) return { phase: 'hold_in' };
  if (t < cycleSeconds.inhale + cycleSeconds.hold_in + cycleSeconds.exhale) return { phase: 'exhale' };
  return { phase: 'hold_out' };
}

// 90-second box-breathing (PRODUCT_SPEC §5.3, free forever per §6).
export default function BreatherScreen() {
  const activeSession = useToolkitStore((s) => s.activeSession);
  const logToolUse = useToolkitStore((s) => s.logToolUse);
  const clearSession = useToolkitStore((s) => s.clearSession);

  const [elapsed, setElapsed] = useState(0);
  const [result, setResult] = useState<{ pre: number; post: number } | null>(null);

  const remaining = Math.max(0, totalSeconds - elapsed);

  useEffect(() => {
    if (remaining <= 0) return;
    const interval = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(interval);
  }, [remaining]);

  function handleRate(postIntensity: number) {
    const preIntensity = activeSession?.preIntensity ?? postIntensity;
    logToolUse('breather', preIntensity, postIntensity);
    trackUrgeToolUsed('breather', preIntensity, postIntensity - preIntensity);
    clearSession();
    setResult({ pre: preIntensity, post: postIntensity });
  }

  if (result) {
    return (
      <ThemedView style={styles.completeContainer}>
        <CompletionBadge label={`The urge is ${describeDelta(result.pre, result.post)}.`} />
        <PrimaryButton label="Done" onPress={() => router.back()} />
      </ThemedView>
    );
  }

  if (remaining <= 0) {
    return (
      <ThemedView style={styles.container}>
        <PostToolRating onSubmit={handleRate} />
      </ThemedView>
    );
  }

  const { phase } = currentPhase(elapsed);

  return (
    <ThemedView style={styles.container}>
      <BoxBreathAnimation phase={phase} phaseSeconds={cycleSeconds[phase]} />
      <ThemedText type="title">{PHASE_LABEL[phase]}</ThemedText>
      <ThemedText type="small" themeColor="textSecondary">
        {remaining}s left
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: Spacing.four, alignItems: 'center', justifyContent: 'center', gap: Spacing.four },
  completeContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: Spacing.five, padding: Spacing.four },
});
