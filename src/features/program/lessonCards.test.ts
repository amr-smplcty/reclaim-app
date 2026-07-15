import { splitLessonIntoCards } from '@/features/program/lessonCards';

describe('splitLessonIntoCards', () => {
  it('splits at paragraph breaks — one thought per card', () => {
    const body = 'First thought.\n\nSecond thought.\n\nThird thought.';
    expect(splitLessonIntoCards(body)).toEqual(['First thought.', 'Second thought.', 'Third thought.']);
  });

  it('keeps a short paragraph as a single card', () => {
    const body = 'A short paragraph under the word limit.';
    expect(splitLessonIntoCards(body)).toEqual(['A short paragraph under the word limit.']);
  });

  it('splits a paragraph over ~55 words at sentence boundaries', () => {
    const sentence = 'This is one sentence with exactly eight words. '; // 8 words incl. period-adjacent
    const longParagraph = sentence.repeat(10).trim(); // 80 words, 10 sentences
    const cards = splitLessonIntoCards(longParagraph);

    expect(cards.length).toBeGreaterThan(1);
    for (const card of cards) {
      const wordCount = card.split(/\s+/).filter(Boolean).length;
      expect(wordCount).toBeLessThanOrEqual(60); // ~55 with some slack for sentence granularity
    }
    // No words lost or invented across the split.
    expect(cards.join(' ').split(/\s+/).filter(Boolean).length).toBe(
      longParagraph.split(/\s+/).filter(Boolean).length
    );
  });

  it('never returns an empty array — degenerate empty input falls back to one card', () => {
    expect(splitLessonIntoCards('')).toEqual(['']);
    expect(splitLessonIntoCards('   \n\n  ')).toHaveLength(1);
  });

  it('falls back to a single card when there are no paragraph breaks at all, even if long', () => {
    const noBreaks = 'word '.repeat(200).trim();
    const cards = splitLessonIntoCards(noBreaks);
    // No paragraph structure to split on — sentence-boundary splitting also
    // can't apply (no sentence punctuation), so this degenerates to one card
    // rather than crashing or losing content.
    expect(cards.join(' ')).toBe(noBreaks);
  });

  it('preserves inline markdown emphasis within a card', () => {
    const body = 'A paragraph with **bold** and *italic* text.';
    expect(splitLessonIntoCards(body)).toEqual(['A paragraph with **bold** and *italic* text.']);
  });

  it('never splits in the middle of a bold span, even if it means exceeding the word cap', () => {
    // A single paragraph, long enough to want a split, where a **bold** span
    // straddles the point that would otherwise be the natural cut.
    const filler = 'Plain word here. '.repeat(9); // ~36 words, pushes toward the cap
    const body = `${filler}**This whole sentence is bold and this next one too is bold still going.** One short closer.`;
    const cards = splitLessonIntoCards(body);

    for (const card of cards) {
      const boldMarkers = (card.match(/\*\*/g) ?? []).length;
      expect(boldMarkers % 2).toBe(0);
    }
    // No content lost.
    expect(cards.join(' ').replace(/\s+/g, ' ')).toBe(body.replace(/\s+/g, ' '));
  });

  it('never drops a sentence whose terminal punctuation is immediately followed by a non-space character (e.g. a markdown marker or closing quote)', () => {
    // Regression: the sentence-boundary regex used to require whitespace
    // right after ".!?", so "label.**" (period directly against a closing
    // bold marker, common in this content) silently dropped the whole
    // preceding sentence instead of splitting after it.
    const filler = 'Plain word here. '.repeat(9); // pushes the paragraph over the word cap
    const body = `**Third: your assessment score is your starting line, not your label.** ${filler}Closing line.`;
    const cards = splitLessonIntoCards(body);
    expect(cards.join(' ').replace(/\s+/g, ' ')).toBe(body.replace(/\s+/g, ' '));
  });

  it('keeps an unpunctuated trailing fragment instead of losing it', () => {
    const filler = 'Plain word here. '.repeat(9);
    const body = `${filler}A trailing fragment with no closing punctuation`;
    const cards = splitLessonIntoCards(body);
    expect(cards.join(' ').replace(/\s+/g, ' ').trim()).toBe(body.replace(/\s+/g, ' ').trim());
  });

  it('never splits in the middle of a single-asterisk italic span either', () => {
    // Regression: the balance check only counted "**" (bold); a run of
    // single-"*" italic lines (as content/week2.json's Day 5 uses for its
    // if-then examples) could still get cut mid-span.
    const filler = 'Plain word here. '.repeat(9);
    const body = `${filler}*If it happens, then I respond this way.*\n*If it happens again, then I still respond this way.*`;
    const cards = splitLessonIntoCards(body);

    for (const card of cards) {
      const withoutBold = card.split('**').join('');
      const italicMarkers = (withoutBold.match(/\*/g) ?? []).length;
      expect(italicMarkers % 2).toBe(0);
    }
    expect(cards.join(' ').split(/\s+/).filter(Boolean).length).toBe(body.split(/\s+/).filter(Boolean).length);
  });

  it('never throws on any input', () => {
    const wildInputs = ['', ' ', '\n', '\n\n\n', '.', '...', '**', 'a'.repeat(10_000), null as unknown as string];
    for (const input of wildInputs) {
      expect(() => splitLessonIntoCards(input)).not.toThrow();
      expect(splitLessonIntoCards(input).length).toBeGreaterThan(0);
    }
  });
});
