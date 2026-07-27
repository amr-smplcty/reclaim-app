import { StyleSheet, type ViewProps } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

import { useTheme } from '@/hooks/use-theme';

interface Props extends ViewProps {
  // Which edges to inset. Full-screen screens without a native header
  // (onboarding) want ['top','bottom']; card-presented modals already clear
  // the notch on iOS, so they typically only need ['bottom'] for the home
  // indicator. Defaults to the full set — pass a narrower set where a native
  // header or modal card already handles the top.
  edges?: readonly Edge[];
  type?: 'bg' | 'surface';
}

// Themed safe-area root for screens that have NO native header (onboarding,
// modals). Screens inside the tabs/program/toolkit native stacks don't need
// this — React Navigation's header already insets the top, and the tab bar
// insets the bottom (fix-device-qa-1 / INC-18).
export function SafeAreaScreen({ edges = ['top', 'bottom'], type = 'bg', style, ...rest }: Props) {
  const theme = useTheme();
  return <SafeAreaView edges={edges} style={[styles.flex, { backgroundColor: theme[type] }, style]} {...rest} />;
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
});
