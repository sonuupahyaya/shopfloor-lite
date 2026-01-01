import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useAuthStore } from '../src/store/authStore';
import { useMachineStore } from '../src/store/machineStore';
import { useDowntimeStore } from '../src/store/downtimeStore';
import { initializeSyncManager } from '../src/sync/SyncManager';
import { startAlertGenerator } from '../src/services/alertGenerator';
import { getDatabase } from '../src/database';

export default function RootLayout() {
  const { loadUser, isAuthenticated } = useAuthStore();
  const { loadMachines } = useMachineStore();
  const { checkActiveDowntimes } = useDowntimeStore();

  useEffect(() => {
    async function initialize() {
      await getDatabase();
      await loadUser();
      await loadMachines();
      await checkActiveDowntimes();
      initializeSyncManager();
      startAlertGenerator();
    }
    initialize();
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="machine/[id]"
          options={{
            presentation: 'card',
          }}
        />

      </Stack>
    </SafeAreaProvider>
  );
}
