import React from 'react';
import { View, ScrollView, StyleSheet, Text, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from '../../src/components/Icon';
import { useAuthStore } from '../../src/store/authStore';
import { useSyncStore } from '../../src/store/syncStore';
import { Header } from '../../src/components';
import { colors, spacing, fontSize, borderRadius, shadows } from '../../src/constants/theme';
import { format } from 'date-fns';

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuthStore();
  const { isOnline, pendingCount, lastSyncTime, startSync, isSyncing } = useSyncStore();

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/');
        },
      },
    ]);
  };

  const handleSyncNow = async () => {
    if (!isOnline) {
      Alert.alert('Offline', 'Cannot sync while offline');
      return;
    }
    await startSync();
  };

  return (
    <View style={styles.container}>
      <Header title="Settings" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + spacing.lg },
        ]}
      >
        <View style={[styles.section, shadows.sm]}>
          <Text style={styles.sectionTitle}>Profile</Text>

          <View style={styles.profileRow}>
            <View style={styles.avatar}>
              <Icon
                name={user?.role === 'operator' ? 'construct' : 'shield'}
                size={32}
                color={colors.primary}
              />
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileEmail}>{user?.email}</Text>
              <View style={styles.roleBadge}>
                <Text style={styles.roleText}>
                  {user?.role?.charAt(0).toUpperCase()}
                  {user?.role?.slice(1)}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Tenant ID</Text>
            <Text style={styles.infoValue}>{user?.tenantId}</Text>
          </View>
        </View>

        <View style={[styles.section, shadows.sm]}>
          <Text style={styles.sectionTitle}>Sync Status</Text>

          <View style={styles.infoRow}>
            <View style={styles.infoLabelRow}>
              <Icon
                name={isOnline ? 'cloud-done' : 'cloud-offline'}
                size={20}
                color={isOnline ? colors.success : colors.error}
              />
              <Text style={styles.infoLabel}>Connection</Text>
            </View>
            <Text style={[styles.infoValue, { color: isOnline ? colors.success : colors.error }]}>
              {isOnline ? 'Online' : 'Offline'}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoLabelRow}>
              <Icon name="cloud-upload" size={20} color={colors.textSecondary} />
              <Text style={styles.infoLabel}>Pending Changes</Text>
            </View>
            <Text style={styles.infoValue}>{pendingCount}</Text>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoLabelRow}>
              <Icon name="time" size={20} color={colors.textSecondary} />
              <Text style={styles.infoLabel}>Last Sync</Text>
            </View>
            <Text style={styles.infoValue}>
              {lastSyncTime
                ? format(new Date(lastSyncTime), 'MMM d, HH:mm')
                : 'Never'}
            </Text>
          </View>

          <TouchableOpacity
            style={[
              styles.syncButton,
              (!isOnline || isSyncing) && styles.syncButtonDisabled,
            ]}
            onPress={handleSyncNow}
            disabled={!isOnline || isSyncing}
          >
            <Icon
              name="sync"
              size={20}
              color={isOnline && !isSyncing ? colors.primary : colors.textMuted}
            />
            <Text
              style={[
                styles.syncButtonText,
                (!isOnline || isSyncing) && styles.syncButtonTextDisabled,
              ]}
            >
              {isSyncing ? 'Syncing...' : 'Sync Now'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.section, shadows.sm]}>
          <Text style={styles.sectionTitle}>About</Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Version</Text>
            <Text style={styles.infoValue}>1.0.0</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Build</Text>
            <Text style={styles.infoValue}>Production</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Icon name="log-out" size={20} color={colors.error} />
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
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
  section: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.md,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  profileInfo: {
    flex: 1,
  },
  profileEmail: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  roleBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    alignSelf: 'flex-start',
  },
  roleText: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: colors.textOnPrimary,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  infoLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  infoLabel: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
  infoValue: {
    fontSize: fontSize.md,
    fontWeight: '500',
    color: colors.text,
  },
  syncButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary + '15',
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    marginTop: spacing.sm,
    gap: spacing.xs,
  },
  syncButtonDisabled: {
    backgroundColor: colors.border,
  },
  syncButtonText: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.primary,
  },
  syncButtonTextDisabled: {
    color: colors.textMuted,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.error + '15',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  logoutButtonText: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.error,
  },
});
