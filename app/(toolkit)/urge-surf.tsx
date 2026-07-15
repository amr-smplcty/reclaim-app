import { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';

import { CompletionBadge } from '@/components/completion-badge';
import { PrimaryButton } from '@/components/primary-button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { getUrgeSurfScript } from '@/lib/content/week';
import { CountdownRing } from '@/features/toolkit/CountdownRing';
import { WaveAnimation } from '@/features/toolkit/WaveAnimation';
import { PostToolRating } from '@/features/toolkit/PostToolRating';
import { useToolkitStore } from '@/features/toolkit/useToolkitStore';
import { useProgramStore } from '@/features/program/useProgramStore';
import { describeDelta } from '@/features/toolkit/suggestion';
import { trackUrgeToolUsed } from '@/lib/analytics/events';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/theme/tokens';
import type { CommitmentBuilderOutput, UrgeSurfBeat } from '@/types/program';

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
  const theme = useTheme();
  const { practice } = useLocalSearchParams<{ practice?: string }>();
  const isPractice = practice === 'true';

  const activeSession = useToolkitStore((s) => s.activeSession);
  const logToolUse = useToolkitStore((s) => s.logToolUse);
  const clearSession = useToolkitStore((s) => s.clearSession);
  // Week 3 Day 7 (CLINICAL_SPEC §4) — the user's own urge script, surfaced
  // here every time once it exists, never blocking the tool's instant load.
  // Saved via the same commitment_builder output shape as Week 1 Day 7
  // ({statement, signature, signed_at}) — never a bare string.
  const urgeScriptStatement = useProgramStore(
    (s) => s.getExerciseOutput<CommitmentBuilderOutput>('urge_script')?.statement
  );

  const [remaining, setRemaining] = useState(durationSeconds);
  const [result, setResult] = useState<{ pre: number; post: number } | null>(null);

  useEffect(() => {
    if (remaining <= 0) return;
    const interval = setInterval(() => setRemaining((r) => Math.max(0, r - 1)), 1000);
    return () => clearInterval(interval);
  }, [remaining]);

  function handleRate(postIntensity: number) {
    const preIntensity = activeSession?.preIntensity ?? postIntensity;
    logToolUse('urge_surf', preIntensity, postIntensity, isPractice);
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
      {urgeScriptStatement ? (
        <ThemedView style={[styles.scriptBlock, { borderColor: theme.border }]}>
          <ThemedText type="small" themeColor="accent" style={styles.scriptLabel}>
            Your urge script
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary" numberOfLines={3}>
            {urgeScriptStatement}
          </ThemedText>
        </ThemedView>
      ) : null}
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
  scriptBlock: { borderWidth: 1, borderRadius: 10, padding: Spacing.three, gap: Spacing.one, alignSelf: 'stretch' },
  scriptLabel: { fontWeight: '700' },
  completeContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: Spacing.five, padding: Spacing.four },
});
