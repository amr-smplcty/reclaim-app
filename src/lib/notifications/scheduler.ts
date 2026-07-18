import * as Notifications from 'expo-notifications';

import type { NotificationSpec, NotificationTrigger } from '@/lib/notifications/schedule';

function toExpoTrigger(trigger: NotificationTrigger): Notifications.NotificationTriggerInput {
  switch (trigger.kind) {
    case 'daily':
      return { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour: trigger.hour, minute: trigger.minute };
    case 'weekly':
      return {
        type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
        weekday: trigger.weekday,
        hour: trigger.hour,
        minute: trigger.minute,
      };
    case 'date':
      return { type: Notifications.SchedulableTriggerInputTypes.DATE, date: new Date(trigger.date) };
  }
}

// Any preference/cadence change must cancel and rebuild the whole schedule
// (PRODUCT_SPEC §7). Cancel-all-then-reschedule-fresh guarantees that with no
// stale-identifier bookkeeping, since this app never schedules anything
// through expo-notifications outside this module.
export async function applyNotificationSchedule(specs: NotificationSpec[]): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
  for (const spec of specs) {
    await Notifications.scheduleNotificationAsync({
      identifier: spec.id,
      content: { title: spec.title, body: spec.body },
      trigger: toExpoTrigger(spec.trigger),
    });
  }
}
