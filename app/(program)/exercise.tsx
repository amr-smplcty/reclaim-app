import { useMemo, useState } from 'react';
import { StyleSheet } from 'react-native';
import { router } from 'expo-router';

import { CompletionBadge } from '@/components/completion-badge';
import { PrimaryButton } from '@/components/primary-button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { getProgramModules } from '@/lib/content/week';
import { useProgramStore } from '@/features/program/useProgramStore';
import { dayKey, findProgramDay } from '@/features/program/progression';
import { Spacing } from '@/theme/tokens';
import { ChainBuilder } from '@/features/program/exercises/ChainBuilder';
import { ChecklistCommit } from '@/features/program/exercises/ChecklistCommit';
import { CommitmentBuilder } from '@/features/program/exercises/CommitmentBuilder';
import { DecisionalBalanceCompare } from '@/features/program/exercises/DecisionalBalanceCompare';
import { DualSliderWrite } from '@/features/program/exercises/DualSliderWrite';
import { GuidedList } from '@/features/program/exercises/GuidedList';
import { IfThenBuilder } from '@/features/program/exercises/IfThenBuilder';
import { LetterWrite } from '@/features/program/exercises/LetterWrite';
import { MultiSelectWrite } from '@/features/program/exercises/MultiSelectWrite';
import { ProfileBuilder } from '@/features/program/exercises/ProfileBuilder';
import { RatedInventory } from '@/features/program/exercises/RatedInventory';
import { ToolPractice } from '@/features/program/exercises/ToolPractice';
import { ValueCardSort } from '@/features/program/exercises/ValueCardSort';
import { CommittedActionPlanner } from '@/features/program/exercises/CommittedActionPlanner';
import { UrgeValueMap } from '@/features/program/exercises/UrgeValueMap';
import { RiskWindowPlanner } from '@/features/program/exercises/RiskWindowPlanner';
import { WorksheetFallback } from '@/features/program/exercises/WorksheetFallback';
import { resolveShiftListSeed } from '@/features/program/shiftList';
import { resolveSelectOptions, summarizeExerciseOutput } from '@/features/program/exerciseHelpers';
import { resolveCommittedActionValues } from '@/features/program/committedActionPlanner';
import { deriveRiskWindows, resolvePlantOptions } from '@/features/program/riskWindowPlanner';
import { useToolkitStore } from '@/features/toolkit/useToolkitStore';
import type {
  ChainBuilderOutput,
  ChainBuilderPayload,
  ChecklistCommitPayload,
  CommitmentBuilderPayload,
  CommittedActionPlannerPayload,
  DecisionalBalanceComparePayload,
  DualSliderWritePayload,
  GuidedListOutput,
  GuidedListPayload,
  IfThenBuilderPayload,
  MultiSelectWriteOutput,
  MultiSelectWritePayload,
  ProfileBuilderPayload,
  RatedInventoryOutput,
  RatedInventoryPayload,
  RiskWindowPlannerPayload,
  ToolPracticePayload,
  UrgeValueMapPayload,
  ValueCardSortPayload,
} from '@/types/program';

// Exercise renderer (PRODUCT_SPEC §5.3 program tie-in) — switches on
// payload.kind for the 11 kinds week1.json/week2.json's notes_for_engineering
// list, falling back to a sequential worksheet for anything unrecognized.
export default function ExerciseScreen() {
  const position = useProgramStore((s) => s.position);
  const completions = useProgramStore((s) => s.completions);
  const completeExercise = useProgramStore((s) => s.completeExercise);
  const saveExerciseOutput = useProgramStore((s) => s.saveExerciseOutput);
  // Subscribing to exerciseOutputs (not just calling getExerciseOutput) keeps
  // cross-referencing exercises (decisional_balance_compare, commitment_builder)
  // reactive to outputs saved by earlier days in the same session.
  const exerciseOutputs = useProgramStore((s) => s.exerciseOutputs);
  const urgeLogs = useToolkitStore((s) => s.urgeLogs);

  const [justCompleted, setJustCompleted] = useState(false);

  const day = useMemo(() => findProgramDay(getProgramModules(), position), [position]);

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
      body = (
        <MultiSelectWrite
          payload={p}
          options={resolveSelectOptions(p, exerciseOutputs)}
          onSubmit={(o) => handleSubmit(p.save_to, o)}
        />
      );
      break;
    }
    case 'rated_inventory': {
      const p = payload as unknown as RatedInventoryPayload;
      body = <RatedInventory payload={p} onSubmit={(o) => handleSubmit(p.save_to, o)} />;
      break;
    }
    case 'guided_list': {
      const p = payload as unknown as GuidedListPayload;
      const existing = exerciseOutputs[p.save_to] as GuidedListOutput | undefined;
      body = (
        <GuidedList
          payload={p}
          initialItems={resolveShiftListSeed(existing)}
          onSubmit={(o) => handleSubmit(p.save_to, o)}
        />
      );
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
          outputs={exerciseOutputs}
          lapseLetter={exerciseOutputs.lapse_letter as string | undefined}
          onSubmit={(o) => handleSubmit(p.save_to, o)}
        />
      );
      break;
    }
    case 'chain_builder': {
      const p = payload as unknown as ChainBuilderPayload;
      body = <ChainBuilder payload={p} onSubmit={(o) => handleSubmit(p.save_to, o)} />;
      break;
    }
    case 'checklist_commit': {
      const p = payload as unknown as ChecklistCommitPayload;
      body = <ChecklistCommit payload={p} onSubmit={(o) => handleSubmit(p.save_to, o)} />;
      break;
    }
    case 'if_then_builder': {
      const p = payload as unknown as IfThenBuilderPayload;
      const referenceSummaries = p.reference_sources
        .map((key) => summarizeExerciseOutput(exerciseOutputs[key]))
        .filter((summary) => summary && summary !== 'Not yet completed.');
      body = (
        <IfThenBuilder payload={p} referenceSummaries={referenceSummaries} onSubmit={(o) => handleSubmit(p.save_to, o)} />
      );
      break;
    }
    case 'profile_builder': {
      const p = payload as unknown as ProfileBuilderPayload;
      body = <ProfileBuilder payload={p} sourceOutputs={exerciseOutputs} onSubmit={(o) => handleSubmit(p.save_to, o)} />;
      break;
    }
    case 'tool_practice': {
      const p = payload as unknown as ToolPracticePayload;
      body = <ToolPractice payload={p} onSubmit={(o) => handleSubmit(p.save_to, o)} />;
      break;
    }
    case 'value_card_sort': {
      const p = payload as unknown as ValueCardSortPayload;
      body = <ValueCardSort payload={p} onSubmit={(o) => handleSubmit(p.save_to, o)} />;
      break;
    }
    case 'committed_action_planner': {
      const p = payload as unknown as CommittedActionPlannerPayload;
      body = (
        <CommittedActionPlanner
          payload={p}
          values={resolveCommittedActionValues(p, exerciseOutputs)}
          onSubmit={(o) => handleSubmit(p.save_to, o)}
        />
      );
      break;
    }
    case 'urge_value_map': {
      const p = payload as unknown as UrgeValueMapPayload;
      const valuesOutput = exerciseOutputs[p.tag_options_source] as MultiSelectWriteOutput | undefined;
      body = (
        <UrgeValueMap
          payload={p}
          urgeLogs={urgeLogs}
          valuesCore={valuesOutput?.selected ?? []}
          onSubmit={(o) => handleSubmit(p.save_to, o)}
        />
      );
      break;
    }
    case 'risk_window_planner': {
      const p = payload as unknown as RiskWindowPlannerPayload;
      // windows_source is always [trigger_map_external, chain_analysis] in
      // content today — read by their well-known keys, same convention as
      // commitment_builder's lapse_letter read below.
      const windows = deriveRiskWindows(
        exerciseOutputs.trigger_map_external as MultiSelectWriteOutput | undefined,
        exerciseOutputs.chain_analysis as ChainBuilderOutput | undefined
      );
      body = (
        <RiskWindowPlanner
          payload={p}
          windows={windows}
          plantOptions={resolvePlantOptions(p.plant_options_sources, exerciseOutputs)}
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
