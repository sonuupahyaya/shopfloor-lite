import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Image,
} from 'react-native';
import { router } from 'expo-router';
import { Icon } from '../src/components/Icon';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '../src/store/authStore';
import { Button } from '../src/components/Button';
import { colors, spacing, fontSize, borderRadius, shadows } from '../src/constants/theme';
import type { UserRole } from '../src/types';

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const { login, isAuthenticated, isLoading } = useAuthStore();
  const [email, setEmail] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('operator');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, isLoading]);

  const handleLogin = async () => {
    if (!email.trim()) return;

    setIsSubmitting(true);
    try {
      await login(email.trim(), selectedRole);
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <Icon name="cog" size={48} color={colors.primary} />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Icon name="construct" size={64} color={colors.primary} />
        </View>
        <Text style={styles.title}>ShopFloor Lite</Text>
        <Text style={styles.subtitle}>Offline-First Manufacturing App</Text>
      </View>

      <View style={[styles.formContainer, shadows.lg]}>
        <Text style={styles.formTitle}>Sign In</Text>

        <View style={styles.inputContainer}>
          <Icon name="mail" size={20} color={colors.textSecondary} />
          <TextInput
            style={styles.input}
            placeholder="Enter your email"
            placeholderTextColor={colors.textMuted}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        <Text style={styles.roleLabel}>Select Your Role</Text>

        <View style={styles.roleContainer}>
          <TouchableOpacity
            style={[
              styles.roleButton,
              selectedRole === 'operator' && styles.roleButtonActive,
            ]}
            onPress={() => setSelectedRole('operator')}
          >
            <Icon
              name="construct"
              size={32}
              color={selectedRole === 'operator' ? colors.primary : colors.textMuted}
            />
            <Text
              style={[
                styles.roleButtonText,
                selectedRole === 'operator' && styles.roleButtonTextActive,
              ]}
            >
              Operator
            </Text>
            <Text style={styles.roleDescription}>
              Record downtime & maintenance
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.roleButton,
              selectedRole === 'supervisor' && styles.roleButtonActive,
            ]}
            onPress={() => setSelectedRole('supervisor')}
          >
            <Icon
              name="shield"
              size={32}
              color={selectedRole === 'supervisor' ? colors.primary : colors.textMuted}
            />
            <Text
              style={[
                styles.roleButtonText,
                selectedRole === 'supervisor' && styles.roleButtonTextActive,
              ]}
            >
              Supervisor
            </Text>
            <Text style={styles.roleDescription}>
              Manage alerts & view KPIs
            </Text>
          </TouchableOpacity>
        </View>

        <Button
          title="Sign In"
          onPress={handleLogin}
          loading={isSubmitting}
          disabled={!email.trim()}
          fullWidth
          size="large"
          icon="log-in"
        />

        <Text style={styles.disclaimer}>
          This is a demo app. Any email will be accepted.
        </Text>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Works offline • Syncs automatically
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: fontSize.lg,
    color: colors.textSecondary,
  },
  header: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
    ...shadows.md,
  },
  title: {
    fontSize: fontSize.xxxl,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
  formContainer: {
    backgroundColor: colors.surface,
    marginHorizontal: spacing.lg,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
  },
  formTitle: {
    fontSize: fontSize.xl,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceVariant,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  input: {
    flex: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    fontSize: fontSize.md,
    color: colors.text,
  },
  roleLabel: {
    fontSize: fontSize.md,
    fontWeight: '500',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  roleContainer: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  roleButton: {
    flex: 1,
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.surfaceVariant,
    borderWidth: 2,
    borderColor: colors.border,
  },
  roleButtonActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '10',
  },
  roleButtonText: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
  roleButtonTextActive: {
    color: colors.primary,
  },
  roleDescription: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  disclaimer: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  footer: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: spacing.xl,
  },
  footerText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
});
