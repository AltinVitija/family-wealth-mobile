// screens/estate/EstateScreen.tsx
// This screen expects the following Redux store slices:
// - state.auth.user: Current logged-in user (should have: _id/id, name or firstName/lastName)
// - state.family.members: Array of family members (should have: _id/id, name or firstName/lastName)
// - state.estatePlans: Estate plans slice (plans, isLoading, error)

import React, { useState, useEffect, useMemo } from 'react';
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
  fetchMembersStart,
  fetchMembersSuccess,
  fetchMembersFailure,
} from 'src/store/slices/familyMember/familyMemberSlice';
import {
  getEstatePlans,
  createEstatePlan,
  deleteEstatePlan,
} from 'src/services/estate/estate.services';
import { getFamilyMembers } from 'src/services/familyMember/familyMember.services';

type EstatePlanStatus = 'draft' | 'active' | 'archived';

interface Asset {
  name: string;
  type: 'property' | 'investment' | 'cash' | 'business' | 'other';
  value: number;
}

interface ExecutorOption {
  id: string;
  name: string;
  isOwner?: boolean;
}

const EstateScreen = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { plans, isLoading, error } = useSelector((state: RootState) => state.estatePlans);

  // Get current user and family members from store
  const currentUser = useSelector((state: RootState) => state.auth?.user);
  const familyMembers = useSelector((state: RootState) => state.familyMembers?.members || []);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    notes: '',
    status: 'active' as EstatePlanStatus,
    executor: '',
    beneficiaries: [] as { familyMemberId: string; name: string; percentage: number }[],
    assets: [] as { name: string; type: string; value: number }[],
  });

  // Build executor options from current user + family members
  const executorOptions = useMemo(() => {
    const options: ExecutorOption[] = [];

    // Add current user as first option
    if (currentUser) {
      options.push({
        id: currentUser.id || currentUser.id,
        name:
          currentUser.firstName ||
          `${currentUser.firstName} ${currentUser.lastName}`.trim() ||
          'Me',
        isOwner: true,
      });
    }

    // Add family members
    if (familyMembers && familyMembers.length > 0) {
      familyMembers.forEach((member: any) => {
        options.push({
          id: member._id || member.id,
          name: member.name || `${member.firstName} ${member.lastName}`.trim(),
          isOwner: false,
        });
      });
    }

    console.log('Executor options built:', options);
    return options;
  }, [currentUser, familyMembers]);

  // Fetch estate plans and family members on mount
  useEffect(() => {
    loadEstatePlans();
    loadFamilyMembers();
  }, []);

  const loadFamilyMembers = async () => {
    dispatch(fetchMembersStart());
    try {
      const members = await getFamilyMembers();
      dispatch(fetchMembersSuccess(members));
      console.log('Family members loaded:', members);
    } catch (error: any) {
      dispatch(fetchMembersFailure(error.message || 'Failed to load family members'));
      console.error('Failed to load family members:', error);
    }
  };

  const loadEstatePlans = async () => {
    dispatch(fetchPlansStart());
    try {
      const plans = await getEstatePlans();
      dispatch(fetchPlansSuccess(plans));
    } catch (error: any) {
      dispatch(fetchPlansFailure(error.message || 'Failed to fetch estate plans'));
    }
  };

  const getAssetIcon = (type: string) => {
    const icons = {
      property: '🏠',
      investment: '📈',
      cash: '💰',
      business: '💼',
      other: '📦',
    };
    return icons[type as keyof typeof icons] || '📦';
  };

  const getAssetColor = (type: string) => {
    const colors = {
      property: '#DBEAFE', // Light blue
      investment: '#D1FAE5', // Light green
      cash: '#FEF3C7', // Light yellow
      business: '#E0E7FF', // Light indigo
      other: '#F3F4F6', // Light gray
    };
    return colors[type as keyof typeof colors] || '#F3F4F6';
  };

  const getStatusColor = (status: EstatePlanStatus) => {
    const colors = {
      draft: '#FFA500',
      active: '#10B981',
      archived: '#94A3B8',
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

    // Validate beneficiaries total to 100%
    const totalPercentage = formData.beneficiaries.reduce((sum, b) => sum + b.percentage, 0);
    if (formData.beneficiaries.length > 0 && totalPercentage !== 100) {
      Alert.alert(
        'Error',
        `Beneficiary percentages must total 100%. Current total: ${totalPercentage}%`
      );
      return;
    }

    dispatch(createPlanStart());
    try {
      const newPlan = await createEstatePlan({
        title: formData.title,
        description: formData.notes || undefined,
        status: formData.status,
        executor: formData.executor || undefined,
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
        beneficiaries: formData.beneficiaries.map((b) => ({
          familyMemberId: b.familyMemberId,
          name: b.name,
          percentage: b.percentage,
        })),
      });

      dispatch(createPlanSuccess(newPlan));
      setIsModalVisible(false);
      setFormData({
        title: '',
        notes: '',
        status: 'active',
        executor: '',
        beneficiaries: [],
        assets: [],
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

  // Beneficiary management functions
  const addBeneficiary = (member: any) => {
    const exists = formData.beneficiaries.find((b) => b.familyMemberId === member._id);
    if (exists) {
      Alert.alert('Info', 'This member is already added as a beneficiary');
      return;
    }

    const newBeneficiary = {
      familyMemberId: member._id,
      name: `${member.firstName} ${member.lastName}`,
      percentage: 0,
    };

    setFormData({
      ...formData,
      beneficiaries: [...formData.beneficiaries, newBeneficiary],
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

  // Asset management functions
  const addAsset = () => {
    const newAsset = {
      name: '',
      type: 'property',
      value: 0,
    };
    setFormData({
      ...formData,
      assets: [...formData.assets, newAsset],
    });
  };

  const updateAsset = (index: number, field: string, value: any) => {
    const updatedAssets = formData.assets.map((asset, i) => {
      if (i === index) {
        return { ...asset, [field]: value };
      }
      return asset;
    });
    setFormData({
      ...formData,
      assets: updatedAssets,
    });
  };

  const removeAsset = (index: number) => {
    setFormData({
      ...formData,
      assets: formData.assets.filter((_, i) => i !== index),
    });
  };

  const renderEstatePlanCard = (plan: any) => {
    const totalValue = calculateTotalValue(plan.assets);
    const assetCount = plan.assets?.length || 0;

    return (
      <View key={plan._id} style={styles.planCard}>
        {/* Header */}
        <View style={styles.planHeader}>
          <View style={styles.planHeaderLeft}>
            <View style={styles.planIconContainer}>
              <Text style={styles.planIcon}>📄</Text>
            </View>
            <View style={styles.planTitleContainer}>
              <Text style={styles.planTitle}>{plan.title}</Text>
              {plan.executor && <Text style={styles.planExecutor}>Executor: {plan.executor}</Text>}
            </View>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(plan.status) }]}>
            <Text style={styles.statusBadgeText}>{getStatusLabel(plan.status)}</Text>
          </View>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
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
            <Text style={styles.statIcon}>📅</Text>
            <View>
              <Text style={styles.statLabel}>Updated</Text>
              <Text style={styles.statValue}>{formatDate(plan.updatedAt)}</Text>
            </View>
          </View>
        </View>

        {/* Assets Section */}
        {plan.assets && plan.assets.length > 0 && (
          <View style={styles.assetsSection}>
            <Text style={styles.sectionTitle}>Assets ({plan.assets.length})</Text>
            {plan.assets.slice(0, 3).map((asset: Asset, index: number) => (
              <View key={index} style={styles.assetItem}>
                <View style={styles.assetLeft}>
                  <View
                    style={[
                      styles.assetIconContainer,
                      { backgroundColor: getAssetColor(asset.type) },
                    ]}>
                    <Text style={styles.assetIconText}>{getAssetIcon(asset.type)}</Text>
                  </View>
                  <View>
                    <Text style={styles.assetName}>{asset.name}</Text>
                    <Text style={styles.assetType}>{asset.type}</Text>
                  </View>
                </View>
                <Text style={styles.assetValue}>{formatCurrency(asset.value)}</Text>
              </View>
            ))}
            {plan.assets.length > 3 && (
              <Text style={styles.moreItems}>+{plan.assets.length - 3} more assets</Text>
            )}
          </View>
        )}

        {/* Beneficiaries Section */}
        {plan.beneficiaries && plan.beneficiaries.length > 0 && (
          <View style={styles.beneficiariesSection}>
            <Text style={styles.sectionTitle}>Beneficiaries ({plan.beneficiaries.length})</Text>
            {plan.beneficiaries.slice(0, 3).map((beneficiary: any, index: number) => (
              <View key={index} style={styles.beneficiaryItem}>
                <View style={styles.beneficiaryLeft}>
                  <View style={styles.beneficiaryAvatar}>
                    <Text style={styles.beneficiaryInitial}>
                      {beneficiary.name?.charAt(0) || beneficiary.familyMemberId?.charAt(0) || 'B'}
                    </Text>
                  </View>
                  <Text style={styles.beneficiaryName}>
                    {beneficiary.name || beneficiary.familyMemberId || 'Beneficiary'}
                  </Text>
                </View>
                <Text style={styles.beneficiaryPercentage}>{beneficiary.percentage}%</Text>
              </View>
            ))}
            {plan.beneficiaries.length > 3 && (
              <Text style={styles.moreItems}>+{plan.beneficiaries.length - 3} more</Text>
            )}
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Planet e Trashëgimisë</Text>
          <Text style={styles.headerSubtitle}>Menaxhoni planet tuaja</Text>
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
              <Text style={styles.retryButtonText}>Provo Përsëri</Text>
            </TouchableOpacity>
          </View>
        ) : plans.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateIcon}>📋</Text>
            <Text style={styles.emptyStateText}>Asnjë plan ende</Text>
            <Text style={styles.emptyStateSubtext}>
              Shtypni butonin + për të krijuar planin tuaj të parë
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
            <Text style={styles.modalTitle}>Krijo Plan të Ri</Text>
            <TouchableOpacity onPress={() => setIsModalVisible(false)}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            {/* Plan Title */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>
                Titulli <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                placeholder="Plani i Trashëgimisë 2024"
                placeholderTextColor="#94A3B8"
                value={formData.title}
                onChangeText={(text) => setFormData({ ...formData, title: text })}
              />
            </View>

            {/* Notes */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Shënime</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Shto shënime shtesë..."
                placeholderTextColor="#94A3B8"
                multiline
                numberOfLines={4}
                value={formData.notes}
                onChangeText={(text) => setFormData({ ...formData, notes: text })}
              />
            </View>

            {/* Status */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Statusi</Text>
              <View style={styles.statusButtonsContainer}>
                <TouchableOpacity
                  style={[
                    styles.statusButton,
                    formData.status === 'active' && styles.statusButtonActive,
                  ]}
                  onPress={() => setFormData({ ...formData, status: 'active' })}>
                  <Text
                    style={[
                      styles.statusButtonText,
                      formData.status === 'active' && styles.statusButtonTextActive,
                    ]}>
                    Aktiv
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.statusButton,
                    formData.status === 'draft' && styles.statusButtonActive,
                  ]}
                  onPress={() => setFormData({ ...formData, status: 'draft' })}>
                  <Text
                    style={[
                      styles.statusButtonText,
                      formData.status === 'draft' && styles.statusButtonTextActive,
                    ]}>
                    Draft
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.statusButton,
                    formData.status === 'archived' && styles.statusButtonActive,
                  ]}
                  onPress={() => setFormData({ ...formData, status: 'archived' })}>
                  <Text
                    style={[
                      styles.statusButtonText,
                      formData.status === 'archived' && styles.statusButtonTextActive,
                    ]}>
                    Arkivuar
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Executor - Removed per screenshot */}

            {/* Assets Section */}
            <View style={styles.formGroup}>
              <View style={styles.sectionHeader}>
                <Text style={styles.formLabel}>Asete</Text>
                <TouchableOpacity style={styles.addAssetButton} onPress={addAsset}>
                  <Text style={styles.addAssetButtonText}>+ Shto Aset</Text>
                </TouchableOpacity>
              </View>

              {formData.assets.length === 0 ? (
                <View style={styles.emptyAssetsBox}>
                  <Text style={styles.emptyAssetsText}>
                    Asnjë aset i shtuar. Shtypni &quot;Shto Aset&quot; për të filluar.
                  </Text>
                </View>
              ) : (
                <View style={styles.assetsList}>
                  {formData.assets.map((asset, index) => (
                    <View key={index} style={styles.assetFormItem}>
                      {/* Asset Name */}
                      <TextInput
                        style={styles.assetInput}
                        placeholder="Emri i asetit (p.sh. Shtëpi kryesore)"
                        placeholderTextColor="#94A3B8"
                        value={asset.name}
                        onChangeText={(text) => updateAsset(index, 'name', text)}
                      />

                      {/* Asset Type Dropdown */}
                      <View style={styles.assetTypeRow}>
                        <View style={styles.assetTypeContainer}>
                          <Text style={styles.assetTypeLabel}>Lloji:</Text>
                          <View style={styles.assetTypeButtons}>
                            {['property', 'investment', 'savings', 'other'].map((type) => (
                              <TouchableOpacity
                                key={type}
                                style={[
                                  styles.assetTypeButton,
                                  asset.type === type && styles.assetTypeButtonActive,
                                ]}
                                onPress={() => updateAsset(index, 'type', type)}>
                                <Text
                                  style={[
                                    styles.assetTypeButtonText,
                                    asset.type === type && styles.assetTypeButtonTextActive,
                                  ]}>
                                  {type === 'property'
                                    ? 'Prone'
                                    : type === 'investment'
                                      ? 'Investim'
                                      : type === 'savings'
                                        ? 'Kursime'
                                        : 'Tjetër'}
                                </Text>
                              </TouchableOpacity>
                            ))}
                          </View>
                        </View>
                      </View>

                      {/* Asset Value */}
                      <View style={styles.assetValueRow}>
                        <Text style={styles.assetValueLabel}>Vlera:</Text>
                        <TextInput
                          style={styles.assetValueInput}
                          placeholder="0"
                          placeholderTextColor="#94A3B8"
                          value={asset.value > 0 ? asset.value.toString() : ''}
                          onChangeText={(text) => {
                            const value = parseFloat(text) || 0;
                            updateAsset(index, 'value', value);
                          }}
                          keyboardType="numeric"
                        />
                        <Text style={styles.currencySymbol}>€</Text>

                        {/* Remove Asset Button */}
                        <TouchableOpacity
                          style={styles.removeAssetButton}
                          onPress={() => removeAsset(index)}>
                          <Text style={styles.removeAssetButtonText}>×</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>

            {/* Beneficiaries Section */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>
                Beneficiarë
                {formData.beneficiaries.length > 0 && (
                  <Text
                    style={
                      getTotalPercentage() === 100
                        ? styles.percentageValid
                        : styles.percentageInvalid
                    }>
                    {' '}
                    ({getTotalPercentage()}% nga 100%)
                  </Text>
                )}
              </Text>

              {/* Add Beneficiary Dropdown */}
              {familyMembers.length > 0 ? (
                <>
                  <Text style={styles.subLabel}>Zgjidhni anëtarët e familjes:</Text>
                  <View style={styles.memberChipsContainer}>
                    {familyMembers.map((member: any) => {
                      const isAdded = formData.beneficiaries.some(
                        (b) => b.familyMemberId === member._id
                      );
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
                            {member.firstName} {member.lastName}
                            {isAdded && ' ✓'}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </>
              ) : (
                <View style={styles.noBeneficiariesBox}>
                  <Text style={styles.noBeneficiariesText}>
                    Nuk ka anëtarë të familjes. Shtoni anëtarë për të caktuar beneficiarë.
                  </Text>
                </View>
              )}

              {/* Selected Beneficiaries with Percentage */}
              {formData.beneficiaries.length > 0 && (
                <View style={styles.beneficiariesList}>
                  <Text style={styles.subLabel}>Beneficiarët e caktuar:</Text>
                  {formData.beneficiaries.map((beneficiary) => (
                    <View key={beneficiary.familyMemberId} style={styles.beneficiaryItem}>
                      <View style={styles.beneficiaryInfo}>
                        <View style={styles.beneficiaryAvatar}>
                          <Text style={styles.beneficiaryInitial}>
                            {beneficiary.name.charAt(0)}
                          </Text>
                        </View>
                        <Text style={styles.beneficiaryName}>{beneficiary.name}</Text>
                      </View>
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
                          placeholder="0"
                          maxLength={3}
                        />
                        <Text style={styles.percentageSymbol}>%</Text>
                        <TouchableOpacity
                          style={styles.removeButton}
                          onPress={() => removeBeneficiary(beneficiary.familyMemberId)}>
                          <Text style={styles.removeButtonText}>×</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}
                </View>
              )}

              {/* Validation Message */}
              {formData.beneficiaries.length > 0 && getTotalPercentage() !== 100 && (
                <Text style={styles.validationWarning}>
                  ⚠️ Totali duhet të jetë 100%. Aktualisht: {getTotalPercentage()}%
                </Text>
              )}
              {formData.beneficiaries.length > 0 && getTotalPercentage() === 100 && (
                <Text style={styles.validationSuccess}>✓ Beneficiarët totalojnë 100%</Text>
              )}
            </View>
          </ScrollView>

          {/* Modal Actions */}
          <View style={styles.modalActions}>
            <TouchableOpacity style={styles.cancelButton} onPress={() => setIsModalVisible(false)}>
              <Text style={styles.cancelButtonText}>Anulo</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleAddEstatePlan}
              disabled={isLoading}>
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitButtonText}>Krijo Planin</Text>
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
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1E3A5F',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#64748B',
  },
  addButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#D4AF37',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  addButtonText: {
    fontSize: 32,
    color: '#FFFFFF',
    fontWeight: '300',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  planCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  planHeaderLeft: {
    flexDirection: 'row',
    flex: 1,
    alignItems: 'flex-start',
  },
  planIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  planIcon: {
    fontSize: 28,
  },
  planTitleContainer: {
    flex: 1,
  },
  planTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E3A5F',
    marginBottom: 6,
  },
  planExecutor: {
    fontSize: 14,
    color: '#64748B',
  },
  statusBadge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusBadgeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  statIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#94A3B8',
    marginBottom: 4,
    fontWeight: '500',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E3A5F',
  },
  assetsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E3A5F',
    marginBottom: 16,
  },
  assetItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  assetLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  assetIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  assetIconText: {
    fontSize: 24,
  },
  assetName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E3A5F',
    marginBottom: 4,
  },
  assetType: {
    fontSize: 13,
    color: '#64748B',
    textTransform: 'capitalize',
  },
  assetValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#D4AF37',
  },
  beneficiariesSection: {
    marginBottom: 8,
  },
  beneficiaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  beneficiaryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  beneficiaryAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#D4AF37',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  beneficiaryInitial: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E3A5F',
  },
  beneficiaryName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E3A5F',
  },
  beneficiaryPercentage: {
    fontSize: 18,
    fontWeight: '700',
    color: '#D4AF37',
  },
  moreItems: {
    fontSize: 14,
    color: '#94A3B8',
    marginTop: 8,
    paddingLeft: 4,
    fontWeight: '500',
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
    fontSize: 15,
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
    padding: 14,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  executorChipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  executorChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  executorChipActive: {
    backgroundColor: '#d4b038',
    borderColor: '#d4b038',
  },
  executorChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  executorChipTextActive: {
    color: '#fff',
  },
  noExecutorsBox: {
    padding: 16,
    backgroundColor: '#fff9e6',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#f0e6c8',
  },
  noExecutorsText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
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
  // Beneficiaries styles
  subLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 12,
    marginBottom: 8,
  },
  percentageValid: {
    color: '#10B981',
    fontWeight: '600',
  },
  percentageInvalid: {
    color: '#EF4444',
    fontWeight: '600',
  },
  memberChipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  memberChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  memberChipDisabled: {
    backgroundColor: '#E2E8F0',
    borderColor: '#CBD5E1',
    opacity: 0.6,
  },
  memberChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E3A5F',
  },
  memberChipTextDisabled: {
    color: '#94A3B8',
  },
  noBeneficiariesBox: {
    padding: 16,
    backgroundColor: '#FEF3C7',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  noBeneficiariesText: {
    fontSize: 14,
    color: '#92400E',
    textAlign: 'center',
  },
  beneficiariesList: {
    marginTop: 12,
    gap: 12,
  },
  beneficiaryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  beneficiaryActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  percentageInput: {
    width: 60,
    height: 40,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 8,
    fontSize: 16,
    fontWeight: '600',
    color: '#1E3A5F',
    textAlign: 'center',
    backgroundColor: '#FFFFFF',
  },
  percentageSymbol: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748B',
  },
  removeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    fontSize: 24,
    color: '#DC2626',
    fontWeight: '600',
  },
  validationWarning: {
    fontSize: 13,
    color: '#DC2626',
    marginTop: 8,
    fontWeight: '500',
  },
  validationSuccess: {
    fontSize: 13,
    color: '#10B981',
    marginTop: 8,
    fontWeight: '500',
  },
  // Status buttons
  statusButtonsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  statusButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
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
  // Assets Section Styles
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  addAssetButton: {
    backgroundColor: '#D4AF37',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addAssetButtonText: {
    color: '#1E3A5F',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyAssetsBox: {
    padding: 20,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
  },
  emptyAssetsText: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
  },
  assetsList: {
    gap: 16,
  },
  assetFormItem: {
    padding: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 12,
  },
  assetInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: '#1E3A5F',
  },
  assetTypeRow: {
    gap: 8,
  },
  assetTypeContainer: {
    gap: 8,
  },
  assetTypeLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  assetTypeButtons: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  assetTypeButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  assetTypeButtonActive: {
    backgroundColor: '#D4AF37',
    borderColor: '#D4AF37',
  },
  assetTypeButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  assetTypeButtonTextActive: {
    color: '#1E3A5F',
  },
  assetValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  assetValueLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
    minWidth: 50,
  },
  assetValueInput: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: '#1E3A5F',
  },
  currencySymbol: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748B',
  },
  removeAssetButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeAssetButtonText: {
    fontSize: 20,
    color: '#DC2626',
    fontWeight: '600',
  },
});

export default EstateScreen;
