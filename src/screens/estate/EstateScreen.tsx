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
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  Image,
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
  updatePlanStart,
  updatePlanSuccess,
  updatePlanFailure,
  deletePlanStart,
  deletePlanSuccess,
  deletePlanFailure,
} from 'src/store/slices/estate/estateSlice';
import {
  getEstatePlans,
  createEstatePlan,
  updateEstatePlan,
  deleteEstatePlan,
} from 'src/services/estate/estate.services';
import { getFamilyMembers } from 'src/services/familyMember/familyMember.services';
import {
  fetchMembersStart,
  fetchMembersSuccess,
  fetchMembersFailure,
} from 'src/store/slices/familyMember/familyMemberSlice';
import { Card } from 'src/components/common/Card';
import { EmptyState } from 'src/components/common/EmptyState';
import { ActionButton } from 'src/components/common/ActionButton';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

type EstatePlanStatus = 'draft' | 'active' | 'archived';

interface Asset {
  name: string;
  type: 'property' | 'investment' | 'cash' | 'business' | 'other';
  value: number;
}

const EstateScreen = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { plans, isLoading } = useSelector((state: RootState) => state.estatePlans);
  const familyMembers = useSelector((state: RootState) => state.familyMembers?.members || []);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingPlan, setEditingPlan] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    notes: '',
    status: 'active' as EstatePlanStatus,
    assets: [] as { name: string; type: string; value: number }[],
    beneficiaries: [] as { familyMemberId: string; name: string; percentage: number }[],
  });

  useEffect(() => {
    loadPlans();
    loadFamilyMembers();
  }, []);

  useEffect(() => {
    if (isModalVisible) {
      loadFamilyMembers();
    }
  }, [isModalVisible]);

  const loadPlans = async () => {
    try {
      dispatch(fetchPlansStart());
      const data = await getEstatePlans();
      dispatch(fetchPlansSuccess(data));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch estate plans';
      dispatch(fetchPlansFailure(message));
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

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPlans();
    setRefreshing(false);
  };

  const handleOpenModal = (plan?: any) => {
    if (plan) {
      setEditingPlan(plan);

      const syncedBeneficiaries = (plan.beneficiaries || []).map((b: any) => {
        const member = familyMembers.find((m: any) => m._id === b.familyMemberId);
        return {
          familyMemberId: b.familyMemberId,
          name: member ? `${member.firstName} ${member.lastName}` : b.name || 'Unknown',
          percentage: b.percentage || 0,
        };
      });

      setFormData({
        title: plan.title || '',
        notes: plan.notes || plan.description || '',
        status: plan.status || 'active',
        assets: plan.assets || [],
        beneficiaries: syncedBeneficiaries,
      });
    } else {
      setEditingPlan(null);
      setFormData({
        title: '',
        notes: '',
        status: 'active',
        assets: [],
        beneficiaries: [],
      });
    }
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
    setEditingPlan(null);
    setFormData({
      title: '',
      notes: '',
      status: 'active',
      assets: [],
      beneficiaries: [],
    });
  };

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      Alert.alert('Error', 'Title is required');
      return;
    }

    const totalPercentage = formData.beneficiaries.reduce((sum, b) => sum + b.percentage, 0);
    if (formData.beneficiaries.length > 0 && totalPercentage !== 100) {
      Alert.alert(
        'Error',
        `Beneficiary percentages must total 100%. Currently: ${totalPercentage}%`
      );
      return;
    }

    try {
      const submitData = {
        title: formData.title,
        description: formData.notes || undefined,
        status: formData.status,
        assets: formData.assets.map((a) => ({
          name: a.name,
          type: (a.type === 'savings' ? 'cash' : a.type) as
            | 'property'
            | 'investment'
            | 'cash'
            | 'business'
            | 'other',
          value: a.value,
        })),
        beneficiaries: formData.beneficiaries.map((b) => {
          const member = familyMembers.find((m: any) => m._id === b.familyMemberId);
          const beneficiaryName = member
            ? `${member.firstName || ''} ${member.lastName || ''}`.trim()
            : b.name || 'Unknown';

          return {
            familyMemberId: b.familyMemberId,
            name: beneficiaryName,
            percentage: b.percentage,
          };
        }),
      };

      if (editingPlan) {
        dispatch(updatePlanStart());
        const updated = await updateEstatePlan(editingPlan._id, submitData);
        dispatch(updatePlanSuccess(updated));
        Alert.alert('Success', 'Plan updated successfully');
      } else {
        dispatch(createPlanStart());
        const newPlan = await createEstatePlan(submitData);
        dispatch(createPlanSuccess(newPlan));
        Alert.alert('Success', 'Plan created successfully');
      }
      handleCloseModal();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Operation failed';
      if (editingPlan) {
        dispatch(updatePlanFailure(message));
      } else {
        dispatch(createPlanFailure(message));
      }
      Alert.alert('Error', message);
    }
  };

  const addAsset = () => {
    setFormData({
      ...formData,
      assets: [...formData.assets, { name: '', type: 'property', value: 0 }],
    });
  };

  const updateAsset = (index: number, field: string, value: any) => {
    const updatedAssets = formData.assets.map((asset, i) => {
      if (i === index) {
        return { ...asset, [field]: value };
      }
      return asset;
    });
    setFormData({ ...formData, assets: updatedAssets });
  };

  const removeAsset = (index: number) => {
    setFormData({
      ...formData,
      assets: formData.assets.filter((_, i) => i !== index),
    });
  };

  const addBeneficiary = (member: any) => {
    if (!member || !member._id) {
      Alert.alert('Error', 'Invalid member selected');
      return;
    }

    const exists = formData.beneficiaries.find((b) => b.familyMemberId === member._id);
    if (exists) {
      Alert.alert('Info', 'This member is already added as beneficiary');
      return;
    }

    const fullName =
      `${member.firstName || ''} ${member.lastName || ''}`.trim() || 'Unknown Member';

    setFormData({
      ...formData,
      beneficiaries: [
        ...formData.beneficiaries,
        {
          familyMemberId: member._id,
          name: fullName,
          percentage: 0,
        },
      ],
    });
  };

  const updateBeneficiaryPercentage = (familyMemberId: string, percentage: number) => {
    setFormData({
      ...formData,
      beneficiaries: formData.beneficiaries.map((b) =>
        b.familyMemberId === familyMemberId ? { ...b, percentage } : b
      ),
    });
  };

  const removeBeneficiary = (familyMemberId: string) => {
    setFormData({
      ...formData,
      beneficiaries: formData.beneficiaries.filter((b) => b.familyMemberId !== familyMemberId),
    });
  };

  const getTotalPercentage = () => {
    return formData.beneficiaries.reduce((sum, b) => sum + b.percentage, 0);
  };

  const handleDelete = (plan: any) => {
    if (!plan || !plan._id) {
      Alert.alert('Error', 'Cannot delete this plan');
      return;
    }
    Alert.alert(
      'Confirm Deletion',
      `Are you sure you want to delete the plan "${plan.title || 'Untitled'}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              dispatch(deletePlanStart());
              await deleteEstatePlan(plan._id);
              dispatch(deletePlanSuccess(plan._id));
              Alert.alert('Success', 'Plan deleted successfully');
            } catch (err) {
              const message = err instanceof Error ? err.message : 'Failed to delete plan';
              dispatch(deletePlanFailure(message));
              Alert.alert('Error', message);
            }
          },
        },
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return '#10B981';
      case 'draft':
        return '#F59E0B';
      case 'archived':
        return '#6B7280';
      default:
        return '#64748B';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'Active';
      case 'draft':
        return 'Draft';
      case 'archived':
        return 'Archived';
      default:
        return status;
    }
  };

  const getAssetIcon = (type: string | undefined) => {
    if (!type) return require('../../assets/icons/view.png');
    const icons: Record<string, any> = {
      property: require('../../assets/icons/home.png'),
      investment: require('../../assets/icons/chart.png'),
      cash: require('../../assets/icons/money.png'),
      savings: require('../../assets/icons/money.png'),
      business: require('../../assets/icons/task.png'),
      other: require('../../assets/icons/view.png'),
    };
    return icons[type] || require('../../assets/icons/view.png');
  };

  const getAssetTypeLabel = (type: string | undefined) => {
    if (!type) return 'Other';
    const labels: Record<string, string> = {
      property: 'Property',
      investment: 'Investment',
      cash: 'Savings',
      savings: 'Savings',
      business: 'Business',
      other: 'Other',
    };
    return labels[type] || type;
  };

  const calculateTotalAssets = (assets?: Asset[]) => {
    if (!assets || !Array.isArray(assets)) return 0;
    return assets.reduce((sum, asset) => sum + (asset.value || 0), 0);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getBeneficiaryName = (beneficiary: any) => {
    if (!beneficiary) return 'Unknown';

    if (beneficiary.name && beneficiary.name.trim()) {
      return beneficiary.name;
    }

    if (beneficiary.familyMemberId) {
      const member = familyMembers.find((m: any) => m._id === beneficiary.familyMemberId);
      if (member) {
        const fullName = `${member.firstName || ''} ${member.lastName || ''}`.trim();
        return fullName || 'Unknown Member';
      }
    }

    if (beneficiary.memberName) return beneficiary.memberName;
    if (beneficiary.fullName) return beneficiary.fullName;

    return 'Unknown';
  };

  const EstateEmptyIcon = require('../../assets/icons/estate-plans.png');

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#1E3A5F" />

      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Estate Plans</Text>
          <Text style={styles.headerSubtitle}>Manage your plans</Text>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={() => handleOpenModal()}>
          <Text style={styles.addButtonText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        {isLoading && !refreshing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#D4AF37" />
          </View>
        ) : plans.length === 0 ? (
          <EmptyState
            icon={EstateEmptyIcon}
            title="No Plans"
            message="Create your first estate plan to start managing your assets"
            actionText="Create Plan"
            onAction={() => handleOpenModal()}
          />
        ) : (
          <>
            {plans.map((plan) => (
              <Card key={plan?._id || Math.random().toString()} style={styles.planCard}>
                <View style={styles.cardHeader}>
                  <View style={styles.planTitleRow}>
                    <View style={styles.planIconContainer}>
                      <Image
                        source={require('../../assets/icons/task.png')}
                        style={styles.taskIcon}
                      />
                    </View>
                    <View style={styles.planTitleContent}>
                      <Text style={styles.planTitle} numberOfLines={1}>
                        {plan?.title || 'Untitled Plan'}
                      </Text>
                      {plan.description && (
                        <Text style={styles.planSubtitle} numberOfLines={1}>
                          {plan.description}
                        </Text>
                      )}
                    </View>
                    <View
                      style={[
                        styles.statusBadge,
                        { backgroundColor: getStatusColor(plan?.status || 'draft') },
                      ]}>
                      <Text style={styles.statusText}>
                        {getStatusLabel(plan?.status || 'draft')}
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={styles.statsRow}>
                  <View style={styles.statItem}>
                    <Image
                      source={require('../../assets/icons/money.png')}
                      style={styles.statImage}
                    />
                    <View>
                      <Text style={styles.statLabel}>Total Value</Text>
                      <Text style={styles.statValue}>
                        {formatCurrency(calculateTotalAssets(plan?.assets))}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.statItem}>
                    <Image
                      source={require('../../assets/icons/chart.png')}
                      style={styles.statImage}
                    />
                    <View>
                      <Text style={styles.statLabel}>Assets</Text>
                      <Text style={styles.statValue}>
                        {Array.isArray(plan?.assets) ? plan.assets.length : 0}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.statItem}>
                    <Image
                      source={require('../../assets/icons/contacts.png')}
                      style={styles.statImage}
                    />
                    <View>
                      <Text style={styles.statLabel}>Beneficiaries</Text>
                      <Text style={styles.statValue}>
                        {Array.isArray(plan?.beneficiaries) ? plan.beneficiaries.length : 0}
                      </Text>
                    </View>
                  </View>
                </View>

                {plan.assets && plan.assets.length > 0 && (
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Assets ({plan.assets.length})</Text>
                    {plan.assets.slice(0, 3).map((asset: any, index: number) => (
                      <View key={index} style={styles.assetItem}>
                        <View style={styles.assetIconContainer}>
                          <Image source={getAssetIcon(asset?.type)} style={styles.assetIconImage} />
                        </View>
                        <View style={styles.assetInfo}>
                          <Text style={styles.assetName} numberOfLines={1}>
                            {asset?.name || 'Unnamed Asset'}
                          </Text>
                          <Text style={styles.assetType}>{getAssetTypeLabel(asset?.type)}</Text>
                        </View>
                        <Text style={styles.assetValue}>{formatCurrency(asset?.value || 0)}</Text>
                      </View>
                    ))}
                    {plan.assets.length > 3 && (
                      <Text style={styles.moreText}>+{plan.assets.length - 3} more assets</Text>
                    )}
                  </View>
                )}

                {plan.beneficiaries && plan.beneficiaries.length > 0 && (
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>
                      Beneficiaries ({plan.beneficiaries.length})
                    </Text>
                    {plan.beneficiaries.slice(0, 3).map((beneficiary: any, index: number) => {
                      const beneficiaryName = getBeneficiaryName(beneficiary);
                      return (
                        <View key={index} style={styles.beneficiaryItem}>
                          <View style={styles.beneficiaryAvatar}>
                            <Image
                              source={require('../../assets/icons/contacts.png')}
                              style={styles.beneficiaryIcon}
                            />
                          </View>
                          <Text style={styles.beneficiaryName} numberOfLines={1}>
                            {beneficiaryName}
                          </Text>
                          <Text style={styles.beneficiaryPercentage}>
                            {beneficiary?.percentage || 0}%
                          </Text>
                        </View>
                      );
                    })}
                    {plan.beneficiaries.length > 3 && (
                      <Text style={styles.moreText}>
                        +{plan.beneficiaries.length - 3} more beneficiaries
                      </Text>
                    )}
                  </View>
                )}

                <View style={styles.actionButtons}>
                  <ActionButton
                    title="Edit"
                    onPress={() => plan && handleOpenModal(plan)}
                    variant="secondary"
                    size="small"
                    style={styles.actionButton}
                  />
                  <ActionButton
                    title="Delete"
                    onPress={() => plan && handleDelete(plan)}
                    variant="danger"
                    size="small"
                    style={styles.actionButton}
                  />
                </View>
              </Card>
            ))}
            <View style={styles.bottomSpacer} />
          </>
        )}
      </ScrollView>

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
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {editingPlan ? 'Edit Plan' : 'Create New Plan'}
                </Text>
                <TouchableOpacity onPress={handleCloseModal} style={styles.closeButton}>
                  <Text style={styles.closeButtonText}>✕</Text>
                </TouchableOpacity>
              </View>

              <ScrollView
                style={styles.modalScrollView}
                contentContainerStyle={styles.modalScrollContent}
                showsVerticalScrollIndicator={true}
                bounces={true}
                keyboardShouldPersistTaps="handled">
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Title *</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.title}
                    onChangeText={(text) => setFormData({ ...formData, title: text })}
                    placeholder="Estate Plan 2024"
                    placeholderTextColor="#94A3B8"
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>Notes</Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    value={formData.notes}
                    onChangeText={(text) => setFormData({ ...formData, notes: text })}
                    placeholder="Add additional notes..."
                    placeholderTextColor="#94A3B8"
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>Status</Text>
                  <View style={styles.statusButtons}>
                    {['active', 'draft', 'archived'].map((status) => (
                      <TouchableOpacity
                        key={status}
                        style={[
                          styles.statusButton,
                          formData.status === status && styles.statusButtonActive,
                        ]}
                        onPress={() =>
                          setFormData({ ...formData, status: status as EstatePlanStatus })
                        }>
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

                <View style={styles.formGroup}>
                  <View style={styles.sectionHeader}>
                    <Text style={styles.label}>Assets</Text>
                    <TouchableOpacity style={styles.addAssetButton} onPress={addAsset}>
                      <Text style={styles.addAssetButtonText}>+ Add Asset</Text>
                    </TouchableOpacity>
                  </View>
                  {formData.assets.length === 0 ? (
                    <View style={styles.emptyBox}>
                      <Text style={styles.emptyText}>
                        No assets added. Click "Add Asset" to start.
                      </Text>
                    </View>
                  ) : (
                    formData.assets.map((asset, index) => (
                      <View key={index} style={styles.assetFormItem}>
                        <TextInput
                          style={styles.input}
                          placeholder="Asset name"
                          placeholderTextColor="#94A3B8"
                          value={asset.name}
                          onChangeText={(text) => updateAsset(index, 'name', text)}
                        />
                        <View style={styles.assetTypeRow}>
                          <Text style={styles.smallLabel}>Type:</Text>
                          <View style={styles.assetTypeButtons}>
                            {['property', 'investment', 'savings', 'other'].map((type) => (
                              <TouchableOpacity
                                key={type}
                                style={[
                                  styles.smallButton,
                                  asset.type === type && styles.smallButtonActive,
                                ]}
                                onPress={() => updateAsset(index, 'type', type)}>
                                <Text
                                  style={[
                                    styles.smallButtonText,
                                    asset.type === type && styles.smallButtonTextActive,
                                  ]}>
                                  {type.charAt(0).toUpperCase() + type.slice(1)}
                                </Text>
                              </TouchableOpacity>
                            ))}
                          </View>
                        </View>
                        <View style={styles.valueRow}>
                          <Text style={styles.smallLabel}>Value:</Text>
                          <TextInput
                            style={[styles.input, styles.valueInput]}
                            placeholder="0"
                            placeholderTextColor="#94A3B8"
                            value={asset.value > 0 ? asset.value.toString() : ''}
                            onChangeText={(text) =>
                              updateAsset(index, 'value', parseFloat(text) || 0)
                            }
                            keyboardType="numeric"
                          />
                          <Text style={styles.currencySymbol}>$</Text>
                          <TouchableOpacity
                            style={styles.removeButton}
                            onPress={() => removeAsset(index)}>
                            <Text style={styles.removeButtonText}>×</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    ))
                  )}
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>
                    Beneficiaries
                    {formData.beneficiaries.length > 0 && (
                      <Text
                        style={
                          getTotalPercentage() === 100
                            ? styles.percentageValid
                            : styles.percentageInvalid
                        }>
                        {' '}
                        ({getTotalPercentage()}% of 100%)
                      </Text>
                    )}
                  </Text>

                  {familyMembers.length > 0 ? (
                    <>
                      <Text style={styles.smallLabel}>Select members:</Text>
                      <View style={styles.memberChips}>
                        {familyMembers.map((member: any) => {
                          const isAdded = formData.beneficiaries.some(
                            (b) => b.familyMemberId === member._id
                          );
                          const memberFullName = `${member.firstName} ${member.lastName}`;
                          return (
                            <TouchableOpacity
                              key={member._id}
                              style={[styles.memberChip, isAdded && styles.memberChipDisabled]}
                              onPress={() => !isAdded && addBeneficiary(member)}
                              disabled={isAdded}>
                              <Text
                                style={[
                                  styles.memberChipText,
                                  isAdded && styles.memberChipTextDisabled,
                                ]}>
                                {memberFullName} {isAdded && '✓'}
                              </Text>
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    </>
                  ) : (
                    <View style={styles.emptyBox}>
                      <Text style={styles.emptyText}>
                        No family members. Add members to assign beneficiaries.
                      </Text>
                    </View>
                  )}

                  {formData.beneficiaries.length > 0 && (
                    <View style={styles.beneficiariesList}>
                      <Text style={styles.smallLabel}>Assigned beneficiaries:</Text>
                      {formData.beneficiaries.map((beneficiary) => {
                        const beneficiaryName = getBeneficiaryName(beneficiary);
                        return (
                          <View key={beneficiary.familyMemberId} style={styles.beneficiaryFormItem}>
                            <Text style={styles.beneficiaryFormName}>{beneficiaryName}</Text>
                            <View style={styles.beneficiaryActions}>
                              <TextInput
                                style={styles.percentageInput}
                                value={beneficiary.percentage.toString()}
                                onChangeText={(text) => {
                                  const value = parseInt(text) || 0;
                                  updateBeneficiaryPercentage(
                                    beneficiary.familyMemberId,
                                    Math.min(100, Math.max(0, value))
                                  );
                                }}
                                keyboardType="numeric"
                                maxLength={3}
                              />
                              <Text style={styles.percentSymbol}>%</Text>
                              <TouchableOpacity
                                style={styles.removeButton}
                                onPress={() => removeBeneficiary(beneficiary.familyMemberId)}>
                                <Text style={styles.removeButtonText}>×</Text>
                              </TouchableOpacity>
                            </View>
                          </View>
                        );
                      })}
                    </View>
                  )}

                  {formData.beneficiaries.length > 0 && getTotalPercentage() !== 100 && (
                    <Text style={styles.validationWarning}>
                      Total must be 100%. Currently: {getTotalPercentage()}%
                    </Text>
                  )}
                  {formData.beneficiaries.length > 0 && getTotalPercentage() === 100 && (
                    <Text style={styles.validationSuccess}>✓ Beneficiaries total 100%</Text>
                  )}
                </View>

                <View style={{ height: 30 }} />
              </ScrollView>

              <View style={styles.modalActions}>
                <ActionButton
                  title="Cancel"
                  onPress={handleCloseModal}
                  variant="secondary"
                  style={styles.modalButton}
                />
                <ActionButton
                  title={editingPlan ? 'Save Changes' : 'Create Plan'}
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
  taskIcon: {
    width: 20,
    height: 20,
  },
  addButtonText: {
    color: '#1E3A5F',
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  statImage: {
    width: 24,
    height: 24,
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
  planCard: {
    marginBottom: 16,
    padding: 0,
  },
  cardHeader: {
    padding: 16,
    paddingBottom: 12,
  },
  planTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  planIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  planIcon: {
    fontSize: 20,
  },
  planTitleContent: {
    flex: 1,
    marginRight: 12,
  },
  planTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E3A5F',
    marginBottom: 2,
  },
  planSubtitle: {
    fontSize: 12,
    color: '#64748B',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F8FAFC',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E2E8F0',
  },
  statItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statIcon: {
    fontSize: 20,
  },
  statLabel: {
    fontSize: 10,
    color: '#64748B',
    marginBottom: 2,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E3A5F',
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E3A5F',
    marginBottom: 12,
  },
  assetItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  assetIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  assetIcon: {
    fontSize: 18,
  },
  assetIconImage: {
    width: 20,
    height: 20,
  },
  assetInfo: {
    flex: 1,
  },
  assetName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E3A5F',
    marginBottom: 2,
  },
  assetType: {
    fontSize: 12,
    color: '#64748B',
  },
  assetValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#D4AF37',
  },
  beneficiaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  beneficiaryAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#D4AF37',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  beneficiaryInitials: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E3A5F',
  },
  beneficiaryIcon: {
    width: 20,
    height: 20,
    tintColor: '#1E3A5F',
  },
  beneficiaryName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#1E3A5F',
  },
  beneficiaryPercentage: {
    fontSize: 15,
    fontWeight: '700',
    color: '#D4AF37',
  },
  moreText: {
    fontSize: 12,
    color: '#64748B',
    fontStyle: 'italic',
    marginTop: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
  },
  actionButton: {
    flex: 1,
    height: 40,
  },
  bottomSpacer: {
    height: 20,
  },
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
  statusButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  statusButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  statusButtonActive: {
    backgroundColor: '#D4AF37',
    borderColor: '#D4AF37',
  },
  statusButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#64748B',
  },
  statusButtonTextActive: {
    color: '#1E3A5F',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  addAssetButton: {
    backgroundColor: '#D4AF37',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addAssetButtonText: {
    color: '#1E3A5F',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyBox: {
    padding: 24,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
  },
  emptyText: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
  },
  assetFormItem: {
    padding: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 12,
    marginBottom: 12,
  },
  assetTypeRow: {
    gap: 8,
  },
  smallLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 8,
  },
  assetTypeButtons: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  smallButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  smallButtonActive: {
    backgroundColor: '#D4AF37',
    borderColor: '#D4AF37',
  },
  smallButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  smallButtonTextActive: {
    color: '#1E3A5F',
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  valueInput: {
    flex: 1,
  },
  currencySymbol: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748B',
  },
  removeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    fontSize: 22,
    color: '#DC2626',
    fontWeight: '600',
    lineHeight: 24,
  },
  percentageValid: {
    color: '#10B981',
    fontSize: 14,
    fontWeight: '600',
  },
  percentageInvalid: {
    color: '#EF4444',
    fontSize: 14,
    fontWeight: '600',
  },
  memberChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
    marginTop: 8,
  },
  memberChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#D4AF37',
    borderWidth: 1,
    borderColor: '#D4AF37',
  },
  memberChipDisabled: {
    backgroundColor: '#E2E8F0',
    borderColor: '#CBD5E1',
  },
  memberChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E3A5F',
  },
  memberChipTextDisabled: {
    color: '#94A3B8',
  },
  beneficiariesList: {
    gap: 12,
    marginTop: 12,
  },
  beneficiaryFormItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  beneficiaryFormName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E3A5F',
    flex: 1,
  },
  beneficiaryActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  percentageInput: {
    width: 70,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#1E3A5F',
    textAlign: 'center',
    fontWeight: '600',
  },
  percentSymbol: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748B',
  },
  validationWarning: {
    fontSize: 14,
    color: '#EF4444',
    marginTop: 12,
    fontWeight: '600',
    backgroundColor: '#FEE2E2',
    padding: 12,
    borderRadius: 8,
  },
  validationSuccess: {
    fontSize: 14,
    color: '#10B981',
    marginTop: 12,
    fontWeight: '600',
    backgroundColor: '#D1FAE5',
    padding: 12,
    borderRadius: 8,
  },
});

export default EstateScreen;
