import { useMemo, useState } from 'react';
import { StyleSheet } from 'react-native';
import { router } from 'expo-router';

import { CompletionBadge } from '@/components/completion-badge';
import { PrimaryButton } from '@/components/primary-button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { getWeekContent } from '@/lib/content/week';
import { useProgramStore } from '@/features/program/useProgramStore';
import { dayKey } from '@/features/program/progression';
import { Spacing } from '@/constants/theme';
import { CommitmentBuilder } from '@/features/program/exercises/CommitmentBuilder';
import { DecisionalBalanceCompare } from '@/features/program/exercises/DecisionalBalanceCompare';
import { DualSliderWrite } from '@/features/program/exercises/DualSliderWrite';
import { GuidedList } from '@/features/program/exercises/GuidedList';
import { LetterWrite } from '@/features/program/exercises/LetterWrite';
import { MultiSelectWrite } from '@/features/program/exercises/MultiSelectWrite';
import { RatedInventory } from '@/features/program/exercises/RatedInventory';
import { WorksheetFallback } from '@/features/program/exercises/WorksheetFallback';
import type {
  CommitmentBuilderPayload,
  DecisionalBalanceComparePayload,
  DualSliderWritePayload,
  GuidedListOutput,
  GuidedListPayload,
  MultiSelectWriteOutput,
  MultiSelectWritePayload,
  RatedInventoryOutput,
  RatedInventoryPayload,
} from '@/types/program';

// Exercise renderer (PRODUCT_SPEC §5.3 program tie-in) — switches on
// payload.kind for the 7 kinds week1.json's notes_for_engineering lists,
// falling back to a sequential worksheet for anything unrecognized.
export default function ExerciseScreen() {
  const position = useProgramStore((s) => s.position);
  const completions = useProgramStore((s) => s.completions);
  const completeExercise = useProgramStore((s) => s.completeExercise);
  const saveExerciseOutput = useProgramStore((s) => s.saveExerciseOutput);
  // Subscribing to exerciseOutputs (not just calling getExerciseOutput) keeps
  // cross-referencing exercises (decisional_balance_compare, commitment_builder)
  // reactive to outputs saved by earlier days in the same session.
  const exerciseOutputs = useProgramStore((s) => s.exerciseOutputs);

  const [justCompleted, setJustCompleted] = useState(false);

  const day = useMemo(() => {
    const week = getWeekContent().modules.find((m) => m.week === position.week);
    return week?.days.find((d) => d.day === position.day);
  }, [position]);

  if (!day) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText type="title">More content coming soon</ThemedText>
        <ThemedText type="default" themeColor="textSecondary">
          Week {position.week} isn't written yet — check back soon.
        </ThemedText>
      </ThemedView>
    );
  }

  const { exercise } = day;
  const alreadyComplete = completions[dayKey(position)]?.exerciseComplete ?? false;

  function handleSubmit(saveTo: string | undefined, output: unknown) {
    if (saveTo) saveExerciseOutput(saveTo, output);
    completeExercise(position.week, position.day);
    setJustCompleted(true);
  }

  if (justCompleted || alreadyComplete) {
    return (
      <ThemedView style={styles.completeContainer}>
        <CompletionBadge label="Exercise saved." />
        <PrimaryButton label="Back to Today" onPress={() => router.back()} />
      </ThemedView>
    );
  }

  const payload = exercise.payload as Record<string, unknown> & { kind: string; save_to?: string };
  let body: React.ReactNode;

  switch (payload.kind) {
    case 'multi_select_write': {
      const p = payload as unknown as MultiSelectWritePayload;
      body = <MultiSelectWrite payload={p} onSubmit={(o) => handleSubmit(p.save_to, o)} />;
      break;
    }
    case 'rated_inventory': {
      const p = payload as unknown as RatedInventoryPayload;
      body = <RatedInventory payload={p} onSubmit={(o) => handleSubmit(p.save_to, o)} />;
      break;
    }
    case 'guided_list': {
      const p = payload as unknown as GuidedListPayload;
      body = <GuidedList payload={p} onSubmit={(o) => handleSubmit(p.save_to, o)} />;
      break;
    }
    case 'decisional_balance_compare': {
      const p = payload as unknown as DecisionalBalanceComparePayload;
      body = (
        <DecisionalBalanceCompare
          payload={p}
          benefits={exerciseOutputs[p.left_source] as GuidedListOutput | undefined}
          costs={exerciseOutputs[p.right_source] as RatedInventoryOutput | undefined}
          onSubmit={(o) => handleSubmit(p.save_to, o)}
        />
      );
      break;
    }
    case 'dual_slider_write': {
      const p = payload as unknown as DualSliderWritePayload;
      body = <DualSliderWrite payload={p} onSubmit={(o) => handleSubmit(p.save_to, o)} />;
      break;
    }
    case 'letter_write': {
      const p = payload as unknown as import('@/types/program').LetterWritePayload;
      body = <LetterWrite payload={p} onSubmit={(o) => handleSubmit(p.save_to, o)} />;
      break;
    }
    case 'commitment_builder': {
      const p = payload as unknown as CommitmentBuilderPayload;
      body = (
        <CommitmentBuilder
          payload={p}
          anchorWhy={exerciseOutputs.anchor_why as MultiSelectWriteOutput | undefined}
          emergencyCardLine={exerciseOutputs.emergency_card_line as string | undefined}
          lapseLetter={exerciseOutputs.lapse_letter as string | undefined}
          onSubmit={(o) => handleSubmit(p.save_to, o)}
        />
      );
      break;
    }
    default:
      body = <WorksheetFallback steps={exercise.steps} onSubmit={(o) => handleSubmit(payload.save_to, o)} />;
  }

  return (
    <ThemedView style={styles.screen}>
      <ThemedText type="title" style={styles.title}>
        {exercise.title}
      </ThemedText>
      {body}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: Spacing.four },
  screen: { flex: 1, padding: Spacing.four },
  title: { marginBottom: Spacing.three },
  completeContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: Spacing.five, padding: Spacing.four },
});
