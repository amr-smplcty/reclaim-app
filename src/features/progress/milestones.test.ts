import { computeUnlockedMilestones, MILESTONES, type MilestoneId } from '@/features/progress/milestones';

const baseInputs = {
  day1LessonComplete: false,
  day1ExerciseComplete: false,
  urgesSurfedCount: 0,
  assessmentHistoryCount: 0,
  patternProfileComplete: false,
  urgeScriptWritten: false,
};

describe('computeUnlockedMilestones', () => {
  it('unlocks nothing with no engagement at all', () => {
    expect(computeUnlockedMilestones(baseInputs)).toEqual([]);
  });

  it('unlocks day_one immediately once Day 1 lesson + exercise are both done (competence-based, early-achievable)', () => {
    const result = computeUnlockedMilestones({ ...baseInputs, day1LessonComplete: true, day1ExerciseComplete: true });
    expect(result).toContain('day_one');
  });

  it('does not unlock day_one from only the lesson or only the exercise', () => {
    expect(computeUnlockedMilestones({ ...baseInputs, day1LessonComplete: true })).not.toContain('day_one');
    expect(computeUnlockedMilestones({ ...baseInputs, day1ExerciseComplete: true })).not.toContain('day_one');
  });

  it('unlocks ten_urges_surfed at 10 tool uses, not before', () => {
    expect(computeUnlockedMilestones({ ...baseInputs, urgesSurfedCount: 9 })).not.toContain('ten_urges_surfed');
    expect(computeUnlockedMilestones({ ...baseInputs, urgesSurfedCount: 10 })).toContain('ten_urges_surfed');
  });

  it('unlocks first_reassessment once assessment history has 2+ entries (onboarding + one re-take)', () => {
    expect(computeUnlockedMilestones({ ...baseInputs, assessmentHistoryCount: 1 })).not.toContain('first_reassessment');
    expect(computeUnlockedMilestones({ ...baseInputs, assessmentHistoryCount: 2 })).toContain('first_reassessment');
  });

  it('unlocks pattern_profile_complete and urge_script_written from their own flags', () => {
    const result = computeUnlockedMilestones({ ...baseInputs, patternProfileComplete: true, urgeScriptWritten: true });
    expect(result).toContain('pattern_profile_complete');
    expect(result).toContain('urge_script_written');
  });

  it('every milestone id returned is a known, labeled milestone', () => {
    const allUnlocked = computeUnlockedMilestones({
      day1LessonComplete: true,
      day1ExerciseComplete: true,
      urgesSurfedCount: 10,
      assessmentHistoryCount: 2,
      patternProfileComplete: true,
      urgeScriptWritten: true,
    });
    for (const id of allUnlocked) {
      expect(MILESTONES.some((m) => m.id === id)).toBe(true);
    }
    expect(allUnlocked).toHaveLength(MILESTONES.length);
  });

  it('is monotonic: once unlocked from ever-growing counters, never un-unlocks', () => {
    const snapshots = [
      { ...baseInputs },
      { ...baseInputs, day1LessonComplete: true, day1ExerciseComplete: true, urgesSurfedCount: 3 },
      { ...baseInputs, day1LessonComplete: true, day1ExerciseComplete: true, urgesSurfedCount: 10, assessmentHistoryCount: 1 },
      {
        ...baseInputs,
        day1LessonComplete: true,
        day1ExerciseComplete: true,
        urgesSurfedCount: 12,
        assessmentHistoryCount: 2,
        patternProfileComplete: true,
      },
    ];

    let previouslyUnlocked = new Set<MilestoneId>();
    for (const snapshot of snapshots) {
      const nowUnlocked = new Set(computeUnlockedMilestones(snapshot));
      for (const id of previouslyUnlocked) {
        expect(nowUnlocked.has(id)).toBe(true);
      }
      previouslyUnlocked = nowUnlocked;
    }
  });
});
