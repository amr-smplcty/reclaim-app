// Lesson card splitter (PRODUCT_SPEC §5.2) — one thought per card, split from
// body_md at paragraph breaks; a paragraph over ~55 words splits further at
// sentence boundaries. Never throws and never returns zero cards on
// degenerate input (INCIDENTS.md standing rule: no user-facing render may
// crash on invalid/missing state) — worst case, the whole body becomes one
// card, same as today's single-scroll rendering.

const MAX_WORDS_PER_CARD = 55;

function wordCount(text: string): number {
  return text.split(/\s+/).filter(Boolean).length;
}

// An odd count of "**" (bold) or single "*" (italic) markers means a span is
// still open — splitting here would leave a stray marker dangling in this
// card and its unmatched partner in the next one, rendering as literal
// asterisks. Bold pairs are checked (and then stripped) before the italic
// count so a "**" never gets miscounted as two dangling "*"s.
function hasBalancedEmphasisMarkers(text: string): boolean {
  const boldCount = (text.match(/\*\*/g) ?? []).length;
  if (boldCount % 2 !== 0) return false;

  const withoutBold = text.split('**').join('');
  const italicCount = (withoutBold.match(/\*/g) ?? []).length;
  return italicCount % 2 === 0;
}

// Splits into sentence-ish chunks without requiring whitespace right after
// the terminal punctuation — sentence-ending punctuation is often followed
// immediately by a markdown marker or closing quote (e.g. "label.**"), and
// requiring trailing whitespace there would silently drop that whole
// sentence from the match (a real data-loss bug, not just a cosmetic one).
// Any unpunctuated remainder at the end (no closing ".", "!", "?") is kept
// as a final fragment rather than lost.
function sentenceChunks(paragraph: string): string[] {
  const matches = paragraph.match(/[^.!?]+[.!?]+/g) ?? [];
  const matchedLength = matches.reduce((sum, m) => sum + m.length, 0);
  return matchedLength < paragraph.length ? [...matches, paragraph.slice(matchedLength)] : matches;
}

function splitLongParagraphBySentence(paragraph: string): string[] {
  const sentences = sentenceChunks(paragraph);
  if (sentences.length <= 1) return [paragraph]; // no sentence punctuation to split on

  const cards: string[] = [];
  let current = '';
  let currentWords = 0;

  for (const sentence of sentences) {
    const sentenceWords = wordCount(sentence);
    if (currentWords > 0 && currentWords + sentenceWords > MAX_WORDS_PER_CARD && hasBalancedEmphasisMarkers(current)) {
      cards.push(current.trim());
      current = '';
      currentWords = 0;
    }
    current += sentence;
    currentWords += sentenceWords;
  }
  if (current.trim()) cards.push(current.trim());

  return cards.length > 0 ? cards : [paragraph];
}

export function splitLessonIntoCards(bodyMd: string | null | undefined): string[] {
  const trimmed = (bodyMd ?? '').trim();
  if (!trimmed) return [''];

  const paragraphs = trimmed
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
  if (paragraphs.length === 0) return [trimmed];

  const cards = paragraphs.flatMap((paragraph) =>
    wordCount(paragraph) <= MAX_WORDS_PER_CARD ? [paragraph] : splitLongParagraphBySentence(paragraph)
  );

  return cards.length > 0 ? cards : [trimmed];
}
