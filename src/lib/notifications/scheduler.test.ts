const mockCancelAll = jest.fn();
const mockSchedule = jest.fn();
const callOrder: string[] = [];

// INC-11: reference outer mock* variables only through a closure, never directly.
jest.mock('expo-notifications', () => ({
  SchedulableTriggerInputTypes: { DAILY: 'daily', WEEKLY: 'weekly', DATE: 'date' },
  cancelAllScheduledNotificationsAsync: (...args: unknown[]) => {
    callOrder.push('cancelAll');
    return mockCancelAll(...args);
  },
  scheduleNotificationAsync: (...args: unknown[]) => {
    callOrder.push('schedule');
    return mockSchedule(...args);
  },
}));

import { applyNotificationSchedule } from '@/lib/notifications/scheduler';
import type { NotificationSpec } from '@/lib/notifications/schedule';

describe('applyNotificationSchedule (reschedule-on-change: always cancel-all then rebuild fresh)', () => {
  beforeEach(() => {
    mockCancelAll.mockReset().mockResolvedValue(undefined);
    mockSchedule.mockReset().mockResolvedValue('some-id');
    callOrder.length = 0;
  });

  it('cancels every previously-scheduled notification before scheduling anything new', async () => {
    const specs: NotificationSpec[] = [
      { id: 'daily_lesson', title: 'Your daily session is ready', body: 'b', trigger: { kind: 'daily', hour: 8, minute: 0 } },
    ];
    await applyNotificationSchedule(specs);

    expect(mockCancelAll).toHaveBeenCalledTimes(1);
    expect(mockSchedule).toHaveBeenCalledTimes(1);
    expect(callOrder).toEqual(['cancelAll', 'schedule']);
  });

  it('schedules one entry per spec, translating each trigger kind to the matching Expo trigger shape', async () => {
    const specs: NotificationSpec[] = [
      { id: 'daily_lesson', title: 'T1', body: 'B1', trigger: { kind: 'daily', hour: 8, minute: 0 } },
      { id: 'maintenance_checkin_2', title: 'T2', body: 'B2', trigger: { kind: 'weekly', weekday: 2, hour: 21, minute: 30 } },
      { id: 'reassessment', title: 'T3', body: 'B3', trigger: { kind: 'date', date: '2024-06-15T10:00:00.000Z' } },
    ];
    await applyNotificationSchedule(specs);

    expect(mockSchedule).toHaveBeenCalledTimes(3);
    expect(mockSchedule).toHaveBeenCalledWith({
      identifier: 'daily_lesson',
      content: { title: 'T1', body: 'B1' },
      trigger: { type: 'daily', hour: 8, minute: 0 },
    });
    expect(mockSchedule).toHaveBeenCalledWith({
      identifier: 'maintenance_checkin_2',
      content: { title: 'T2', body: 'B2' },
      trigger: { type: 'weekly', weekday: 2, hour: 21, minute: 30 },
    });
    expect(mockSchedule).toHaveBeenCalledWith({
      identifier: 'reassessment',
      content: { title: 'T3', body: 'B3' },
      trigger: { type: 'date', date: new Date('2024-06-15T10:00:00.000Z') },
    });
  });

  it('cancels everything (schedules nothing new) when given an empty spec list — e.g. all opt-ins turned off', async () => {
    await applyNotificationSchedule([]);
    expect(mockCancelAll).toHaveBeenCalledTimes(1);
    expect(mockSchedule).not.toHaveBeenCalled();
  });
});
