import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Image,
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
  updateMemberStart,
  updateMemberSuccess,
  updateMemberFailure,
  deleteMemberStart,
  deleteMemberSuccess,
  deleteMemberFailure,
} from 'src/store/slices/familyMember/familyMemberSlice';
import {
  getFamilyMembers,
  createFamilyMember,
  updateFamilyMember,
  deleteFamilyMember,
} from 'src/services/familyMember/familyMember.services';
import { RelationshipType } from 'src/types/familyMember';
import { Card } from 'src/components/common/Card';
import { EmptyState } from 'src/components/common/EmptyState';
import { ActionButton } from 'src/components/common/ActionButton';

const FamilyScreen = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { members, isLoading } = useSelector((state: RootState) => state.familyMembers);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingMember, setEditingMember] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    relationship: 'spouse' as RelationshipType,
    email: '',
    phone: '',
    dateOfBirth: '',
  });

  useEffect(() => {
    loadMembers();
  }, []);

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

  const onRefresh = async () => {
    setRefreshing(true);
    await loadMembers();
    setRefreshing(false);
  };

  const handleOpenModal = (member?: any) => {
    if (member) {
      setEditingMember(member);
      setFormData({
        firstName: member.firstName || '',
        lastName: member.lastName || '',
        relationship: member.relationship || 'spouse',
        email: member.email || '',
        phone: member.phone || '',
        dateOfBirth: member.dateOfBirth || '',
      });
    } else {
      setEditingMember(null);
      setFormData({
        firstName: '',
        lastName: '',
        relationship: 'spouse',
        email: '',
        phone: '',
        dateOfBirth: '',
      });
    }
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
    setEditingMember(null);
    setFormData({
      firstName: '',
      lastName: '',
      relationship: 'spouse',
      email: '',
      phone: '',
      dateOfBirth: '',
    });
  };

  const handleSubmit = async () => {
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      Alert.alert('Error', 'First name and last name are required');
      return;
    }

    try {
      if (editingMember) {
        dispatch(updateMemberStart());
        const updated = await updateFamilyMember(editingMember._id, formData);
        dispatch(updateMemberSuccess(updated));
        Alert.alert('Success', 'Member updated successfully');
      } else {
        dispatch(createMemberStart());
        const newMember = await createFamilyMember(formData);
        dispatch(createMemberSuccess(newMember));
        Alert.alert('Success', 'Member added successfully');
      }
      handleCloseModal();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Operation failed';
      if (editingMember) {
        dispatch(updateMemberFailure(message));
      } else {
        dispatch(createMemberFailure(message));
      }
      Alert.alert('Error', message);
    }
  };

  const handleDelete = (member: any) => {
    Alert.alert(
      'Confirm Deletion',
      `Are you sure you want to delete member "${member.firstName} ${member.lastName}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              dispatch(deleteMemberStart());
              await deleteFamilyMember(member._id);
              dispatch(deleteMemberSuccess(member._id));
              Alert.alert('Success', 'Member deleted successfully');
            } catch (err) {
              const message = err instanceof Error ? err.message : 'Failed to delete member';
              dispatch(deleteMemberFailure(message));
              Alert.alert('Error', message);
            }
          },
        },
      ]
    );
  };

  const getRelationshipLabel = (relationship: string) => {
    const labels: Record<string, string> = {
      spouse: 'Spouse',
      child: 'Child',
      parent: 'Parent',
      sibling: 'Sibling',
      other: 'Other',
    };
    return labels[relationship] || relationship;
  };

  const getRelationshipIcon = (relationship: string) => {
    const icons: Record<string, string> = {
      spouse: '💑',
      child: '👶',
      parent: '👴',
      sibling: '👫',
      other: '👤',
    };
    return icons[relationship] || '👤';
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB');
  };
  const familyEmptyIcon = require('../../assets/icons/family-members.png'); // adjust path depth

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Family Members</Text>
          <Text style={styles.headerSubtitle}>Manage your family</Text>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={() => handleOpenModal()}>
          <Text style={styles.addButtonText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        {isLoading && !refreshing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#D4AF37" />
          </View>
        ) : members.length === 0 ? (
          <EmptyState
            icon={familyEmptyIcon}
            title="No Members"
            message="Add your family members to start estate planning"
            actionText="Add Member"
            onAction={() => handleOpenModal()}
          />
        ) : (
          members.map((member) => (
            <Card key={member._id} style={styles.memberCard}>
              {/* Centered Avatar and Name */}
              <View style={styles.memberCenterSection}>
                <View style={styles.memberAvatar}>
                  <Text style={styles.avatarText}>
                    {(member.firstName?.charAt(0) || '') + (member.lastName?.charAt(0) || '')}
                  </Text>
                </View>

                {/* Relationship Badge */}
                <View
                  style={[
                    styles.relationshipBadge,
                    { backgroundColor: member.relationship === 'spouse' ? '#FEE2E2' : '#DBEAFE' },
                  ]}>
                  <Text
                    style={[
                      styles.relationshipBadgeText,
                      { color: member.relationship === 'spouse' ? '#DC2626' : '#2563EB' },
                    ]}>
                    {member.relationship === 'spouse'
                      ? 'Spouse'
                      : member.relationship === 'child'
                        ? 'Child'
                        : member.relationship === 'parent'
                          ? 'Parent'
                          : member.relationship === 'sibling'
                            ? 'Sibling'
                            : 'Family'}
                  </Text>
                </View>

                <Text style={styles.memberName}>
                  {member.firstName} {member.lastName}
                </Text>
              </View>

              {/* Contact Details */}
              <View style={styles.memberDetails}>
                {member.email && (
                  <View style={styles.detailRow}>
                    <Image
                      source={require('../../assets/icons/mail.png')}
                      style={styles.detailIcon}
                    />
                    <Text style={styles.detailText}>{member.email}</Text>
                  </View>
                )}
                {member.phone && (
                  <View style={styles.detailRow}>
                    <Image
                      source={require('../../assets/icons/phone.png')}
                      style={styles.detailIcon}
                    />
                    <Text style={styles.detailText}>{member.phone}</Text>
                  </View>
                )}
              </View>

              {/* Action Buttons */}
              <View style={styles.actionButtons}>
                <ActionButton
                  title="Edit"
                  onPress={() => handleOpenModal(member)}
                  variant="secondary"
                  size="small"
                  style={styles.actionButton}
                />
                <ActionButton
                  title="Delete"
                  onPress={() => handleDelete(member)}
                  variant="danger"
                  size="small"
                  style={styles.actionButton}
                />
              </View>
            </Card>
          ))
        )}
      </ScrollView>

      {/* Create/Edit Modal */}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={handleCloseModal}>
        <View style={styles.modalOverlay}>
          <ScrollView contentContainerStyle={styles.modalScrollContent}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>
                {editingMember ? 'Edit Member' : 'Add New Member'}
              </Text>

              <View style={styles.formGroup}>
                <Text style={styles.label}>First Name *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.firstName}
                  onChangeText={(text) => setFormData({ ...formData, firstName: text })}
                  placeholder="First name"
                  placeholderTextColor="#94A3B8"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Last Name *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.lastName}
                  onChangeText={(text) => setFormData({ ...formData, lastName: text })}
                  placeholder="Last name"
                  placeholderTextColor="#94A3B8"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Relationship</Text>
                <View style={styles.relationshipButtons}>
                  {(['spouse', 'child', 'parent', 'sibling', 'other'] as RelationshipType[]).map(
                    (rel) => (
                      <TouchableOpacity
                        key={rel}
                        style={[
                          styles.relationshipButton,
                          formData.relationship === rel && styles.relationshipButtonActive,
                        ]}
                        onPress={() => setFormData({ ...formData, relationship: rel })}>
                        <Text style={styles.relationshipIcon}>{getRelationshipIcon(rel)}</Text>
                        <Text
                          style={[
                            styles.relationshipText,
                            formData.relationship === rel && styles.relationshipTextActive,
                          ]}>
                          {getRelationshipLabel(rel)}
                        </Text>
                      </TouchableOpacity>
                    )
                  )}
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={styles.input}
                  value={formData.email}
                  onChangeText={(text) => setFormData({ ...formData, email: text })}
                  placeholder="email@example.com"
                  placeholderTextColor="#94A3B8"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Phone</Text>
                <TextInput
                  style={styles.input}
                  value={formData.phone}
                  onChangeText={(text) => setFormData({ ...formData, phone: text })}
                  placeholder="+355 XX XXX XXX"
                  placeholderTextColor="#94A3B8"
                  keyboardType="phone-pad"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Date of Birth (YYYY-MM-DD)</Text>
                <TextInput
                  style={styles.input}
                  value={formData.dateOfBirth}
                  onChangeText={(text) => setFormData({ ...formData, dateOfBirth: text })}
                  placeholder="2000-01-15"
                  placeholderTextColor="#94A3B8"
                />
              </View>

              <View style={styles.modalActions}>
                <ActionButton
                  title="Cancel"
                  onPress={handleCloseModal}
                  variant="secondary"
                  style={styles.modalButton}
                />
                <ActionButton
                  title={editingMember ? 'Save Changes' : 'Add Member'}
                  onPress={handleSubmit}
                  variant="primary"
                  loading={isLoading}
                  style={styles.modalButton}
                />
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  addButton: {
    backgroundColor: '#D4AF37',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#1E3A5F',
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 100,
  },
  memberCard: {
    marginBottom: 16,
    paddingVertical: 24,
  },
  memberCenterSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  memberAvatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#D4AF37',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 36,
    fontWeight: '700',
    color: '#1E3A5F',
  },
  relationshipBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 12,
  },
  relationshipBadgeText: {
    fontSize: 13,
    fontWeight: '600',
  },
  memberHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  memberIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  iconText: {
    fontSize: 28,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1E3A5F',
    marginBottom: 8,
    textAlign: 'center',
  },
  relationship: {
    fontSize: 14,
    color: '#64748B',
  },
  memberDetails: {
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  detailIcon: {
    fontSize: 18,
    marginRight: 10,
    height: 18,
    width: 18,
  },
  detailText: {
    fontSize: 15,
    color: '#475569',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  actionButton: {
    flex: 1,
    height: 40,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalScrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 16,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1E3A5F',
    marginBottom: 24,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E3A5F',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1E3A5F',
    backgroundColor: '#F8FAFC',
  },
  relationshipButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  relationshipButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
  },
  relationshipButtonActive: {
    backgroundColor: '#D4AF37',
    borderColor: '#D4AF37',
  },
  relationshipIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  relationshipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  relationshipTextActive: {
    color: '#1E3A5F',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  modalButton: {
    flex: 1,
    height: 48,
  },
});

export default FamilyScreen;
