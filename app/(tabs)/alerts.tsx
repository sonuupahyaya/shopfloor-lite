import React, { useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  RefreshControl,
  Text,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from '../../src/components/Icon';
import { useAlertStore } from '../../src/store/alertStore';
import { Header, AlertCard } from '../../src/components';
import { colors, spacing, fontSize, borderRadius } from '../../src/constants/theme';
import type { AlertStatus } from '../../src/types';

type FilterType = 'all' | AlertStatus;

export default function AlertsScreen() {
  const insets = useSafeAreaInsets();
  const {
    alerts,
    loadAlerts,
    isLoading,
    acknowledgeAlert,
    clearAlert,
    generateSimulatedAlert,
  } = useAlertStore();
  const [filter, setFilter] = useState<FilterType>('all');

  useEffect(() => {
    loadAlerts();
  }, []);

  const handleRefresh = () => {
    loadAlerts();
  };

  const filteredAlerts = alerts.filter((alert) => {
    if (filter === 'all') return true;
    return alert.status === filter;
  });

  const getFilterCount = (status: FilterType) => {
    if (status === 'all') return alerts.length;
    return alerts.filter((a) => a.status === status).length;
  };

  const getFilterColor = (status: FilterType) => {
    switch (status) {
      case 'created':
        return colors.error;
      case 'acknowledged':
        return colors.warning;
      case 'cleared':
        return colors.success;
      default:
        return colors.primary;
    }
  };

  return (
    <View style={styles.container}>
      <Header
        title="Alerts"
        rightAction={{
          icon: 'add-circle',
          onPress: generateSimulatedAlert,
        }}
      />

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
        <View style={styles.summaryRow}>
          <View style={[styles.summaryCard, { borderColor: colors.error }]}>
            <Text style={[styles.summaryValue, { color: colors.error }]}>
              {getFilterCount('created')}
            </Text>
            <Text style={styles.summaryLabel}>New</Text>
          </View>
          <View style={[styles.summaryCard, { borderColor: colors.warning }]}>
            <Text style={[styles.summaryValue, { color: colors.warning }]}>
              {getFilterCount('acknowledged')}
            </Text>
            <Text style={styles.summaryLabel}>Acknowledged</Text>
          </View>
          <View style={[styles.summaryCard, { borderColor: colors.success }]}>
            <Text style={[styles.summaryValue, { color: colors.success }]}>
              {getFilterCount('cleared')}
            </Text>
            <Text style={styles.summaryLabel}>Cleared</Text>
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterScroll}
          contentContainerStyle={styles.filterContent}
        >
          {(['all', 'created', 'acknowledged', 'cleared'] as FilterType[]).map(
            (f) => (
              <TouchableOpacity
                key={f}
                style={[
                  styles.filterChip,
                  filter === f && {
                    backgroundColor: getFilterColor(f),
                    borderColor: getFilterColor(f),
                  },
                ]}
                onPress={() => setFilter(f)}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    filter === f && styles.filterChipTextActive,
                  ]}
                >
                  {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
                </Text>
                <Text
                  style={[
                    styles.filterChipCount,
                    filter === f && styles.filterChipCountActive,
                  ]}
                >
                  {getFilterCount(f)}
                </Text>
              </TouchableOpacity>
            )
          )}
        </ScrollView>

        {filteredAlerts.length === 0 ? (
          <View style={styles.emptyState}>
            <Icon name="notifications-off" size={48} color={colors.textMuted} />
            <Text style={styles.emptyStateText}>No alerts</Text>
            <Text style={styles.emptyStateSubtext}>
              {filter !== 'all'
                ? `No ${filter} alerts`
                : 'All quiet on the shop floor'}
            </Text>
          </View>
        ) : (
          filteredAlerts.map((alert) => (
            <AlertCard
              key={alert.id}
              alert={alert}
              onAcknowledge={() => acknowledgeAlert(alert.id)}
              onClear={() => clearAlert(alert.id)}
            />
          ))
        )}
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
  summaryRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    borderLeftWidth: 3,
  },
  summaryValue: {
    fontSize: fontSize.xxl,
    fontWeight: '700',
  },
  summaryLabel: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  filterScroll: {
    marginBottom: spacing.lg,
    marginHorizontal: -spacing.md,
  },
  filterContent: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.xs,
  },
  filterChipText: {
    fontSize: fontSize.sm,
    color: colors.text,
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: colors.textOnPrimary,
  },
  filterChipCount: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  filterChipCountActive: {
    color: colors.textOnPrimary,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyStateText: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.text,
    marginTop: spacing.md,
  },
  emptyStateSubtext: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
});
