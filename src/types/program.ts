// Exercise payload kinds — per content/week1.json's notes_for_engineering and
// CLINICAL_SPEC §7. Unknown kinds fall back to a sequential worksheet render.

import type { ProgramModule } from '@/types/content';
import type { ToolId } from '@/features/toolkit/entitlement';

export interface MultiSelectWritePayload {
  kind: 'multi_select_write';
  select_options: string[];
  select_count: number;
  write_prompt: string;
  save_to: string;
}

export interface RatedInventoryPayload {
  kind: 'rated_inventory';
  areas: string[];
  scale_max: number;
  note_threshold: number;
  save_to: string;
}

export interface GuidedListPayload {
  kind: 'guided_list';
  prompt: string;
  suggestions: string[];
  min_items: number;
  save_to: string;
}

export interface DecisionalBalanceComparePayload {
  kind: 'decisional_balance_compare';
  left_source: string;
  right_source: string;
  gain_prompt: string;
  hardest_line_prompt: string;
  save_to: string;
}

export interface DualSliderWritePayload {
  kind: 'dual_slider_write';
  sliders: Array<{ label: string; min: number; max: number }>;
  write_prompts: string[];
  save_to: string;
}

export interface LetterWritePayload {
  kind: 'letter_write';
  prompt: string;
  min_chars: number;
  save_to: string;
}

export interface CommitmentBuilderPayload {
  kind: 'commitment_builder';
  template: string;
  inputs: string[];
  signature_required: boolean;
  save_to: string;
  // Week 1 Day 7 pins its statement to Today; Week 3 Day 7 (urge_script)
  // omits this and surfaces itself elsewhere instead (surface_in).
  pin_to_today?: boolean;
  max_words?: number;
  surface_in?: string[];
}

// Week 3 (CLINICAL_SPEC §4) — launches a named Toolkit tool in practice mode
// (a rehearsal, not a real urge) and asks a short reflection once the
// session ends.
export interface ToolPracticePayload {
  kind: 'tool_practice';
  tool: ToolId;
  practice_mode: boolean;
  post_prompt: string;
  save_to: string;
}

export interface ChainBuilderPayload {
  kind: 'chain_builder';
  link_prompt: string;
  min_links: number;
  max_links: number;
  weakest_link_prompt: string;
  save_to: string;
}

export interface ChecklistCommitPayload {
  kind: 'checklist_commit';
  audit_items: string[];
  commit_prompt: string;
  commit_count: number;
  followup_next_day: boolean;
  save_to: string;
}

export interface IfThenBuilderPayload {
  kind: 'if_then_builder';
  plan_count: number;
  reference_sources: string[];
  then_suggestions: string[];
  save_to: string;
}

export interface ProfileSection {
  title: string;
  source: string;
}

export interface ProfileBuilderPayload {
  kind: 'profile_builder';
  sections: ProfileSection[];
  save_to: string;
  surface_in: string[];
}

export type ExercisePayload =
  | MultiSelectWritePayload
  | RatedInventoryPayload
  | GuidedListPayload
  | DecisionalBalanceComparePayload
  | DualSliderWritePayload
  | LetterWritePayload
  | CommitmentBuilderPayload
  | ChainBuilderPayload
  | ChecklistCommitPayload
  | IfThenBuilderPayload
  | ProfileBuilderPayload
  | ToolPracticePayload;

export const KNOWN_PAYLOAD_KINDS = [
  'multi_select_write',
  'rated_inventory',
  'guided_list',
  'decisional_balance_compare',
  'dual_slider_write',
  'letter_write',
  'commitment_builder',
  'chain_builder',
  'checklist_commit',
  'if_then_builder',
  'profile_builder',
  'tool_practice',
] as const;

// -- Saved output shapes, keyed by each payload's save_to name --

export interface MultiSelectWriteOutput {
  selected: string[];
  write: string;
}

export interface RatedInventoryOutput {
  ratings: Record<string, number>;
  notes: Record<string, string>;
}

export interface GuidedListOutput {
  items: string[];
}

// decisional_balance_compare saves just the chosen hardest line (a plain
// string) to save_to — "that line goes on your Emergency Card." The gains
// list itself is transient, used only to build the selectable candidates.
export type EmergencyCardLineOutput = string;

export interface DualSliderWriteOutput {
  sliders: Record<string, number>;
  writes: string[];
}

export type LetterWriteOutput = string;

// The post-practice reflection text (tool_practice's post_prompt answer).
export type ToolPracticeOutput = string;

export interface CommitmentBuilderOutput {
  statement: string;
  signature: string;
  signed_at: string;
}

export interface ChainBuilderOutput {
  links: string[];
  weakest_link: string;
}

export type CommitmentFollowupAnswer = 'yes' | 'partly' | 'no';

export interface ChecklistCommitOutput {
  audit: Record<string, boolean>;
  commitments: string[];
}

export interface IfThenPlan {
  if_text: string;
  then_text: string;
}

export type IfThenBuilderOutput = IfThenPlan[];

export interface ProfileBuilderOutput {
  sections: Array<{ title: string; content: string }>;
}

export interface LessonReflectionRecord {
  type: 'single_choice' | 'free_text';
  value: string;
  // Stamped by useProgramStore.saveReflection — needed so the Journal
  // timeline (Epic 6) can interleave reflections with checkins/urge logs/
  // lapse debriefs in true chronological order.
  timestamp: string;
}

export interface UrgeSurfBeat {
  at_seconds: number;
  text: string;
}

export interface UrgeSurfScript {
  duration_seconds: number;
  note: string;
  on_screen_beats: UrgeSurfBeat[];
  narration_script: string;
}

export interface ToolkitScripts {
  urge_surf?: UrgeSurfScript;
}

export interface WeekContentPack {
  content_version: string;
  notes_for_engineering: string;
  modules: ProgramModule[];
  // Week 1 carries the base list; later weeks add to it (checkin_prompts_additions)
  // rather than each redeclaring the full list.
  checkin_prompts?: string[];
  checkin_prompts_additions?: string[];
  toolkit_scripts?: ToolkitScripts;
}
