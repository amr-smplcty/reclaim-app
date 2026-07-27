import type { ProgramPosition } from '@/features/program/progression';
import type { JourneyMapContent } from '@/types/journey';

export type NodeState = 'completed' | 'current' | 'upcoming';

export interface JourneyNodeView {
  week: number;
  title: string;
  subtitle: string;
  state: NodeState;
  // Present only for the current week — 7 dots, `currentDay` of them filled.
  dayDots?: { total: number; currentDay: number };
}

export interface MaintenanceNodeView {
  title: string;
  subtitle: string;
  state: NodeState;
}

export interface JourneyMapView {
  heading: string;
  nodes: JourneyNodeView[];
  maintenance: MaintenanceNodeView;
}

const DAYS_PER_WEEK = 7;

// PRODUCT_SPEC §5.7 journey map states. While the program runs: weeks before
// the current position are completed, the current week is current (with day
// dots), later weeks are upcoming; maintenance is upcoming. Once the program
// is complete (programCompletedAt set), every week is completed and the
// maintenance node becomes current. No padlock/locked semantics — upcoming
// weeks still show their title+subtitle (locks read as paywall, not progression).
export function deriveJourneyMap(
  content: JourneyMapContent,
  position: ProgramPosition,
  programCompletedAt: string | null
): JourneyMapView {
  const complete = !!programCompletedAt;

  const nodes: JourneyNodeView[] = content.nodes.map((node) => {
    if (complete || node.week < position.week) {
      return { week: node.week, title: node.title, subtitle: node.subtitle, state: 'completed' };
    }
    if (node.week === position.week) {
      return {
        week: node.week,
        title: node.title,
        subtitle: node.subtitle,
        state: 'current',
        dayDots: { total: DAYS_PER_WEEK, currentDay: position.day },
      };
    }
    return { week: node.week, title: node.title, subtitle: node.subtitle, state: 'upcoming' };
  });

  const maintenance: MaintenanceNodeView = {
    title: content.maintenance_node.title,
    subtitle: content.maintenance_node.subtitle,
    state: complete ? 'current' : 'upcoming',
  };

  return { heading: content.heading, nodes, maintenance };
}

// The "Starts after Week {n}" label for an upcoming node — n is the week
// before it (i.e. the week whose completion unlocks it).
export function upcomingLabelFor(content: JourneyMapContent, week: number): string {
  return content.upcoming_label.replace('{n}', String(week - 1));
}

// A node's weekly intro is re-readable from the map only once reached
// (completed or current). Upcoming nodes show title+subtitle only
// (PRODUCT_SPEC §5.7 / journey_experience notes).
export function canReadWeeklyIntro(state: NodeState): boolean {
  return state === 'completed' || state === 'current';
}

// Weekly kickoff interstitial gate (PRODUCT_SPEC §5.7): shown once on the
// first open of each week's Day 1 session, weeks 2–6 only (Week 1's intro is
// the beginning sequence). Pure — the caller owns the "seen" persistence.
export function shouldShowWeeklyIntro(
  position: ProgramPosition,
  seen: Record<number, boolean>
): boolean {
  const { week, day } = position;
  if (day !== 1) return false;
  if (week < 2 || week > 6) return false;
  return !seen[week];
}

// Beginning sequence gate (PRODUCT_SPEC §5.7): shown once, after first paywall
// continuation, before W1D1 is first engaged. Not shown once seen, nor once
// the program has advanced past its very start, nor after graduation.
export function shouldShowBeginningSequence(args: {
  hasOnboarded: boolean;
  beginningSequenceSeen: boolean;
  position: ProgramPosition;
  hasAnyCompletion: boolean;
  programCompletedAt: string | null;
}): boolean {
  if (!args.hasOnboarded || args.beginningSequenceSeen || args.programCompletedAt) return false;
  const atStart = args.position.week === 1 && args.position.day === 1;
  return atStart && !args.hasAnyCompletion;
}
