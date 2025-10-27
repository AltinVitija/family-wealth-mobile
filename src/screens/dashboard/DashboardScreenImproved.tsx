// Improved Dashboard Screen matching design screenshots
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
  Image,
  Platform,
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
import { getEstatePlans } from 'src/services/estate/estate.services';
import {
  fetchPlansStart,
  fetchPlansSuccess,
  fetchPlansFailure,
} from 'src/store/slices/estate/estateSlice';

const DashboardScreenImproved = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation<any>();

  const { user } = useSelector((state: RootState) => state.auth);
  const {
    data: dashboardData,
    isLoading,
    error,
  } = useSelector((state: RootState) => state.dashboardReducer);

  // Get estate plans from Redux store
  const { plans: estatePlans, isLoading: estatePlansLoading } = useSelector(
    (state: RootState) => state.estatePlans
  );

  // Get the active estate plan
  const activeEstatePlan = estatePlans.find((plan: any) => plan.status === 'active');

  // Debug logging
  useEffect(() => {
    console.log('=== ESTATE PLANS DEBUG ===');
    console.log('Total estate plans:', estatePlans.length);
    console.log('All plans:', JSON.stringify(estatePlans, null, 2));

    if (activeEstatePlan) {
      console.log('Active Estate Plan Found:', activeEstatePlan);
      console.log('Active Plan Title:', activeEstatePlan.title);
      console.log('Active Plan Status:', activeEstatePlan.status);
      console.log('Assets:', activeEstatePlan.assets);
      console.log('Assets Count:', activeEstatePlan.assets?.length);
      console.log('Assets Array?:', Array.isArray(activeEstatePlan.assets));
      console.log('Beneficiaries:', activeEstatePlan.beneficiaries);
      console.log('Beneficiaries Count:', activeEstatePlan.beneficiaries?.length);

      if (activeEstatePlan.assets && activeEstatePlan.assets.length > 0) {
        console.log('First asset:', activeEstatePlan.assets[0]);
        console.log('First asset value:', activeEstatePlan.assets[0].value);
      }
    } else {
      console.log('No active estate plan found');
    }
    console.log('=== END DEBUG ===');
  }, [activeEstatePlan, estatePlans]);

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboardData();
    loadEstatePlans();
  }, []);

  const loadEstatePlans = async () => {
    try {
      dispatch(fetchPlansStart());
      const plans = await getEstatePlans();
      console.log('Loaded estate plans:', plans);
      console.log('Plans data:', JSON.stringify(plans, null, 2));
      dispatch(fetchPlansSuccess(plans));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch estate plans';
      console.error('Error loading estate plans:', err);
      dispatch(fetchPlansFailure(message));
    }
  };

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
    await loadDashboardData();
    await loadEstatePlans();
    setRefreshing(false);
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return value >= 0 ? `+${value.toFixed(1)}%` : `${value.toFixed(1)}%`;
  };

  // Calculate total assets value
  const calculateTotalValue = (assets: any[]) => {
    if (!assets || !Array.isArray(assets)) return 0;
    const total = assets.reduce((sum, asset) => {
      const value = Number(asset.value) || 0;
      return sum + value;
    }, 0);
    console.log('Calculated total value:', total, 'from assets:', assets);
    return total;
  };

  // Format date
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
  };

  // Metric card component matching the design
  const MetricCard = ({
    iconSource,
    value,
    label,
    backgroundColor,
    onPress,
  }: {
    iconSource: any;
    value: number;
    label: string;
    backgroundColor: string;
    onPress?: () => void;
  }) => (
    <TouchableOpacity
      style={[styles.metricCard, { backgroundColor }]}
      onPress={onPress}
      activeOpacity={0.7}>
      <View style={styles.metricIconContainer}>
        <Image source={iconSource} style={styles.metricIconImage} />
      </View>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </TouchableOpacity>
  );

  // Helper: check if user has any real dashboard data
  const hasRealData =
    dashboardData &&
    ((dashboardData.overview?.totalEstatePlans && dashboardData.overview.totalEstatePlans > 0) ||
      (dashboardData.overview?.totalFamilyMembers &&
        dashboardData.overview.totalFamilyMembers > 0) ||
      (dashboardData.overview?.pendingTasks && dashboardData.overview.pendingTasks > 0) ||
      (dashboardData.overview?.activeGoals && dashboardData.overview.activeGoals > 0));

  return (
    <View style={styles.wrapper}>
      <StatusBar barStyle="light-content" backgroundColor="#1E3A5F" translucent={false} />

      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        {/* Header - Dark Blue Background */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Welcome back</Text>
            <Text style={styles.userName}>
              {user?.firstName} {user?.lastName}
            </Text>
          </View>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#d4af37" />
          }>
          {isLoading && !dashboardData ? (
            <ActivityIndicator size="large" color="#d4af37" style={styles.loader} />
          ) : hasRealData ? (
            <>
              {/* Total Wealth Card - Yellow/Gold */}
              <View style={styles.wealthCard}>
                <Text style={styles.wealthAmount}>
                  {formatCurrency(dashboardData?.financialSummary?.totalAssets || 0)}
                </Text>
                <View style={styles.wealthGrowth}>
                  <Text style={styles.growthIcon}>📈</Text>
                  <Text style={styles.growthText}>
                    {formatPercentage((dashboardData as any)?.yearGrowth || 0)} this year
                  </Text>
                </View>
              </View>

              {/* Metrics Grid - 2x2 */}
              <View style={styles.metricsGrid}>
                <MetricCard
                  iconSource={require('src/assets/icons/task.png')}
                  value={dashboardData?.overview?.totalEstatePlans || 0}
                  label="Estate Plans"
                  backgroundColor="#E3F2FD"
                  onPress={() => navigation.navigate('Estate')}
                />
                <MetricCard
                  iconSource={require('src/assets/icons/contacts.png')}
                  value={dashboardData?.overview?.totalFamilyMembers || 0}
                  label="Family Members"
                  backgroundColor="#FFF9E6"
                  onPress={() => navigation.navigate('Family')}
                />
                <MetricCard
                  iconSource={require('src/assets/icons/financial-goals.png')}
                  value={dashboardData?.overview?.activeGoals || 0}
                  label="Active Goals"
                  backgroundColor="#E8F5E9"
                  onPress={() => navigation.navigate('Goals')}
                />
              </View>

              {/* Active Estate Plan */}
              {!estatePlansLoading && activeEstatePlan && (
                <View style={styles.estatePlanSection}>
                  <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Active Estate Plan</Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Estate')}>
                      <Text style={styles.seeAllText}>See All</Text>
                    </TouchableOpacity>
                  </View>
                  <TouchableOpacity
                    style={styles.estatePlanCard}
                    onPress={() => navigation.navigate('Estate')}
                    activeOpacity={0.9}>
                    <View style={styles.estatePlanHeader}>
                      <View style={styles.estatePlanTitleContainer}>
                        <Text style={styles.estatePlanTitle}>
                          {activeEstatePlan.title || 'Primary Estate Plan'}
                        </Text>
                        <Text style={styles.estatePlanDate}>
                          Last updated:{' '}
                          {formatDate(activeEstatePlan.updatedAt || activeEstatePlan.createdAt)}
                        </Text>
                      </View>
                      <View style={styles.estatePlanBadge}>
                        <Text style={styles.estatePlanBadgeText}>Active</Text>
                      </View>
                    </View>

                    <View style={styles.estatePlanStats}>
                      <View style={styles.estatePlanStat}>
                        <Text style={styles.estatePlanStatValue}>
                          {Array.isArray(activeEstatePlan.assets)
                            ? activeEstatePlan.assets.length
                            : 0}
                        </Text>
                        <Text style={styles.estatePlanStatLabel}>Assets</Text>
                      </View>

                      <View style={styles.estatePlanStat}>
                        <Text style={styles.estatePlanStatValue}>
                          {Array.isArray(activeEstatePlan.beneficiaries)
                            ? activeEstatePlan.beneficiaries.length
                            : 0}
                        </Text>
                        <Text style={styles.estatePlanStatLabel}>Beneficiaries</Text>
                      </View>

                      <View style={styles.estatePlanStat}>
                        <Text style={styles.estatePlanStatValue}>
                          {formatCurrency(calculateTotalValue(activeEstatePlan.assets || []))}
                        </Text>
                        <Text style={styles.estatePlanStatLabel}>Total Value</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                </View>
              )}

              {/* Bottom Spacer */}
              <View style={styles.bottomSpacer} />
            </>
          ) : (
            <View style={styles.emptyState}>
              <Image source={require('src/assets/icons/home.png')} style={styles.emptyStateImage} />
              <Text style={styles.emptyStateTitle}>Get Started!</Text>
              <Text style={styles.emptyStateText}>
                Add your first estate plan, goals or family members
              </Text>
              <TouchableOpacity
                style={styles.emptyStateButton}
                onPress={() => navigation.navigate('Estate')}>
                <Text style={styles.emptyStateButtonText}>Create Estate Plan</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#1E3A5F',
  },
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    backgroundColor: '#1E3A5F',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
  },
  greeting: {
    fontSize: 14,
    color: '#B8C5D6',
    marginBottom: 4,
  },
  userName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  loader: {
    marginTop: 40,
  },

  // Wealth Card - Yellow/Gold
  wealthCard: {
    backgroundColor: '#F4E5B8',
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  wealthAmount: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#1E3A5F',
    marginBottom: 12,
  },
  wealthGrowth: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  growthIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  growthText: {
    fontSize: 16,
    color: '#2D4A3E',
    fontWeight: '600',
  },

  // Metrics Grid
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  metricCard: {
    width: '48%',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  metricIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  metricIcon: {
    fontSize: 24,
  },
  metricIconImage: {
    width: 28,
    height: 28,
  },
  metricValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1E3A5F',
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },

  // Estate Plan Section
  estatePlanSection: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E3A5F',
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#d4af37',
  },
  estatePlanCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  estatePlanHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  estatePlanTitleContainer: {
    flex: 1,
    marginRight: 12,
  },
  estatePlanTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E3A5F',
    marginBottom: 4,
  },
  estatePlanDate: {
    fontSize: 13,
    color: '#64748B',
  },
  estatePlanBadge: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  estatePlanBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#059669',
  },
  estatePlanStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  estatePlanStat: {
    flex: 1,
    alignItems: 'center',
  },
  estatePlanStatValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E3A5F',
    marginBottom: 6,
  },
  estatePlanStatLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: 80,
    paddingHorizontal: 20,
  },
  emptyStateImage: {
    width: 80,
    height: 80,
    marginBottom: 24,
    opacity: 0.8,
  },
  emptyStateTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1E3A5F',
    marginBottom: 12,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  emptyStateButton: {
    backgroundColor: '#d4af37',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emptyStateButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E3A5F',
  },
  bottomSpacer: {
    height: 40,
  },
});

export default DashboardScreenImproved;
