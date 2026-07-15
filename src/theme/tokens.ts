import { Platform } from 'react-native';

// Design tokens — single source of truth per CLAUDE.md rule 6. No hardcoded
// colors anywhere outside this file; every screen/component imports from here.

export const colors = {
  // Dark-mode-first, but never default-dark: a deliberate warm-charcoal
  // palette, not the OS's raw dark grey/black. One fixed palette — no
  // separate light-mode variant.
  bg: '#12141A',
  surface: '#1B1E27',
  surfaceRaised: '#232734',
  border: '#2C3040',

  textPrimary: '#F2EFE9',
  textSecondary: '#9BA0AE',
  textDisabled: '#5C6170',

  // ONE accent color, used sparingly: primary buttons, active states, progress.
  accent: '#5FA8A0',
  accentPressed: '#4C8B84',
  accentTint: '#5FA8A01A',

  // Muted, never neon. SOS uses caution, not red/danger.
  success: '#7FB88B',
  caution: '#D9A05B',
  danger: '#C96F6F',
} as const;

export type ThemeColor = keyof typeof colors;

export const radius = {
  card: 16,
  button: 14,
  chip: 10,
} as const;

// 4pt grid.
export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
  screenPadding: 20,
} as const;

export const typography = {
  fontFamily: Platform.select({ ios: 'system-ui', default: 'normal' }),
  title: { fontSize: 28, lineHeight: 34, fontWeight: '600' as const },
  body: { fontSize: 17, lineHeight: 28, fontWeight: '400' as const },
  caption: { fontSize: 13, lineHeight: 18, fontWeight: '400' as const },
} as const;

// Subtle fades/slides only — no confetti, no bounce, no gradients.
export const motion = {
  duration: 250,
} as const;
