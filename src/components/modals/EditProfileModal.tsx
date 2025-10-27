import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { ActionButton } from 'src/components/common/ActionButton';

interface EditProfileModalProps {
  visible: boolean;
  onClose: () => void;
  user: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
  };
  onSave: (data: { firstName: string; lastName: string; phone: string }) => Promise<void>;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  visible,
  onClose,
  user,
  onSave,
}) => {
  const [firstName, setFirstName] = useState(user.firstName || '');
  const [lastName, setLastName] = useState(user.lastName || '');
  const [phone, setPhone] = useState(user.phone || '');
  const [isLoading, setIsLoading] = useState(false);

  const isValid = firstName.trim().length >= 2 && lastName.trim().length >= 2;

  const handleSave = async () => {
    if (!isValid) {
      Alert.alert('Error', 'First name and last name are required');
      return;
    }

    setIsLoading(true);
    try {
      await onSave({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim(),
      });
      Alert.alert('Success', 'Profile updated successfully');
      onClose();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Update failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <ScrollView>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>Edit Profile</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Text style={styles.closeIcon}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Form */}
            <View style={styles.form}>
              {/* First Name */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>First Name *</Text>
                <View style={styles.inputContainer}>
                  <Text style={styles.inputIcon}>👤</Text>
                  <TextInput
                    style={styles.input}
                    value={firstName}
                    onChangeText={setFirstName}
                    placeholder="Your first name"
                    placeholderTextColor="#94A3B8"
                    autoCapitalize="words"
                    editable={!isLoading}
                  />
                </View>
                {firstName && firstName.trim().length < 2 && (
                  <Text style={styles.errorText}>Minimum 2 characters</Text>
                )}
              </View>

              {/* Last Name */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Last Name *</Text>
                <View style={styles.inputContainer}>
                  <Text style={styles.inputIcon}>👤</Text>
                  <TextInput
                    style={styles.input}
                    value={lastName}
                    onChangeText={setLastName}
                    placeholder="Your last name"
                    placeholderTextColor="#94A3B8"
                    autoCapitalize="words"
                    editable={!isLoading}
                  />
                </View>
                {lastName && lastName.trim().length < 2 && (
                  <Text style={styles.errorText}>Minimum 2 characters</Text>
                )}
              </View>

              {/* Email (Read-only) */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email</Text>
                <View style={[styles.inputContainer, styles.inputDisabled]}>
                  <Text style={styles.inputIcon}>✉️</Text>
                  <TextInput
                    style={styles.input}
                    value={user.email}
                    editable={false}
                    placeholderTextColor="#94A3B8"
                  />
                  <Text style={styles.lockIcon}>🔒</Text>
                </View>
                <Text style={styles.helpText}>Email cannot be changed</Text>
              </View>

              {/* Phone */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Phone</Text>
                <View style={styles.inputContainer}>
                  <Text style={styles.inputIcon}>📞</Text>
                  <TextInput
                    style={styles.input}
                    value={phone}
                    onChangeText={setPhone}
                    placeholder="+355 XX XXX XXX"
                    placeholderTextColor="#94A3B8"
                    keyboardType="phone-pad"
                    editable={!isLoading}
                  />
                </View>
              </View>
            </View>

            {/* Actions */}
            <View style={styles.actions}>
              <ActionButton
                title="Cancel"
                onPress={onClose}
                variant="secondary"
                style={styles.actionButton}
                disabled={isLoading}
              />
              <ActionButton
                title="Save Changes"
                onPress={handleSave}
                variant="primary"
                style={styles.actionButton}
                disabled={!isValid}
                loading={isLoading}
              />
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    paddingTop: 24,
    paddingBottom: 32,
    paddingHorizontal: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1E3A5F',
  },
  closeButton: {
    padding: 8,
  },
  closeIcon: {
    fontSize: 24,
    color: '#64748B',
  },
  form: {
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E3A5F',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 56,
  },
  inputDisabled: {
    backgroundColor: '#F1F5F9',
    opacity: 0.7,
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
  lockIcon: {
    fontSize: 16,
    marginLeft: 8,
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 4,
    marginLeft: 4,
  },
  helpText: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
    marginLeft: 4,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
  },
});
