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
  fetchGoalsStart,
  fetchGoalsSuccess,
  fetchGoalsFailure,
  createGoalStart,
  createGoalSuccess,
  createGoalFailure,
  deleteGoalStart,
  deleteGoalSuccess,
  deleteGoalFailure,
  clearError,
} from 'src/store/slices/financialGoal/goalsSlice';
import {
  fetchMembersStart,
  fetchMembersSuccess,
  fetchMembersFailure,
} from 'src/store/slices/familyMember/familyMemberSlice';
import { getGoals, createGoal, deleteGoal } from 'src/services/financialGoal/goals.services';
import { getFamilyMembers } from 'src/services/familyMember/familyMember.services';
import { GoalType, CreateGoalRequest } from 'src/types/goals';

const GoalsScreen = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { goals, isLoading, error } = useSelector((state: RootState) => state.financialGoals);
  const { members: familyMembers } = useSelector((state: RootState) => state.familyMembers);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [formData, setFormData] = useState<{
    title: string;
    type: GoalType;
    targetAmount: string;
    currentAmount: string;
    targetDate: string;
    description: string;
    assignedMembers: string[];
  }>({
    title: '',
    type: 'savings',
    targetAmount: '',
    currentAmount: '',
    targetDate: '',
    description: '',
    assignedMembers: [],
  });

  // Fetch goals and family members on mount
  useEffect(() => {
    loadGoals();
    loadFamilyMembers(); //  Load family members
  }, []);

  // Show error alerts
  useEffect(() => {
    if (error) {
      Alert.alert('Error', error, [{ text: 'OK', onPress: () => dispatch(clearError()) }]);
    }
  }, [error]);

  const loadGoals = async () => {
    try {
      dispatch(fetchGoalsStart());
      const data = await getGoals();
      dispatch(fetchGoalsSuccess(data));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch goals';
      dispatch(fetchGoalsFailure(message));
    }
  };

  const loadFamilyMembers = async () => {
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
      dispatch(fetchGoalsStart());
      const data = await getGoals();
      dispatch(fetchGoalsSuccess(data));

      //  Also refresh family members
      dispatch(fetchMembersStart());
      const membersData = await getFamilyMembers();
      dispatch(fetchMembersSuccess(membersData));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch goals';
      dispatch(fetchGoalsFailure(message));
    } finally {
      setRefreshing(false);
    }
  }, [dispatch]);

  const getGoalIcon = (type: GoalType) => {
    const icons: Record<GoalType, string> = {
      savings: '💰',
      investment: '📈',
      retirement: '🏖️',
      education: '🎓',
      other: '🎯',
    };
    return icons[type];
  };

  const getGoalColor = (type: GoalType) => {
    const colors: Record<GoalType, string> = {
      savings: '#FFD700',
      investment: '#90EE90',
      retirement: '#FFB6C1',
      education: '#DDA0DD',
      other: '#87CEEB',
    };
    return colors[type];
  };

  const calculateProgress = (current: number, target: number) => {
    return Math.min(Math.round((current / target) * 100), 100);
  };

  const calculateDaysLeft = (deadline: string) => {
    const today = new Date();
    const endDate = new Date(deadline);
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const validateForm = (): boolean => {
    if (!formData.title.trim()) {
      Alert.alert('Validation Error', 'Please enter a goal title');
      return false;
    }
    if (!formData.targetAmount || parseFloat(formData.targetAmount) <= 0) {
      Alert.alert('Validation Error', 'Please enter a valid target amount');
      return false;
    }
    if (!formData.targetDate) {
      Alert.alert('Validation Error', 'Please enter a target date');
      return false;
    }
    return true;
  };

  const handleAddGoal = async () => {
    if (!validateForm()) return;

    try {
      const goalData: CreateGoalRequest = {
        title: formData.title.trim(),
        type: formData.type,
        targetAmount: parseFloat(formData.targetAmount),
        currentAmount: parseFloat(formData.currentAmount) || 0,
        targetDate: formData.targetDate,
        description: formData.description.trim() || undefined,
        assignedMembers: formData.assignedMembers.length > 0 ? formData.assignedMembers : undefined,
      };

      dispatch(createGoalStart());
      const newGoal = await createGoal(goalData);
      dispatch(createGoalSuccess(newGoal));

      // Reset form and close modal
      setFormData({
        title: '',
        type: 'savings',
        targetAmount: '',
        currentAmount: '',
        targetDate: '',
        description: '',
        assignedMembers: [],
      });
      setIsModalVisible(false);
      Alert.alert('Success', 'Goal created successfully!');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create goal';
      dispatch(createGoalFailure(message));
    }
  };

  const handleDeleteGoal = (goalId: string, goalTitle: string) => {
    Alert.alert('Delete Goal', `Are you sure you want to delete "${goalTitle}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            dispatch(deleteGoalStart());
            await deleteGoal(goalId);
            dispatch(deleteGoalSuccess(goalId));
            Alert.alert('Success', 'Goal deleted successfully');
          } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to delete goal';
            dispatch(deleteGoalFailure(message));
          }
        },
      },
    ]);
  };

  const renderGoalCard = (goal: any) => {
    const progress = calculateProgress(goal.currentAmount, goal.targetAmount);
    const daysLeft = calculateDaysLeft(goal.targetDate);
    const amountToGo = goal.targetAmount - goal.currentAmount;

    return (
      <TouchableOpacity
        key={goal._id}
        style={styles.goalCard}
        activeOpacity={0.7}
        onLongPress={() => handleDeleteGoal(goal._id, goal.title)}>
        {/* Goal Header */}
        <View style={styles.goalHeader}>
          <View style={[styles.goalIcon, { backgroundColor: getGoalColor(goal.type) }]}>
            <Text style={styles.goalIconText}>{getGoalIcon(goal.type)}</Text>
          </View>
          <View style={styles.goalTitleContainer}>
            <Text style={styles.goalTitle}>{goal.title}</Text>
            <Text style={styles.goalType}>
              {goal.type.charAt(0).toUpperCase() + goal.type.slice(1)}
            </Text>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Progress</Text>
            <Text style={styles.progressPercentage}>{progress}%</Text>
          </View>
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBar, { width: `${progress}%` }]} />
          </View>
        </View>

        {/* Amount */}
        <View style={styles.amountSection}>
          <Text style={styles.currentAmount}>{formatCurrency(goal.currentAmount)}</Text>
          <Text style={styles.targetAmount}>of {formatCurrency(goal.targetAmount)}</Text>
        </View>

        {/* Details */}
        <View style={styles.detailsSection}>
          <View style={styles.detailItem}>
            <Text style={styles.detailIcon}>📅</Text>
            <Text style={styles.detailText}>{daysLeft} days left</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailIcon}>💸</Text>
            <Text style={styles.detailText}>{formatCurrency(amountToGo)} to go</Text>
          </View>
        </View>

        {/* Assigned Members */}
        {goal.assignedMembers && goal.assignedMembers.length > 0 && (
          <View style={styles.membersSection}>
            <Text style={styles.membersLabel}>👥 Assigned Members</Text>
            <View style={styles.membersList}>
              {goal.assignedMembers.map((member: string, index: number) => (
                <View key={index} style={styles.memberChip}>
                  <Text style={styles.memberName}>{member}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Description */}
        {goal.description && <Text style={styles.goalDescription}>{goal.description}</Text>}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Financial Goals</Text>
          <Text style={styles.headerSubtitle}>{goals.length} active goals</Text>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setIsModalVisible(true)}
          disabled={isLoading}>
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      {/* Goals List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        {isLoading && goals.length === 0 ? (
          <ActivityIndicator size="large" color="#d4b038" style={styles.loader} />
        ) : goals.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateIcon}>🎯</Text>
            <Text style={styles.emptyStateText}>No goals yet</Text>
            <Text style={styles.emptyStateSubtext}>
              Tap the + button to add your first financial goal
            </Text>
          </View>
        ) : (
          goals.map(renderGoalCard)
        )}
      </ScrollView>

      {/* Add Goal Modal */}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setIsModalVisible(false)}>
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add Financial Goal</Text>
            <TouchableOpacity onPress={() => setIsModalVisible(false)}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            {/* Goal Title */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>
                Goal Title <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Emergency Fund"
                value={formData.title}
                onChangeText={(text) => setFormData({ ...formData, title: text })}
              />
            </View>

            {/* Goal Type */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>
                Goal Type <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.typeSelector}>
                {(['savings', 'investment', 'retirement', 'education', 'other'] as const).map(
                  (type) => (
                    <TouchableOpacity
                      key={type}
                      style={[styles.typeButton, formData.type === type && styles.typeButtonActive]}
                      onPress={() => setFormData({ ...formData, type })}>
                      <Text
                        style={[
                          styles.typeButtonText,
                          formData.type === type && styles.typeButtonTextActive,
                        ]}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  )
                )}
              </View>
            </View>

            {/* Target Amount */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>
                Target Amount <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                placeholder="0"
                keyboardType="numeric"
                value={formData.targetAmount}
                onChangeText={(text) => setFormData({ ...formData, targetAmount: text })}
              />
            </View>

            {/* Current Amount */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Current Amount</Text>
              <TextInput
                style={styles.input}
                placeholder="0"
                keyboardType="numeric"
                value={formData.currentAmount}
                onChangeText={(text) => setFormData({ ...formData, currentAmount: text })}
              />
            </View>

            {/* Target Date */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>
                Target Date (YYYY-MM-DD) <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                placeholder="2025-12-31"
                value={formData.targetDate}
                onChangeText={(text) => setFormData({ ...formData, targetDate: text })}
              />
            </View>

            {/* Description */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Add details about this goal..."
                multiline
                numberOfLines={4}
                value={formData.description}
                onChangeText={(text) => setFormData({ ...formData, description: text })}
              />
            </View>

            {/* Assign Family Members */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Assign Family Members</Text>
              {familyMembers.length === 0 ? (
                <View style={styles.noMembersContainer}>
                  <Text style={styles.noMembersText}>
                    No family members added yet. Add family members first to assign them to goals.
                  </Text>
                </View>
              ) : (
                <View style={styles.familyMemberSelector}>
                  {familyMembers.map((member) => {
                    const fullName = `${member.firstName} ${member.lastName}`;
                    const isSelected = formData.assignedMembers.includes(fullName);
                    return (
                      <TouchableOpacity
                        key={member._id}
                        style={[
                          styles.familyMemberChip,
                          isSelected && styles.familyMemberChipSelected,
                        ]}
                        onPress={() => {
                          if (isSelected) {
                            setFormData({
                              ...formData,
                              assignedMembers: formData.assignedMembers.filter(
                                (m) => m !== fullName
                              ),
                            });
                          } else {
                            setFormData({
                              ...formData,
                              assignedMembers: [...formData.assignedMembers, fullName],
                            });
                          }
                        }}>
                        <Text
                          style={[
                            styles.familyMemberChipText,
                            isSelected && styles.familyMemberChipTextSelected,
                          ]}>
                          {fullName}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
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
              onPress={handleAddGoal}
              disabled={isLoading}>
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitButtonText}>Add Goal</Text>
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
  goalCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  goalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  goalIcon: {
    width: 56,
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  goalIconText: {
    fontSize: 28,
  },
  goalTitleContainer: {
    flex: 1,
  },
  goalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  goalType: {
    fontSize: 14,
    color: '#666',
  },
  progressSection: {
    marginBottom: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    color: '#666',
  },
  progressPercentage: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#d4b038',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#d4b038',
    borderRadius: 4,
  },
  amountSection: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 16,
  },
  currentAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginRight: 8,
  },
  targetAmount: {
    fontSize: 16,
    color: '#999',
  },
  detailsSection: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 24,
  },
  detailIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
  },
  membersSection: {
    marginBottom: 12,
  },
  membersLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  membersList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  memberChip: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  memberName: {
    fontSize: 14,
    color: '#333',
  },
  goalDescription: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
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
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  typeSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  typeButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginRight: 8,
    marginBottom: 8,
  },
  typeButtonActive: {
    backgroundColor: '#d4b038',
  },
  typeButtonText: {
    fontSize: 14,
    color: '#666',
  },
  typeButtonTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  familyMemberSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  familyMemberChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  familyMemberChipSelected: {
    backgroundColor: '#d4b038',
    borderColor: '#d4b038',
  },
  familyMemberChipText: {
    fontSize: 14,
    color: '#666',
  },
  familyMemberChipTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  noMembersContainer: {
    backgroundColor: '#fff3cd',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ffc107',
  },
  noMembersText: {
    fontSize: 14,
    color: '#856404',
    textAlign: 'center',
    lineHeight: 20,
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

export default GoalsScreen;
