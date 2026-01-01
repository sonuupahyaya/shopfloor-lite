import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Icon } from './Icon';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, fontSize } from '../constants/theme';
import { useAuthStore } from '../store/authStore';

interface HeaderProps {
  title: string;
  showBack?: boolean;
  onBack?: () => void;
  rightAction?: {
    icon: string;
    onPress: () => void;
  };
}

export function Header({ title, showBack, onBack, rightAction }: HeaderProps) {
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.content}>
        <View style={styles.left}>
          {showBack && (
            <TouchableOpacity onPress={onBack} style={styles.backButton}>
              <Icon name="arrow-back" size={24} color={colors.textOnPrimary} />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.center}>
          <Text style={styles.title}>{title}</Text>
          {user && (
            <View style={styles.roleContainer}>
              <Icon
                name={user.role === 'operator' ? 'construct' : 'shield'}
                size={12}
                color={colors.textOnPrimary}
              />
              <Text style={styles.roleText}>
                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.right}>
          {rightAction && (
            <TouchableOpacity onPress={rightAction.onPress} style={styles.rightButton}>
              <Icon
                name={rightAction.icon}
                size={24}
                color={colors.textOnPrimary}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.primary,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  left: {
    width: 48,
  },
  center: {
    flex: 1,
    alignItems: 'center',
  },
  right: {
    width: 48,
    alignItems: 'flex-end',
  },
  backButton: {
    padding: spacing.xs,
  },
  rightButton: {
    padding: spacing.xs,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.textOnPrimary,
  },
  roleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    gap: 4,
  },
  roleText: {
    fontSize: fontSize.xs,
    color: colors.textOnPrimary,
    opacity: 0.8,
  },
});
