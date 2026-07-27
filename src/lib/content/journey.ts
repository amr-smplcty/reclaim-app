import journeyRaw from '../../../content/journey_experience.json';

import type { JourneyExperienceContent, WeeklyIntro } from '@/types/journey';

// Journey experience content (PRODUCT_SPEC §5.7). Bundled JSON, same offline
// model as the week packs — authored copy, never improvised in code.
export function getJourneyContent(): JourneyExperienceContent {
  return journeyRaw as unknown as JourneyExperienceContent;
}

// The weekly kickoff intro for a given program week (2–6). Week 1's intro IS
// the beginning sequence, so there is no week_1 entry — returns undefined for
// any week without an authored intro.
export function getWeeklyIntro(week: number): WeeklyIntro | undefined {
  return getJourneyContent().weekly_intros[`week_${week}`];
}
