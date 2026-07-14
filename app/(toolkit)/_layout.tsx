import { Stack } from 'expo-router';

import { useTheme } from '@/hooks/use-theme';

export default function ToolkitLayout() {
  const theme = useTheme();

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: theme.background },
        headerTintColor: theme.text,
        headerShadowVisible: false,
        headerBackButtonDisplayMode: 'minimal',
      }}
    >
      <Stack.Screen name="urge-surf" options={{ title: 'Urge Surf' }} />
      <Stack.Screen name="breather" options={{ title: 'Breather' }} />
      <Stack.Screen name="defusion" options={{ title: 'Defusion' }} />
      <Stack.Screen name="shift-environment" options={{ title: 'Shift Environment' }} />
      <Stack.Screen name="ten-minute-shift" options={{ title: '10-Minute Shift' }} />
      <Stack.Screen name="log-urge" options={{ title: 'Log the Urge' }} />
      <Stack.Screen name="lapse-debrief" options={{ title: 'Lapse Debrief' }} />
    </Stack>
  );
}
