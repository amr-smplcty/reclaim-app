import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';

import { useAssessmentHistoryStore, type AssessmentEntry } from '@/features/assessment/useAssessmentHistoryStore';
import { useJournalStore, type CheckinEntry } from '@/features/journal/useJournalStore';
import { useToolkitStore, type LapseDebriefEntry, type ToolUseEntry, type UrgeLogEntry } from '@/features/toolkit/useToolkitStore';
import { useProgramStore } from '@/features/program/useProgramStore';
import { useCommitmentGoalsStore } from '@/features/progress/useCommitmentGoalsStore';
import type { CommitmentGoalState } from '@/features/progress/commitmentGoals';
import type { LessonReflectionRecord } from '@/types/program';

export interface CommitmentGoalExport {
  rewardName: string;
  dailyPledgeAmount: number;
  goal: CommitmentGoalState | null;
}

export interface DataExport {
  exportedAt: string;
  assessmentHistory: AssessmentEntry[];
  journalCheckins: CheckinEntry[];
  urgeLogs: UrgeLogEntry[];
  toolUses: ToolUseEntry[];
  lapseDebriefs: LapseDebriefEntry[];
  exerciseOutputs: Record<string, unknown>;
  lessonReflections: Record<string, LessonReflectionRecord>;
  commitmentGoal: CommitmentGoalExport | null;
}

// Pure assembly (LEGAL_COMPLIANCE §5.7 access/export rights) — every store
// that holds user-generated content gets read here; add to this list
// whenever a new store gains one, or a future data-request will come up
// short. No I/O, so this is the part unit tests can verify for completeness.
export function buildDataExport(exportedAt: string): DataExport {
  const commitmentGoals = useCommitmentGoalsStore.getState();

  return {
    exportedAt,
    assessmentHistory: useAssessmentHistoryStore.getState().entries,
    journalCheckins: useJournalStore.getState().checkins,
    urgeLogs: useToolkitStore.getState().urgeLogs,
    toolUses: useToolkitStore.getState().toolUses,
    lapseDebriefs: useToolkitStore.getState().lapseDebriefs,
    exerciseOutputs: useProgramStore.getState().exerciseOutputs,
    lessonReflections: useProgramStore.getState().reflections,
    commitmentGoal: commitmentGoals.optedIn
      ? {
          rewardName: commitmentGoals.rewardName,
          dailyPledgeAmount: commitmentGoals.dailyPledgeAmount,
          goal: commitmentGoals.goal,
        }
      : null,
  };
}

// Native file write + share sheet — not unit-tested, same as the rest of this
// codebase's async-native-wrapper convention (e.g. src/lib/assessment/sync.ts).
export async function exportDataToFile(): Promise<string> {
  const data = buildDataExport(new Date().toISOString());
  const file = new File(Paths.cache, 'reclaim-data-export.json');
  file.write(JSON.stringify(data, null, 2));
  return file.uri;
}

export async function shareDataExport(): Promise<void> {
  const fileUri = await exportDataToFile();
  const available = await Sharing.isAvailableAsync();
  if (!available) {
    console.warn('[exportData] Sharing is not available on this device — export saved locally only.');
    return;
  }
  await Sharing.shareAsync(fileUri, { mimeType: 'application/json', dialogTitle: 'Export your Reclaim data' });
}
