import { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import { router } from 'expo-router';

import { CompletionBadge } from '@/components/completion-badge';
import { PrimaryButton } from '@/components/primary-button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { getUrgeSurfScript } from '@/lib/content/week';
import { CountdownRing } from '@/features/toolkit/CountdownRing';
import { WaveAnimation } from '@/features/toolkit/WaveAnimation';
import { PostToolRating } from '@/features/toolkit/PostToolRating';
import { useToolkitStore } from '@/features/toolkit/useToolkitStore';
import { describeDelta } from '@/features/toolkit/suggestion';
import { trackUrgeToolUsed } from '@/lib/analytics/events';
import { Spacing } from '@/constants/theme';
import type { UrgeSurfBeat } from '@/types/program';

// Week 2's authored script (content/program.json's earlier interim text
// beats are superseded) — the guided audio itself is still TODO(content),
// see BACKLOG #4.
const script = getUrgeSurfScript();
const durationSeconds = script?.duration_seconds ?? 180;
const beats: UrgeSurfBeat[] = script?.on_screen_beats ?? [];

function currentBeatText(elapsedSeconds: number): string {
  let text = beats[0]?.text ?? '';
  for (const beat of beats) {
    if (beat.at_seconds <= elapsedSeconds) text = beat.text;
    else break;
  }
  return text;
}

// Urge Surf (PRODUCT_SPEC §5.3, free forever per §6) — on-screen timed text
// prompts implementing the CLINICAL_SPEC §5.2 script beats.
export default function UrgeSurfScreen() {
  const activeSession = useToolkitStore((s) => s.activeSession);
  const logToolUse = useToolkitStore((s) => s.logToolUse);
  const clearSession = useToolkitStore((s) => s.clearSession);

  const [remaining, setRemaining] = useState(durationSeconds);
  const [result, setResult] = useState<{ pre: number; post: number } | null>(null);

  useEffect(() => {
    if (remaining <= 0) return;
    const interval = setInterval(() => setRemaining((r) => Math.max(0, r - 1)), 1000);
    return () => clearInterval(interval);
  }, [remaining]);

  function handleRate(postIntensity: number) {
    const preIntensity = activeSession?.preIntensity ?? postIntensity;
    logToolUse('urge_surf', preIntensity, postIntensity);
    trackUrgeToolUsed('urge_surf', preIntensity, postIntensity - preIntensity);
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

  return (
    <ThemedView style={styles.container}>
      <CountdownRing remainingSeconds={remaining} totalSeconds={durationSeconds} />
      <WaveAnimation />
      <ThemedText type="subtitle" style={styles.prompt}>
        {currentBeatText(durationSeconds - remaining)}
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: Spacing.four, alignItems: 'center', justifyContent: 'center', gap: Spacing.five },
  prompt: { textAlign: 'center', paddingHorizontal: Spacing.three },
  completeContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: Spacing.five, padding: Spacing.four },
});
