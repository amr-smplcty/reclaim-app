// Mirrors the content JSON contract defined in CLINICAL_SPEC.md §7.

export interface ProgramReflection {
  type: 'single_choice' | 'free_text';
  prompt: string;
  options?: string[];
}

export interface Lesson {
  id: string;
  title: string;
  body_md: string;
  read_minutes: number;
  audio_url: string | null;
  reflection: ProgramReflection;
}

export interface Exercise {
  id: string;
  type: 'decisional_balance' | 'worksheet' | 'audio_practice' | 'planner' | 'card_sort';
  title: string;
  steps: string[];
  payload: Record<string, unknown>;
}

export interface ProgramDay {
  day: number;
  lesson: Lesson;
  exercise: Exercise;
}

export interface ProgramModule {
  week: number;
  title: string;
  days: ProgramDay[];
}

export type Ppcs6Component = 'salience' | 'tolerance' | 'mood_modification' | 'conflict' | 'withdrawal' | 'relapse';

export interface Ppcs6Item {
  id: string;
  component: Ppcs6Component;
  text: string;
}

export interface Ppcs6Assessment {
  citation: string;
  citation_short: string;
  definition: string;
  timeframe_instruction: string;
  scale_labels: string[];
  cutoff: number;
  timeframe_default: string;
  timeframe_reassessment: string;
  items: Ppcs6Item[];
}

export interface ScreenerAssessment {
  items: string[];
  scale_labels: string[];
  cutoff: number;
}

export interface ToolkitContent {
  // Script/timing now come from content/week2.json's toolkit_scripts.urge_surf
  // (getUrgeSurfScript()) — this just carries the still-pending audio asset.
  urge_surf: { audio_url: string | null };
  breather: { total_seconds: number; cycle_seconds: { inhale: number; hold_in: number; exhale: number; hold_out: number } };
  defusion: Record<string, unknown>;
  environment_shift: Record<string, unknown>;
}

export interface MotivationOption {
  id: string;
  label: string;
}

export interface IntakeContent {
  motivations: MotivationOption[];
  years_of_use: string[];
  frequency_now: string[];
  prior_quit_attempts: string[];
}

export interface ContentPack {
  content_version: string;
  modules: ProgramModule[];
  assessments: {
    ppcs6: { ref: string };
    mood_stem: string;
    phq2: ScreenerAssessment;
    gad2: ScreenerAssessment;
  };
  intake: IntakeContent;
  toolkit: ToolkitContent;
  checkin_prompts: string[];
  booster_lessons: string[];
}
