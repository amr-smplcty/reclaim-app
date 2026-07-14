// Exercise payload kinds — per content/week1.json's notes_for_engineering and
// CLINICAL_SPEC §7. Unknown kinds fall back to a sequential worksheet render.

import type { ProgramModule } from '@/types/content';

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
  pin_to_today: boolean;
}

export type ExercisePayload =
  | MultiSelectWritePayload
  | RatedInventoryPayload
  | GuidedListPayload
  | DecisionalBalanceComparePayload
  | DualSliderWritePayload
  | LetterWritePayload
  | CommitmentBuilderPayload;

export const KNOWN_PAYLOAD_KINDS = [
  'multi_select_write',
  'rated_inventory',
  'guided_list',
  'decisional_balance_compare',
  'dual_slider_write',
  'letter_write',
  'commitment_builder',
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

export interface CommitmentBuilderOutput {
  statement: string;
  signature: string;
  signed_at: string;
}

export interface LessonReflectionRecord {
  type: 'single_choice' | 'free_text';
  value: string;
}

export interface WeekContentPack {
  content_version: string;
  notes_for_engineering: string;
  modules: ProgramModule[];
  checkin_prompts: string[];
}
