import { computeGrowthScore, computeGrowthStage, GROWTH_STAGE_COUNT } from '@/features/progress/growthStage';

const noEvents = { sessionsCompleted: 0, urgesSurfed: 0, debriefsDone: 0, checkins: 0 };

describe('computeGrowthScore', () => {
  it('is 0 with no practice events at all', () => {
    expect(computeGrowthScore(noEvents)).toBe(0);
  });

  it('sums every practice-behavior count — process, not outcome', () => {
    expect(computeGrowthScore({ sessionsCompleted: 3, urgesSurfed: 2, debriefsDone: 1, checkins: 4 })).toBe(10);
  });
});

describe('computeGrowthStage', () => {
  it('starts at stage 0 with no growth score', () => {
    expect(computeGrowthStage(0)).toBe(0);
  });

  it('never exceeds the maximum stage, however large the score', () => {
    expect(computeGrowthStage(1_000_000)).toBe(GROWTH_STAGE_COUNT - 1);
  });

  it('increases in discrete steps as the score grows', () => {
    const stageAt0 = computeGrowthStage(0);
    const stageAtMax = computeGrowthStage(1000);
    expect(stageAtMax).toBeGreaterThan(stageAt0);
  });

  it('is monotonic: growth stage never decreases as the underlying score only ever grows', () => {
    let previousStage = 0;
    for (let score = 0; score <= 200; score += 3) {
      const stage = computeGrowthStage(score);
      expect(stage).toBeGreaterThanOrEqual(previousStage);
      previousStage = stage;
    }
  });

  it('is monotonic across realistic event snapshots (each only adding practice, never removing)', () => {
    const snapshots = [
      noEvents,
      { sessionsCompleted: 2, urgesSurfed: 1, debriefsDone: 0, checkins: 2 },
      { sessionsCompleted: 5, urgesSurfed: 4, debriefsDone: 1, checkins: 5 },
      { sessionsCompleted: 20, urgesSurfed: 10, debriefsDone: 3, checkins: 15 },
    ];
    let previousStage = -1;
    for (const snapshot of snapshots) {
      const stage = computeGrowthStage(computeGrowthScore(snapshot));
      expect(stage).toBeGreaterThanOrEqual(previousStage);
      previousStage = stage;
    }
  });
});
