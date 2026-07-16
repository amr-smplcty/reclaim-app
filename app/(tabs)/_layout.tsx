import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { SosButton } from '@/components/sos-button';
import { SettingsButton } from '@/components/settings-button';
import { EmergencyCardButton } from '@/components/emergency-card-button';
import { useTheme } from '@/hooks/use-theme';

export default function TabsLayout() {
  const theme = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerRight: () => <SosButton />,
        headerStyle: { backgroundColor: theme.bg },
        headerTintColor: theme.textPrimary,
        headerShadowVisible: false,
        tabBarActiveTintColor: theme.accent,
        tabBarInactiveTintColor: theme.textSecondary,
        tabBarStyle: { backgroundColor: theme.bg, borderTopColor: theme.border },
      }}
    >
      <Tabs.Screen
        name="today"
        options={{
          title: 'Today',
          headerLeft: () => <SettingsButton />,
          tabBarIcon: ({ color, size }) => <Ionicons name="today-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="toolkit"
        options={{
          title: 'Toolkit',
          headerLeft: () => <EmergencyCardButton />,
          tabBarIcon: ({ color, size }) => <Ionicons name="shield-checkmark-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="journal"
        options={{
          title: 'Journal',
          tabBarIcon: ({ color, size }) => <Ionicons name="book-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: 'Progress',
          tabBarIcon: ({ color, size }) => <Ionicons name="trending-up-outline" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
