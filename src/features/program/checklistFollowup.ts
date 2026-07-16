// Pure logic behind today.tsx's "did yesterday's checklist commitments
// happen?" follow-up card — a generic scan of the *previous* day's exercise
// (Epic 5b), not hardcoded to any specific week/day. Extracted out of
// today.tsx (Week 5 Day 2 reuse) so two coexisting checklist_commit
// instances — content/week2.json Day 4 and content/week5.json Day 2 — can
// be proven independent without RNTL.

import { dayKey, findProgramDay, previousPosition, type ProgramPosition } from '@/features/program/progression';
import type { ProgramModule } from '@/types/content';
import type { ChecklistCommitOutput, ChecklistCommitPayload, CommitmentFollowupAnswer } from '@/types/program';

export interface ChecklistFollowupResolution {
  // dayKey of the previous day, e.g. "2-4" — the Record key
  // recordCommitmentFollowup / commitmentFollowups use, so answering one
  // instance can never be mistaken for answering another.
  key: string | null;
  payload: ChecklistCommitPayload | undefined;
  output: ChecklistCommitOutput | undefined;
  shouldShow: boolean;
}

export function resolveChecklistFollowup(
  position: ProgramPosition,
  modules: ProgramModule[],
  exerciseOutputs: Record<string, unknown>,
  commitmentFollowups: Record<string, CommitmentFollowupAnswer>
): ChecklistFollowupResolution {
  const previousDayPosition = previousPosition(position);
  const previousDay = previousDayPosition ? findProgramDay(modules, previousDayPosition) : undefined;
  const payload =
    previousDay?.exercise.payload?.kind === 'checklist_commit'
      ? (previousDay.exercise.payload as unknown as ChecklistCommitPayload)
      : undefined;
  const key = previousDayPosition ? dayKey(previousDayPosition) : null;
  const alreadyAnswered = key ? !!commitmentFollowups[key] : true;
  const output = payload ? (exerciseOutputs[payload.save_to] as ChecklistCommitOutput | undefined) : undefined;
  const shouldShow = !!payload?.followup_next_day && !!output && !alreadyAnswered;

  return { key, payload, output, shouldShow };
}
