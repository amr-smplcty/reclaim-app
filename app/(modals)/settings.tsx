import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Switch, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/use-theme';
import { getCurrentUserEmail } from '@/lib/supabase/auth';
import { isAppLockAvailable } from '@/features/lock/localAuth';
import { useSettingsStore } from '@/features/settings/useSettingsStore';
import { TimeStepperRow } from '@/features/settings/TimeStepperRow';
import { shareDataExport } from '@/features/settings/exportData';
import { Spacing } from '@/theme/tokens';

// Settings (PRODUCT_SPEC §5.6), reachable from the Today header.
export default function SettingsScreen() {
  const theme = useTheme();
  const dailyLessonTime = useSettingsStore((s) => s.dailyLessonTime);
  const setDailyLessonTime = useSettingsStore((s) => s.setDailyLessonTime);
  const eveningCheckinTime = useSettingsStore((s) => s.eveningCheckinTime);
  const setEveningCheckinTime = useSettingsStore((s) => s.setEveningCheckinTime);
  const appLockEnabled = useSettingsStore((s) => s.appLockEnabled);
  const setAppLockEnabled = useSettingsStore((s) => s.setAppLockEnabled);

  const [email, setEmail] = useState<string | undefined>(undefined);
  const [lockAvailable, setLockAvailable] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    getCurrentUserEmail().then(setEmail);
    isAppLockAvailable().then(setLockAvailable);
  }, []);

  function openLegalDoc(type: 'tou' | 'privacy') {
    router.push({ pathname: '/(modals)/legal-doc', params: { type } });
  }

  async function handleToggleAppLock(value: boolean) {
    if (value && !lockAvailable) {
      Alert.alert(
        "Face ID / passcode isn't set up",
        'Set up Face ID or a passcode on this device first, then turn this on.'
      );
      return;
    }
    setAppLockEnabled(value);
  }

  async function handleExport() {
    setExporting(true);
    try {
      await shareDataExport();
    } catch (e) {
      console.error('[settings] Export failed:', e);
      Alert.alert("Couldn't export your data", 'Please try again in a moment.');
    } finally {
      setExporting(false);
    }
  }

  function handleSubscriptionPress() {
    Alert.alert('Subscription management', "Coming with launch — you're on the full program during development.");
  }

  return (
    <ThemedView style={styles.container}>
      <View style={styles.closeRow}>
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Close"
          hitSlop={8}
          style={[styles.closeButton, { backgroundColor: theme.surface }]}
        >
          <Ionicons name="close" size={20} color={theme.textPrimary} />
        </Pressable>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <ThemedText type="title" style={styles.title}>
          Settings
        </ThemedText>

        <Section title="Account">
          <ThemedText type="default" themeColor="textSecondary">
            {email ?? 'Not signed in with an email account'}
          </ThemedText>
        </Section>

        <Section title="Legal">
          <Row label="Terms of Use" onPress={() => openLegalDoc('tou')} />
          <Row label="Privacy Policy" onPress={() => openLegalDoc('privacy')} />
        </Section>

        <Section title="Notifications">
          <ThemedText type="small" themeColor="textSecondary" style={styles.sectionNote}>
            These times are saved for when reminders are wired up — nothing is scheduled yet.
          </ThemedText>
          <TimeStepperRow label="Daily session" time={dailyLessonTime} onChange={setDailyLessonTime} />
          <TimeStepperRow label="Evening check-in" time={eveningCheckinTime} onChange={setEveningCheckinTime} />
        </Section>

        <Section title="Privacy">
          <View style={styles.lockRow}>
            <View style={styles.rowLabel}>
              <ThemedText type="default">App lock</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                Require Face ID or your passcode to open Reclaim
              </ThemedText>
              {!lockAvailable ? (
                <ThemedText type="small" themeColor="caution" style={styles.unavailableNote}>
                  Face ID / passcode isn't set up on this device.
                </ThemedText>
              ) : null}
            </View>
            <Switch
              value={appLockEnabled}
              onValueChange={handleToggleAppLock}
              accessibilityLabel="App lock"
              trackColor={{ true: theme.accent, false: theme.border }}
            />
          </View>
        </Section>

        <Section title="Your data">
          <Row label={exporting ? 'Preparing export…' : 'Export my data'} onPress={handleExport} disabled={exporting} />
          <Row
            label="Delete account and all data"
            themeColor="danger"
            onPress={() => router.push('/(modals)/delete-account')}
          />
        </Section>

        <Section title="Subscription">
          <Row label="Manage subscription" onPress={handleSubscriptionPress} />
        </Section>
      </ScrollView>
    </ThemedView>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <ThemedText type="small" themeColor="textSecondary" style={styles.sectionTitle}>
        {title.toUpperCase()}
      </ThemedText>
      {children}
    </View>
  );
}

function Row({
  label,
  onPress,
  disabled,
  themeColor,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  themeColor?: 'danger';
}) {
  return (
    <ThemedText
      type="default"
      themeColor={themeColor}
      onPress={disabled ? undefined : onPress}
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      style={[styles.row, disabled && styles.disabled]}
    >
      {label}
    </ThemedText>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  closeRow: { alignItems: 'flex-end', padding: Spacing.four, paddingBottom: 0 },
  closeButton: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  content: { padding: Spacing.four, paddingBottom: Spacing.six },
  title: { marginBottom: Spacing.four },
  section: { marginBottom: Spacing.five },
  sectionTitle: { marginBottom: Spacing.two, letterSpacing: 0.5 },
  sectionNote: { marginBottom: Spacing.two },
  row: { paddingVertical: Spacing.two },
  lockRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: Spacing.two },
  rowLabel: { flex: 1, gap: 2, paddingRight: Spacing.three },
  unavailableNote: { marginTop: Spacing.half },
  disabled: { opacity: 0.5 },
});
