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
        headerStyle: { backgroundColor: theme.surface },
        headerTintColor: theme.textPrimary,
        headerShadowVisible: false,
        tabBarActiveTintColor: theme.accent,
        tabBarInactiveTintColor: theme.textSecondary,
        tabBarStyle: { backgroundColor: theme.surface, borderTopColor: theme.border },
      }}
    >
      {/* Icons are stroke-only at rest and filled when active (DESIGN_SYSTEM
          §6) — the shape change carries the active state alongside color and
          the always-present text label, so selection is never color-alone. */}
      <Tabs.Screen
        name="today"
        options={{
          title: 'Today',
          headerLeft: () => <SettingsButton />,
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'today' : 'today-outline'} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="toolkit"
        options={{
          title: 'Toolkit',
          headerLeft: () => <EmergencyCardButton />,
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'shield-checkmark' : 'shield-checkmark-outline'} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="journal"
        options={{
          title: 'Journal',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'book' : 'book-outline'} size={size} color={color} />
          ),
        }}
      />
      {/* Deviation (b): Tab 4 stays "Progress", not "You" — it holds the score
          trend, journey map, and Commitment Goals (CLINICAL_SPEC §2/§9). */}
      <Tabs.Screen
        name="progress"
        options={{
          title: 'Progress',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'trending-up' : 'trending-up-outline'} size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
