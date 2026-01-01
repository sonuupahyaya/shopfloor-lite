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
import { useMaintenanceStore } from '../../src/store/maintenanceStore';
import { useMachineStore } from '../../src/store/machineStore';
import { Header, MaintenanceItemCard } from '../../src/components';
import { colors, spacing, fontSize, borderRadius } from '../../src/constants/theme';

type FilterType = 'all' | 'due' | 'overdue' | 'done';

export default function MaintenanceScreen() {
  const insets = useSafeAreaInsets();
  const { items, loadItems, isLoading, markAsDone, addNote } = useMaintenanceStore();
  const { machines } = useMachineStore();
  const [filter, setFilter] = useState<FilterType>('all');
  const [selectedMachine, setSelectedMachine] = useState<string | null>(null);

  useEffect(() => {
    loadItems();
  }, []);

  const handleRefresh = () => {
    loadItems();
  };

  const filteredItems = items.filter((item) => {
    if (selectedMachine && item.machineId !== selectedMachine) return false;
    if (filter === 'all') return true;
    return item.status === filter;
  });

  const getFilterCount = (status: FilterType) => {
    if (status === 'all') return items.length;
    return items.filter((i) => i.status === status).length;
  };

  return (
    <View style={styles.container}>
      <Header title="Maintenance" />

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
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.machineFilter}
          contentContainerStyle={styles.machineFilterContent}
        >
          <TouchableOpacity
            style={[
              styles.machineChip,
              !selectedMachine && styles.machineChipActive,
            ]}
            onPress={() => setSelectedMachine(null)}
          >
            <Text
              style={[
                styles.machineChipText,
                !selectedMachine && styles.machineChipTextActive,
              ]}
            >
              All Machines
            </Text>
          </TouchableOpacity>

          {machines.map((machine) => (
            <TouchableOpacity
              key={machine.id}
              style={[
                styles.machineChip,
                selectedMachine === machine.id && styles.machineChipActive,
              ]}
              onPress={() => setSelectedMachine(machine.id)}
            >
              <Text
                style={[
                  styles.machineChipText,
                  selectedMachine === machine.id && styles.machineChipTextActive,
                ]}
              >
                {machine.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.filterRow}>
          {(['all', 'overdue', 'due', 'done'] as FilterType[]).map((f) => (
            <TouchableOpacity
              key={f}
              style={[styles.filterButton, filter === f && styles.filterButtonActive]}
              onPress={() => setFilter(f)}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  filter === f && styles.filterButtonTextActive,
                ]}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </Text>
              <View
                style={[
                  styles.filterBadge,
                  filter === f && styles.filterBadgeActive,
                ]}
              >
                <Text
                  style={[
                    styles.filterBadgeText,
                    filter === f && styles.filterBadgeTextActive,
                  ]}
                >
                  {getFilterCount(f)}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {filteredItems.length === 0 ? (
          <View style={styles.emptyState}>
            <Icon name="checkmark-circle" size={48} color={colors.success} />
            <Text style={styles.emptyStateText}>No maintenance items</Text>
            <Text style={styles.emptyStateSubtext}>
              {filter !== 'all'
                ? `No ${filter} items found`
                : 'All caught up!'}
            </Text>
          </View>
        ) : (
          filteredItems.map((item) => (
            <MaintenanceItemCard
              key={item.id}
              item={item}
              onMarkDone={(notes) => markAsDone(item.id, notes)}
              onAddNote={(notes) => addNote(item.id, notes)}
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
  machineFilter: {
    marginBottom: spacing.md,
    marginHorizontal: -spacing.md,
  },
  machineFilterContent: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  machineChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  machineChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  machineChipText: {
    fontSize: fontSize.sm,
    color: colors.text,
    fontWeight: '500',
  },
  machineChipTextActive: {
    color: colors.textOnPrimary,
  },
  filterRow: {
    flexDirection: 'row',
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  filterButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
    gap: spacing.xs,
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
  },
  filterButtonText: {
    fontSize: fontSize.sm,
    color: colors.text,
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: colors.textOnPrimary,
  },
  filterBadge: {
    backgroundColor: colors.border,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    minWidth: 20,
    alignItems: 'center',
  },
  filterBadgeActive: {
    backgroundColor: colors.textOnPrimary + '30',
  },
  filterBadgeText: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  filterBadgeTextActive: {
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
