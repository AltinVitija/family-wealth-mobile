// screens/family/FamilyScreen.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from 'src/store';
import {
  fetchMembersStart,
  fetchMembersSuccess,
  fetchMembersFailure,
  createMemberStart,
  createMemberSuccess,
  createMemberFailure,
  deleteMemberStart,
  deleteMemberSuccess,
  deleteMemberFailure,
  clearError,
} from 'src/store/slices/familyMember/familyMemberSlice';
import {
  getFamilyMembers,
  createFamilyMember,
  deleteFamilyMember,
} from 'src/services/familyMember/familyMember.services';
import { RelationshipType, CreateFamilyMemberRequest } from 'src/types/familyMember';

const FamilyScreen = () => {
  const dispatch = useDispatch<AppDispatch>();

  // Redux state
  const { members, isLoading, error } = useSelector((state: RootState) => state.familyMembers);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [formData, setFormData] = useState<{
    firstName: string;
    lastName: string;
    relationship: RelationshipType;
    email: string;
    phone: string;
    dateOfBirth: string;
  }>({
    firstName: '',
    lastName: '',
    relationship: 'spouse',
    email: '',
    phone: '',
    dateOfBirth: '',
  });

  // Fetch members on mount
  useEffect(() => {
    loadMembers();
  }, []);

  // Show error alerts
  useEffect(() => {
    if (error) {
      Alert.alert('Error', error, [{ text: 'OK', onPress: () => dispatch(clearError()) }]);
    }
  }, [error]);

  const loadMembers = async () => {
    try {
      dispatch(fetchMembersStart());
      const data = await getFamilyMembers();
      dispatch(fetchMembersSuccess(data));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch family members';
      dispatch(fetchMembersFailure(message));
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      dispatch(fetchMembersStart());
      const data = await getFamilyMembers();
      dispatch(fetchMembersSuccess(data));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch family members';
      dispatch(fetchMembersFailure(message));
    } finally {
      setRefreshing(false);
    }
  }, [dispatch]);

  const getRelationshipColor = (relationship: RelationshipType) => {
    const colors: Record<RelationshipType, string> = {
      spouse: '#FF69B4',
      child: '#87CEEB',
      parent: '#DDA0DD',
      sibling: '#98FB98',
      other: '#F0E68C',
    };
    return colors[relationship];
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const validateForm = (): boolean => {
    if (!formData.firstName.trim()) {
      Alert.alert('Validation Error', 'Please enter first name');
      return false;
    }
    if (!formData.lastName.trim()) {
      Alert.alert('Validation Error', 'Please enter last name');
      return false;
    }
    if (!formData.relationship) {
      Alert.alert('Validation Error', 'Please select a relationship');
      return false;
    }
    return true;
  };

  const handleAddMember = async () => {
    if (!validateForm()) return;

    try {
      const memberData: CreateFamilyMemberRequest = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        relationship: formData.relationship,
        email: formData.email.trim() || undefined,
        phone: formData.phone.trim() || undefined,
        dateOfBirth: formData.dateOfBirth.trim() || undefined,
      };

      dispatch(createMemberStart());
      const newMember = await createFamilyMember(memberData);
      dispatch(createMemberSuccess(newMember));

      // Reset form and close modal
      setFormData({
        firstName: '',
        lastName: '',
        relationship: 'spouse',
        email: '',
        phone: '',
        dateOfBirth: '',
      });
      setIsModalVisible(false);
      Alert.alert('Success', 'Family member added successfully!');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create family member';
      dispatch(createMemberFailure(message));
    }
  };

  const handleDeleteMember = (memberId: string, memberName: string) => {
    Alert.alert(
      'Delete Family Member',
      `Are you sure you want to remove ${memberName} from your family?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              dispatch(deleteMemberStart());
              await deleteFamilyMember(memberId);
              dispatch(deleteMemberSuccess(memberId));
              Alert.alert('Success', 'Family member removed successfully');
            } catch (err) {
              const message = err instanceof Error ? err.message : 'Failed to delete family member';
              dispatch(deleteMemberFailure(message));
            }
          },
        },
      ]
    );
  };

  const renderMemberCard = (member: any) => {
    const fullName = `${member.firstName} ${member.lastName}`;
    const initials = getInitials(member.firstName, member.lastName);

    return (
      <TouchableOpacity
        key={member._id}
        style={styles.memberCard}
        activeOpacity={0.7}
        onLongPress={() => handleDeleteMember(member._id, fullName)}>
        {/* Avatar */}
        <View style={[styles.avatar, { backgroundColor: '#d4b038' }]}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>

        {/* Relationship Badge */}
        <View
          style={[
            styles.relationshipBadge,
            { backgroundColor: getRelationshipColor(member.relationship) },
          ]}>
          <Text style={styles.relationshipText}>
            {member.relationship.charAt(0).toUpperCase() + member.relationship.slice(1)}
          </Text>
        </View>

        {/* Member Name */}
        <Text style={styles.memberName}>{fullName}</Text>

        {/* Contact Info */}
        {member.email && (
          <View style={styles.contactRow}>
            <Text style={styles.contactIcon}>✉️</Text>
            <Text style={styles.contactText}>{member.email}</Text>
          </View>
        )}
        {member.phone && (
          <View style={styles.contactRow}>
            <Text style={styles.contactIcon}>📞</Text>
            <Text style={styles.contactText}>{member.phone}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Family Members</Text>
          <Text style={styles.headerSubtitle}>{members.length} members</Text>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setIsModalVisible(true)}
          disabled={isLoading}>
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      {/* Members List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        {isLoading && members.length === 0 ? (
          <ActivityIndicator size="large" color="#d4b038" style={styles.loader} />
        ) : members.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateIcon}>👨‍👩‍👧‍👦</Text>
            <Text style={styles.emptyStateText}>No family members yet</Text>
            <Text style={styles.emptyStateSubtext}>
              Tap the + button to add your first family member
            </Text>
          </View>
        ) : (
          members.map(renderMemberCard)
        )}
      </ScrollView>

      {/* Add Member Modal */}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setIsModalVisible(false)}>
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add Family Member</Text>
            <TouchableOpacity onPress={() => setIsModalVisible(false)}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            {/* First Name */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>
                First Name <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., John"
                value={formData.firstName}
                onChangeText={(text) => setFormData({ ...formData, firstName: text })}
              />
            </View>

            {/* Last Name */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>
                Last Name <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Smith"
                value={formData.lastName}
                onChangeText={(text) => setFormData({ ...formData, lastName: text })}
              />
            </View>

            {/* Relationship */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>
                Relationship <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.relationshipButtons}>
                {(['spouse', 'child', 'parent', 'sibling', 'other'] as const).map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.relationshipButton,
                      formData.relationship === type && styles.relationshipButtonActive,
                    ]}
                    onPress={() => setFormData({ ...formData, relationship: type })}>
                    <Text
                      style={[
                        styles.relationshipButtonText,
                        formData.relationship === type && styles.relationshipButtonTextActive,
                      ]}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Email */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="email@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
                value={formData.email}
                onChangeText={(text) => setFormData({ ...formData, email: text })}
              />
            </View>

            {/* Phone */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Phone</Text>
              <TextInput
                style={styles.input}
                placeholder="+1 (555) 123-4567"
                keyboardType="phone-pad"
                value={formData.phone}
                onChangeText={(text) => setFormData({ ...formData, phone: text })}
              />
            </View>

            {/* Date of Birth */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Date of Birth (YYYY-MM-DD)</Text>
              <TextInput
                style={styles.input}
                placeholder="1990-01-15"
                value={formData.dateOfBirth}
                onChangeText={(text) => setFormData({ ...formData, dateOfBirth: text })}
              />
            </View>
          </ScrollView>

          {/* Modal Actions */}
          <View style={styles.modalActions}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setIsModalVisible(false)}
              disabled={isLoading}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
              onPress={handleAddMember}
              disabled={isLoading}>
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitButtonText}>Add Member</Text>
              )}
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#d4b038',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 28,
    color: '#fff',
    fontWeight: '300',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  memberCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  relationshipBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 12,
  },
  relationshipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  memberName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 12,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  contactIcon: {
    fontSize: 14,
    marginRight: 8,
  },
  contactText: {
    fontSize: 14,
    color: '#666',
  },
  loader: {
    marginTop: 40,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyStateText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  closeButton: {
    fontSize: 24,
    color: '#666',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  formGroup: {
    marginBottom: 24,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  required: {
    color: '#ff4444',
  },
  input: {
    borderWidth: 1,
    borderColor: '#e5e5e5',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  relationshipButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  relationshipButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginRight: 8,
    marginBottom: 8,
  },
  relationshipButtonActive: {
    backgroundColor: '#d4b038',
  },
  relationshipButtonText: {
    fontSize: 14,
    color: '#666',
  },
  relationshipButtonTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  modalActions: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e5e5',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  submitButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#d4b038',
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});

export default FamilyScreen;
