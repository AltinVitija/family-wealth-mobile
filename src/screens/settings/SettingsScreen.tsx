import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from 'src/store';
import { logout } from 'src/store/slices/auth/authSlice';
import { Card } from 'src/components/common/Card';
import { ActionButton } from 'src/components/common/ActionButton';
import { EditProfileModal } from 'src/components/modals/EditProfileModal';
import { ChangePasswordModal } from 'src/components/modals/ChangePasswordModal';
import { updateUserProfile } from 'src/services/user/user.services';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SettingsScreen = () => {
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((state: RootState) => state.auth?.user);

  // Settings state
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isChangePasswordModalVisible, setIsChangePasswordModalVisible] = useState(false);

  const handleUpdateProfile = async (data: {
    firstName: string;
    lastName: string;
    phone: string;
  }) => {
    try {
      const updatedUser = await updateUserProfile(data);
      // Update Redux state with new user data
      dispatch(
        logout() // Temporary - you should add an updateUser action
      );
      // Ideally dispatch: updateUserSuccess(updatedUser)
    } catch (error: any) {
      throw error;
    }
  };

  const handleLogout = () => {
    Alert.alert('Confirm Logout', 'Are you sure you want to logout from your account?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          try {
            // Clear async storage
            await AsyncStorage.multiRemove(['accessToken', 'refreshToken']);
            // Dispatch logout action
            dispatch(logout());
            Alert.alert('Success', 'You have successfully logged out');
          } catch (error) {
            Alert.alert('Error', 'Failed to logout from account');
          }
        },
      },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'WARNING: This will permanently delete your account and all data. This action cannot be undone!',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Account',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Info', 'Account deletion functionality will be implemented soon');
          },
        },
      ]
    );
  };

  const getInitials = (firstName?: string, lastName?: string) => {
    const first = firstName?.charAt(0) || '';
    const last = lastName?.charAt(0) || '';
    return `${first}${last}`.toUpperCase();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
        <Text style={styles.headerSubtitle}>Manage your profile and preferences</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Profile Section */}
        <Card style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{getInitials(user?.firstName, user?.lastName)}</Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>
                {user?.firstName} {user?.lastName}
              </Text>
              <Text style={styles.profileEmail}>{user?.email}</Text>
              {user?.role && (
                <View style={styles.roleBadge}>
                  <Text style={styles.roleText}>
                    {user.role === 'owner' ? 'Owner' : user.role === 'member' ? 'Member' : 'Viewer'}
                  </Text>
                </View>
              )}
            </View>
          </View>
          <TouchableOpacity
            style={styles.editProfileButton}
            onPress={() => setIsEditModalVisible(true)}>
            <Text style={styles.editProfileText}>Edit Profile</Text>
          </TouchableOpacity>
        </Card>
        {/* Security Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Security</Text>

          <Card>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => setIsChangePasswordModalVisible(true)}>
              <Image
                source={require('src/assets/icons/password.png')}
                style={styles.passwordIcon}
              />
              <Text style={styles.menuText}>Change Password</Text>
              <Text style={styles.menuChevron}>›</Text>
            </TouchableOpacity>
          </Card>
        </View>
        About Section
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>

          <Card>
            <TouchableOpacity style={styles.menuItem}>
              <Image source={require('src/assets/icons/info.png')} style={styles.menuIcon} />
              <Text style={styles.menuText}>About Application</Text>
              <Text style={styles.menuChevron}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.menuItem, styles.menuItemBorder]}>
              <Image source={require('src/assets/icons/privacy.png')} style={styles.menuIcon} />
              <Text style={styles.menuText}>Privacy Policy</Text>
              <Text style={styles.menuChevron}>›</Text>
            </TouchableOpacity>
          </Card>
        </View>
        {/* Actions Section */}
        <View style={styles.actionsSection}>
          <ActionButton
            title="Logout"
            onPress={handleLogout}
            variant="secondary"
            size="large"
            style={styles.logoutButton}
          />

          <TouchableOpacity onPress={handleDeleteAccount} style={styles.deleteButton}>
            <Text style={styles.deleteButtonText}>Delete Account</Text>
          </TouchableOpacity>
        </View>
        {/* Version Info */}
        <View style={styles.versionInfo}>
          <Text style={styles.versionText}>Version 1.0.0</Text>
          <Text style={styles.copyrightText}>© 2025 Family Wealth Management</Text>
        </View>
      </ScrollView>

      {/* Edit Profile Modal */}
      <EditProfileModal
        visible={isEditModalVisible}
        onClose={() => setIsEditModalVisible(false)}
        user={{
          firstName: user?.firstName,
          lastName: user?.lastName,
          email: user?.email,
          phone: (user as any)?.phone,
        }}
        onSave={handleUpdateProfile}
      />

      {/* Change Password Modal */}
      <ChangePasswordModal
        visible={isChangePasswordModalVisible}
        onClose={() => setIsChangePasswordModalVisible(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#1E3A5F',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#CBD5E1',
    marginTop: 4,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  profileCard: {
    marginBottom: 24,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#D4AF37',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1E3A5F',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E3A5F',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 8,
  },
  roleBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roleText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#3B82F6',
  },
  editProfileButton: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  editProfileText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E3A5F',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E3A5F',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  settingItemBorder: {
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  settingText: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E3A5F',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 12,
    color: '#64748B',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  menuItemBorder: {
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  // menuIcon: {
  //   fontSize: 20,
  //   marginRight: 12,
  //   width: 24,
  // },
  menuIcon: { width: 20, height: 20, marginRight: 8 },
  menuText: {
    flex: 1,
    fontSize: 16,
    color: '#1E3A5F',
  },
  menuChevron: {
    fontSize: 20,
    color: '#94A3B8',
  },
  actionsSection: {
    marginTop: 12,
    marginBottom: 24,
  },
  logoutButton: {
    marginBottom: 16,
  },
  deleteButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  deleteButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#EF4444',
  },
  versionInfo: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  versionText: {
    fontSize: 12,
    color: '#94A3B8',
    marginBottom: 4,
  },
  copyrightText: {
    fontSize: 11,
    color: '#CBD5E1',
  },
  passwordIcon: { width: 20, height: 20, marginRight: 8 },
});

export default SettingsScreen;
