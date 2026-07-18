const mockGetStatus = jest.fn();
const mockApply = jest.fn();

// INC-11: reference outer mock* variables only through a closure, never directly.
jest.mock('@/lib/notifications/availability', () => ({
  getNotificationPermissionStatus: (...args: unknown[]) => mockGetStatus(...args),
}));
jest.mock('@/lib/notifications/scheduler', () => ({
  applyNotificationSchedule: (...args: unknown[]) => mockApply(...args),
}));

import { renderHook, waitFor } from '@testing-library/react-native';

import { useNotificationScheduler } from '@/features/notifications/useNotificationScheduler';
import { useSettingsStore } from '@/features/settings/useSettingsStore';
import { useProgramStore } from '@/features/program/useProgramStore';

describe('useNotificationScheduler (reschedule-on-change, wired to real stores)', () => {
  beforeEach(() => {
    mockGetStatus.mockReset().mockResolvedValue('granted');
    mockApply.mockReset().mockResolvedValue(undefined);
  });

  afterEach(() => {
    useSettingsStore.getState().reset();
    useProgramStore.getState().reset();
  });

  it('schedules on mount once permission is granted', async () => {
    renderHook(() => useNotificationScheduler());
    await waitFor(() => expect(mockApply).toHaveBeenCalledTimes(1));
  });

  it('never calls the scheduler when permission is not granted (INC-2 graceful skip)', async () => {
    mockGetStatus.mockResolvedValue('denied');
    renderHook(() => useNotificationScheduler());
    // Give the async effect a chance to run before asserting the negative.
    await waitFor(() => expect(mockGetStatus).toHaveBeenCalled());
    expect(mockApply).not.toHaveBeenCalled();
  });

  it('rebuilds the schedule when a notification-relevant preference changes', async () => {
    renderHook(() => useNotificationScheduler());
    await waitFor(() => expect(mockApply).toHaveBeenCalledTimes(1));

    useSettingsStore.getState().setDailyLessonTime({ hour: 6, minute: 0 });

    await waitFor(() => expect(mockApply).toHaveBeenCalledTimes(2));
    const secondCallSpecs = mockApply.mock.calls[1][0];
    expect(secondCallSpecs.find((s: { id: string }) => s.id === 'daily_lesson').trigger).toEqual({
      kind: 'daily',
      hour: 6,
      minute: 0,
    });
  });

  it('rebuilds into the maintenance shape when the program completes', async () => {
    renderHook(() => useNotificationScheduler());
    await waitFor(() => expect(mockApply).toHaveBeenCalledTimes(1));

    useProgramStore.getState().completeProgram();

    await waitFor(() => expect(mockApply).toHaveBeenCalledTimes(2));
    const secondCallSpecs = mockApply.mock.calls[1][0];
    expect(secondCallSpecs.find((s: { id: string }) => s.id === 'daily_lesson')).toBeUndefined();
  });
});
