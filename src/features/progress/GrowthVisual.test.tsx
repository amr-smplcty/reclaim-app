import { render } from '@testing-library/react-native';

import { GrowthVisual } from '@/features/progress/GrowthVisual';

// DESIGN_SYSTEM.md §10: VoiceOver announces the growth visual as
// "N activities completed" — never a streak, never a rankable score.
describe('GrowthVisual accessibility', () => {
  it('announces the total activity count, pluralized', async () => {
    const { getByLabelText } = await render(
      <GrowthVisual events={{ sessionsCompleted: 3, urgesSurfed: 2, debriefsDone: 1, checkins: 4 }} />
    );
    // 3 + 2 + 1 + 4 = 10
    expect(getByLabelText('10 activities completed')).toBeTruthy();
  });

  it('uses the singular form for exactly one activity', async () => {
    const { getByLabelText } = await render(
      <GrowthVisual events={{ sessionsCompleted: 1, urgesSurfed: 0, debriefsDone: 0, checkins: 0 }} />
    );
    expect(getByLabelText('1 activity completed')).toBeTruthy();
  });

  it('never announces a streak, day count, or score word', async () => {
    const { queryByLabelText } = await render(
      <GrowthVisual events={{ sessionsCompleted: 5, urgesSurfed: 0, debriefsDone: 0, checkins: 0 }} />
    );
    for (const banned of [/streak/i, /day/i, /score/i]) {
      expect(queryByLabelText(banned)).toBeNull();
    }
  });
});
