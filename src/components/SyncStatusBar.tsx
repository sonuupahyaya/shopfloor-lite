import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Icon } from './Icon';
import { useSyncStore } from '../store/syncStore';
import { colors, spacing, fontSize } from '../constants/theme';

export function SyncStatusBar() {
  const { isOnline, isSyncing, pendingCount, startSync } = useSyncStore();

  if (isOnline && pendingCount === 0 && !isSyncing) {
    return null;
  }

  const getStatusColor = () => {
    if (!isOnline) return colors.error;
    if (isSyncing) return colors.info;
    if (pendingCount > 0) return colors.warning;
    return colors.success;
  };

  const getStatusIcon = () => {
    if (!isOnline) return 'cloud-offline';
    if (isSyncing) return 'sync';
    if (pendingCount > 0) return 'cloud-upload';
    return 'cloud-done';
  };

  const getStatusText = () => {
    if (!isOnline) return 'Offline Mode';
    if (isSyncing) return `Syncing... (${pendingCount} pending)`;
    if (pendingCount > 0) return `${pendingCount} pending changes`;
    return 'Synced';
  };

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: getStatusColor() }]}
      onPress={() => isOnline && pendingCount > 0 && startSync()}
      disabled={!isOnline || isSyncing}
    >
      <Icon
        name={getStatusIcon()}
        size={16}
        color={colors.textOnPrimary}
        style={isSyncing ? styles.spinningIcon : undefined}
      />
      <Text style={styles.text}>{getStatusText()}</Text>
      {isOnline && pendingCount > 0 && !isSyncing && (
        <Text style={styles.tapHint}>Tap to sync</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    gap: spacing.xs,
  },
  text: {
    color: colors.textOnPrimary,
    fontSize: fontSize.sm,
    fontWeight: '500',
  },
  tapHint: {
    color: colors.textOnPrimary,
    fontSize: fontSize.xs,
    opacity: 0.8,
    marginLeft: spacing.sm,
  },
  spinningIcon: {
    opacity: 0.8,
  },
});
