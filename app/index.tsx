import { Redirect } from 'expo-router';

import { useAppStore } from '@/stores/useAppStore';

export default function Index() {
  const hasOnboarded = useAppStore((s) => s.hasOnboarded);

  return <Redirect href={hasOnboarded ? '/(tabs)/today' : '/(onboarding)/welcome'} />;
}
