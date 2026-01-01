import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
} from 'react-native';
import { Icon } from './Icon';
import type { DowntimeReason } from '../types';
import { colors, spacing, fontSize, borderRadius, shadows } from '../constants/theme';

interface ReasonPickerProps {
  reasonTree: DowntimeReason[];
  onSelect: (
    code: string,
    label: string,
    parentCode?: string,
    parentLabel?: string
  ) => void;
  onCancel: () => void;
}

export function ReasonPicker({ reasonTree, onSelect, onCancel }: ReasonPickerProps) {
  const [selectedParent, setSelectedParent] = useState<DowntimeReason | null>(null);

  const handleParentSelect = (reason: DowntimeReason) => {
    if (reason.children && reason.children.length > 0) {
      setSelectedParent(reason);
    } else {
      onSelect(reason.code, reason.label);
    }
  };

  const handleChildSelect = (child: DowntimeReason) => {
    if (selectedParent) {
      onSelect(child.code, child.label, selectedParent.code, selectedParent.label);
    }
  };

  const handleBack = () => {
    setSelectedParent(null);
  };

  return (
    <Modal visible animationType="slide" transparent onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <View style={[styles.container, shadows.lg]}>
          <View style={styles.header}>
            {selectedParent ? (
              <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                <Icon name="arrow-back" size={24} color={colors.text} />
              </TouchableOpacity>
            ) : (
              <View style={styles.backButton} />
            )}

            <Text style={styles.title}>
              {selectedParent ? selectedParent.label : 'Select Reason'}
            </Text>

            <TouchableOpacity onPress={onCancel} style={styles.closeButton}>
              <Icon name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollView}>
            {selectedParent ? (
              selectedParent.children?.map((child) => (
                <TouchableOpacity
                  key={child.code}
                  style={styles.reasonItem}
                  onPress={() => handleChildSelect(child)}
                >
                  <View style={styles.reasonContent}>
                    <Text style={styles.reasonLabel}>{child.label}</Text>
                    <Text style={styles.reasonCode}>{child.code}</Text>
                  </View>
                  <Icon name="checkmark" size={20} color={colors.primary} />
                </TouchableOpacity>
              ))
            ) : (
              reasonTree.map((reason) => (
                <TouchableOpacity
                  key={reason.code}
                  style={styles.reasonItem}
                  onPress={() => handleParentSelect(reason)}
                >
                  <View style={styles.reasonContent}>
                    <Text style={styles.reasonLabel}>{reason.label}</Text>
                    <Text style={styles.reasonCode}>{reason.code}</Text>
                  </View>
                  {reason.children && reason.children.length > 0 ? (
                    <Icon
                      name="chevron-forward"
                      size={20}
                      color={colors.textMuted}
                    />
                  ) : (
                    <Icon name="checkmark" size={20} color={colors.primary} />
                  )}
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
    textAlign: 'center',
  },
  scrollView: {
    padding: spacing.md,
  },
  reasonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surfaceVariant,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  reasonContent: {
    flex: 1,
  },
  reasonLabel: {
    fontSize: fontSize.lg,
    fontWeight: '500',
    color: colors.text,
  },
  reasonCode: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
});
