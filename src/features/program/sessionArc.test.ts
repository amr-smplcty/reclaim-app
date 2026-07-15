import { computeSessionArcProgress } from '@/features/program/sessionArc';

describe('computeSessionArcProgress', () => {
  it('is 0 of 3 with no completion record at all', () => {
    expect(computeSessionArcProgress(undefined)).toEqual({ completedCount: 0, totalCount: 3 });
  });

  it('counts each of lesson/exercise/checkin independently', () => {
    expect(
      computeSessionArcProgress({ lessonComplete: true, exerciseComplete: false, checkinComplete: false })
    ).toEqual({ completedCount: 1, totalCount: 3 });

    expect(
      computeSessionArcProgress({ lessonComplete: true, exerciseComplete: true, checkinComplete: false })
    ).toEqual({ completedCount: 2, totalCount: 3 });
  });

  it('is 3 of 3 when everything for the day is complete', () => {
    expect(
      computeSessionArcProgress({ lessonComplete: true, exerciseComplete: true, checkinComplete: true })
    ).toEqual({ completedCount: 3, totalCount: 3 });
  });
});
