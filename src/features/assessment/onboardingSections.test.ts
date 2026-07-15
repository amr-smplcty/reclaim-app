import { sectionProgressFor, SECTION_LABEL } from '@/features/assessment/onboardingSections';

describe('sectionProgressFor', () => {
  it('returns undefined for welcome (pre-section contract screen)', () => {
    expect(sectionProgressFor('welcome')).toBeUndefined();
  });

  it('places the first "about you" step at a partial fill', () => {
    const result = sectionProgressFor('age');
    expect(result).toEqual({ section: 'about-you', fill: 1 / 8 });
  });

  it('fills "about you" completely on its last step', () => {
    const result = sectionProgressFor('insight-quits');
    expect(result).toEqual({ section: 'about-you', fill: 1 });
  });

  it('starts "the screening" section fresh, independent of prior section', () => {
    const result = sectionProgressFor('disclaimer');
    expect(result).toEqual({ section: 'screening', fill: 1 / 3 });
  });

  it('fills "the screening" completely on mood', () => {
    expect(sectionProgressFor('mood')).toEqual({ section: 'screening', fill: 1 });
  });

  it('starts "your results" section fresh on the results screen', () => {
    expect(sectionProgressFor('results')).toEqual({ section: 'results', fill: 1 / 5 });
  });

  it('fills "your results" completely on the final step', () => {
    expect(sectionProgressFor('paywall')).toEqual({ section: 'results', fill: 1 });
  });

  it('has a display label for every section', () => {
    expect(SECTION_LABEL['about-you']).toBe('About you');
    expect(SECTION_LABEL.screening).toBe('The screening');
    expect(SECTION_LABEL.results).toBe('Your results');
  });
});
