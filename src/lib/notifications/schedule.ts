import type { TimeWindow } from '@/features/progress/patternInsights';
import { riskyWindowReminderCopy, riskyWindowReminderTime, type TimeOfDay } from '@/lib/notifications/riskyWindow';
import { isReassessmentDue, REASSESSMENT_INTERVAL_DAYS } from '@/features/assessment/reassessment';
import type { MaintenancePlanOutput } from '@/types/program';

export type NotificationTrigger =
  | { kind: 'daily'; hour: number; minute: number }
  | { kind: 'weekly'; weekday: number; hour: number; minute: number }
  | { kind: 'date'; date: string };

export interface NotificationSpec {
  id: string;
  title: string;
  body: string;
  trigger: NotificationTrigger;
}

export interface RiskyWindowPref {
  enabled: boolean;
  window: TimeWindow;
}

export interface ScheduleInputs {
  now: Date;
  programCompletedAt: string | null;
  dailyLessonTime: TimeOfDay;
  eveningCheckinTime: TimeOfDay;
  maintenancePlan: MaintenancePlanOutput | null;
  lastAssessedAt: string | null;
  riskyWindow: RiskyWindowPref | null;
}

// Week 6 Day 6's checkin_cadence_options (content/week6.json) mapped to
// iOS calendar-trigger weekdays (1=Sun ... 7=Sat). "3 evenings a week" and
// "Weekly" pick specific days as an engineering default — not a spec number,
// same category as BACKLOG #41 (app-lock grace period): worth a founder
// sanity check, not a blocker.
const CADENCE_WEEKDAYS: Record<string, number[]> = {
  Daily: [1, 2, 3, 4, 5, 6, 7],
  Weekdays: [2, 3, 4, 5, 6],
  '3 evenings a week': [2, 4, 6],
  Weekly: [1],
};

export function cadenceToWeekdays(cadence: string): number[] {
  return CADENCE_WEEKDAYS[cadence] ?? CADENCE_WEEKDAYS.Daily;
}

function nextReassessmentDate(lastAssessedAt: string | null, now: Date): string {
  if (!lastAssessedAt || isReassessmentDue(lastAssessedAt, now)) {
    // Already due (or never assessed) — prompt tomorrow morning rather than
    // firing a "reminder" the instant the schedule is built.
    const due = new Date(now);
    due.setDate(due.getDate() + 1);
    due.setHours(10, 0, 0, 0);
    return due.toISOString();
  }
  const due = new Date(lastAssessedAt);
  due.setDate(due.getDate() + REASSESSMENT_INTERVAL_DAYS);
  due.setHours(10, 0, 0, 0);
  return due.toISOString();
}

// PRODUCT_SPEC §7 + CLINICAL_SPEC §4 — the complete desired notification set
// for the user's current prefs/program state. Pure and total: no SDK calls,
// so every branch (active program vs. maintenance mode, opt-ins on/off) is
// unit-testable without mocking expo-notifications at all. The apply layer
// (scheduler.ts) always cancels everything and reschedules fresh from this
// output, so any input change here is, by construction, a full rebuild.
export function buildNotificationSchedule(inputs: ScheduleInputs): NotificationSpec[] {
  const specs: NotificationSpec[] = [];

  if (!inputs.programCompletedAt) {
    specs.push({
      id: 'daily_lesson',
      title: 'Your daily session is ready',
      body: 'A few minutes, whenever works today.',
      trigger: { kind: 'daily', hour: inputs.dailyLessonTime.hour, minute: inputs.dailyLessonTime.minute },
    });
    specs.push({
      id: 'evening_checkin',
      title: 'Quick check-in?',
      body: 'Thirty seconds to close out your day.',
      trigger: { kind: 'daily', hour: inputs.eveningCheckinTime.hour, minute: inputs.eveningCheckinTime.minute },
    });
  } else {
    const weeklyBoosterEnabled = inputs.maintenancePlan?.weeklyBoosterEnabled ?? true;
    if (weeklyBoosterEnabled) {
      specs.push({
        id: 'weekly_booster',
        title: "This week's session is ready",
        body: 'One short sharpening lesson, whenever works.',
        trigger: {
          kind: 'weekly',
          // Same weekday the user graduated on, at their usual lesson time.
          weekday: new Date(inputs.programCompletedAt).getDay() + 1,
          hour: inputs.dailyLessonTime.hour,
          minute: inputs.dailyLessonTime.minute,
        },
      });
    }

    const cadence = inputs.maintenancePlan?.cadence;
    if (cadence) {
      for (const weekday of cadenceToWeekdays(cadence)) {
        specs.push({
          id: `maintenance_checkin_${weekday}`,
          title: 'Quick check-in?',
          body: 'Thirty seconds to close out your day.',
          trigger: { kind: 'weekly', weekday, hour: inputs.eveningCheckinTime.hour, minute: inputs.eveningCheckinTime.minute },
        });
      }
    }
  }

  const reassessmentEnabled = inputs.programCompletedAt
    ? (inputs.maintenancePlan?.reassessmentReminderEnabled ?? true)
    : true;
  if (reassessmentEnabled) {
    specs.push({
      id: 'reassessment',
      title: 'Your 2-week check-in',
      body: 'Ninety seconds to see your trend.',
      trigger: { kind: 'date', date: nextReassessmentDate(inputs.lastAssessedAt, inputs.now) },
    });
  }

  if (inputs.riskyWindow?.enabled) {
    const time = riskyWindowReminderTime(inputs.riskyWindow.window);
    const copy = riskyWindowReminderCopy(inputs.riskyWindow.window);
    specs.push({
      id: 'risky_window',
      title: copy.title,
      body: copy.body,
      trigger: { kind: 'daily', hour: time.hour, minute: time.minute },
    });
  }

  return specs;
}
