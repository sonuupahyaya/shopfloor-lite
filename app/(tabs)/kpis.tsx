import React, { useEffect } from 'react';
import { View, ScrollView, StyleSheet, RefreshControl, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from '../../src/components/Icon';
import { useKPIStore } from '../../src/store/kpiStore';
import { Header, KPICard } from '../../src/components';
import { colors, spacing, fontSize, borderRadius, shadows } from '../../src/constants/theme';

export default function KPIsScreen() {
  const insets = useSafeAreaInsets();
  const { data, loadKPIs, isLoading } = useKPIStore();

  useEffect(() => {
    loadKPIs();
  }, []);

  const handleRefresh = () => {
    loadKPIs();
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  return (
    <View style={styles.container}>
      <Header title="Dashboard" />

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
        <Text style={styles.sectionTitle}>Today's Overview</Text>

        <View style={styles.heroCard}>
          <View style={styles.heroIconContainer}>
            <Icon name="time" size={32} color={colors.error} />
          </View>
          <View style={styles.heroContent}>
            <Text style={styles.heroLabel}>Total Downtime Today</Text>
            <Text style={styles.heroValue}>
              {data ? formatDuration(data.totalDowntimeMinutes) : '--'}
            </Text>
            <Text style={styles.heroSubtext}>
              {data?.totalDowntimeToday ?? 0} downtime events
            </Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Machine Status</Text>

        <View style={styles.kpiRow}>
          <KPICard
            title="Running"
            value={data?.machinesRunning ?? 0}
            icon="play-circle"
            color={colors.success}
            subtitle="machines active"
          />
          <KPICard
            title="Down / Idle"
            value={data?.machinesDown ?? 0}
            icon="pause-circle"
            color={colors.warning}
            subtitle="need attention"
          />
        </View>

        <Text style={styles.sectionTitle}>Alerts</Text>

        <View style={styles.kpiRow}>
          <KPICard
            title="Open Alerts"
            value={data?.alertsOpen ?? 0}
            icon="warning"
            color={colors.error}
            subtitle="require action"
          />
          <KPICard
            title="Cleared Today"
            value={data?.alertsClosed ?? 0}
            icon="checkmark-circle"
            color={colors.success}
            subtitle="resolved"
          />
        </View>

        <Text style={styles.sectionTitle}>Maintenance</Text>

        <View style={[styles.progressCard, shadows.md]}>
          <View style={styles.progressHeader}>
            <Icon name="build" size={24} color={colors.primary} />
            <Text style={styles.progressTitle}>Maintenance Completion</Text>
          </View>

          <View style={styles.progressBarContainer}>
            <View
              style={[
                styles.progressBar,
                {
                  width: `${data?.maintenanceCompletedPercent ?? 0}%`,
                },
              ]}
            />
          </View>

          <View style={styles.progressStats}>
            <Text style={styles.progressPercent}>
              {data?.maintenanceCompletedPercent ?? 0}%
            </Text>
            <Text style={styles.progressDetail}>
              {data?.maintenanceCompleted ?? 0} of {data?.maintenanceTotal ?? 0} tasks
              completed
            </Text>
          </View>
        </View>

        <View style={styles.kpiRow}>
          <KPICard
            title="Total Tasks"
            value={data?.maintenanceTotal ?? 0}
            icon="list"
            color={colors.info}
            subtitle="maintenance items"
          />
          <KPICard
            title="Completed"
            value={data?.maintenanceCompleted ?? 0}
            icon="checkmark-done"
            color={colors.success}
            subtitle="tasks done"
          />
        </View>

        <Text style={styles.sectionTitle}>Quick Stats</Text>

        <View style={[styles.statsCard, shadows.md]}>
          <View style={styles.statRow}>
            <View style={styles.statItem}>
              <Icon name="alert-circle" size={20} color={colors.alertCritical} />
              <Text style={styles.statLabel}>Critical Alerts</Text>
              <Text style={styles.statValue}>0</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Icon name="trending-up" size={20} color={colors.success} />
              <Text style={styles.statLabel}>Uptime</Text>
              <Text style={styles.statValue}>94.2%</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Icon name="speedometer" size={20} color={colors.info} />
              <Text style={styles.statLabel}>OEE</Text>
              <Text style={styles.statValue}>87.5%</Text>
            </View>
          </View>
        </View>
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
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.md,
    marginTop: spacing.sm,
  },
  heroCard: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    alignItems: 'center',
    ...shadows.md,
  },
  heroIconContainer: {
    width: 64,
    height: 64,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.error + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  heroContent: {
    flex: 1,
  },
  heroLabel: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  heroValue: {
    fontSize: 36,
    fontWeight: '700',
    color: colors.error,
    marginVertical: spacing.xs,
  },
  heroSubtext: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  kpiRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  progressCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  progressTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.text,
  },
  progressBarContainer: {
    height: 12,
    backgroundColor: colors.border,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.success,
    borderRadius: borderRadius.full,
  },
  progressStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressPercent: {
    fontSize: fontSize.xxl,
    fontWeight: '700',
    color: colors.success,
  },
  progressDetail: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  statsCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    padding: spacing.sm,
  },
  statLabel: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  statValue: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.text,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.border,
  },
});
