import { Platform } from 'react-native';

// Calm, adult, low-stimulation palette (dark-mode-first per CLAUDE.md design language).
export const Colors = {
  dark: {
    text: '#EDEDEF',
    textSecondary: '#9A9CA3',
    background: '#101113',
    backgroundElement: '#1C1D20',
    backgroundSelected: '#26282C',
    accent: '#6FA8DC',
    border: '#2C2E33',
  },
  light: {
    text: '#1B1C1E',
    textSecondary: '#5B5D64',
    background: '#FAFAFA',
    backgroundElement: '#F0F0F2',
    backgroundSelected: '#E4E4E8',
    accent: '#3D6FA8',
    border: '#E0E0E4',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    rounded: 'normal',
    mono: 'monospace',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;
