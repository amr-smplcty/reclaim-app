import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { SafeAreaScreen } from '@/components/safe-area-screen';
import { JourneyMap } from '@/features/journey/JourneyMapView';
import { useTheme } from '@/hooks/use-theme';
import { space } from '@/theme/tokens';

// The journey map as a modal, reached by tapping the "Week X · Day Y" header
// on Today (PRODUCT_SPEC §5.7). Also rendered inline in Progress; this is the
// "where am I" full view.
export default function JourneyMapScreen() {
  const theme = useTheme();

  return (
    <SafeAreaScreen style={styles.container} edges={['bottom']}>
      <View style={styles.closeRow}>
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Close"
          hitSlop={8}
          style={[styles.closeButton, { backgroundColor: theme.surfaceRaised }]}
        >
          <Ionicons name="close" size={20} color={theme.textPrimary} />
        </Pressable>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <JourneyMap />
      </ScrollView>
    </SafeAreaScreen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  closeRow: { alignItems: 'flex-end', padding: space.xl, paddingBottom: 0 },
  closeButton: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  content: { padding: space.xl, paddingTop: space.sm },
});
