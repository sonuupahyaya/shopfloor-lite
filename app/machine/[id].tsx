import React, { useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import * as Linking from 'expo-linking';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from '../../src/components/Icon';
import { format } from 'date-fns';
import { useMachineStore } from '../../src/store/machineStore';
import { useDowntimeStore } from '../../src/store/downtimeStore';
import { useMaintenanceStore } from '../../src/store/maintenanceStore';
import { useAlertStore } from '../../src/store/alertStore';
import { useAuthStore } from '../../src/store/authStore';
import { Header, Button, ReasonPicker, MaintenanceItemCard, AlertCard } from '../../src/components';
import { pickImageFromCamera, pickImageFromLibrary } from '../../src/services/imageService';
import { colors, spacing, fontSize, borderRadius, shadows } from '../../src/constants/theme';
import type { DowntimeEvent } from '../../src/types';

export default function MachineDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();
  const { getMachineById, updateMachineStatus } = useMachineStore();
  const {
    activeDowntime,
    startDowntime,
    endDowntime,
    getActiveDowntime,
    reasonTree,
    loadEvents,
    events,
  } = useDowntimeStore();
  const { items: maintenanceItems, loadItems, markAsDone, addNote } = useMaintenanceStore();
  const { alerts, loadAlerts, acknowledgeAlert, clearAlert } = useAlertStore();

  const [showReasonPicker, setShowReasonPicker] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [currentDowntime, setCurrentDowntime] = useState<DowntimeEvent | null>(null);
  const [activeTab, setActiveTab] = useState<'actions' | 'maintenance' | 'alerts' | 'history'>('actions');

  const machine = getMachineById(id ?? '');
  const machineActiveDowntime = activeDowntime[id ?? ''] ?? null;
  const machineMaintenanceItems = maintenanceItems.filter((i) => i.machineId === id);
  const machineAlerts = alerts.filter((a) => a.machineId === id);
  const machineHistory = events.filter((e) => e.machineId === id && e.endTime);

  useEffect(() => {
    if (id) {
      getActiveDowntime(id);
      loadItems(id);
      loadAlerts();
      loadEvents(id);
    }
  }, [id]);

  useEffect(() => {
    setCurrentDowntime(machineActiveDowntime);
  }, [machineActiveDowntime]);

  if (!machine) {
    return (
      <View style={styles.container}>
        <Header title="Machine Not Found" showBack onBack={() => router.back()} />
        <View style={styles.errorContainer}>
          <Icon name="alert-circle" size={48} color={colors.error} />
          <Text style={styles.errorText}>Machine not found</Text>
        </View>
      </View>
    );
  }

  const handleStartDowntime = async () => {
    try {
      const event = await startDowntime(machine.id);
      await updateMachineStatus(machine.id, 'OFF');
      setCurrentDowntime(event);
    } catch (error) {
      console.error('Failed to start downtime:', error);
      Alert.alert('Error', 'Failed to start downtime recording');
    }
  };

  const handleEndDowntime = () => {
    setShowReasonPicker(true);
  };

  const handleReasonSelect = async (
    code: string,
    label: string,
    parentCode?: string,
    parentLabel?: string
  ) => {
    setShowReasonPicker(false);

    if (!currentDowntime) return;

    try {
      await endDowntime(
        currentDowntime.id,
        code,
        label,
        parentCode,
        parentLabel,
        selectedPhoto ?? undefined
      );
      await updateMachineStatus(machine.id, 'IDLE');
      setCurrentDowntime(null);
      setSelectedPhoto(null);
      Alert.alert('Success', 'Downtime recorded successfully');
    } catch (error) {
      console.error('Failed to end downtime:', error);
      Alert.alert('Error', 'Failed to record downtime');
    }
  };

  const handleTakePhoto = async () => {
    try {
      const result = await pickImageFromCamera();
      if (result) {
        setSelectedPhoto(result.uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to take photo');
    }
  };

  const handlePickPhoto = async () => {
    try {
      const result = await pickImageFromLibrary();
      if (result) {
        setSelectedPhoto(result.uri);
      }
    } catch (error) {
      console.error('Photo picker error:', error);
      const message = error instanceof Error ? error.message : 'Failed to pick photo';
      if (message.includes('Settings')) {
        Alert.alert('Permission Required', message, [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open Settings', onPress: () => Linking.openSettings() },
        ]);
      } else {
        Alert.alert('Error', message);
      }
    }
  };

  const getStatusColor = () => {
    if (currentDowntime) return colors.error;
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

  const displayStatus = currentDowntime ? 'DOWN' : machine.status;

  return (
    <View style={styles.container}>
      <Header
        title={machine.name}
        showBack
        onBack={() => router.back()}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + spacing.lg },
        ]}
      >
        <View style={[styles.statusCard, shadows.md]}>
          <View style={[styles.statusIndicator, { backgroundColor: getStatusColor() }]}>
            <Icon
              name={currentDowntime ? 'pause' : 'play'}
              size={32}
              color={colors.textOnPrimary}
            />
          </View>

          <View style={styles.statusContent}>
            <Text style={styles.machineId}>{machine.id}</Text>
            <Text style={styles.machineType}>{machine.type.toUpperCase()}</Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
              <Text style={styles.statusBadgeText}>{displayStatus}</Text>
            </View>
          </View>

          {currentDowntime && (
            <View style={styles.downtimeTimer}>
              <Icon name="time" size={16} color={colors.error} />
              <Text style={styles.downtimeTimerText}>
                Started: {format(new Date(currentDowntime.startTime), 'HH:mm')}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.tabBar}>
          {(['actions', 'maintenance', 'alerts', 'history'] as const).map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.tabActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {activeTab === 'actions' && (
          <View style={styles.actionsSection}>
            {user?.role === 'operator' && (
              <>
                {!currentDowntime ? (
                  <Button
                    title="Start Downtime"
                    icon="pause-circle"
                    variant="danger"
                    size="large"
                    fullWidth
                    onPress={handleStartDowntime}
                  />
                ) : (
                  <View style={styles.activeDowntimeCard}>
                    <View style={styles.activeDowntimeHeader}>
                      <Icon name="alert-circle" size={24} color={colors.error} />
                      <Text style={styles.activeDowntimeTitle}>Downtime In Progress</Text>
                    </View>

                    <Text style={styles.activeDowntimeInfo}>
                      Started at {format(new Date(currentDowntime.startTime), 'HH:mm:ss')}
                    </Text>

                    <View style={styles.photoSection}>
                      <Text style={styles.photoLabel}>Add Photo (Optional)</Text>
                      <View style={styles.photoButtons}>
                        <TouchableOpacity style={styles.photoButton} onPress={handleTakePhoto}>
                          <Icon name="camera" size={24} color={colors.primary} />
                          <Text style={styles.photoButtonText}>Camera</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.photoButton} onPress={handlePickPhoto}>
                          <Icon name="images" size={24} color={colors.primary} />
                          <Text style={styles.photoButtonText}>Gallery</Text>
                        </TouchableOpacity>
                      </View>

                      {selectedPhoto && (
                        <View style={styles.photoPreview}>
                          <Image source={{ uri: selectedPhoto }} style={styles.photoImage} />
                          <TouchableOpacity
                            style={styles.removePhotoButton}
                            onPress={() => setSelectedPhoto(null)}
                          >
                            <Icon name="close-circle" size={24} color={colors.error} />
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>

                    <Button
                      title="End Downtime & Select Reason"
                      icon="checkmark-circle"
                      variant="success"
                      size="large"
                      fullWidth
                      onPress={handleEndDowntime}
                    />
                  </View>
                )}
              </>
            )}

            <View style={styles.quickActions}>
              <Text style={styles.quickActionsTitle}>Quick Status Update</Text>
              <View style={styles.statusButtons}>
                <TouchableOpacity
                  style={[
                    styles.statusButton,
                    machine.status === 'RUN' && styles.statusButtonActive,
                    { borderColor: colors.success },
                  ]}
                  onPress={() => updateMachineStatus(machine.id, 'RUN')}
                  disabled={!!currentDowntime}
                >
                  <Icon name="play" size={20} color={colors.success} />
                  <Text style={[styles.statusButtonText, { color: colors.success }]}>
                    RUN
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.statusButton,
                    machine.status === 'IDLE' && styles.statusButtonActive,
                    { borderColor: colors.warning },
                  ]}
                  onPress={() => updateMachineStatus(machine.id, 'IDLE')}
                  disabled={!!currentDowntime}
                >
                  <Icon name="pause" size={20} color={colors.warning} />
                  <Text style={[styles.statusButtonText, { color: colors.warning }]}>
                    IDLE
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.statusButton,
                    machine.status === 'OFF' && styles.statusButtonActive,
                    { borderColor: colors.textMuted },
                  ]}
                  onPress={() => updateMachineStatus(machine.id, 'OFF')}
                  disabled={!!currentDowntime}
                >
                  <Icon name="power" size={20} color={colors.textMuted} />
                  <Text style={[styles.statusButtonText, { color: colors.textMuted }]}>
                    OFF
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {activeTab === 'maintenance' && (
          <View style={styles.tabContent}>
            {machineMaintenanceItems.length === 0 ? (
              <View style={styles.emptyState}>
                <Icon name="checkmark-circle" size={48} color={colors.success} />
                <Text style={styles.emptyStateText}>No maintenance tasks</Text>
              </View>
            ) : (
              machineMaintenanceItems.map((item) => (
                <MaintenanceItemCard
                  key={item.id}
                  item={item}
                  onMarkDone={(notes) => markAsDone(item.id, notes)}
                  onAddNote={(notes) => addNote(item.id, notes)}
                />
              ))
            )}
          </View>
        )}

        {activeTab === 'alerts' && (
          <View style={styles.tabContent}>
            {machineAlerts.length === 0 ? (
              <View style={styles.emptyState}>
                <Icon name="notifications-off" size={48} color={colors.textMuted} />
                <Text style={styles.emptyStateText}>No alerts</Text>
              </View>
            ) : (
              machineAlerts.map((alert) => (
                <AlertCard
                  key={alert.id}
                  alert={alert}
                  onAcknowledge={() => acknowledgeAlert(alert.id)}
                  onClear={() => clearAlert(alert.id)}
                />
              ))
            )}
          </View>
        )}

        {activeTab === 'history' && (
          <View style={styles.tabContent}>
            {machineHistory.length === 0 ? (
              <View style={styles.emptyState}>
                <Icon name="time-outline" size={48} color={colors.textMuted} />
                <Text style={styles.emptyStateText}>No downtime history</Text>
              </View>
            ) : (
              machineHistory.slice(0, 10).map((event) => (
                <View key={event.id} style={styles.historyItem}>
                  <View style={styles.historyHeader}>
                    <Text style={styles.historyReason}>
                      {event.parentReasonLabel
                        ? `${event.parentReasonLabel} › ${event.reasonLabel}`
                        : event.reasonLabel}
                    </Text>
                    <Text style={styles.historyDate}>
                      {format(new Date(event.startTime), 'MMM d')}
                    </Text>
                  </View>
                  <Text style={styles.historyTime}>
                    {format(new Date(event.startTime), 'HH:mm')} -{' '}
                    {event.endTime ? format(new Date(event.endTime), 'HH:mm') : 'Ongoing'}
                  </Text>
                  {!event.synced && (
                    <View style={styles.unsyncedBadge}>
                      <Icon name="cloud-upload" size={12} color={colors.warning} />
                      <Text style={styles.unsyncedText}>Pending sync</Text>
                    </View>
                  )}
                </View>
              ))
            )}
          </View>
        )}
      </ScrollView>

      {showReasonPicker && (
        <ReasonPicker
          reasonTree={reasonTree}
          onSelect={handleReasonSelect}
          onCancel={() => setShowReasonPicker(false)}
        />
      )}
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: fontSize.lg,
    color: colors.error,
    marginTop: spacing.md,
  },
  statusCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  statusContent: {
    flex: 1,
  },
  machineId: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  machineType: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    alignSelf: 'flex-start',
  },
  statusBadgeText: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.textOnPrimary,
  },
  downtimeTimer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.error + '15',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  downtimeTimerText: {
    fontSize: fontSize.sm,
    color: colors.error,
    fontWeight: '500',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.xs,
    marginBottom: spacing.md,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: borderRadius.md,
  },
  tabActive: {
    backgroundColor: colors.primary,
  },
  tabText: {
    fontSize: fontSize.sm,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  tabTextActive: {
    color: colors.textOnPrimary,
  },
  actionsSection: {
    gap: spacing.md,
  },
  activeDowntimeCard: {
    backgroundColor: colors.error + '10',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.error + '30',
  },
  activeDowntimeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  activeDowntimeTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.error,
  },
  activeDowntimeInfo: {
    fontSize: fontSize.md,
    color: colors.text,
    marginBottom: spacing.md,
  },
  photoSection: {
    marginBottom: spacing.md,
  },
  photoLabel: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  photoButtons: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  photoButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    gap: spacing.xs,
  },
  photoButtonText: {
    fontSize: fontSize.md,
    color: colors.primary,
    fontWeight: '500',
  },
  photoPreview: {
    marginTop: spacing.md,
    position: 'relative',
  },
  photoImage: {
    width: '100%',
    height: 150,
    borderRadius: borderRadius.md,
    resizeMode: 'cover',
  },
  removePhotoButton: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
    backgroundColor: colors.surface,
    borderRadius: 12,
  },
  quickActions: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
  },
  quickActionsTitle: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.md,
  },
  statusButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  statusButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    backgroundColor: colors.surfaceVariant,
    gap: spacing.xs,
  },
  statusButtonActive: {
    backgroundColor: colors.border,
  },
  statusButtonText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  tabContent: {
    gap: spacing.md,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyStateText: {
    fontSize: fontSize.lg,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  historyItem: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  historyReason: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
  },
  historyDate: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  historyTime: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  unsyncedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
    gap: spacing.xs,
  },
  unsyncedText: {
    fontSize: fontSize.xs,
    color: colors.warning,
  },
});
