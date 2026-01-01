import React from 'react';
import { Text, StyleSheet } from 'react-native';

const iconMap: Record<string, string> = {
  'construct': '🔧',
  'shield': '🛡️',
  'log-in': '→',
  'hardware-chip': '⚙️',
  'build': '🔨',
  'notifications': '🔔',
  'stats-chart': '📊',
  'settings': '⚙️',
  'play': '▶',
  'pause': '⏸',
  'power': '⏻',
  'play-circle': '▶',
  'pause-circle': '⏸',
  'time': '⏱️',
  'warning': '⚠️',
  'alert-circle': '⚠️',
  'checkmark': '✓',
  'checkmark-circle': '✓',
  'checkmark-done': '✓✓',
  'close': '✕',
  'close-circle': '✕',
  'arrow-back': '←',
  'chevron-forward': '›',
  'add-circle': '+',
  'sync': '🔄',
  'cloud-done': '☁️',
  'cloud-offline': '☁️',
  'cloud-upload': '☁️',
  'mail': '✉️',
  'camera': '📷',
  'images': '🖼️',
  'document-text': '📄',
  'calendar': '📅',
  'create': '✏️',
  'cut': '✂️',
  'cube': '📦',
  'cog': '⚙️',
  'flame': '🔥',
  'information-circle': 'ℹ️',
  'list': '📋',
  'trending-up': '📈',
  'speedometer': '⏱️',
  'notifications-off': '🔕',
  'time-outline': '⏱️',
  'ellipse-outline': '○',
  'log-out': '←',
};

interface IconProps {
  name: string;
  size?: number;
  color?: string;
  style?: any;
}

export function Icon({ name, size = 24, color = '#000', style }: IconProps) {
  const emoji = iconMap[name] || '•';
  
  return (
    <Text style={[{ fontSize: size * 0.8, color }, style]}>
      {emoji}
    </Text>
  );
}

export default Icon;
