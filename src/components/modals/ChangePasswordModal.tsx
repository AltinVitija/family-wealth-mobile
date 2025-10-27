import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ActionButton } from '../common/ActionButton';
import { updatePassword } from 'src/services/user/user.services';

interface ChangePasswordModalProps {
  visible: boolean;
  onClose: () => void;
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ visible, onClose }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Validation
  const [currentPasswordError, setCurrentPasswordError] = useState('');
  const [newPasswordError, setNewPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

  const validateForm = () => {
    let isValid = true;

    // Reset errors
    setCurrentPasswordError('');
    setNewPasswordError('');
    setConfirmPasswordError('');

    // Validate current password
    if (currentPassword.trim().length === 0) {
      setCurrentPasswordError('Current password is required');
      isValid = false;
    }

    // Validate new password
    if (newPassword.trim().length < 6) {
      setNewPasswordError('New password must be at least 6 characters');
      isValid = false;
    }

    // Validate password match
    if (newPassword !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match');
      isValid = false;
    }

    // Check if new password is different from current
    if (currentPassword === newPassword) {
      setNewPasswordError('New password must be different from current');
      isValid = false;
    }

    return isValid;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      await updatePassword({
        currentPassword,
        newPassword,
      });

      Alert.alert('Success', 'Password changed successfully', [
        {
          text: 'OK',
          onPress: () => {
            handleClose();
          },
        },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to change password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    // Reset form
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
    setCurrentPasswordError('');
    setNewPasswordError('');
    setConfirmPasswordError('');
    onClose();
  };

  const isFormValid =
    currentPassword.trim().length > 0 &&
    newPassword.trim().length >= 6 &&
    confirmPassword.trim().length >= 6 &&
    newPassword === confirmPassword &&
    currentPassword !== newPassword;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}>
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.headerTitle}>Change Password</Text>
              <Text style={styles.headerSubtitle}>Make sure your password is strong</Text>
            </View>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled">
            {/* Current Password */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>
                Current Password <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.inputContainer}>
                <View style={styles.inputWrapper}>
                  <Text style={styles.inputIcon}>🔒</Text>
                  <TextInput
                    style={styles.input}
                    value={currentPassword}
                    onChangeText={(text) => {
                      setCurrentPassword(text);
                      setCurrentPasswordError('');
                    }}
                    placeholder="Enter current password"
                    placeholderTextColor="#94A3B8"
                    secureTextEntry={!showCurrentPassword}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity
                    onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                    style={styles.eyeButton}>
                    <Text style={styles.eyeIcon}>{showCurrentPassword ? '👁️' : '👁️‍🗨️'}</Text>
                  </TouchableOpacity>
                </View>
              </View>
              {currentPasswordError ? (
                <Text style={styles.errorText}>{currentPasswordError}</Text>
              ) : null}
            </View>

            {/* New Password */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>
                New Password <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.inputContainer}>
                <View style={styles.inputWrapper}>
                  <Text style={styles.inputIcon}>🔑</Text>
                  <TextInput
                    style={styles.input}
                    value={newPassword}
                    onChangeText={(text) => {
                      setNewPassword(text);
                      setNewPasswordError('');
                    }}
                    placeholder="Enter new password"
                    placeholderTextColor="#94A3B8"
                    secureTextEntry={!showNewPassword}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity
                    onPress={() => setShowNewPassword(!showNewPassword)}
                    style={styles.eyeButton}>
                    <Text style={styles.eyeIcon}>{showNewPassword ? '👁️' : '👁️‍🗨️'}</Text>
                  </TouchableOpacity>
                </View>
              </View>
              {newPasswordError ? <Text style={styles.errorText}>{newPasswordError}</Text> : null}
              {newPassword.length > 0 && newPassword.length < 6 ? (
                <Text style={styles.hintText}>Minimum 6 characters</Text>
              ) : null}
            </View>

            {/* Confirm Password */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>
                Confirm New Password <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.inputContainer}>
                <View style={styles.inputWrapper}>
                  <Text style={styles.inputIcon}>🔑</Text>
                  <TextInput
                    style={styles.input}
                    value={confirmPassword}
                    onChangeText={(text) => {
                      setConfirmPassword(text);
                      setConfirmPasswordError('');
                    }}
                    placeholder="Confirm new password"
                    placeholderTextColor="#94A3B8"
                    secureTextEntry={!showConfirmPassword}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={styles.eyeButton}>
                    <Text style={styles.eyeIcon}>{showConfirmPassword ? '👁️' : '👁️‍🗨️'}</Text>
                  </TouchableOpacity>
                </View>
              </View>
              {confirmPasswordError ? (
                <Text style={styles.errorText}>{confirmPasswordError}</Text>
              ) : null}
              {confirmPassword.length > 0 && newPassword === confirmPassword ? (
                <Text style={styles.successText}>✓ Passwords match</Text>
              ) : null}
            </View>

            {/* Security Tips */}
            <View style={styles.tipsCard}>
              <Text style={styles.tipsTitle}>💡 Security Tips</Text>
              <Text style={styles.tipText}>• Use at least 8 characters</Text>
              <Text style={styles.tipText}>• Combine letters, numbers and symbols</Text>
              <Text style={styles.tipText}>• Don't use personal information</Text>
              <Text style={styles.tipText}>• Don't share your password with anyone</Text>
            </View>
          </ScrollView>

          {/* Footer Actions */}
          <View style={styles.footer}>
            <ActionButton
              title="Cancel"
              onPress={handleClose}
              variant="secondary"
              size="large"
              disabled={isLoading}
              style={styles.cancelButton}
            />
            <ActionButton
              title={isLoading ? 'Saving...' : 'Save Changes'}
              onPress={handleSave}
              variant="primary"
              size="large"
              disabled={!isFormValid || isLoading}
              style={styles.saveButton}
            />
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#1E3A5F',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#CBD5E1',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  formGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E3A5F',
    marginBottom: 8,
  },
  required: {
    color: '#EF4444',
  },
  inputContainer: {
    marginBottom: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 16,
    height: 56,
  },
  inputIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1E3A5F',
  },
  eyeButton: {
    padding: 4,
  },
  eyeIcon: {
    fontSize: 20,
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 4,
    marginLeft: 4,
  },
  hintText: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
    marginLeft: 4,
  },
  successText: {
    fontSize: 12,
    color: '#10B981',
    marginTop: 4,
    marginLeft: 4,
  },
  tipsCard: {
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E3A5F',
    marginBottom: 12,
  },
  tipText: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 6,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
  },
  saveButton: {
    flex: 1,
  },
});
