import { useCommitmentGoalsStore } from '@/features/progress/useCommitmentGoalsStore';

const fullDay = { lessonCompleted: true, checkinCompleted: true, cleanDay: true, lapseDebriefed: false };

describe('useCommitmentGoalsStore', () => {
  afterEach(() => {
    useCommitmentGoalsStore.getState().reset();
  });

  it('starts opted out, with no goal', () => {
    const state = useCommitmentGoalsStore.getState();
    expect(state.optedIn).toBe(false);
    expect(state.goal).toBeNull();
  });

  it('opting in creates a goal at the bottom of the ladder', () => {
    useCommitmentGoalsStore.getState().optIn('A weekend trip', 5);
    const state = useCommitmentGoalsStore.getState();
    expect(state.optedIn).toBe(true);
    expect(state.rewardName).toBe('A weekend trip');
    expect(state.dailyPledgeAmount).toBe(5);
    expect(state.goal?.tier).toBe(7);
  });

  it('records daily credit exactly once per calendar date key (idempotent)', () => {
    useCommitmentGoalsStore.getState().optIn('Reward', 5);
    useCommitmentGoalsStore.getState().recordDailyCredit(fullDay, '2026-01-01');
    useCommitmentGoalsStore.getState().recordDailyCredit(fullDay, '2026-01-01'); // same day again — ignored
    expect(useCommitmentGoalsStore.getState().goal?.accumulatedCredit).toBeCloseTo(1);

    useCommitmentGoalsStore.getState().recordDailyCredit(fullDay, '2026-01-02');
    expect(useCommitmentGoalsStore.getState().goal?.accumulatedCredit).toBeCloseTo(2);
  });

  it('applies a lapse delay to the active goal', () => {
    useCommitmentGoalsStore.getState().optIn('Reward', 5);
    useCommitmentGoalsStore.getState().applyLapseToGoal();
    expect(useCommitmentGoalsStore.getState().goal?.delayDays).toBe(2);
  });

  it('steps down a rung on explicit request', () => {
    useCommitmentGoalsStore.getState().optIn('Reward', 5);
    useCommitmentGoalsStore.setState((state) => ({ goal: state.goal ? { ...state.goal, tier: 30 } : state.goal }));
    useCommitmentGoalsStore.getState().stepDownGoal();
    expect(useCommitmentGoalsStore.getState().goal?.tier).toBe(14);
  });

  it('reset clears opt-in state entirely', () => {
    useCommitmentGoalsStore.getState().optIn('Reward', 5);
    useCommitmentGoalsStore.getState().reset();
    const state = useCommitmentGoalsStore.getState();
    expect(state.optedIn).toBe(false);
    expect(state.goal).toBeNull();
  });
});
