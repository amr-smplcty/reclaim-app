import type { AssessmentEntry } from '@/features/assessment/useAssessmentHistoryStore';
import type { ProgramDay, ProgramModule } from '@/types/content';

const REFRESHER_LENGTH = 7;

// Post-program maintenance mode's refresher-week offer (CLINICAL_SPEC §4):
// "if score rises >= 6 points across two re-assessments". Only true
// re-assessments count (timeframe 'past_2_weeks') — the onboarding baseline
// ('past_6_months') is a different instrument administration and must never
// be one side of this delta. Requires at least two re-assessments to have a
// rise to measure at all.
export function shouldOfferRefresherWeek(entries: AssessmentEntry[]): boolean {
  const reassessments = entries
    .filter((e) => e.timeframe === 'past_2_weeks')
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  if (reassessments.length < 2) return false;

  const [previous, latest] = reassessments.slice(-2);
  return latest.score - previous.score >= 6;
}

// Original {week, day} carried alongside each ProgramDay so a consumer
// (the refresher screen's "redo the exercise" deep link) can navigate back
// to the real content location — the interleaved list itself can't be
// looked up by day.day alone, since W2D1 and W3D1 both carry day: 1.
export interface RefresherDay {
  week: number;
  day: ProgramDay;
}

// Auto-assembles a one-week "greatest hits" refresher from Weeks 2-3
// (CLINICAL_SPEC §4 / content/week6.json notes_for_engineering) — no
// clinical judgment call on which specific days matter most (CLAUDE.md:
// never invent/alter clinical content), so this deterministically
// interleaves both weeks' real, unmodified days rather than picking a
// subset: W2D1, W3D1, W2D2, W3D2, W2D3, W3D3, W2D4 (4 pattern-recognition
// days, 3 urge-skills days, capped at 7).
export function assembleRefresherWeek(week2: ProgramModule, week3: ProgramModule): RefresherDay[] {
  const interleaved: RefresherDay[] = [];
  for (let i = 0; i < REFRESHER_LENGTH; i++) {
    const source = i % 2 === 0 ? week2 : week3;
    const sourceIndex = Math.floor(i / 2);
    const day = source.days[sourceIndex];
    if (day) interleaved.push({ week: source.week, day });
  }
  return interleaved;
}

// Convenience wrapper for callers holding the full module list
// (getProgramModules()) rather than the two modules directly — degrades to
// an empty refresher (never throws) if either week is somehow missing.
export function assembleRefresherWeekFromModules(modules: ProgramModule[]): RefresherDay[] {
  const week2 = modules.find((m) => m.week === 2);
  const week3 = modules.find((m) => m.week === 3);
  if (!week2 || !week3) return [];
  return assembleRefresherWeek(week2, week3);
}
