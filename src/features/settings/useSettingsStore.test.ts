import { useSettingsStore } from '@/features/settings/useSettingsStore';

describe('useSettingsStore — notification-time preferences + app-lock opt-in (PRODUCT_SPEC §5.6)', () => {
  afterEach(() => {
    useSettingsStore.getState().reset();
  });

  it('defaults to the PRODUCT_SPEC §7 reminder times and app lock off', () => {
    const state = useSettingsStore.getState();
    expect(state.dailyLessonTime).toEqual({ hour: 8, minute: 0 });
    expect(state.eveningCheckinTime).toEqual({ hour: 21, minute: 30 });
    expect(state.appLockEnabled).toBe(false);
  });

  it('updates the daily lesson reminder time', () => {
    useSettingsStore.getState().setDailyLessonTime({ hour: 7, minute: 15 });
    expect(useSettingsStore.getState().dailyLessonTime).toEqual({ hour: 7, minute: 15 });
  });

  it('updates the evening check-in reminder time', () => {
    useSettingsStore.getState().setEveningCheckinTime({ hour: 22, minute: 0 });
    expect(useSettingsStore.getState().eveningCheckinTime).toEqual({ hour: 22, minute: 0 });
  });

  it('toggles app lock on and off', () => {
    useSettingsStore.getState().setAppLockEnabled(true);
    expect(useSettingsStore.getState().appLockEnabled).toBe(true);
    useSettingsStore.getState().setAppLockEnabled(false);
    expect(useSettingsStore.getState().appLockEnabled).toBe(false);
  });

  it('reset restores every field to its default', () => {
    useSettingsStore.getState().setDailyLessonTime({ hour: 6, minute: 45 });
    useSettingsStore.getState().setEveningCheckinTime({ hour: 23, minute: 0 });
    useSettingsStore.getState().setAppLockEnabled(true);

    useSettingsStore.getState().reset();

    const state = useSettingsStore.getState();
    expect(state.dailyLessonTime).toEqual({ hour: 8, minute: 0 });
    expect(state.eveningCheckinTime).toEqual({ hour: 21, minute: 30 });
    expect(state.appLockEnabled).toBe(false);
  });
});
