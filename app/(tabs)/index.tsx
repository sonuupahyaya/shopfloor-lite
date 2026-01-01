import React, { useEffect } from 'react';
import { View, ScrollView, StyleSheet, RefreshControl, Text } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useMachineStore } from '../../src/store/machineStore';
import { useDowntimeStore } from '../../src/store/downtimeStore';
import { useAlertStore } from '../../src/store/alertStore';
import { Header, MachineCard } from '../../src/components';
import { colors, spacing, fontSize } from '../../src/constants/theme';

export default function MachinesScreen() {
  const insets = useSafeAreaInsets();
  const { machines, loadMachines, isLoading } = useMachineStore();
  const { activeDowntime, checkActiveDowntimes } = useDowntimeStore();
  const { alerts, loadAlerts, getAlertsByMachine } = useAlertStore();

  useEffect(() => {
    loadMachines();
    checkActiveDowntimes();
    loadAlerts();
  }, []);

  const handleRefresh = async () => {
    await Promise.all([loadMachines(), checkActiveDowntimes(), loadAlerts()]);
  };

  const handleMachinePress = (machineId: string) => {
    router.push(`/machine/${machineId}`);
  };

  return (
    <View style={styles.container}>
      <Header title="Machine Dashboard" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + spacing.lg },
        ]}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
          />
        }
      >
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {machines.filter((m) => m.status === 'RUN').length}
            </Text>
            <Text style={styles.statLabel}>Running</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.warning }]}>
              {machines.filter((m) => m.status === 'IDLE').length}
            </Text>
            <Text style={styles.statLabel}>Idle</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.error }]}>
              {Object.values(activeDowntime).filter(Boolean).length}
            </Text>
            <Text style={styles.statLabel}>Down</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>All Machines</Text>

        {machines.map((machine) => {
          const machineAlerts = getAlertsByMachine(machine.id).filter(
            (a) => a.status !== 'cleared'
          );
          return (
            <MachineCard
              key={machine.id}
              machine={machine}
              onPress={() => handleMachinePress(machine.id)}
              hasActiveDowntime={!!activeDowntime[machine.id]}
              alertCount={machineAlerts.length}
            />
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.lg,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: fontSize.xxl,
    fontWeight: '700',
    color: colors.success,
  },
  statLabel: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.border,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.md,
  },
});
