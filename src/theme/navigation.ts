import { DarkTheme, DefaultTheme, type Theme as NavTheme } from 'expo-router';

import { darkColors, lightColors } from '@/theme/tokens';

// React Navigation themes tinted with Driftwood surfaces so transition and
// nav-chrome backgrounds match the app (no light flash pushing a screen in
// dark mode). Screens still paint their own full-bleed background via
// ThemedView / SafeAreaScreen; this covers the chrome underneath.
export const navLightTheme: NavTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: lightColors.surface,
    card: lightColors.surfaceRaised,
    text: lightColors.textPrimary,
    border: lightColors.border,
    primary: lightColors.accent,
    notification: lightColors.accent,
  },
};

export const navDarkTheme: NavTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: darkColors.surface,
    card: darkColors.surfaceRaised,
    text: darkColors.textPrimary,
    border: darkColors.border,
    primary: darkColors.accent,
    notification: darkColors.accent,
  },
};
