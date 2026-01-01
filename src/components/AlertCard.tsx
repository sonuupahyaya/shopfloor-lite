import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Icon } from './Icon';
import { format } from 'date-fns';
import type { Alert } from '../types';
import { colors, spacing, fontSize, borderRadius, shadows } from '../constants/theme';

interface AlertCardProps {
  alert: Alert;
  onAcknowledge?: () => void;
  onClear?: () => void;
}

export function AlertCard({ alert, onAcknowledge, onClear }: AlertCardProps) {
  const getSeverityColor = () => {
    switch (alert.severity) {
      case 'low':
        return colors.alertLow;
      case 'medium':
        return colors.alertMedium;
      case 'high':
        return colors.alertHigh;
      case 'critical':
        return colors.alertCritical;
      default:
        return colors.alertMedium;
    }
  };

  const getSeverityIcon = () => {
    switch (alert.severity) {
      case 'low':
        return 'information-circle';
      case 'medium':
        return 'warning';
      case 'high':
        return 'alert-circle';
      case 'critical':
        return 'flame';
      default:
        return 'warning';
    }
  };

  const getStatusBadge = () => {
    switch (alert.status) {
      case 'created':
        return { label: 'NEW', color: colors.error };
      case 'acknowledged':
        return { label: 'ACK', color: colors.warning };
      case 'cleared':
        return { label: 'CLEARED', color: colors.success };
      default:
        return { label: 'UNKNOWN', color: colors.textMuted };
    }
  };

  const statusBadge = getStatusBadge();

  return (
    <View style={[styles.container, shadows.md]}>
      <View style={[styles.severityIndicator, { backgroundColor: getSeverityColor() }]} />

      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Icon
            name={getSeverityIcon()}
            size={24}
            color={getSeverityColor()}
          />
          <View style={styles.titleContainer}>
            <Text style={styles.machineName}>{alert.machineName}</Text>
            <Text style={styles.timestamp}>
              {format(new Date(alert.createdAt), 'MMM d, HH:mm')}
            </Text>
          </View>
        </View>

        <View style={[styles.statusBadge, { backgroundColor: statusBadge.color }]}>
          <Text style={styles.statusText}>{statusBadge.label}</Text>
        </View>
      </View>

      <Text style={styles.message}>{alert.message}</Text>

      {alert.acknowledgedBy && (
        <Text style={styles.actionInfo}>
          Acknowledged by {alert.acknowledgedBy} at{' '}
          {format(new Date(alert.acknowledgedAt!), 'HH:mm')}
        </Text>
      )}

      {alert.clearedBy && (
        <Text style={styles.actionInfo}>
          Cleared by {alert.clearedBy} at{' '}
          {format(new Date(alert.clearedAt!), 'HH:mm')}
        </Text>
      )}

      {alert.status !== 'cleared' && (
        <View style={styles.actions}>
          {alert.status === 'created' && onAcknowledge && (
            <TouchableOpacity
              style={[styles.actionButton, styles.acknowledgeButton]}
              onPress={onAcknowledge}
            >
              <Icon name="checkmark" size={16} color={colors.textOnPrimary} />
              <Text style={styles.actionButtonText}>Acknowledge</Text>
            </TouchableOpacity>
          )}

          {alert.status === 'acknowledged' && onClear && (
            <TouchableOpacity
              style={[styles.actionButton, styles.clearButton]}
              onPress={onClear}
            >
              <Icon name="checkmark-done" size={16} color={colors.textOnPrimary} />
              <Text style={styles.actionButtonText}>Clear</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  severityIndicator: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  titleContainer: {
    marginLeft: spacing.sm,
    flex: 1,
  },
  machineName: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.text,
  },
  timestamp: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  statusText: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: colors.textOnPrimary,
  },
  message: {
    fontSize: fontSize.md,
    color: colors.text,
    marginBottom: spacing.sm,
    paddingLeft: spacing.xl + spacing.sm,
  },
  actionInfo: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    fontStyle: 'italic',
    paddingLeft: spacing.xl + spacing.sm,
    marginBottom: spacing.xs,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: spacing.sm,
    gap: spacing.sm,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    gap: spacing.xs,
  },
  acknowledgeButton: {
    backgroundColor: colors.warning,
  },
  clearButton: {
    backgroundColor: colors.success,
  },
  actionButtonText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.textOnPrimary,
  },
});
