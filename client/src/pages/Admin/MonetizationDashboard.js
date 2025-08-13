import React, { useState, useEffect } from 'react';
import { 
  CurrencyDollarIcon, 
  UserGroupIcon, 
  GiftIcon, 
  ChartBarIcon,
  CogIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  PlayIcon,
  PauseIcon,
  ClockIcon,
  FireIcon,
  StarIcon,
  UsersIcon,
  ShoppingBagIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useToast } from '../../contexts/ToastContext';

const MonetizationDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [loyaltyStats, setLoyaltyStats] = useState({});
  const [affiliateStats, setAffiliateStats] = useState({});
  const [offersStats, setOffersStats] = useState({});
  const { success, error, info } = useToast();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch all stats in parallel
      const [loyaltyRes, affiliateRes, offersRes] = await Promise.all([
        axios.get('/api/loyalty/stats'),
        axios.get('/api/affiliate/admin/stats'),
        axios.get('/api/special-offers/admin/stats')
      ]);

      setLoyaltyStats(loyaltyRes.data);
      setAffiliateStats(affiliateRes.data);
      setOffersStats(offersRes.data);

      // Calculate overall stats for Dialog StarPay system
      const overallStats = {
        totalRevenue: (loyaltyRes.data.totalPoints || 0) * 0.01, // Convert points to revenue estimate
        totalUsers: loyaltyRes.data.totalUsers || 0,
        activeOffers: offersRes.data.activeOffers || 0,
        totalAffiliates: affiliateRes.data.totalAffiliates || 0,
        totalCommissions: affiliateRes.data.totalCommissions || 0,
        // New Dialog StarPay metrics
        totalPointsRedeemed: loyaltyRes.data.totalPointsRedeemed || 0,
        totalRedemptionValue: loyaltyRes.data.totalRedemptionValue || 0,
        premiumUsers: loyaltyRes.data.premiumUsers || 0,
        vipUsers: loyaltyRes.data.vipUsers || 0
      };

      setStats(overallStats);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      error('Failed to load dashboard data');
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'overview', name: 'Overview', icon: ChartBarIcon },
    { id: 'loyalty', name: 'Loyalty System', icon: StarIcon },
    { id: 'affiliates', name: 'Affiliate Program', icon: UserGroupIcon },
    { id: 'offers', name: 'Special Offers', icon: GiftIcon },
    { id: 'analytics', name: 'Revenue Analytics', icon: CurrencyDollarIcon }
  ];

  const StatCard = ({ title, value, change, icon: Icon, color = 'blue' }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white rounded-xl p-6 shadow-lg border-l-4 border-${color}-500`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {change && (
            <p className={`text-sm ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {change >= 0 ? '+' : ''}{change}% from last month
            </p>
          )}
        </div>
        <div className={`p-3 bg-${color}-100 rounded-full`}>
          <Icon className={`h-6 w-6 text-${color}-600`} />
        </div>
      </div>
    </motion.div>
  );

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Revenue"
          value={`$${stats.totalRevenue?.toLocaleString() || '0'}`}
          change={12.5}
          icon={CurrencyDollarIcon}
          color="green"
        />
        <StatCard
          title="Active Users"
          value={stats.totalUsers?.toLocaleString() || '0'}
          change={8.2}
          icon={UsersIcon}
          color="blue"
        />
        <StatCard
          title="Active Offers"
          value={stats.activeOffers || '0'}
          change={-3.1}
          icon={GiftIcon}
          color="purple"
        />
        <StatCard
          title="Total Affiliates"
          value={stats.totalAffiliates || '0'}
          change={15.7}
          icon={UserGroupIcon}
          color="orange"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <PlusIcon className="h-5 w-5 mr-2" />
              Create New Special Offer
            </button>
            <button className="w-full flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              <CogIcon className="h-5 w-5 mr-2" />
              Configure Loyalty Rules
            </button>
            <button className="w-full flex items-center justify-center px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
              <UserGroupIcon className="h-5 w-5 mr-2" />
              Manage Affiliate Partners
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">System Status</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Loyalty System</span>
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Active</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Affiliate Program</span>
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Active</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Special Offers</span>
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Active</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Automation</span>
              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">Pending</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderLoyaltySystem = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={loyaltyStats.totalUsers?.toLocaleString() || '0'}
          icon={UsersIcon}
          color="blue"
        />
        <StatCard
          title="Total Points Issued"
          value={loyaltyStats.totalPoints?.toLocaleString() || '0'}
          icon={StarIcon}
          color="yellow"
        />
        <StatCard
          title="Points Redeemed"
          value={loyaltyStats.totalPointsRedeemed?.toLocaleString() || '0'}
          icon={GiftIcon}
          color="green"
        />
        <StatCard
          title="Redemption Value"
          value={`LKR ${loyaltyStats.totalRedemptionValue?.toLocaleString() || '0'}`}
          icon={CurrencyDollarIcon}
          color="purple"
        />
      </div>

      <div className="bg-white rounded-xl p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Membership Distribution</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {loyaltyStats.membershipStats?.map((tier) => (
            <div key={tier._id} className="text-center p-4 bg-gray-50 rounded-lg">
              <div className={`text-2xl font-bold ${
                tier._id === 'free' ? 'text-gray-600' :
                tier._id === 'premium' ? 'text-blue-600' :
                'text-purple-600'
              }`}>
                {tier._id.charAt(0).toUpperCase() + tier._id.slice(1)}
              </div>
              <div className="text-lg font-semibold text-gray-900">{tier.count}</div>
              <div className="text-sm text-gray-600">users</div>
              {tier._id !== 'free' && (
                <div className="text-xs text-green-600 mt-1">
                  +{tier.totalValue?.toLocaleString() || '0'} LKR value
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Dialog StarPay Performance</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Point Redemption</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Total Points Redeemed:</span>
                <span className="font-semibold">{loyaltyStats.totalPointsRedeemed?.toLocaleString() || '0'}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Value Given:</span>
                <span className="font-semibold text-green-600">
                  LKR {loyaltyStats.totalRedemptionValue?.toLocaleString() || '0'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Your Profit Margin:</span>
                <span className="font-semibold text-blue-600">
                  LKR {Math.floor((loyaltyStats.totalPointsRedeemed || 0) * 0.1)}
                </span>
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Premium Revenue</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Premium Users:</span>
                <span className="font-semibold">{loyaltyStats.premiumUsers || '0'}</span>
              </div>
              <div className="flex justify-between">
                <span>VIP Users:</span>
                <span className="font-semibold">{loyaltyStats.vipUsers || '0'}</span>
              </div>
              <div className="flex justify-between">
                <span>Monthly Revenue:</span>
                <span className="font-semibold text-green-600">
                  LKR {((loyaltyStats.premiumUsers || 0) * 999 + (loyaltyStats.vipUsers || 0) * 1999).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Addiction Mechanics Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
            <FireIcon className="h-6 w-6 text-green-600" />
            <div>
              <div className="font-medium text-gray-900">Login Streaks</div>
              <div className="text-sm text-gray-600">Active - Users earning daily bonuses</div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
            <CalendarIcon className="h-6 w-6 text-blue-600" />
            <div>
              <div className="font-medium text-gray-900">Weekend Bonuses</div>
              <div className="text-sm text-gray-600">Active - 2x points on weekends</div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
            <GiftIcon className="h-6 w-6 text-purple-600" />
            <div>
              <div className="font-medium text-gray-900">Birthday Bonuses</div>
              <div className="text-sm text-gray-600">Active - 3x points in birthday month</div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 p-3 bg-orange-50 rounded-lg">
            <UserGroupIcon className="h-6 w-6 text-orange-600" />
            <div>
              <div className="font-medium text-gray-900">Referral System</div>
              <div className="text-sm text-gray-600">Active - 500 bonus points per referral</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAffiliateProgram = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          title="Total Affiliates"
          value={affiliateStats.totalAffiliates || '0'}
          icon={UserGroupIcon}
          color="blue"
        />
        <StatCard
          title="Active Affiliates"
          value={affiliateStats.activeAffiliates || '0'}
          icon={UsersIcon}
          color="green"
        />
        <StatCard
          title="Total Commissions"
          value={`$${affiliateStats.totalCommissions?.toLocaleString() || '0'}`}
          icon={CurrencyDollarIcon}
          color="yellow"
        />
        <StatCard
          title="Pending Commissions"
          value={`$${affiliateStats.pendingCommissions?.toLocaleString() || '0'}`}
          icon={ClockIcon}
          color="orange"
        />
      </div>

      <div className="bg-white rounded-xl p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performers</h3>
        <div className="space-y-3">
          {affiliateStats.topPerformers?.map((affiliate, index) => (
            <div key={affiliate._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold text-purple-600">#{index + 1}</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">{affiliate.user?.username}</p>
                  <p className="text-sm text-gray-600">{affiliate.user?.email}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-green-600">
                  ${affiliate.performance?.totalCommission?.toLocaleString() || '0'}
                </p>
                <p className="text-xs text-gray-500">
                  {affiliate.performance?.totalReferrals || '0'} referrals
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderSpecialOffers = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          title="Total Offers"
          value={offersStats.totalOffers || '0'}
          icon={GiftIcon}
          color="purple"
        />
        <StatCard
          title="Active Offers"
          value={offersStats.activeOffers || '0'}
          icon={PlayIcon}
          color="green"
        />
        <StatCard
          title="Scheduled Offers"
          value={offersStats.scheduledOffers || '0'}
          icon={ClockIcon}
          color="blue"
        />
        <StatCard
          title="Expired Offers"
          value={offersStats.expiredOffers || '0'}
          icon={PauseIcon}
          color="red"
        />
      </div>

      <div className="bg-white rounded-xl p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Offers</h3>
        <div className="space-y-3">
          {offersStats.topPerformingOffers?.map((offer, index) => (
            <div key={offer._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold text-yellow-600">#{index + 1}</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">{offer.name}</p>
                  <p className="text-sm text-gray-600">{offer.type}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-green-600">
                  {(offer.performance?.conversionRate || 0).toFixed(1)}%
                </p>
                <p className="text-xs text-gray-500">
                  {offer.usedCount || '0'} uses
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderRevenueAnalytics = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Loyalty Revenue</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Points Issued:</span>
                <span className="font-semibold">{loyaltyStats.totalPoints?.toLocaleString() || '0'}</span>
              </div>
              <div className="flex justify-between">
                <span>Estimated Value:</span>
                <span className="font-semibold text-green-600">
                  ${((loyaltyStats.totalPoints || 0) * 0.01).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Affiliate Revenue</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Total Commissions:</span>
                <span className="font-semibold">
                  ${affiliateStats.totalCommissions?.toLocaleString() || '0'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Pending Payouts:</span>
                <span className="font-semibold text-orange-600">
                  ${affiliateStats.pendingCommissions?.toLocaleString() || '0'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {offersStats.typeStats?.length || '0'}
            </div>
            <div className="text-sm text-gray-600">Offer Types</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {loyaltyStats.tierStats?.length || '0'}
            </div>
            <div className="text-sm text-gray-600">Loyalty Tiers</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {affiliateStats.totalAffiliates || '0'}
            </div>
            <div className="text-sm text-gray-600">Active Partners</div>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Monetization Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage loyalty, affiliates, special offers, and revenue analytics</p>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-xl shadow-lg mb-6">
          <nav className="flex space-x-8 p-4">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'loyalty' && renderLoyaltySystem()}
          {activeTab === 'affiliates' && renderAffiliateProgram()}
          {activeTab === 'offers' && renderSpecialOffers()}
          {activeTab === 'analytics' && renderRevenueAnalytics()}
        </div>
      </div>
    </div>
  );
};

export default MonetizationDashboard;

