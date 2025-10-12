// screens/estate/EstateScreen.tsx
import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from 'src/store';
import {
  fetchPlansStart,
  fetchPlansSuccess,
  fetchPlansFailure,
  createPlanStart,
  createPlanSuccess,
  createPlanFailure,
  deletePlanStart,
  deletePlanSuccess,
  deletePlanFailure,
} from 'src/store/slices/estate/estateSlice';
import {
  getEstatePlans,
  createEstatePlan,
  deleteEstatePlan,
} from 'src/services/estate/estate.services';

type EstatePlanStatus = 'draft' | 'active' | 'archived';

interface Asset {
  name: string;
  type: 'property' | 'investment' | 'cash' | 'business' | 'other';
  value: number;
}

const EstateScreen = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { plans, isLoading, error } = useSelector((state: RootState) => state.estatePlans);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'active' as EstatePlanStatus,
    executor: '',
  });

  // Fetch estate plans on mount
  useEffect(() => {
    loadEstatePlans();
  }, []);

  const loadEstatePlans = async () => {
    dispatch(fetchPlansStart());
    try {
      const plans = await getEstatePlans();
      dispatch(fetchPlansSuccess(plans));
    } catch (error: any) {
      dispatch(fetchPlansFailure(error.message || 'Failed to fetch estate plans'));
    }
  };

  const getStatusColor = (status: EstatePlanStatus) => {
    const colors = {
      draft: '#FFA500',
      active: '#4CAF50',
      archived: '#999',
    };
    return colors[status];
  };

  const getStatusLabel = (status: EstatePlanStatus) => {
    const labels = {
      draft: 'Draft',
      active: 'Active',
      archived: 'Archived',
    };
    return labels[status];
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const calculateTotalValue = (assets?: Asset[]) => {
    if (!assets || assets.length === 0) return 0;
    return assets.reduce((sum, asset) => sum + (asset.value || 0), 0);
  };

  const handleAddEstatePlan = async () => {
    if (!formData.title.trim()) {
      Alert.alert('Error', 'Please enter a title for the estate plan');
      return;
    }

    dispatch(createPlanStart());
    try {
      const newPlan = await createEstatePlan({
        title: formData.title,
        description: formData.description || undefined,
        status: formData.status,
        executor: formData.executor || undefined,
        assets: [],
        beneficiaries: [],
      });

      dispatch(createPlanSuccess(newPlan));
      setIsModalVisible(false);
      setFormData({
        title: '',
        description: '',
        status: 'active',
        executor: '',
      });
      Alert.alert('Success', 'Estate plan created successfully!');
    } catch (error: any) {
      dispatch(createPlanFailure(error.message || 'Failed to create estate plan'));
      Alert.alert('Error', error.message || 'Failed to create estate plan');
    }
  };

  const handleDeleteEstatePlan = (planId: string) => {
    Alert.alert(
      'Delete Estate Plan',
      'Are you sure you want to delete this estate plan? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            dispatch(deletePlanStart());
            try {
              await deleteEstatePlan(planId);
              dispatch(deletePlanSuccess(planId));
              Alert.alert('Success', 'Estate plan deleted successfully');
            } catch (error: any) {
              dispatch(deletePlanFailure(error.message || 'Failed to delete estate plan'));
              Alert.alert('Error', error.message || 'Failed to delete estate plan');
            }
          },
        },
      ]
    );
  };

  const renderEstatePlanCard = (plan: any) => {
    const totalValue = calculateTotalValue(plan.assets);
    const assetCount = plan.assets?.length || 0;
    const beneficiaryCount = plan.beneficiaries?.length || 0;

    return (
      <TouchableOpacity key={plan._id} style={styles.planCard} activeOpacity={0.7}>
        {/* Header */}
        <View style={styles.planHeader}>
          <View style={styles.planIcon}>
            <Text style={styles.planIconText}>📋</Text>
          </View>
          <View style={styles.planTitleContainer}>
            <Text style={styles.planTitle}>{plan.title}</Text>
            {plan.executor && <Text style={styles.planExecutor}>Executor: {plan.executor}</Text>}
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(plan.status) }]}>
            <Text style={styles.statusBadgeText}>{getStatusLabel(plan.status)}</Text>
          </View>
        </View>

        {/* Description */}
        {plan.description && <Text style={styles.planDescription}>{plan.description}</Text>}

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statIcon}>💰</Text>
            <View>
              <Text style={styles.statLabel}>Total Value</Text>
              <Text style={styles.statValue}>{formatCurrency(totalValue)}</Text>
            </View>
          </View>

          <View style={styles.statItem}>
            <Text style={styles.statIcon}>📦</Text>
            <View>
              <Text style={styles.statLabel}>Assets</Text>
              <Text style={styles.statValue}>{assetCount}</Text>
            </View>
          </View>

          <View style={styles.statItem}>
            <Text style={styles.statIcon}>👥</Text>
            <View>
              <Text style={styles.statLabel}>Beneficiaries</Text>
              <Text style={styles.statValue}>{beneficiaryCount}</Text>
            </View>
          </View>

          <View style={styles.statItem}>
            <Text style={styles.statIcon}>📅</Text>
            <View>
              <Text style={styles.statLabel}>Updated</Text>
              <Text style={styles.statValue}>{formatDate(plan.updatedAt)}</Text>
            </View>
          </View>
        </View>

        {/* Assets Preview */}
        {plan.assets && plan.assets.length > 0 && (
          <View style={styles.assetsSection}>
            <Text style={styles.sectionTitle}>Assets ({plan.assets.length})</Text>
            {plan.assets.slice(0, 3).map((asset: Asset, index: number) => (
              <View key={index} style={styles.assetItem}>
                <View style={styles.assetInfo}>
                  <Text style={styles.assetName}>{asset.name}</Text>
                  <Text style={styles.assetType}>{asset.type}</Text>
                </View>
                <Text style={styles.assetValue}>{formatCurrency(asset.value)}</Text>
              </View>
            ))}
            {plan.assets.length > 3 && (
              <Text style={styles.moreItems}>+{plan.assets.length - 3} more assets</Text>
            )}
          </View>
        )}

        {/* Beneficiaries Preview */}
        {plan.beneficiaries && plan.beneficiaries.length > 0 && (
          <View style={styles.beneficiariesSection}>
            <Text style={styles.sectionTitle}>Beneficiaries ({plan.beneficiaries.length})</Text>
            <View style={styles.beneficiaryList}>
              {plan.beneficiaries.slice(0, 3).map((beneficiary: any, index: number) => (
                <View key={index} style={styles.beneficiaryItem}>
                  <View style={styles.beneficiaryAvatar}>
                    <Text style={styles.beneficiaryInitial}>
                      {beneficiary.familyMemberId?.charAt(0) || 'B'}
                    </Text>
                  </View>
                  <Text style={styles.beneficiaryPercentage}>{beneficiary.percentage}%</Text>
                </View>
              ))}
              {plan.beneficiaries.length > 3 && (
                <Text style={styles.moreItems}>+{plan.beneficiaries.length - 3} more</Text>
              )}
            </View>
          </View>
        )}

        {/* Actions */}
        <View style={styles.cardActions}>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => handleDeleteEstatePlan(plan._id)}>
            <Text style={[styles.actionButtonText, styles.deleteButtonText]}>Delete</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Estate Plans</Text>
          <Text style={styles.headerSubtitle}>Manage your wills and trusts</Text>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={() => setIsModalVisible(true)}>
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      {/* Estate Plans List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <ActivityIndicator size="large" color="#d4b038" style={styles.loader} />
        ) : error ? (
          <View style={styles.errorState}>
            <Text style={styles.errorIcon}>⚠️</Text>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={loadEstatePlans}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : plans.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateIcon}>📋</Text>
            <Text style={styles.emptyStateText}>No estate plans yet</Text>
            <Text style={styles.emptyStateSubtext}>
              Tap the + button to create your first estate plan
            </Text>
          </View>
        ) : (
          plans.map(renderEstatePlanCard)
        )}
      </ScrollView>

      {/* Add Estate Plan Modal */}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setIsModalVisible(false)}>
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add Estate Plan</Text>
            <TouchableOpacity onPress={() => setIsModalVisible(false)}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            {/* Title */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>
                Title <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Primary Estate Plan"
                value={formData.title}
                onChangeText={(text) => setFormData({ ...formData, title: text })}
              />
            </View>

            {/* Description */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Brief description of this estate plan"
                multiline
                numberOfLines={3}
                value={formData.description}
                onChangeText={(text) => setFormData({ ...formData, description: text })}
              />
            </View>

            {/* Status */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>
                Status <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.statusSelector}>
                {(['draft', 'active', 'archived'] as const).map((status) => (
                  <TouchableOpacity
                    key={status}
                    style={[
                      styles.statusButton,
                      formData.status === status && styles.statusButtonActive,
                      { borderColor: getStatusColor(status) },
                      formData.status === status && {
                        backgroundColor: getStatusColor(status),
                      },
                    ]}
                    onPress={() => setFormData({ ...formData, status })}>
                    <Text
                      style={[
                        styles.statusButtonText,
                        formData.status === status && styles.statusButtonTextActive,
                      ]}>
                      {getStatusLabel(status)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Executor */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Executor</Text>
              <TextInput
                style={styles.input}
                placeholder="Name of executor"
                value={formData.executor}
                onChangeText={(text) => setFormData({ ...formData, executor: text })}
              />
            </View>

            <View style={styles.infoBox}>
              <Text style={styles.infoIcon}>ℹ️</Text>
              <Text style={styles.infoText}>
                You can add assets and beneficiaries after creating the estate plan
              </Text>
            </View>
          </ScrollView>

          {/* Modal Actions */}
          <View style={styles.modalActions}>
            <TouchableOpacity style={styles.cancelButton} onPress={() => setIsModalVisible(false)}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleAddEstatePlan}
              disabled={isLoading}>
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitButtonText}>Add Estate Plan</Text>
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
  planCard: {
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
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  planIcon: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: '#FFF9E6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  planIconText: {
    fontSize: 24,
  },
  planTitleContainer: {
    flex: 1,
  },
  planTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 2,
  },
  planExecutor: {
    fontSize: 13,
    color: '#666',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  planDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    lineHeight: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
    gap: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
    flex: 1,
    minWidth: '45%',
  },
  statIcon: {
    fontSize: 24,
    marginRight: 10,
  },
  statLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 2,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  assetsSection: {
    marginBottom: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 12,
  },
  assetItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  assetInfo: {
    flex: 1,
  },
  assetName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000',
    marginBottom: 2,
  },
  assetType: {
    fontSize: 12,
    color: '#999',
    textTransform: 'capitalize',
  },
  assetValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#d4b038',
  },
  beneficiariesSection: {
    marginBottom: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  beneficiaryList: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  beneficiaryItem: {
    alignItems: 'center',
    marginRight: 16,
  },
  beneficiaryAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#d4b038',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  beneficiaryInitial: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  beneficiaryPercentage: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  moreItems: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
    marginTop: 8,
  },
  cardActions: {
    flexDirection: 'row',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  deleteButton: {
    backgroundColor: '#ffebee',
  },
  deleteButtonText: {
    color: '#ff4444',
  },
  loader: {
    marginTop: 40,
  },
  errorState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  errorIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 16,
    color: '#ff4444',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#d4b038',
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
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
    height: 80,
    textAlignVertical: 'top',
  },
  statusSelector: {
    flexDirection: 'row',
    gap: 12,
  },
  statusButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 2,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  statusButtonActive: {
    borderWidth: 0,
  },
  statusButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  statusButtonTextActive: {
    color: '#fff',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#e3f2fd',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  infoIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#1976d2',
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
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});

export default EstateScreen;
