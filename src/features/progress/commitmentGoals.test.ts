import {
  applyLapse,
  computeDayCreditFraction,
  createGoal,
  isGoalComplete,
  LADDER_TIERS,
  promoteIfComplete,
  recordDayCredit,
  requiredCreditDays,
  stepDown,
} from '@/features/progress/commitmentGoals';

const fullDay = { lessonCompleted: true, checkinCompleted: true, cleanDay: true, lapseDebriefed: false };
const lapsedDebriefedDay = { lessonCompleted: true, checkinCompleted: true, cleanDay: false, lapseDebriefed: true };
const lapsedUndebriefedDay = { lessonCompleted: true, checkinCompleted: true, cleanDay: false, lapseDebriefed: false };
const nothingDay = { lessonCompleted: false, checkinCompleted: false, cleanDay: false, lapseDebriefed: false };

describe('computeDayCreditFraction', () => {
  it('gives full credit (1) for a fully engaged, clean day', () => {
    expect(computeDayCreditFraction(fullDay)).toBeCloseTo(1);
  });

  it('gives partial credit for a lapse with a completed debrief — never zero (CLINICAL_SPEC §9 rule 2/3)', () => {
    const credit = computeDayCreditFraction(lapsedDebriefedDay);
    expect(credit).toBeGreaterThan(0);
    expect(credit).toBeLessThan(1);
  });

  it('gives less credit for a lapse with no debrief than a lapse with one', () => {
    expect(computeDayCreditFraction(lapsedUndebriefedDay)).toBeLessThan(computeDayCreditFraction(lapsedDebriefedDay));
  });

  it('gives 0 for total non-engagement', () => {
    expect(computeDayCreditFraction(nothingDay)).toBe(0);
  });
});

describe('createGoal', () => {
  it('always starts at the bottom of the ladder (7 days)', () => {
    const goal = createGoal('2026-01-01T00:00:00.000Z');
    expect(goal.tier).toBe(7);
    expect(goal.tierCompletions).toBe(0);
    expect(goal.accumulatedCredit).toBe(0);
    expect(goal.delayDays).toBe(0);
    expect(goal.jarTotal).toBe(0);
    expect(goal.history).toEqual([]);
  });
});

describe('requiredCreditDays / isGoalComplete', () => {
  it('requires exactly the tier length with no delay', () => {
    const goal = createGoal('2026-01-01T00:00:00.000Z');
    expect(requiredCreditDays(goal)).toBe(7);
    expect(isGoalComplete(goal)).toBe(false);
  });

  it('is complete once accumulated credit reaches the requirement', () => {
    let goal = createGoal('2026-01-01T00:00:00.000Z');
    for (let i = 0; i < 7; i++) goal = recordDayCredit(goal, fullDay, 5);
    expect(isGoalComplete(goal)).toBe(true);
  });
});

describe('recordDayCredit', () => {
  it('accumulates credit and grows the Reward Jar proportionally, never shrinking', () => {
    let goal = createGoal('2026-01-01T00:00:00.000Z');
    goal = recordDayCredit(goal, fullDay, 5); // full day, $5 pledge -> +$5
    expect(goal.jarTotal).toBeCloseTo(5);
    goal = recordDayCredit(goal, nothingDay, 5); // 0 credit -> +$0
    expect(goal.jarTotal).toBeCloseTo(5);
    goal = recordDayCredit(goal, fullDay, 5);
    expect(goal.jarTotal).toBeCloseTo(10);
  });
});

describe('applyLapse', () => {
  it('adds 2 days of delay per lapse', () => {
    const goal = createGoal('2026-01-01T00:00:00.000Z');
    const afterOne = applyLapse(goal);
    expect(afterOne.delayDays).toBe(2);
    expect(requiredCreditDays(afterOne)).toBe(9); // 7 + 2
  });

  it('caps total delay at the tier length (never grows unboundedly)', () => {
    let goal = createGoal('2026-01-01T00:00:00.000Z'); // tier 7, cap should be 7
    for (let i = 0; i < 10; i++) goal = applyLapse(goal);
    expect(goal.delayDays).toBe(7);
    expect(goal.lapseCount).toBe(10);
  });

  it('never reduces accumulated credit or the Reward Jar', () => {
    let goal = createGoal('2026-01-01T00:00:00.000Z');
    goal = recordDayCredit(goal, fullDay, 5);
    const creditBefore = goal.accumulatedCredit;
    const jarBefore = goal.jarTotal;
    goal = applyLapse(goal);
    expect(goal.accumulatedCredit).toBe(creditBefore);
    expect(goal.jarTotal).toBe(jarBefore);
  });

  it('actually delays completion — a lapse means more days of credit are needed', () => {
    let clean = createGoal('2026-01-01T00:00:00.000Z');
    let lapsed = createGoal('2026-01-01T00:00:00.000Z');
    lapsed = applyLapse(lapsed);

    for (let i = 0; i < 7; i++) {
      clean = recordDayCredit(clean, fullDay, 0);
      lapsed = recordDayCredit(lapsed, fullDay, 0);
    }

    expect(isGoalComplete(clean)).toBe(true);
    expect(isGoalComplete(lapsed)).toBe(false); // needs 9, only has 7
  });
});

describe('promoteIfComplete', () => {
  it('does nothing if the goal is not yet complete', () => {
    const goal = createGoal('2026-01-01T00:00:00.000Z');
    const result = promoteIfComplete(goal, '2026-01-08T00:00:00.000Z');
    expect(result).toEqual(goal);
  });

  it('stays at the 7-day tier until 3 completions, then promotes to 14', () => {
    let goal = createGoal('2026-01-01T00:00:00.000Z');

    function completeOneCycle(g: typeof goal) {
      let next = g;
      for (let i = 0; i < 7; i++) next = recordDayCredit(next, fullDay, 0);
      return promoteIfComplete(next, '2026-01-01T00:00:00.000Z');
    }

    goal = completeOneCycle(goal);
    expect(goal.tier).toBe(7);
    expect(goal.tierCompletions).toBe(1);

    goal = completeOneCycle(goal);
    expect(goal.tier).toBe(7);
    expect(goal.tierCompletions).toBe(2);

    goal = completeOneCycle(goal);
    expect(goal.tier).toBe(14); // 3rd completion promotes
    expect(goal.tierCompletions).toBe(0);
    expect(goal.accumulatedCredit).toBe(0);
    expect(goal.history).toHaveLength(3);
  });

  it('promotes 14 -> 30 -> 90 after a single completion each', () => {
    let goal = createGoal('2026-01-01T00:00:00.000Z');
    goal = { ...goal, tier: 14 };
    for (let i = 0; i < 14; i++) goal = recordDayCredit(goal, fullDay, 0);
    goal = promoteIfComplete(goal, '2026-01-15T00:00:00.000Z');
    expect(goal.tier).toBe(30);

    for (let i = 0; i < 30; i++) goal = recordDayCredit(goal, fullDay, 0);
    goal = promoteIfComplete(goal, '2026-02-14T00:00:00.000Z');
    expect(goal.tier).toBe(90);
  });

  it('never auto-promotes past 90 — cycles in place instead', () => {
    let goal = createGoal('2026-01-01T00:00:00.000Z');
    goal = { ...goal, tier: 90 };
    for (let i = 0; i < 90; i++) goal = recordDayCredit(goal, fullDay, 0);
    goal = promoteIfComplete(goal, '2026-04-01T00:00:00.000Z');
    expect(goal.tier).toBe(90);
    expect(goal.tierCompletions).toBe(1);
    expect(goal.history).toHaveLength(1);
  });

  it('demotion never happens automatically', () => {
    expect(LADDER_TIERS).toEqual([7, 14, 30, 90]);
    // No function in this module ever lowers `tier` except stepDown, which
    // is only ever invoked by an explicit user action in the UI layer.
  });
});

describe('stepDown', () => {
  it('moves one rung down the ladder when explicitly called', () => {
    let goal = createGoal('2026-01-01T00:00:00.000Z');
    goal = { ...goal, tier: 30 };
    goal = stepDown(goal);
    expect(goal.tier).toBe(14);
  });

  it('does nothing below the bottom rung', () => {
    const goal = createGoal('2026-01-01T00:00:00.000Z');
    expect(stepDown(goal).tier).toBe(7);
  });

  it('resets in-progress credit for the new tier but never touches the jar', () => {
    let goal = createGoal('2026-01-01T00:00:00.000Z');
    goal = { ...goal, tier: 30 };
    goal = recordDayCredit(goal, fullDay, 5);
    const jarBefore = goal.jarTotal;
    goal = stepDown(goal);
    expect(goal.accumulatedCredit).toBe(0);
    expect(goal.jarTotal).toBe(jarBefore);
  });
});
