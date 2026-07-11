// Scoring is sacred (CLAUDE.md rule 3) — sums and cutoffs below are transcribed
// verbatim from CLINICAL_SPEC §2.2/§2.3/§3, never approximate or round differently.

export const PPCS6_ITEM_COUNT = 6;
export const PPCS6_ITEM_MIN = 1;
export const PPCS6_ITEM_MAX = 7;
export const PPCS6_SCORE_MIN = 6;
export const PPCS6_SCORE_MAX = 42;
export const PPCS6_CUTOFF = 20;

export function scorePpcs6(responses: number[]): number {
  if (responses.length !== PPCS6_ITEM_COUNT) {
    throw new Error(`PPCS-6 requires exactly ${PPCS6_ITEM_COUNT} responses, got ${responses.length}`);
  }
  if (responses.some((r) => r < PPCS6_ITEM_MIN || r > PPCS6_ITEM_MAX)) {
    throw new Error(`PPCS-6 items must be on the ${PPCS6_ITEM_MIN}-${PPCS6_ITEM_MAX} scale`);
  }
  return responses.reduce((sum, r) => sum + r, 0);
}

export type Ppcs6Band = 'A' | 'B' | 'C' | 'D';

export interface Ppcs6BandInfo {
  band: Ppcs6Band;
  label: string;
  framing: string;
  showResourcesLink: boolean;
}

// Table verbatim from CLINICAL_SPEC §2.3. Band A's framing is extended with the
// honest, non-inflating offer sentence from PRODUCT_SPEC §4's "below cutoff" edge
// case (same opening sentence in both specs). Band D's added recommendation
// sentence is composed per the spec's instruction ("Band C copy + explicit
// recommendation..."), not verbatim-quoted — mirrors the §3 mood-interstitial tone.
const BAND_TABLE: Array<{ band: Ppcs6Band; min: number; max: number; label: string; framing: string; showResourcesLink: boolean }> = [
  {
    band: 'A',
    min: 6,
    max: 13,
    label: 'Low indication',
    framing:
      "Your responses don't indicate problematic use. If it still bothers you, the program can help you build the relationship with porn you actually want.",
    showResourcesLink: false,
  },
  {
    band: 'B',
    min: 14,
    max: 19,
    label: 'Emerging risk',
    framing: 'Some warning signs, below the clinical screening threshold. Good moment to act early.',
    showResourcesLink: false,
  },
  {
    band: 'C',
    min: 20,
    max: 28,
    label: 'Likely problematic use',
    framing: 'Your score crosses the validated screening threshold (≥20).',
    showResourcesLink: false,
  },
  {
    band: 'D',
    min: 29,
    max: 42,
    label: 'High severity',
    framing:
      'Your score crosses the validated screening threshold (≥20). We\'d also recommend considering professional support alongside the program.',
    showResourcesLink: true,
  },
];

export function getPpcs6Band(score: number): Ppcs6BandInfo {
  if (score < PPCS6_SCORE_MIN || score > PPCS6_SCORE_MAX) {
    throw new Error(`PPCS-6 score must be between ${PPCS6_SCORE_MIN} and ${PPCS6_SCORE_MAX}, got ${score}`);
  }
  const entry = BAND_TABLE.find((row) => score >= row.min && score <= row.max);
  if (!entry) {
    throw new Error(`No PPCS-6 band covers score ${score}`);
  }
  const { min, max, ...bandInfo } = entry;
  return bandInfo;
}

export const SCREENER_ITEM_COUNT = 2;
export const SCREENER_ITEM_MIN = 0;
export const SCREENER_ITEM_MAX = 3;
export const SCREENER_CUTOFF = 3;

function scoreScreener(name: string, responses: number[]): number {
  if (responses.length !== SCREENER_ITEM_COUNT) {
    throw new Error(`${name} requires exactly ${SCREENER_ITEM_COUNT} responses, got ${responses.length}`);
  }
  if (responses.some((r) => r < SCREENER_ITEM_MIN || r > SCREENER_ITEM_MAX)) {
    throw new Error(`${name} items must be on the ${SCREENER_ITEM_MIN}-${SCREENER_ITEM_MAX} scale`);
  }
  return responses.reduce((sum, r) => sum + r, 0);
}

export function scorePhq2(responses: number[]): number {
  return scoreScreener('PHQ-2', responses);
}

export function scoreGad2(responses: number[]): number {
  return scoreScreener('GAD-2', responses);
}

export function isMoodElevated(phq2Score: number, gad2Score: number): boolean {
  return phq2Score >= SCREENER_CUTOFF || gad2Score >= SCREENER_CUTOFF;
}

export function calculateAge(dob: Date, today: Date): number {
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  const dayDiff = today.getDate() - dob.getDate();
  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
    age -= 1;
  }
  return age;
}

export function isMinor(age: number): boolean {
  return age < 18;
}
