import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
} from 'react-native';
import { Icon } from './Icon';
import { format } from 'date-fns';
import type { MaintenanceItem as MaintenanceItemType } from '../types';
import { colors, spacing, fontSize, borderRadius, shadows } from '../constants/theme';

interface MaintenanceItemProps {
  item: MaintenanceItemType;
  onMarkDone: (notes?: string) => void;
  onAddNote: (notes: string) => void;
}

export function MaintenanceItemCard({
  item,
  onMarkDone,
  onAddNote,
}: MaintenanceItemProps) {
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [noteText, setNoteText] = useState(item.notes ?? '');

  const getStatusColor = () => {
    switch (item.status) {
      case 'done':
        return colors.success;
      case 'overdue':
        return colors.error;
      case 'due':
        return colors.warning;
      default:
        return colors.textMuted;
    }
  };

  const getStatusIcon = () => {
    switch (item.status) {
      case 'done':
        return 'checkmark-circle';
      case 'overdue':
        return 'alert-circle';
      case 'due':
        return 'time';
      default:
        return 'ellipse-outline';
    }
  };

  const handleSaveNote = () => {
    if (noteText.trim()) {
      onAddNote(noteText.trim());
    }
    setShowNoteModal(false);
  };

  return (
    <View style={[styles.container, shadows.sm]}>
      <View style={[styles.statusIndicator, { backgroundColor: getStatusColor() }]} />

      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Icon
              name={getStatusIcon()}
              size={24}
              color={getStatusColor()}
            />
            <View style={styles.titleContainer}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.description}>{item.description}</Text>
            </View>
          </View>

          <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
            <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
          </View>
        </View>

        <View style={styles.details}>
          <View style={styles.detailItem}>
            <Icon name="calendar" size={14} color={colors.textSecondary} />
            <Text style={styles.detailText}>
              Due: {format(new Date(item.dueDate), 'MMM d, yyyy')}
            </Text>
          </View>

          {item.completedAt && (
            <View style={styles.detailItem}>
              <Icon name="checkmark" size={14} color={colors.success} />
              <Text style={styles.detailText}>
                Completed: {format(new Date(item.completedAt), 'MMM d, HH:mm')}
              </Text>
            </View>
          )}

          {item.notes && (
            <View style={styles.noteContainer}>
              <Icon name="document-text" size={14} color={colors.textSecondary} />
              <Text style={styles.noteText}>{item.notes}</Text>
            </View>
          )}
        </View>

        {item.status !== 'done' && (
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.actionButton, styles.noteButton]}
              onPress={() => setShowNoteModal(true)}
            >
              <Icon name="create" size={16} color={colors.primary} />
              <Text style={styles.noteButtonText}>Add Note</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.doneButton]}
              onPress={() => onMarkDone()}
            >
              <Icon name="checkmark" size={16} color={colors.textOnPrimary} />
              <Text style={styles.doneButtonText}>Mark Done</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <Modal
        visible={showNoteModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowNoteModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Note</Text>

            <TextInput
              style={styles.noteInput}
              value={noteText}
              onChangeText={setNoteText}
              placeholder="Enter note..."
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowNoteModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleSaveNote}
              >
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
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
  content: {
    padding: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  headerLeft: {
    flexDirection: 'row',
    flex: 1,
    alignItems: 'flex-start',
  },
  titleContainer: {
    marginLeft: spacing.sm,
    flex: 1,
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.text,
  },
  description: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    marginLeft: spacing.sm,
  },
  statusText: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: colors.textOnPrimary,
  },
  details: {
    marginLeft: spacing.xl + spacing.sm,
    marginBottom: spacing.sm,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
    gap: spacing.xs,
  },
  detailText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  noteContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: spacing.xs,
    gap: spacing.xs,
  },
  noteText: {
    fontSize: fontSize.sm,
    color: colors.text,
    flex: 1,
    fontStyle: 'italic',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    gap: spacing.xs,
  },
  noteButton: {
    backgroundColor: colors.surfaceVariant,
    borderWidth: 1,
    borderColor: colors.border,
  },
  noteButtonText: {
    fontSize: fontSize.sm,
    fontWeight: '500',
    color: colors.primary,
  },
  doneButton: {
    backgroundColor: colors.success,
  },
  doneButtonText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.textOnPrimary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: fontSize.xl,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.md,
  },
  noteInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: fontSize.md,
    minHeight: 100,
    marginBottom: spacing.md,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
  },
  modalButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  cancelButton: {
    backgroundColor: colors.surfaceVariant,
  },
  cancelButtonText: {
    fontSize: fontSize.md,
    color: colors.text,
  },
  saveButton: {
    backgroundColor: colors.primary,
  },
  saveButtonText: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.textOnPrimary,
  },
});
