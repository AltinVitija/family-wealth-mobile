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
  KeyboardAvoidingView,
  Image,
  Platform,
  Dimensions,
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
  updateGoalStart,
  updateGoalSuccess,
  updateGoalFailure,
  deleteGoalStart,
  deleteGoalSuccess,
  deleteGoalFailure,
} from 'src/store/slices/financialGoal/goalsSlice';
import {
  getGoals,
  createGoal,
  updateGoal,
  deleteGoal,
} from 'src/services/financialGoal/goals.services';
import { GoalType } from 'src/types/goals';
import { Card } from 'src/components/common/Card';
import { EmptyState } from 'src/components/common/EmptyState';
import { ActionButton } from 'src/components/common/ActionButton';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const GoalsScreen = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { goals, isLoading } = useSelector((state: RootState) => state.financialGoals);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingGoal, setEditingGoal] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    type: 'savings' as GoalType,
    targetAmount: '',
    currentAmount: '',
    targetDate: '',
    description: '',
  });

  useEffect(() => {
    loadGoals();
  }, []);

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

  const onRefresh = async () => {
    setRefreshing(true);
    await loadGoals();
    setRefreshing(false);
  };

  const handleOpenModal = (goal?: any) => {
    if (goal) {
      setEditingGoal(goal);
      setFormData({
        title: goal.title || '',
        type: goal.type || 'savings',
        targetAmount: goal.targetAmount?.toString() || '',
        currentAmount: goal.currentAmount?.toString() || '',
        targetDate: goal.targetDate || '',
        description: goal.description || '',
      });
    } else {
      setEditingGoal(null);
      setFormData({
        title: '',
        type: 'savings',
        targetAmount: '',
        currentAmount: '',
        targetDate: '',
        description: '',
      });
    }
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
    setEditingGoal(null);
    setFormData({
      title: '',
      type: 'savings',
      targetAmount: '',
      currentAmount: '',
      targetDate: '',
      description: '',
    });
  };

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      Alert.alert('Error', 'Title is required');
      return;
    }

    if (!formData.targetAmount || parseFloat(formData.targetAmount) <= 0) {
      Alert.alert('Error', 'Target amount must be greater than 0');
      return;
    }

    const payload = {
      ...formData,
      targetAmount: parseFloat(formData.targetAmount),
      currentAmount: parseFloat(formData.currentAmount) || 0,
    };

    try {
      if (editingGoal) {
        dispatch(updateGoalStart());
        const updated = await updateGoal(editingGoal._id, payload);
        dispatch(updateGoalSuccess(updated));
        Alert.alert('Success', 'Goal updated successfully');
      } else {
        dispatch(createGoalStart());
        const newGoal = await createGoal(payload);
        dispatch(createGoalSuccess(newGoal));
        Alert.alert('Success', 'Goal created successfully');
      }
      handleCloseModal();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Operation failed';
      if (editingGoal) {
        dispatch(updateGoalFailure(message));
      } else {
        dispatch(createGoalFailure(message));
      }
      Alert.alert('Error', message);
    }
  };

  const handleDelete = (goal: any) => {
    Alert.alert('Confirm Deletion', `Are you sure you want to delete the goal "${goal.title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            dispatch(deleteGoalStart());
            await deleteGoal(goal._id);
            dispatch(deleteGoalSuccess(goal._id));
            Alert.alert('Success', 'Goal deleted successfully');
          } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to delete goal';
            dispatch(deleteGoalFailure(message));
            Alert.alert('Error', message);
          }
        },
      },
    ]);
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      education: 'Education',
      retirement: 'Retirement',
      investment: 'Investment',
      savings: 'Savings',
      other: 'Other',
    };
    return labels[type] || type;
  };

  const getTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      education: '🎓',
      retirement: '🏖️',
      investment: '📈',
      savings: '💰',
      other: '🎯',
    };
    return icons[type] || '🎯';
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      education: '#8B5CF6',
      retirement: '#EC4899',
      investment: '#10B981',
      savings: '#F59E0B',
      other: '#6B7280',
    };
    return colors[type] || '#6B7280';
  };

  const calculateProgress = (current: number, target: number) => {
    if (target === 0) return 0;
    return Math.min((current / target) * 100, 100);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB');
  };

  const GoalsEmptyIcon = require('../../assets/icons/financial-goals.png');

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Financial Goals</Text>
          <Text style={styles.headerSubtitle}>Track your progress</Text>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={() => handleOpenModal()}>
          <Text style={styles.addButtonText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        {isLoading && !refreshing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#D4AF37" />
          </View>
        ) : goals.length === 0 ? (
          <EmptyState
            icon={GoalsEmptyIcon}
            title="No Goals"
            message="Create your first financial goal to start planning"
            actionText="Create Goal"
            onAction={() => handleOpenModal()}
          />
        ) : (
          <>
            {goals.map((goal) => {
              const progress = calculateProgress(goal.currentAmount, goal.targetAmount);
              const typeColor = getTypeColor(goal.type);

              return (
                <Card key={goal._id} style={styles.goalCard}>
                  <View style={styles.goalHeader}>
                    <View style={[styles.typeIcon, { backgroundColor: `${typeColor}20` }]}>
                      {/* <Text style={styles.iconText}>{getTypeIcon(goal.type)}</Text> */}
                      <Image
                        source={require(`../../assets/icons/money.png`)}
                        style={{ width: 24, height: 24 }}
                      />
                    </View>
                    <View style={styles.goalInfo}>
                      <Text style={styles.goalTitle} numberOfLines={2}>
                        {goal.title}
                      </Text>
                      <Text style={[styles.goalType, { color: typeColor }]}>
                        {getTypeLabel(goal.type)}
                      </Text>
                    </View>
                  </View>

                  {goal.description && (
                    <Text style={styles.goalDescription} numberOfLines={2}>
                      {goal.description}
                    </Text>
                  )}

                  {/* Progress Bar */}
                  <View style={styles.progressSection}>
                    <View style={styles.progressHeader}>
                      <Text style={styles.progressLabel}>Progress</Text>
                      <Text style={styles.progressPercentage}>{progress.toFixed(0)}%</Text>
                    </View>
                    <View style={styles.progressBarBackground}>
                      <View
                        style={[
                          styles.progressBarFill,
                          { width: `${progress}%`, backgroundColor: typeColor },
                        ]}
                      />
                    </View>
                    <View style={styles.amountRow}>
                      <Text style={styles.currentAmount}>{formatCurrency(goal.currentAmount)}</Text>
                      <Text style={styles.targetAmount}>
                        of {formatCurrency(goal.targetAmount)}
                      </Text>
                    </View>
                  </View>

                  {/* Target Date */}
                  {goal.targetDate && (
                    <View style={styles.dateSection}>
                      <Text style={styles.dateIcon}>📅</Text>
                      <Text style={styles.dateText}>Deadline: {formatDate(goal.targetDate)}</Text>
                    </View>
                  )}

                  {/* Action Buttons */}
                  <View style={styles.actionButtons}>
                    <ActionButton
                      title="Edit"
                      onPress={() => handleOpenModal(goal)}
                      variant="secondary"
                      size="small"
                      style={styles.actionButton}
                    />
                    <ActionButton
                      title="Delete"
                      onPress={() => handleDelete(goal)}
                      variant="danger"
                      size="small"
                      style={styles.actionButton}
                    />
                  </View>
                </Card>
              );
            })}
            {/* Bottom spacing */}
            <View style={styles.bottomSpacer} />
          </>
        )}
      </ScrollView>

      {/* Create/Edit Modal - FIXED WITH SCROLLVIEW */}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={handleCloseModal}>
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardView}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>
            <View style={styles.modalContainer}>
              {/* Fixed Header */}
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {editingGoal ? 'Edit Goal' : 'Create New Goal'}
                </Text>
                <TouchableOpacity onPress={handleCloseModal} style={styles.closeButton}>
                  <Text style={styles.closeButtonText}>✕</Text>
                </TouchableOpacity>
              </View>

              {/* Scrollable Content */}
              <ScrollView
                style={styles.modalScrollView}
                contentContainerStyle={styles.modalScrollContent}
                showsVerticalScrollIndicator={true}
                bounces={true}
                keyboardShouldPersistTaps="handled">
                {/* Title */}
                <View style={styles.formGroup}>
                  <Text style={styles.label}>
                    Title <Text style={styles.required}>*</Text>
                  </Text>
                  <TextInput
                    style={styles.input}
                    value={formData.title}
                    onChangeText={(text) => setFormData({ ...formData, title: text })}
                    placeholder="House purchase"
                    placeholderTextColor="#94A3B8"
                  />
                </View>

                {/* Type */}
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Type</Text>
                  <View style={styles.typeButtons}>
                    {(
                      ['education', 'retirement', 'investment', 'savings', 'other'] as GoalType[]
                    ).map((type) => (
                      <TouchableOpacity
                        key={type}
                        style={[
                          styles.typeButton,
                          formData.type === type && styles.typeButtonActive,
                        ]}
                        onPress={() => setFormData({ ...formData, type })}>
                        <Text style={styles.typeButtonIcon}>{getTypeIcon(type)}</Text>
                        <Text
                          style={[
                            styles.typeButtonText,
                            formData.type === type && styles.typeButtonTextActive,
                          ]}>
                          {getTypeLabel(type)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Target Amount */}
                <View style={styles.formGroup}>
                  <Text style={styles.label}>
                    Target Amount <Text style={styles.required}>*</Text>
                  </Text>
                  <TextInput
                    style={styles.input}
                    value={formData.targetAmount}
                    onChangeText={(text) => setFormData({ ...formData, targetAmount: text })}
                    placeholder="50000"
                    placeholderTextColor="#94A3B8"
                    keyboardType="numeric"
                  />
                </View>

                {/* Current Amount */}
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Current Amount</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.currentAmount}
                    onChangeText={(text) => setFormData({ ...formData, currentAmount: text })}
                    placeholder="15000"
                    placeholderTextColor="#94A3B8"
                    keyboardType="numeric"
                  />
                </View>

                {/* Target Date */}
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Target Date (YYYY-MM-DD)</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.targetDate}
                    onChangeText={(text) => setFormData({ ...formData, targetDate: text })}
                    placeholder="2026-12-31"
                    placeholderTextColor="#94A3B8"
                  />
                </View>

                {/* Description */}
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Description</Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    value={formData.description}
                    onChangeText={(text) => setFormData({ ...formData, description: text })}
                    placeholder="Add description..."
                    placeholderTextColor="#94A3B8"
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                  />
                </View>

                {/* Bottom spacing */}
                <View style={{ height: 30 }} />
              </ScrollView>

              {/* Fixed Bottom Actions */}
              <View style={styles.modalActions}>
                <ActionButton
                  title="Cancel"
                  onPress={handleCloseModal}
                  variant="secondary"
                  style={styles.modalButton}
                />
                <ActionButton
                  title={editingGoal ? 'Save Changes' : 'Create Goal'}
                  onPress={handleSubmit}
                  variant="primary"
                  loading={isLoading}
                  style={styles.modalButton}
                />
              </View>
            </View>
          </KeyboardAvoidingView>
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
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 100,
  },
  goalCard: {
    marginBottom: 16,
  },
  goalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  typeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  iconText: {
    fontSize: 24,
  },
  goalInfo: {
    flex: 1,
  },
  goalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E3A5F',
    marginBottom: 4,
  },
  goalType: {
    fontSize: 14,
    fontWeight: '600',
  },
  goalDescription: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 16,
    lineHeight: 20,
  },
  progressSection: {
    marginBottom: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  progressPercentage: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E3A5F',
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  currentAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E3A5F',
  },
  targetAmount: {
    fontSize: 14,
    color: '#64748B',
  },
  dateSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  dateIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  dateText: {
    fontSize: 14,
    color: '#475569',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    height: 40,
  },
  bottomSpacer: {
    height: 20,
  },
  // MODAL STYLES - UPDATED FOR FULL VISIBILITY
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  keyboardView: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: SCREEN_HEIGHT * 0.92,
    height: SCREEN_HEIGHT * 0.92,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1E3A5F',
    flex: 1,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 22,
    color: '#64748B',
    fontWeight: '600',
    lineHeight: 24,
  },
  modalScrollView: {
    flex: 1,
  },
  modalScrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  modalButton: {
    flex: 1,
    height: 48,
  },
  formGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E3A5F',
    marginBottom: 10,
  },
  required: {
    color: '#EF4444',
  },
  input: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    color: '#1E3A5F',
    backgroundColor: '#FFFFFF',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  typeButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  typeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
  },
  typeButtonActive: {
    backgroundColor: '#D4AF37',
    borderColor: '#D4AF37',
  },
  typeButtonIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  typeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  typeButtonTextActive: {
    color: '#1E3A5F',
  },
});

export default GoalsScreen;
