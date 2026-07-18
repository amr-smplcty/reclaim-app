import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import type { PurchasesPackage } from 'react-native-purchases';

import { PrimaryButton } from '@/components/primary-button';
import { ThemedText } from '@/components/themed-text';
import { OnboardingLayout } from '@/features/assessment/OnboardingLayout';
import { useOnboardingStore } from '@/features/assessment/useOnboardingStore';
import { useAssessmentHistoryStore } from '@/features/assessment/useAssessmentHistoryStore';
import { useAppStore } from '@/stores/useAppStore';
import { useSubscriptionStore } from '@/features/paywall/useSubscriptionStore';
import { annualSavingsPercent, type SubscriptionPackageView } from '@/features/paywall/offerings';
import { isRevenueCatAvailable } from '@/lib/revenuecat/availability';
import { trackPaywallViewed } from '@/lib/analytics/events';
import { useTheme } from '@/hooks/use-theme';
import { Spacing, radius } from '@/theme/tokens';

// Order matters (INC-8a/INC-8b prevention rules): navigate away from the
// onboarding stack *before* resetting its shared store. Every onboarding
// screen pushed through so far is still mounted (goNextFrom uses
// router.push, not replace) and reactively reads useOnboardingStore —
// resetting first would let a still-mounted validation-heavy screen
// (ResultsScreen) re-render against nulls and throw.
function completeOnboardingAndEnter() {
  useAppStore.getState().setHasOnboarded(true);
  router.replace('/(tabs)/today');
  useOnboardingStore.getState().reset();
}

function openLegalDoc(type: 'tou' | 'privacy') {
  router.push({ pathname: '/(modals)/legal-doc', params: { type } });
}

// PRODUCT_SPEC §4 step 11 / §6 — hard paywall after the results screen.
// Real RevenueCat wiring only runs in a build where the native module is
// actually linked (INC-2); Expo Go/tests fall through to the same
// "requires full app" degraded continue-through state this screen has
// always had, unchanged, so onboarding can still be exercised there.
export default function PaywallScreen() {
  const [revenueCatAvailable] = useState(isRevenueCatAvailable);

  if (!revenueCatAvailable) {
    return <DegradedPaywall />;
  }
  return <RealPaywall />;
}

function DegradedPaywall() {
  return (
    <OnboardingLayout step="paywall" contentStyle={styles.content}>
      <ThemedText type="title" style={styles.title}>
        Paywall
      </ThemedText>
      <ThemedText type="default" themeColor="textSecondary">
        Pricing and purchase require the full app build — this build continues without one.
      </ThemedText>
      <PrimaryButton label="Continue" onPress={completeOnboardingAndEnter} />
    </OnboardingLayout>
  );
}

function RealPaywall() {
  const theme = useTheme();
  const status = useSubscriptionStore((s) => s.status);
  const hasProEntitlement = useSubscriptionStore((s) => s.hasProEntitlement);
  const offering = useSubscriptionStore((s) => s.offering);
  const refreshEntitlement = useSubscriptionStore((s) => s.refreshEntitlement);
  const loadOfferings = useSubscriptionStore((s) => s.loadOfferings);
  const purchase = useSubscriptionStore((s) => s.purchase);
  const restore = useSubscriptionStore((s) => s.restore);
  const latestScore = useAssessmentHistoryStore((s) => s.entries.at(-1)?.score);

  const [selected, setSelected] = useState<'annual' | 'monthly'>('annual');
  const [purchasing, setPurchasing] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    trackPaywallViewed();
    refreshEntitlement();
    loadOfferings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (hasProEntitlement) completeOnboardingAndEnter();
  }, [hasProEntitlement]);

  const savingsPercent = annualSavingsPercent(offering);
  const selectedPackage: SubscriptionPackageView | null = selected === 'annual' ? offering.annual : offering.monthly;

  async function handlePurchase() {
    const pkg = selected === 'annual' ? rawPackageFor('annual') : rawPackageFor('monthly');
    if (!pkg) return;
    setPurchasing(true);
    setError(null);
    const result = await purchase(pkg);
    setPurchasing(false);
    if (!result.success && !result.cancelled) {
      setError(result.error ?? "Couldn't complete the purchase. Please try again.");
    }
    // result.success === true is handled by the hasProEntitlement effect above.
  }

  async function handleRestore() {
    setRestoring(true);
    setError(null);
    const result = await restore();
    setRestoring(false);
    if (!result.success) {
      setError(result.error ?? 'No previous purchase found to restore.');
    }
  }

  // Kept as a tiny local lookup rather than storing raw SDK packages in
  // state — the store only exposes the simplified view for rendering;
  // purchase() needs the real PurchasesPackage, fetched fresh from the
  // store's underlying offering each time.
  function rawPackageFor(which: 'annual' | 'monthly'): PurchasesPackage | null {
    return useSubscriptionStore.getState().rawOffering?.[which] ?? null;
  }

  if (status === 'loading' || (!offering.annual && !offering.monthly)) {
    return (
      <OnboardingLayout step="paywall" showBack={false} contentStyle={styles.loadingContent}>
        <ActivityIndicator color={theme.accent} />
      </OnboardingLayout>
    );
  }

  return (
    <OnboardingLayout step="paywall" showBack={false} contentStyle={styles.content}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <ThemedText type="title" style={styles.title}>
          {typeof latestScore === 'number'
            ? `Your score: ${latestScore}.`
            : 'Your program, built on your answers.'}
        </ThemedText>
        <ThemedText type="default" themeColor="textSecondary" style={styles.subtitle}>
          The 6-week program teaches the skills — from published research — to work on exactly that.
          Re-measure every two weeks and watch your own trend.
        </ThemedText>

        {offering.annual ? (
          <PlanCard
            title="Annual"
            priceLabel={`${offering.annual.priceString}/year`}
            badge={savingsPercent ? `Save ${savingsPercent}%` : undefined}
            trialNote={offering.annual.hasFreeTrial ? '7-day free trial, then billed yearly' : undefined}
            selected={selected === 'annual'}
            onPress={() => setSelected('annual')}
          />
        ) : null}
        {offering.monthly ? (
          <PlanCard
            title="Monthly"
            priceLabel={`${offering.monthly.priceString}/month`}
            selected={selected === 'monthly'}
            onPress={() => setSelected('monthly')}
          />
        ) : null}

        {error ? (
          <ThemedText type="small" themeColor="danger" style={styles.error}>
            {error}
          </ThemedText>
        ) : null}

        <PrimaryButton
          label={
            purchasing
              ? 'Processing…'
              : selectedPackage?.hasFreeTrial
                ? 'Start free trial'
                : 'Subscribe'
          }
          onPress={handlePurchase}
          disabled={purchasing || restoring || !selectedPackage}
        />

        <Pressable
          onPress={handleRestore}
          disabled={purchasing || restoring}
          accessibilityRole="button"
          accessibilityLabel="Restore purchases"
          hitSlop={8}
          style={styles.restoreButton}
        >
          <ThemedText type="link" themeColor="textSecondary">
            {restoring ? 'Restoring…' : 'Restore purchases'}
          </ThemedText>
        </Pressable>

        <ThemedText type="small" themeColor="textSecondary" style={styles.disclosure}>
          Payment is charged to your Apple ID at confirmation of purchase. Subscriptions auto-renew
          unless cancelled at least 24 hours before the end of the current period, in your Apple ID
          account settings. Manage or cancel anytime in Settings. Individual results vary.
        </ThemedText>

        <View style={styles.legalRow}>
          <Pressable onPress={() => openLegalDoc('tou')} hitSlop={8}>
            <ThemedText type="small" themeColor="textSecondary" style={styles.legalLink}>
              Terms of Use
            </ThemedText>
          </Pressable>
          <Pressable onPress={() => openLegalDoc('privacy')} hitSlop={8}>
            <ThemedText type="small" themeColor="textSecondary" style={styles.legalLink}>
              Privacy Policy
            </ThemedText>
          </Pressable>
        </View>
      </ScrollView>
    </OnboardingLayout>
  );
}

function PlanCard({
  title,
  priceLabel,
  badge,
  trialNote,
  selected,
  onPress,
}: {
  title: string;
  priceLabel: string;
  badge?: string;
  trialNote?: string;
  selected: boolean;
  onPress: () => void;
}) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ selected }}
      style={[
        styles.planCard,
        {
          borderColor: selected ? theme.accent : theme.border,
          backgroundColor: selected ? theme.accentTint : theme.surface,
        },
      ]}
    >
      <View style={styles.planHeaderRow}>
        <ThemedText type="default" style={styles.planTitle}>
          {title}
        </ThemedText>
        {badge ? (
          <View style={[styles.badge, { backgroundColor: theme.accent }]}>
            <ThemedText type="small" style={styles.badgeText}>
              {badge}
            </ThemedText>
          </View>
        ) : null}
      </View>
      <ThemedText type="default" themeColor="textSecondary">
        {priceLabel}
      </ThemedText>
      {trialNote ? (
        <ThemedText type="small" themeColor="accent" style={styles.trialNote}>
          {trialNote}
        </ThemedText>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: { justifyContent: 'flex-start' },
  loadingContent: { justifyContent: 'center', alignItems: 'center' },
  scroll: { gap: Spacing.three, paddingBottom: Spacing.six },
  title: { marginBottom: Spacing.one },
  subtitle: { marginBottom: Spacing.three },
  planCard: { borderWidth: 1, borderRadius: radius.card, padding: Spacing.three, gap: 2 },
  planHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  planTitle: { fontWeight: '700' },
  badge: { paddingHorizontal: Spacing.two, paddingVertical: 2, borderRadius: radius.chip },
  badgeText: { fontWeight: '700' },
  trialNote: { marginTop: 2 },
  error: { marginTop: Spacing.one },
  restoreButton: { alignItems: 'center', paddingVertical: Spacing.two },
  disclosure: { marginTop: Spacing.two },
  legalRow: { flexDirection: 'row', justifyContent: 'center', gap: Spacing.four, marginTop: Spacing.one },
  legalLink: { textDecorationLine: 'underline' },
});
