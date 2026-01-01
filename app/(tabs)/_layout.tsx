import React from 'react';
import { Tabs } from 'expo-router';
import { Icon } from '../../src/components/Icon';
import { useAuthStore } from '../../src/store/authStore';
import { useAlertStore } from '../../src/store/alertStore';
import { colors, fontSize } from '../../src/constants/theme';
import { SyncStatusBar } from '../../src/components/SyncStatusBar';
import { View } from 'react-native';

export default function TabsLayout() {
  const { user } = useAuthStore();
  const { getOpenAlerts } = useAlertStore();
  const openAlerts = getOpenAlerts();

  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textMuted,
          tabBarStyle: {
            backgroundColor: colors.surface,
            borderTopColor: colors.border,
            paddingTop: 4,
          },
          tabBarLabelStyle: {
            fontSize: fontSize.xs,
            fontWeight: '500',
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Machines',
            tabBarIcon: ({ color, size }) => (
              <Icon name="hardware-chip" size={size} color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="maintenance"
          options={{
            title: 'Maintenance',
            tabBarIcon: ({ color, size }) => (
              <Icon name="build" size={size} color={color} />
            ),
            href: user?.role === 'operator' ? undefined : null,
          }}
        />

        <Tabs.Screen
          name="alerts"
          options={{
            title: 'Alerts',
            tabBarIcon: ({ color, size }) => (
              <Icon name="notifications" size={size} color={color} />
            ),
            tabBarBadge: openAlerts.length > 0 ? openAlerts.length : undefined,
            tabBarBadgeStyle: {
              backgroundColor: colors.error,
              fontSize: fontSize.xs,
            },
            href: user?.role === 'supervisor' ? undefined : null,
          }}
        />

        <Tabs.Screen
          name="kpis"
          options={{
            title: 'Dashboard',
            tabBarIcon: ({ color, size }) => (
              <Icon name="stats-chart" size={size} color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="settings"
          options={{
            title: 'Settings',
            tabBarIcon: ({ color, size }) => (
              <Icon name="settings" size={size} color={color} />
            ),
          }}
        />
      </Tabs>
      <SyncStatusBar />
    </View>
  );
}
