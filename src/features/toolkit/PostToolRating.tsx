import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { PrimaryButton } from '@/components/primary-button';
import { ThemedText } from '@/components/themed-text';
import { NumberScale } from '@/features/program/exercises/NumberScale';
import { Spacing } from '@/constants/theme';

interface Props {
  onSubmit: (postIntensity: number) => void;
}

// Shared post-tool re-rate step (PRODUCT_SPEC §5.3: "After any tool: 'How's
// the urge now?'"). The numeric value feeds the delta the caller logs.
export function PostToolRating({ onSubmit }: Props) {
  const [value, setValue] = useState<number | null>(null);

  return (
    <View style={styles.container}>
      <ThemedText type="subtitle" style={styles.prompt}>
        How's the urge now?
      </ThemedText>
      <NumberScale min={1} max={10} value={value} onChange={setValue} />
      <PrimaryButton label="Save" onPress={() => value !== null && onSubmit(value)} disabled={value === null} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: Spacing.four },
  prompt: { marginBottom: Spacing.one },
});
