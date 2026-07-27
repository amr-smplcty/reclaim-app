// Journey experience layer (PRODUCT_SPEC §5.7) — ceremonial/navigational copy.
// Shapes mirror content/journey_experience.json exactly; all copy is authored
// there (clinician-reviewable) and never inlined in code.

export interface BeginningScreen {
  id: string;
  title: string;
  body: string;
  cta: string;
  shows_journey_map?: boolean;
}

export interface WeeklyIntro {
  title: string;
  body: string;
  cta: string;
}

export interface JourneyMapNodeContent {
  week: number;
  title: string;
  subtitle: string;
}

export interface JourneyMapContent {
  heading: string;
  nodes: JourneyMapNodeContent[];
  maintenance_node: { title: string; subtitle: string };
  upcoming_label: string; // contains the "{n}" placeholder
  current_label: string;
  completed_label: string;
}

export interface JourneyExperienceContent {
  content_version: string;
  beginning_sequence: BeginningScreen[];
  weekly_intros: Record<string, WeeklyIntro>; // keyed "week_2" ... "week_6"
  journey_map: JourneyMapContent;
  welcome_back: string[];
}
