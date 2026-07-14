import { Stack } from 'expo-router';

import { useTheme } from '@/hooks/use-theme';

export default function ProgramLayout() {
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
      <Stack.Screen name="lesson" options={{ title: 'Lesson' }} />
      <Stack.Screen name="exercise" options={{ title: 'Exercise' }} />
      <Stack.Screen name="checkin" options={{ title: 'Evening check-in' }} />
    </Stack>
  );
}
