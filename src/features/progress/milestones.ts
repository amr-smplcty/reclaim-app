// Skill milestones (PRODUCT_SPEC §5.5) — competence badges, not purity
// badges. Every input here comes from an append-only counter (tool uses,
// assessment history, program completions), so the set of unlocked
// milestones can only ever grow — there is no code path that removes one.

export type MilestoneId =
  | 'day_one'
  | 'ten_urges_surfed'
  | 'first_reassessment'
  | 'pattern_profile_complete'
  | 'urge_script_written';

export interface Milestone {
  id: MilestoneId;
  label: string;
}

export const MILESTONES: Milestone[] = [
  { id: 'day_one', label: 'Day 1 complete' },
  { id: 'ten_urges_surfed', label: '10 urges surfed' },
  { id: 'first_reassessment', label: 'First re-assessment' },
  { id: 'pattern_profile_complete', label: 'Pattern profile complete' },
  { id: 'urge_script_written', label: 'Urge script written' },
];

export interface MilestoneInputs {
  day1LessonComplete: boolean;
  day1ExerciseComplete: boolean;
  urgesSurfedCount: number;
  assessmentHistoryCount: number;
  patternProfileComplete: boolean;
  urgeScriptWritten: boolean;
}

const TEN_URGES_THRESHOLD = 10;
// Onboarding's own assessment is entry #1 — a real re-assessment is #2+.
const FIRST_REASSESSMENT_THRESHOLD = 2;

export function computeUnlockedMilestones(inputs: MilestoneInputs): MilestoneId[] {
  const unlocked: MilestoneId[] = [];

  if (inputs.day1LessonComplete && inputs.day1ExerciseComplete) unlocked.push('day_one');
  if (inputs.urgesSurfedCount >= TEN_URGES_THRESHOLD) unlocked.push('ten_urges_surfed');
  if (inputs.assessmentHistoryCount >= FIRST_REASSESSMENT_THRESHOLD) unlocked.push('first_reassessment');
  if (inputs.patternProfileComplete) unlocked.push('pattern_profile_complete');
  if (inputs.urgeScriptWritten) unlocked.push('urge_script_written');

  return unlocked;
}
