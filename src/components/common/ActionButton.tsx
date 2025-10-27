import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, ActivityIndicator } from 'react-native';

interface ActionButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  size?: 'small' | 'medium' | 'large';
}

export const ActionButton: React.FC<ActionButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  style,
  size = 'medium',
}) => {
  const buttonStyle = [
    styles.button,
    styles[size],
    styles[variant],
    disabled && styles.disabled,
    style,
  ];

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}>
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? '#1E3A5F' : '#FFFFFF'} />
      ) : (
        <Text style={[styles.text, styles[`${variant}Text`]]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  small: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  medium: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  large: {
    paddingHorizontal: 24,
    paddingVertical: 14,
  },
  primary: {
    backgroundColor: '#D4AF37',
  },
  secondary: {
    backgroundColor: '#1E3A5F',
  },
  danger: {
    backgroundColor: '#EF4444',
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontSize: 14,
    fontWeight: '600',
  },
  primaryText: {
    color: '#1E3A5F',
  },
  secondaryText: {
    color: '#FFFFFF',
  },
  dangerText: {
    color: '#FFFFFF',
  },
});
