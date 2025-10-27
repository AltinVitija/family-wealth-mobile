// screens/dashboard/DashboardScreen.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { AppDispatch, RootState } from 'src/store';
import {
  fetchDashboardStart,
  fetchDashboardSuccess,
  fetchDashboardFailure,
  clearError,
} from 'src/store/slices/dashboard/dashboardSlice';
import { getDashboardData } from 'src/services/dashboard/dashboard.services';
import { logout } from 'src/store/slices/auth/authSlice';
import { removeData } from 'src/services/storage/asyncStorage';

const DashboardScreen = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation<any>();

  // Redux state
  const { user } = useSelector((state: RootState) => state.auth);
  const {
    data: dashboardData,
    isLoading,
    error,
  } = useSelector((state: RootState) => state.dashboardReducer);
  const { goals } = useSelector((state: RootState) => state.financialGoals);
  const { members } = useSelector((state: RootState) => state.familyMembers);
  const { plans } = useSelector((state: RootState) => state.estatePlans);

  const [refreshing, setRefreshing] = useState(false);

  // Fetch dashboard data on mount
  useEffect(() => {
    loadDashboardData();
  }, []);

  // Show error alerts
  useEffect(() => {
    if (error) {
      Alert.alert('Error', error, [{ text: 'OK', onPress: () => dispatch(clearError()) }]);
    }
  }, [error]);

  const loadDashboardData = async () => {
    try {
      dispatch(fetchDashboardStart());
      const data = await getDashboardData();
      dispatch(fetchDashboardSuccess(data));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch dashboard data';
      dispatch(fetchDashboardFailure(message));
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      dispatch(fetchDashboardStart());
      const data = await getDashboardData();
      dispatch(fetchDashboardSuccess(data));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch dashboard data';
      dispatch(fetchDashboardFailure(message));
    } finally {
      setRefreshing(false);
    }
  }, [dispatch]);

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          try {
            await removeData('token');
            await removeData('refreshToken');
            dispatch(logout());
          } catch (error) {
            console.error('Logout error:', error);
          }
        },
      },
    ]);
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
    return date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
  };

  const calculateTotalAssets = (assets?: any[]) => {
    if (!assets || !Array.isArray(assets)) return 0;
    return assets.reduce((sum, asset) => sum + (asset.value || 0), 0);
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

  const renderStatCard = (title: string, value: string | number, icon: string, color: string) => {
    return (
      <View style={[styles.statCard, { borderLeftColor: color }]}>
        <Text style={styles.statIcon}>{icon}</Text>
        <View style={styles.statContent}>
          <Text style={styles.statValue}>{value}</Text>
          <Text style={styles.statTitle}>{title}</Text>
        </View>
      </View>
    );
  };

  const renderQuickAction = (title: string, icon: string, color: string, onPress: () => void) => {
    return (
      <TouchableOpacity
        style={[styles.quickAction, { backgroundColor: color }]}
        onPress={onPress}
        activeOpacity={0.7}>
        <Text style={styles.quickActionIcon}>{icon}</Text>
        <Text style={styles.quickActionTitle}>{title}</Text>
      </TouchableOpacity>
    );
  };

  // Get active estate plans
  const activePlans = plans.filter((plan: any) => plan.status === 'active');

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome back,</Text>
          <Text style={styles.userName}>{user?.firstName || 'User'}!</Text>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutIcon}>🚪</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        {isLoading && !dashboardData ? (
          <ActivityIndicator size="large" color="#d4b038" style={styles.loader} />
        ) : (
          <>
            {/* Stats Grid */}
            <View style={styles.statsGrid}>
              {renderStatCard('Active Goals', goals.length || 0, '🎯', '#d4b038')}
              {renderStatCard('Family Members', members.length || 0, '👨‍👩‍👧‍👦', '#FF69B4')}
            </View>

            {/* Financial Summary */}
            {dashboardData?.financialSummary && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Financial Overview</Text>
                <View style={styles.financialCard}>
                  <View style={styles.financialRow}>
                    <Text style={styles.financialLabel}>Total Target</Text>
                    <Text style={styles.financialValue}>
                      {formatCurrency(dashboardData.financialSummary.totalTargetSavings)}
                    </Text>
                  </View>
                  <View style={styles.financialRow}>
                    <Text style={styles.financialLabel}>Current Savings</Text>
                    <Text style={[styles.financialValue, { color: '#22c55e' }]}>
                      {formatCurrency(dashboardData.financialSummary.totalCurrentSavings)}
                    </Text>
                  </View>
                  <View style={styles.progressBarContainer}>
                    <View
                      style={[
                        styles.progressBar,
                        { width: `${dashboardData.financialSummary.savingsProgress}%` },
                      ]}
                    />
                  </View>
                  <Text style={styles.progressText}>
                    {dashboardData.financialSummary.savingsProgress.toFixed(1)}% Complete
                  </Text>
                </View>
              </View>
            )}

            {/* Quick Actions */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Quick Actions</Text>
              <View style={styles.quickActionsGrid}>
                {renderQuickAction('Add Goal', '🎯', '#d4b038', () => navigation.navigate('Goals'))}
                {renderQuickAction('Add Member', '👨‍👩‍👧', '#FF69B4', () =>
                  navigation.navigate('Family')
                )}
                {renderQuickAction('Estate Plan', '🏠', '#90EE90', () =>
                  navigation.navigate('Estate')
                )}
                {renderQuickAction('View All', '📊', '#87CEEB', () => navigation.navigate('Goals'))}
              </View>
            </View>

            {/* Active Estate Plans */}
            {activePlans.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Active Estate Plans</Text>
                  <TouchableOpacity onPress={() => navigation.navigate('Estate')}>
                    <Text style={styles.seeAllText}>See All</Text>
                  </TouchableOpacity>
                </View>
                {activePlans.slice(0, 2).map((plan: any) => (
                  <TouchableOpacity
                    key={plan._id}
                    style={styles.estatePlanCard}
                    onPress={() => navigation.navigate('Estate')}
                    activeOpacity={0.7}>
                    <View style={styles.estatePlanHeader}>
                      <View style={styles.estatePlanTitleRow}>
                        <Text style={styles.estatePlanTitle} numberOfLines={1}>
                          {plan.title || 'Untitled Plan'}
                        </Text>
                        <View
                          style={[
                            styles.estatePlanBadge,
                            { backgroundColor: getStatusColor(plan.status) },
                          ]}>
                          <Text style={styles.estatePlanBadgeText}>
                            {getStatusLabel(plan.status)}
                          </Text>
                        </View>
                      </View>
                      {plan.updatedAt && (
                        <Text style={styles.estatePlanSubtitle}>
                          Last updated: {formatDate(plan.updatedAt)}
                        </Text>
                      )}
                    </View>

                    <View style={styles.estatePlanStats}>
                      <View style={styles.estatePlanStat}>
                        <Text style={styles.estatePlanStatValue}>
                          {Array.isArray(plan.assets) ? plan.assets.length : 0}
                        </Text>
                        <Text style={styles.estatePlanStatLabel}>Assets</Text>
                      </View>
                      <View style={styles.estatePlanStat}>
                        <Text style={styles.estatePlanStatValue}>
                          {Array.isArray(plan.beneficiaries) ? plan.beneficiaries.length : 0}
                        </Text>
                        <Text style={styles.estatePlanStatLabel}>Beneficiaries</Text>
                      </View>
                      <View style={styles.estatePlanStat}>
                        <Text style={styles.estatePlanStatValue}>
                          {formatCurrency(calculateTotalAssets(plan.assets))}
                        </Text>
                        <Text style={styles.estatePlanStatLabel}>Total Value</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Recent Goals */}
            {goals.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Recent Goals</Text>
                  <TouchableOpacity onPress={() => navigation.navigate('Goals')}>
                    <Text style={styles.seeAllText}>See All</Text>
                  </TouchableOpacity>
                </View>
                {goals.slice(0, 3).map((goal: any) => {
                  const progress = Math.round((goal.currentAmount / goal.targetAmount) * 100);
                  return (
                    <TouchableOpacity
                      key={goal._id}
                      style={styles.recentGoalCard}
                      onPress={() => navigation.navigate('Goals')}
                      activeOpacity={0.7}>
                      <View style={styles.recentGoalHeader}>
                        <Text style={styles.recentGoalTitle} numberOfLines={1}>
                          {goal.title}
                        </Text>
                        <Text style={styles.recentGoalProgress}>{progress}%</Text>
                      </View>
                      <View style={styles.recentGoalProgressBar}>
                        <View style={[styles.recentGoalProgressFill, { width: `${progress}%` }]} />
                      </View>
                      <Text style={styles.recentGoalAmount}>
                        {formatCurrency(goal.currentAmount)} of {formatCurrency(goal.targetAmount)}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}

            {/* Empty State */}
            {goals.length === 0 && members.length === 0 && activePlans.length === 0 && (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateIcon}>🚀</Text>
                <Text style={styles.emptyStateTitle}>Get Started!</Text>
                <Text style={styles.emptyStateText}>
                  Start by adding your first goal, family member, or estate plan
                </Text>
              </View>
            )}

            {/* Bottom Spacer */}
            <View style={styles.bottomSpacer} />
          </>
        )}
      </ScrollView>
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
  greeting: {
    fontSize: 14,
    color: '#666',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginTop: 4,
  },
  logoutButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutIcon: {
    fontSize: 20,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  loader: {
    marginTop: 40,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statIcon: {
    fontSize: 32,
    marginBottom: 12,
  },
  statContent: {
    gap: 4,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
  },
  statTitle: {
    fontSize: 12,
    color: '#666',
    textTransform: 'uppercase',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#d4b038',
  },
  financialCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  financialRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  financialLabel: {
    fontSize: 14,
    color: '#666',
  },
  financialValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    overflow: 'hidden',
    marginTop: 8,
    marginBottom: 8,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#d4b038',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickAction: {
    width: '48%',
    aspectRatio: 1,
    borderRadius: 12,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quickActionIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  quickActionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
  },
  // Estate Plan Card Styles
  estatePlanCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  estatePlanHeader: {
    marginBottom: 16,
  },
  estatePlanTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  estatePlanTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
    flex: 1,
    marginRight: 12,
  },
  estatePlanBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  estatePlanBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#fff',
  },
  estatePlanSubtitle: {
    fontSize: 12,
    color: '#666',
  },
  estatePlanStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  estatePlanStat: {
    alignItems: 'center',
    flex: 1,
  },
  estatePlanStatValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  estatePlanStatLabel: {
    fontSize: 11,
    color: '#666',
  },
  // Recent Goals Styles
  recentGoalCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  recentGoalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  recentGoalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    flex: 1,
    marginRight: 12,
  },
  recentGoalProgress: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#d4b038',
  },
  recentGoalProgressBar: {
    height: 6,
    backgroundColor: '#f0f0f0',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  recentGoalProgressFill: {
    height: '100%',
    backgroundColor: '#d4b038',
    borderRadius: 3,
  },
  recentGoalAmount: {
    fontSize: 12,
    color: '#666',
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
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 40,
    lineHeight: 20,
  },
  bottomSpacer: {
    height: 40,
  },
});

export default DashboardScreen;
