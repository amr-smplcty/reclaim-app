import { useToolkitStore } from '@/features/toolkit/useToolkitStore';
import { buildUrgeEventTimestamps, findDominantTimeWindow } from '@/features/progress/patternInsights';

// End-to-end regression (Epic 8 reconciliation): practice sessions (Week 3
// tool_practice — CLINICAL_SPEC §4 "practice while calm") must never
// contaminate the clinical/analytical urge-pattern reads, even when the data
// flows through the real, persisted useToolkitStore rather than a hand-built
// fixture. Growth visual / milestones are a separate, intentional exception
// — see progress.tsx: those reward practice on purpose (process, not purity).
describe('practice-session exclusion end to end (real useToolkitStore)', () => {
  afterEach(() => {
    useToolkitStore.getState().reset();
  });

  it('excludes practice-flagged tool uses from buildUrgeEventTimestamps when read from the real store', () => {
    const store = useToolkitStore.getState();
    // Real urges, clustered in the afternoon.
    store.logUrge({ intensity: 6, trigger: 'stress', location: 'home', whatHappenedNext: 'used a tool' });
    // A real (non-practice) tool use — also counts as a genuine urge event.
    store.logToolUse('breather', 6, 3, false);
    // Practice sessions from a Week 3 tool_practice exercise — must be excluded.
    store.logToolUse('urge_surf', 0, 0, true);
    store.logToolUse('ten_minute_shift', 0, 0, true);

    const { urgeLogs, toolUses } = useToolkitStore.getState();
    const timestamps = buildUrgeEventTimestamps({
      urgeLogTimestamps: urgeLogs.map((u) => u.timestamp),
      toolUses,
    });

    // 1 urge log + 1 real tool use = 2 timestamps; the 2 practice sessions
    // excluded. (Length, not timestamp identity, is the real proof here —
    // logging several entries synchronously can land on the same
    // millisecond, so comparing exact timestamp strings would be flaky.)
    expect(toolUses).toHaveLength(3);
    expect(toolUses.filter((t) => t.practice)).toHaveLength(2);
    expect(timestamps).toHaveLength(2);
  });

  it('does not let a burst of practice sessions manufacture a fake time-of-day pattern', () => {
    const store = useToolkitStore.getState();

    // 3 real urges, spread out (no dominant window).
    store.logUrge({ intensity: 5, trigger: 'boredom', location: 'home', whatHappenedNext: '' });
    store.logUrge({ intensity: 5, trigger: 'boredom', location: 'home', whatHappenedNext: '' });
    store.logUrge({ intensity: 5, trigger: 'boredom', location: 'home', whatHappenedNext: '' });

    // Several practice sessions, all logged "late at night" purely because
    // that's when the user happened to do the lesson — must not create a
    // "your urges cluster late at night" insight from rehearsal data alone.
    for (let i = 0; i < 6; i++) {
      store.logToolUse('urge_surf', 0, 0, true);
    }

    const { urgeLogs, toolUses } = useToolkitStore.getState();
    const timestamps = buildUrgeEventTimestamps({
      urgeLogTimestamps: urgeLogs.map((u) => u.timestamp),
      toolUses,
    });

    // Only the 3 real urge logs remain — below the ≥5 minimum, so no
    // (potentially practice-skewed) insight is manufactured at all.
    expect(timestamps).toHaveLength(3);
    expect(findDominantTimeWindow(timestamps)).toBeNull();
  });
});
