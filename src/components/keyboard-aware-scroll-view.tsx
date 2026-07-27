import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, type ScrollViewProps } from 'react-native';

// Keyboard-aware scroll container for any screen with text inputs. Combines:
//  - KeyboardAvoidingView (iOS 'padding') so the focused field and the
//    primary CTA below it stay visible instead of being covered.
//  - keyboardShouldPersistTaps="handled": a tap outside the input (on empty
//    space or a button) dismisses the keyboard, while button presses still
//    fire — the app-wide "tap outside to dismiss" behavior.
//  - keyboardDismissMode="interactive": drag the scroll view down to dismiss.
// Pair with the global <KeyboardToolbar/> (root) for the iOS "Done" button.
export function KeyboardAwareScrollView({ children, contentContainerStyle, style, ...rest }: ScrollViewProps) {
  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        contentContainerStyle={contentContainerStyle}
        style={[styles.flex, style]}
        {...rest}
      >
        {children}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
});
