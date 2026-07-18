import { buildNotificationSchedule, cadenceToWeekdays, type ScheduleInputs } from '@/lib/notifications/schedule';

const NOW = new Date('2024-06-10T12:00:00.000Z'); // a Monday

function baseInputs(overrides: Partial<ScheduleInputs> = {}): ScheduleInputs {
  return {
    now: NOW,
    programCompletedAt: null,
    dailyLessonTime: { hour: 8, minute: 0 },
    eveningCheckinTime: { hour: 21, minute: 30 },
    maintenancePlan: null,
    lastAssessedAt: null,
    riskyWindow: null,
    ...overrides,
  };
}

describe('buildNotificationSchedule — active program (schedule construction from prefs)', () => {
  it('builds daily lesson + evening check-in at the user-chosen times', () => {
    const specs = buildNotificationSchedule(baseInputs());
    const lesson = specs.find((s) => s.id === 'daily_lesson');
    const checkin = specs.find((s) => s.id === 'evening_checkin');

    expect(lesson?.trigger).toEqual({ kind: 'daily', hour: 8, minute: 0 });
    expect(checkin?.trigger).toEqual({ kind: 'daily', hour: 21, minute: 30 });
  });

  it('reflects a changed preference time directly in the built trigger', () => {
    const specs = buildNotificationSchedule(
      baseInputs({ dailyLessonTime: { hour: 6, minute: 45 }, eveningCheckinTime: { hour: 22, minute: 15 } })
    );
    expect(specs.find((s) => s.id === 'daily_lesson')?.trigger).toEqual({ kind: 'daily', hour: 6, minute: 45 });
    expect(specs.find((s) => s.id === 'evening_checkin')?.trigger).toEqual({ kind: 'daily', hour: 22, minute: 15 });
  });

  it('includes a reassessment reminder even with no maintenance plan (spec applies generally, every 14 days)', () => {
    const specs = buildNotificationSchedule(baseInputs());
    expect(specs.find((s) => s.id === 'reassessment')).toBeDefined();
  });

  it('never includes maintenance-only notifications while the program is active', () => {
    const specs = buildNotificationSchedule(baseInputs());
    expect(specs.find((s) => s.id === 'weekly_booster')).toBeUndefined();
    expect(specs.find((s) => s.id.startsWith('maintenance_checkin'))).toBeUndefined();
  });

  it('includes the risky-window reminder only when opted in and a window is known', () => {
    const withRiskyWindow = buildNotificationSchedule(baseInputs({ riskyWindow: { enabled: true, window: 'late_night' } }));
    const without = buildNotificationSchedule(baseInputs({ riskyWindow: null }));

    expect(withRiskyWindow.find((s) => s.id === 'risky_window')?.trigger).toEqual({ kind: 'daily', hour: 21, minute: 30 });
    expect(without.find((s) => s.id === 'risky_window')).toBeUndefined();
  });
});

describe('buildNotificationSchedule — maintenance-shape transition', () => {
  it('drops the active-program notifications and switches to the maintenance shape once graduated', () => {
    const specs = buildNotificationSchedule(
      baseInputs({
        programCompletedAt: '2024-05-01T09:00:00.000Z',
        maintenancePlan: { cadence: 'Weekdays', reassessmentReminderEnabled: true, weeklyBoosterEnabled: true },
      })
    );

    expect(specs.find((s) => s.id === 'daily_lesson')).toBeUndefined();
    expect(specs.find((s) => s.id === 'evening_checkin')).toBeUndefined();
    expect(specs.find((s) => s.id === 'weekly_booster')).toBeDefined();
    expect(specs.filter((s) => s.id.startsWith('maintenance_checkin'))).toHaveLength(5); // Mon-Fri
  });

  it('respects the weekly-booster opt-out while keeping check-in cadence', () => {
    const specs = buildNotificationSchedule(
      baseInputs({
        programCompletedAt: '2024-05-01T09:00:00.000Z',
        maintenancePlan: { cadence: 'Daily', reassessmentReminderEnabled: true, weeklyBoosterEnabled: false },
      })
    );
    expect(specs.find((s) => s.id === 'weekly_booster')).toBeUndefined();
    expect(specs.filter((s) => s.id.startsWith('maintenance_checkin'))).toHaveLength(7);
  });

  it('respects the reassessment-reminder opt-out in maintenance mode', () => {
    const specs = buildNotificationSchedule(
      baseInputs({
        programCompletedAt: '2024-05-01T09:00:00.000Z',
        maintenancePlan: { cadence: 'Weekly', reassessmentReminderEnabled: false, weeklyBoosterEnabled: true },
      })
    );
    expect(specs.find((s) => s.id === 'reassessment')).toBeUndefined();
  });

  it('defaults reassessment + weekly booster on when programCompletedAt is set but no plan was ever saved', () => {
    const specs = buildNotificationSchedule(baseInputs({ programCompletedAt: '2024-05-01T09:00:00.000Z', maintenancePlan: null }));
    expect(specs.find((s) => s.id === 'weekly_booster')).toBeDefined();
    expect(specs.find((s) => s.id === 'reassessment')).toBeDefined();
  });
});

describe('cadenceToWeekdays', () => {
  it('maps every known cadence option to iOS calendar weekdays (1=Sun..7=Sat)', () => {
    expect(cadenceToWeekdays('Daily')).toEqual([1, 2, 3, 4, 5, 6, 7]);
    expect(cadenceToWeekdays('Weekdays')).toEqual([2, 3, 4, 5, 6]);
    expect(cadenceToWeekdays('3 evenings a week')).toHaveLength(3);
    expect(cadenceToWeekdays('Weekly')).toHaveLength(1);
  });

  it('falls back to Daily for an unrecognized cadence rather than scheduling nothing', () => {
    expect(cadenceToWeekdays('some future content option')).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });
});
