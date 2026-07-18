import { useEffect } from 'react';

import { useProgramStore } from '@/features/program/useProgramStore';
import { useSettingsStore } from '@/features/settings/useSettingsStore';
import { useAssessmentHistoryStore } from '@/features/assessment/useAssessmentHistoryStore';
import { useToolkitStore } from '@/features/toolkit/useToolkitStore';
import { evaluateRiskyWindowEligibility } from '@/lib/notifications/riskyWindow';
import { buildNotificationSchedule } from '@/lib/notifications/schedule';
import { applyNotificationSchedule } from '@/lib/notifications/scheduler';
import { getNotificationPermissionStatus } from '@/lib/notifications/availability';

function latestAssessmentTimestamp(entries: { timestamp: string }[]): string | null {
  if (entries.length === 0) return null;
  return entries.reduce((latest, e) => (e.timestamp > latest ? e.timestamp : latest), entries[0].timestamp);
}

// Mounted once at the app root (PRODUCT_SPEC §7). Rebuilds the entire local
// notification schedule whenever anything it depends on changes — preference
// times, maintenance plan/cadence, the risky-window opt-in, program
// completion, or a new assessment/urge-log entry. applyNotificationSchedule
// always cancels everything and reschedules fresh, so every change here is,
// by construction, a full cancel-and-rebuild (PRODUCT_SPEC §7's requirement).
// INC-2: skips entirely (no scheduling attempt) unless permission is already
// granted — never shows a raw error if notifications are unavailable.
export function useNotificationScheduler() {
  const programCompletedAt = useProgramStore((s) => s.programCompletedAt);
  const dailyLessonTime = useSettingsStore((s) => s.dailyLessonTime);
  const eveningCheckinTime = useSettingsStore((s) => s.eveningCheckinTime);
  const maintenancePlan = useSettingsStore((s) => s.maintenancePlan);
  const riskyWindowReminderEnabled = useSettingsStore((s) => s.riskyWindowReminderEnabled);
  const urgeLogs = useToolkitStore((s) => s.urgeLogs);
  const toolUses = useToolkitStore((s) => s.toolUses);
  const assessmentEntries = useAssessmentHistoryStore((s) => s.entries);

  const dailyLessonHour = dailyLessonTime.hour;
  const dailyLessonMinute = dailyLessonTime.minute;
  const eveningCheckinHour = eveningCheckinTime.hour;
  const eveningCheckinMinute = eveningCheckinTime.minute;
  const cadence = maintenancePlan?.cadence;
  const reassessmentReminderEnabled = maintenancePlan?.reassessmentReminderEnabled;
  const weeklyBoosterEnabled = maintenancePlan?.weeklyBoosterEnabled;
  const urgeLogCount = urgeLogs.length;
  const toolUseCount = toolUses.length;
  const assessmentCount = assessmentEntries.length;

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const status = await getNotificationPermissionStatus();
      if (status !== 'granted' || cancelled) return;

      const eligibility = evaluateRiskyWindowEligibility(
        urgeLogs.map((u) => u.timestamp),
        toolUses
      );

      const specs = buildNotificationSchedule({
        now: new Date(),
        programCompletedAt,
        dailyLessonTime: { hour: dailyLessonHour, minute: dailyLessonMinute },
        eveningCheckinTime: { hour: eveningCheckinHour, minute: eveningCheckinMinute },
        maintenancePlan: maintenancePlan ?? null,
        lastAssessedAt: latestAssessmentTimestamp(assessmentEntries),
        riskyWindow:
          riskyWindowReminderEnabled && eligibility.eligible && eligibility.window
            ? { enabled: true, window: eligibility.window }
            : null,
      });

      if (!cancelled) await applyNotificationSchedule(specs);
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    programCompletedAt,
    dailyLessonHour,
    dailyLessonMinute,
    eveningCheckinHour,
    eveningCheckinMinute,
    cadence,
    reassessmentReminderEnabled,
    weeklyBoosterEnabled,
    riskyWindowReminderEnabled,
    urgeLogCount,
    toolUseCount,
    assessmentCount,
  ]);
}
