import type { BoosterLesson, MaintenancePlanOutput } from '@/types/program';

const MS_PER_WEEK = 7 * 24 * 60 * 60 * 1000;

// Post-program maintenance mode (CLINICAL_SPEC §4) — one rotating booster
// lesson per week since graduation, cycling through booster_lessons forever.
// Pure and calendar-based (not stored progress), same "position advances on
// completion, not calendar" spirit as the rest of the program — except here
// there IS no more completion to advance on, so the calendar is the only
// honest clock left.
export function selectWeeklyBooster(
  boosters: BoosterLesson[],
  programCompletedAt: string,
  now: Date
): BoosterLesson | undefined {
  if (boosters.length === 0) return undefined;

  const weeksElapsed = Math.floor((now.getTime() - new Date(programCompletedAt).getTime()) / MS_PER_WEEK);
  const index = ((weeksElapsed % boosters.length) + boosters.length) % boosters.length;
  return boosters[index];
}

export interface MaintenanceTodayView {
  booster: BoosterLesson | undefined;
  cadence: string | undefined;
}

// What Today shows once the program is complete (CLINICAL_SPEC §4): this
// week's booster (respecting the Week 6 Day 6 opt-out — default on, same as
// the payload default, for the edge case where programCompletedAt is set
// but no maintenance_plan was ever saved) and the chosen check-in cadence
// label, if any.
export function assembleMaintenanceToday(
  boosters: BoosterLesson[],
  programCompletedAt: string,
  now: Date,
  maintenancePlan: MaintenancePlanOutput | null
): MaintenanceTodayView {
  const weeklyBoosterEnabled = maintenancePlan?.weeklyBoosterEnabled ?? true;
  return {
    booster: weeklyBoosterEnabled ? selectWeeklyBooster(boosters, programCompletedAt, now) : undefined,
    cadence: maintenancePlan?.cadence,
  };
}
