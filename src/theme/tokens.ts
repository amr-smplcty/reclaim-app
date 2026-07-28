import { Platform } from 'react-native';

// Design tokens — single source of truth per CLAUDE.md rule 6 and the
// DESIGN_SYSTEM.md "Driftwood" spec. No hardcoded colors anywhere outside this
// file; every screen/component reads from here. Values are the committed
// Driftwood ramp measured in design/Reclaim Foundations.html (the files win
// over the doc where they disagree — §Source files).

// ---------------------------------------------------------------------------
// Color — "Driftwood" (DESIGN_SYSTEM.md §2)
//
// Two full palettes. Dark is the designed-first mode (built for the 2am state,
// not a filter over light). Light was added in Epic 15. Both share identical
// keys so `Theme` is one shape and `useTheme()` can swap by system appearance.
// Contrast ratios (from the spec, measured against that mode's `surface`) are
// noted inline; re-verify if any hex changes (DESIGN_SYSTEM.md §10).
// ---------------------------------------------------------------------------

const CANONICAL_LIGHT = {
  surface: '#F7F4EF', // app background
  surfaceRaised: '#FFFDFA', // cards, sheets
  surfaceSunken: '#F1EEE8', // wells, disabled fills

  textPrimary: '#282420', // 14.0:1
  textSecondary: '#65605A', // 5.7:1
  textPlaceholder: '#6F6A60', // 4.9:1
  textDisabled: '#7C766B', // 4.1:1 (inactive controls, WCAG 1.4.3 exempt)

  accent: '#3F5480', // growth, actions — 6.9:1
  accentPressed: '#354B6C', // −6% lightness of accent (pressed state)
  accentMuted: '#DEE2EC', // fills, tracks (background-only)
  accentSubtle: '#EDF0F6', // selected-card tint (background-only)

  success: '#4F6E5A', // completion — 5.2:1
  caution: '#9A6A34', // icons + large labels only — 4.3:1
  cautionSubtle: '#F5EAD9', // advisory panel tint (background-only)
  cautionText: '#7A5326', // text on cautionSubtle — 6.2:1

  destructive: '#A6462F', // irreversible data only — 5.4:1

  border: '#E7E0D6', // hairlines
  borderStrong: '#CFC8BC', // control outlines

  overlay: 'rgba(20, 18, 12, 0.45)', // scrim — #14120C @ 45%
  onAccent: '#FFFFFF', // text/icon on accent
} as const;

const CANONICAL_DARK = {
  surface: '#16150F',
  surfaceRaised: '#211F18',
  surfaceSunken: '#1B1A13',

  textPrimary: '#F0ECE3', // 15.5:1
  textSecondary: '#ABA598', // 7.5:1
  textPlaceholder: '#948F84', // 5.7:1
  textDisabled: '#5E6058', // 2.9:1 (inactive controls, WCAG 1.4.3 exempt)

  accent: '#93A6CE', // 7.5:1
  accentPressed: '#7E95C4', // −6% lightness of accent (pressed state)
  accentMuted: '#2A3040',
  accentSubtle: '#222839',

  success: '#84A78E', // 6.9:1
  caution: '#C79A5E', // 7.2:1
  cautionSubtle: '#2E2517',
  cautionText: '#EBC894', // 11.5:1

  destructive: '#D07B62', // 5.8:1

  border: '#2C2A22',
  borderStrong: '#4A4840',

  overlay: 'rgba(0, 0, 0, 0.6)', // #000000 @ 60%
  onAccent: '#16150F',
} as const;

// The Epic 15 legacy alias layer (bg → surface, accentTint → accentSubtle,
// danger → destructive, and the old `surface`/cards → surfaceRaised) has been
// fully migrated out; canonical Driftwood names are the only surface now.
export const lightColors = CANONICAL_LIGHT;
export const darkColors = CANONICAL_DARK;

export type ColorScheme = 'light' | 'dark';
// Values widened to string so the light and dark palettes (different literal
// hexes) share one assignable shape.
export type Theme = { [K in keyof typeof darkColors]: string };
export type ThemeColor = keyof Theme;

export const palettes: Record<ColorScheme, Theme> = {
  light: lightColors,
  dark: darkColors,
};

// Dark is the designed-first mode: an unset/unknown scheme resolves to dark.
// Accepts a loose string (RN's ColorSchemeName is 'light' | 'dark' | null).
export function resolveScheme(scheme: string | null | undefined): ColorScheme {
  return scheme === 'light' ? 'light' : 'dark';
}

export function getPalette(scheme: string | null | undefined): Theme {
  return palettes[resolveScheme(scheme)];
}

// Back-compat default export of the color object. Points at the dark palette
// (the designed-first mode). Reactive consumers must use `useTheme()`.
export const colors: Theme = darkColors;

// ---------------------------------------------------------------------------
// Typography (DESIGN_SYSTEM.md §3)
//
// UI: SF Pro (iOS system) — the app should never announce a font. Long-form
// lesson body + ceremony moments: New York (iOS system serif). Georgia stands
// in for New York until the face is bundled (see BACKLOG); it is the reliably
// available iOS system serif and carries the same journal/reading feel.
// Serif is for *reading*, sans for *operating* — never mixed in one paragraph.
// Dynamic Type to 200%; every step scales; no fixed-height text containers.
// ---------------------------------------------------------------------------
export const fontFamilies = {
  // undefined → SF Pro on iOS, Roboto on Android. Never a named UI font.
  ui: Platform.select({ ios: undefined, default: undefined }),
  serif: Platform.select({ ios: 'Georgia', android: 'serif', default: 'serif' }),
} as const;

export const typography = {
  // ceremony, week complete — serif
  display: {
    fontFamily: fontFamilies.serif,
    fontSize: 34,
    lineHeight: 40,
    letterSpacing: -0.4,
    fontWeight: '700' as const,
  },
  // screen titles — SF
  title1: {
    fontFamily: fontFamilies.ui,
    fontSize: 28,
    lineHeight: 34,
    letterSpacing: -0.3,
    fontWeight: '700' as const,
  },
  // section headers — SF
  title2: {
    fontFamily: fontFamilies.ui,
    fontSize: 22,
    lineHeight: 28,
    letterSpacing: -0.2,
    fontWeight: '600' as const,
  },
  // card titles — SF
  title3: {
    fontFamily: fontFamilies.ui,
    fontSize: 20,
    lineHeight: 25,
    letterSpacing: -0.2,
    fontWeight: '600' as const,
  },
  // lesson reading — serif
  body: {
    fontFamily: fontFamilies.serif,
    fontSize: 17,
    lineHeight: 26,
    letterSpacing: 0,
    fontWeight: '400' as const,
  },
  // secondary body — SF
  callout: {
    fontFamily: fontFamilies.ui,
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: 0,
    fontWeight: '400' as const,
  },
  // labels, list rows — SF
  subhead: {
    fontFamily: fontFamilies.ui,
    fontSize: 15,
    lineHeight: 20,
    letterSpacing: 0,
    fontWeight: '500' as const,
  },
  // meta, timestamps — SF
  footnote: {
    fontFamily: fontFamilies.ui,
    fontSize: 13,
    lineHeight: 18,
    letterSpacing: 0.1,
    fontWeight: '400' as const,
  },
  // micro-labels — SF
  caption: {
    fontFamily: fontFamilies.ui,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.2,
    fontWeight: '500' as const,
  },
} as const;

export type TypographyStep = keyof typeof typography;

// ---------------------------------------------------------------------------
// Spacing — 4pt base (DESIGN_SYSTEM.md §4)
// Screen gutter = base (16). Card interior padding = lg (20).
// Section separation = xxl (32).
// ---------------------------------------------------------------------------
export const space = {
  xxs: 2, // space-1
  xs: 4, // space-xs
  sm: 8, // space-sm
  md: 12, // space-md
  base: 16, // space  (screen gutter)
  lg: 20, // space-lg  (card interior padding)
  xl: 24, // space-xl
  xxl: 32, // space-2xl  (section separation)
  xxxl: 48, // space-3xl
} as const;

export type Space = keyof typeof space;

// ---------------------------------------------------------------------------
// Radius (DESIGN_SYSTEM.md §4)
// Buttons r-md, cards r-lg, sheets r-xl (top corners only), pills/avatars r-full.
// ---------------------------------------------------------------------------
export const radius = {
  xs: 6,
  sm: 10,
  md: 14,
  lg: 20,
  xl: 28,
  full: 999,
} as const;

export type Radius = keyof typeof radius;

// ---------------------------------------------------------------------------
// Elevation (DESIGN_SYSTEM.md §4) — soft, low-contrast only. In dark mode
// shadows are near-invisible; depth comes from surfaceRaised lightness +
// border. RN takes a single shadow layer, so these approximate the spec's
// two-layer CSS box-shadows with the dominant (outer) layer.
// ---------------------------------------------------------------------------
export const elevation = {
  e0: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  e1: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  e2: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 28,
    elevation: 8,
  },
  e3: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 24 },
    shadowOpacity: 0.14,
    shadowRadius: 48,
    elevation: 16,
  },
} as const;

export type Elevation = keyof typeof elevation;

// ---------------------------------------------------------------------------
// Motion (DESIGN_SYSTEM.md §5)
// Breathing and celebration are the only expressive curves. Everything honors
// prefers-reduced-motion → crossfade fallback (see src/theme/motion.ts).
// ---------------------------------------------------------------------------
export const motion = {
  durations: {
    screenTransition: 350,
    cardEnter: 300,
    breathingIn: 4000,
    breathingOut: 6000,
    celebration: 700,
    // crossfade fallback used when prefers-reduced-motion is on
    reducedFade: 200,
  },
  easings: {
    // iOS push / cross-fade
    screen: [0.2, 0, 0, 1] as const,
    // 8px rise + fade; lists stagger 40ms
    card: [0.16, 1, 0.3, 1] as const,
    // one gentle settle; no confetti, no repeat
    celebration: [0.34, 1.4, 0.64, 1] as const,
  },
  // breathing: scale 1.0↔1.35, opacity 0.6↔1.0, 4s in / 6s out, alternate loop
  breathing: {
    scaleFrom: 1.0,
    scaleTo: 1.35,
    opacityFrom: 0.6,
    opacityTo: 1.0,
  },
  listStaggerMs: 40,
} as const;
