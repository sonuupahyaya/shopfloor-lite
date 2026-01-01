export const colors = {
  primary: '#1E3A5F',
  primaryLight: '#2E5A8F',
  primaryDark: '#0E2A4F',

  secondary: '#FF6B35',
  secondaryLight: '#FF8B55',
  secondaryDark: '#E55B25',

  success: '#10B981',
  successLight: '#34D399',
  successDark: '#059669',

  warning: '#F59E0B',
  warningLight: '#FBBF24',
  warningDark: '#D97706',

  error: '#EF4444',
  errorLight: '#F87171',
  errorDark: '#DC2626',

  info: '#3B82F6',
  infoLight: '#60A5FA',
  infoDark: '#2563EB',

  background: '#F3F4F6',
  surface: '#FFFFFF',
  surfaceVariant: '#F9FAFB',

  text: '#1F2937',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',
  textOnPrimary: '#FFFFFF',

  border: '#E5E7EB',
  borderLight: '#F3F4F6',

  statusRun: '#10B981',
  statusIdle: '#F59E0B',
  statusOff: '#6B7280',

  alertLow: '#3B82F6',
  alertMedium: '#F59E0B',
  alertHigh: '#F97316',
  alertCritical: '#EF4444',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
};

export const fontSize = {
  xs: 10,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 18,
  xxl: 24,
  xxxl: 32,
};

export const fontWeight = {
  normal: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
};
