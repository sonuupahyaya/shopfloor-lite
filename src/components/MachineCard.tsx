import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Icon } from './Icon';
import type { Machine } from '../types';
import { colors, spacing, fontSize, borderRadius, shadows } from '../constants/theme';

interface MachineCardProps {
  machine: Machine;
  onPress: () => void;
  hasActiveDowntime?: boolean;
  alertCount?: number;
}

export function MachineCard({
  machine,
  onPress,
  hasActiveDowntime,
  alertCount = 0,
}: MachineCardProps) {
  const getStatusColor = () => {
    if (hasActiveDowntime) return colors.error;
    switch (machine.status) {
      case 'RUN':
        return colors.statusRun;
      case 'IDLE':
        return colors.statusIdle;
      case 'OFF':
        return colors.statusOff;
      default:
        return colors.statusOff;
    }
  };

  const getMachineIcon = () => {
    switch (machine.type) {
      case 'cutter':
        return 'cut';
      case 'roller':
        return 'sync';
      case 'packer':
        return 'cube';
      default:
        return 'hardware-chip';
    }
  };

  const displayStatus = hasActiveDowntime ? 'DOWN' : machine.status;

  return (
    <TouchableOpacity
      style={[styles.container, shadows.md]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.statusIndicator, { backgroundColor: getStatusColor() }]} />

      <View style={styles.iconContainer}>
        <Icon
          name={getMachineIcon()}
          size={32}
          color={colors.primary}
        />
      </View>

      <View style={styles.content}>
        <Text style={styles.name}>{machine.name}</Text>
        <Text style={styles.id}>{machine.id}</Text>
      </View>

      <View style={styles.rightSection}>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
          <Text style={styles.statusText}>{displayStatus}</Text>
        </View>

        {alertCount > 0 && (
          <View style={styles.alertBadge}>
            <Icon name="warning" size={12} color={colors.textOnPrimary} />
            <Text style={styles.alertCount}>{alertCount}</Text>
          </View>
        )}
      </View>

      <Icon
        name="chevron-forward"
        size={20}
        color={colors.textMuted}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  statusIndicator: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surfaceVariant,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  content: {
    flex: 1,
  },
  name: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  id: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  rightSection: {
    alignItems: 'flex-end',
    marginRight: spacing.sm,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.xs,
  },
  statusText: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: colors.textOnPrimary,
  },
  alertBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.error,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    gap: 2,
  },
  alertCount: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: colors.textOnPrimary,
  },
});
