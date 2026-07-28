import { useEffect, useState } from 'react';
import { Keyboard, Platform, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { space } from '@/theme/tokens';

// A global "Done" accessory that sits just above the keyboard (iOS). Mounted
// once at the app root so EVERY text input gets a dismiss affordance without
// wiring inputAccessoryViewID onto each of the ~24 TextInputs. iOS only:
// Android's soft keyboard already has its own dismiss/back key, so a custom
// bar there would be redundant (and the QA request was iOS-specific).
//
// Positioned directly from the keyboard height (no JS-driven Animated timer —
// the keyboard's own show/hide animation carries the bar with it, and a timer
// outliving a render caused teardown crashes in tests).
export function KeyboardToolbar() {
  const theme = useTheme();
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    if (Platform.OS !== 'ios') return;
    const showSub = Keyboard.addListener('keyboardWillShow', (e) => setKeyboardHeight(e.endCoordinates.height));
    const hideSub = Keyboard.addListener('keyboardWillHide', () => setKeyboardHeight(0));
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  if (Platform.OS !== 'ios' || keyboardHeight === 0) return null;

  return (
    <View
      pointerEvents="box-none"
      style={[styles.bar, { bottom: keyboardHeight, backgroundColor: theme.surfaceRaised, borderTopColor: theme.border }]}
    >
      <Pressable
        onPress={() => Keyboard.dismiss()}
        accessibilityRole="button"
        accessibilityLabel="Dismiss keyboard"
        hitSlop={8}
        style={styles.doneButton}
      >
        <ThemedText type="link" themeColor="accent">
          Done
        </ThemedText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    left: 0,
    right: 0,
    borderTopWidth: StyleSheet.hairlineWidth,
    alignItems: 'flex-end',
    paddingHorizontal: space.xl,
    paddingVertical: space.sm,
  },
  doneButton: { paddingHorizontal: space.sm, paddingVertical: space.xs },
});
