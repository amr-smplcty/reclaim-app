import { Redirect } from 'expo-router';

import { routeForStep } from '@/features/assessment/navigation';
import { useOnboardingStore } from '@/features/assessment/useOnboardingStore';
import { useAppStore } from '@/stores/useAppStore';

export default function Index() {
  const hasOnboarded = useAppStore((s) => s.hasOnboarded);
  const isMinor = useOnboardingStore((s) => s.isMinor);
  const currentStep = useOnboardingStore((s) => s.currentStep);

  if (isMinor) {
    return <Redirect href="/(onboarding)/resources" />;
  }
  if (!hasOnboarded) {
    return <Redirect href={routeForStep(currentStep)} />;
  }
  return <Redirect href="/(tabs)/today" />;
}
