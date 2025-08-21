import React, { useState, useEffect } from 'react';
import { 
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  EyeSlashIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  ReceiptPercentIcon,
  GiftIcon,
  SparklesIcon,
  FireIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import api from '../../utils/api';
import { FiTag, FiCheckCircle, FiUsers, FiDollarSign } from 'react-icons/fi';
import { useToast } from '../../contexts/ToastContext';

const Coupons = () => {
  const { success: showSuccess, error: showError } = useToast();
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    type: 'percentage', // percentage, fixed, free_shipping
    value: 0,
    minimumOrderAmount: 0, // Changed from minSpend
    maxDiscount: 0,
    usageLimit: 0,
    usedCount: 0,
    isActive: true,
    isSpecialEvent: false,
    eventType: '', // birthday, holiday, milestone, seasonal
    validFrom: '',
    validUntil: '', // Changed from endDate
    applicableCategories: [],
    applicableProducts: [],
    userGroups: [], // new, loyal, vip
    userUsageLimit: 1, // Added this field
    autoGenerate: false
  });

  const [couponAnalytics, setCouponAnalytics] = useState({
    totalCoupons: 0,
    activeCoupons: 0,
    totalUsage: 0,
    totalSavings: 0
  });

  // Advanced Coupon Management
  const handleBulkCouponAction = async (action, couponIds) => {
    try {
      const response = await api.post('/api/admin/coupons/bulk-action', {
        couponIds,
        action
      });
      
      if (response.data.success) {
        showSuccess(`${action} completed successfully`);
        fetchCoupons(); // Refresh the list
      }
    } catch (error) {
      console.error('Bulk coupon action error:', error);
      showError(`Failed to ${action} coupons`);
    }
  };

  const duplicateCoupon = async (coupon) => {
    try {
      const duplicatedCoupon = {
        ...coupon,
        code: `${coupon.code}_COPY`,
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        usedCount: 0,
        usedBy: []
      };
      
      delete duplicatedCoupon._id;
      delete duplicatedCoupon.createdAt;
      delete duplicatedCoupon.updatedAt;
      
      const response = await api.post('/api/admin/coupons', duplicatedCoupon);
      if (response.data) {
        showSuccess('Coupon duplicated successfully');
        fetchCoupons();
      }
    } catch (error) {
      console.error('Error duplicating coupon:', error);
      showError('Failed to duplicate coupon');
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/admin/coupons');
      setCoupons(response.data);
    } catch (error) {
      console.error('Error fetching coupons:', error);
      showError('Failed to load coupons');
      // Set empty array if API fails
      setCoupons([]);
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  const handleAddCoupon = () => {
    setFormData({
      code: '',
      name: '',
      description: '',
      type: 'percentage',
      value: 0,
      minimumOrderAmount: 0,
      maxDiscount: 0,
      usageLimit: 0,
      usedCount: 0,
      isActive: true,
      isSpecialEvent: false,
      eventType: '',
      validFrom: '',
      validUntil: '',
      applicableCategories: [],
      applicableProducts: [],
      userGroups: ['all'],
      userUsageLimit: 1,
      autoGenerate: false
    });
    setEditingCoupon(null);
    setShowAddModal(true);
  };

  const handleEditCoupon = (coupon) => {
    setFormData({
      code: coupon.code,
      name: coupon.name,
      description: coupon.description,
      type: coupon.type,
      value: coupon.value,
      minimumOrderAmount: coupon.minimumOrderAmount,
      maxDiscount: coupon.maxDiscount,
      usageLimit: coupon.usageLimit,
      usedCount: coupon.usedCount,
      isActive: coupon.isActive,
      isSpecialEvent: coupon.isSpecialEvent,
      eventType: coupon.eventType,
      validFrom: coupon.validFrom,
      validUntil: coupon.validUntil,
      applicableCategories: coupon.applicableCategories,
      applicableProducts: coupon.applicableProducts,
      userGroups: coupon.userGroups,
      userUsageLimit: coupon.userUsageLimit,
      autoGenerate: coupon.autoGenerate
    });
    setEditingCoupon(coupon);
    setShowAddModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCoupon) {
        // Update existing coupon
        await api.put(`/api/admin/coupons/${editingCoupon._id}`, formData);
        showSuccess('Coupon updated successfully');
      } else {
        // Create new coupon
        await api.post('/api/admin/coupons', formData);
        showSuccess('Coupon created successfully');
      }
      // Refresh the coupons list
      await fetchCoupons();
      setShowAddModal(false);
      setEditingCoupon(null);
    } catch (error) {
      console.error('Error saving coupon:', error);
      showError(editingCoupon ? 'Failed to update coupon' : 'Failed to create coupon');
    }
  };

  const handleDeleteCoupon = async (couponId) => {
    if (window.confirm('Are you sure you want to delete this coupon? This action cannot be undone.')) {
      try {
        await api.delete(`/api/admin/coupons/${couponId}`);
        showSuccess('Coupon deleted successfully');
        // Refresh the coupons list
        await fetchCoupons();
      } catch (error) {
        console.error('Error deleting coupon:', error);
        showError('Failed to delete coupon');
      }
    }
  };

  const toggleCouponStatus = async (couponId) => {
    try {
      const coupon = coupons.find(c => c._id === couponId);
      await api.put(`/api/admin/coupons/${couponId}`, { 
        ...coupon, 
        isActive: !coupon.isActive 
      });
      showSuccess(`Coupon ${coupon.isActive ? 'deactivated' : 'activated'} successfully`);
      // Refresh the coupons list
      await fetchCoupons();
    } catch (error) {
      console.error('Error toggling coupon status:', error);
      showError('Failed to update coupon status');
    }
  };

  const getCouponTypeIcon = (type) => {
    switch (type) {
      case 'percentage':
        return <ReceiptPercentIcon className="h-5 w-5" />;
      case 'fixed':
        return <CurrencyDollarIcon className="h-5 w-5" />;
      case 'free_shipping':
        return <GiftIcon className="h-5 w-5" />;
      default:
        return <GiftIcon className="h-5 w-5" />;
    }
  };

  const getEventTypeIcon = (eventType) => {
    switch (eventType) {
      case 'birthday':
        return <StarIcon className="h-4 w-4" />;
      case 'holiday':
        return <SparklesIcon className="h-4 w-4" />;
      case 'seasonal':
        return <FireIcon className="h-4 w-4" />;
      case 'milestone':
        return <StarIcon className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getCouponTypeColor = (type) => {
    switch (type) {
      case 'percentage':
        return 'from-blue-500 to-cyan-500';
      case 'fixed':
        return 'from-green-500 to-emerald-500';
      case 'free_shipping':
        return 'from-purple-500 to-pink-500';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const getUsagePercentage = (used, limit) => {
    if (limit === 0) return 0;
    return Math.round((used / limit) * 100);
  };

  const isExpired = (validUntil) => {
    return new Date(validUntil) < new Date();
  };

  const isActive = (coupon) => {
    const now = new Date();
    const validFrom = new Date(coupon.validFrom);
    const validUntil = new Date(coupon.validUntil);
    return coupon.isActive && now >= validFrom && now <= validUntil;
  };

  const filteredCoupons = coupons.filter(coupon => {
    const matchesSearch = coupon.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         coupon.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         coupon.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || coupon.type === filterType;
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' && isActive(coupon)) ||
                         (filterStatus === 'inactive' && !isActive(coupon)) ||
                         (filterStatus === 'expired' && isExpired(coupon.validUntil));
    return matchesSearch && matchesType && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6C7A59]"></div>
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div 
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between"
        variants={itemVariants}
      >
        <div>
          <h1 className="text-2xl font-display font-bold text-[#1E1E1E]">Coupons</h1>
          <p className="text-gray-600 mt-1">Manage promotional codes and special offers</p>
        </div>
        <button
          onClick={handleAddCoupon}
          className="mt-4 sm:mt-0 flex items-center px-4 py-2 bg-gradient-to-r from-[#6C7A59] to-[#5A6A4A] text-white rounded-xl hover:shadow-lg transition-all duration-200"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Coupon
        </button>
      </motion.div>

      {/* Coupon Analytics */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6"
        variants={itemVariants}
      >
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Coupons</p>
              <p className="text-2xl font-display font-bold text-[#1E1E1E]">
                {couponAnalytics.totalCoupons}
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
              <FiTag className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Coupons</p>
              <p className="text-2xl font-display font-bold text-green-600">
                {couponAnalytics.activeCoupons}
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
              <FiCheckCircle className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Usage</p>
              <p className="text-2xl font-display font-bold text-purple-600">
                {couponAnalytics.totalUsage}
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <FiUsers className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Savings</p>
              <p className="text-2xl font-display font-bold text-yellow-600">
                ${couponAnalytics.totalSavings?.toFixed(2) || '0.00'}
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center">
              <FiDollarSign className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div 
        className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6"
        variants={itemVariants}
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <input
              type="text"
              placeholder="Search coupons..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6C7A59] focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6C7A59] focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="percentage">Percentage</option>
              <option value="fixed">Fixed Amount</option>
              <option value="free_shipping">Free Shipping</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6C7A59] focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="expired">Expired</option>
            </select>
          </div>
          <div className="flex items-end">
            <div className="text-sm text-gray-600">
              <span className="font-semibold">{filteredCoupons.length}</span> coupons found
            </div>
          </div>
        </div>
      </motion.div>

      {/* Coupons List */}
      <motion.div 
        className="bg-white rounded-2xl shadow-lg border border-gray-100"
        variants={itemVariants}
      >
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-display font-bold text-[#1E1E1E]">All Coupons</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {filteredCoupons.map((coupon) => (
              <div key={coupon._id} className="border border-gray-200 rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 bg-gradient-to-br ${getCouponTypeColor(coupon.type)} rounded-xl flex items-center justify-center`}>
                      {getCouponTypeIcon(coupon.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-semibold text-[#1E1E1E]">{coupon.name}</h4>
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full font-mono">
                          {coupon.code}
                        </span>
                        {coupon.isSpecialEvent && getEventTypeIcon(coupon.eventType) && (
                          <div className="flex items-center text-purple-600">
                            {getEventTypeIcon(coupon.eventType)}
                          </div>
                        )}
                        {!isActive(coupon) && (
                          <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">Inactive</span>
                        )}
                        {isExpired(coupon.validUntil) && (
                          <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">Expired</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{coupon.description}</p>
                      <div className="flex items-center space-x-4 mt-2">
                        <div className="flex items-center text-sm text-gray-600">
                          <CalendarIcon className="h-4 w-4 mr-1" />
                          {coupon.validFrom} - {coupon.validUntil}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <CurrencyDollarIcon className="h-4 w-4 mr-1" />
                          {coupon.type === 'percentage' ? `${coupon.value}%` : 
                           coupon.type === 'fixed' ? `$${coupon.value}` : 'Free Shipping'}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <GiftIcon className="h-4 w-4 mr-1" />
                          {coupon.usedCount}/{coupon.usageLimit} used
                        </div>
                      </div>
                      {/* Usage Progress Bar */}
                      <div className="mt-3">
                        <div className="flex justify-between text-xs text-gray-600 mb-1">
                          <span>Usage</span>
                          <span>{getUsagePercentage(coupon.usedCount, coupon.usageLimit)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-[#6C7A59] to-[#D6BFAF] h-2 rounded-full transition-all duration-300"
                            style={{ width: `${getUsagePercentage(coupon.usedCount, coupon.usageLimit)}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => toggleCouponStatus(coupon._id)}
                      className={`p-2 rounded-lg transition-colors ${
                        coupon.isActive 
                          ? 'text-green-600 hover:text-green-800' 
                          : 'text-red-600 hover:text-red-800'
                      }`}
                    >
                      {coupon.isActive ? <EyeIcon className="h-5 w-5" /> : <EyeSlashIcon className="h-5 w-5" />}
                    </button>
                    <button
                      onClick={() => handleEditCoupon(coupon)}
                      className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteCoupon(coupon._id)}
                      className="p-2 text-gray-600 hover:text-red-600 transition-colors"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-2xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto"
          >
            <h3 className="text-xl font-display font-bold text-[#1E1E1E] mb-4">
              {editingCoupon ? 'Edit Coupon' : 'Add New Coupon'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Coupon Code</label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6C7A59] focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6C7A59] focus:border-transparent"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6C7A59] focus:border-transparent"
                  rows="3"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6C7A59] focus:border-transparent"
                  >
                    <option value="percentage">Percentage</option>
                    <option value="fixed">Fixed Amount</option>
                    <option value="free_shipping">Free Shipping</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Value</label>
                  <input
                    type="number"
                    value={formData.value}
                    onChange={(e) => setFormData({...formData, value: parseFloat(e.target.value)})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6C7A59] focus:border-transparent"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Usage Limit</label>
                  <input
                    type="number"
                    value={formData.usageLimit}
                    onChange={(e) => setFormData({...formData, usageLimit: parseInt(e.target.value)})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6C7A59] focus:border-transparent"
                    min="0"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Order Amount</label>
                  <input
                    type="number"
                    value={formData.minimumOrderAmount}
                    onChange={(e) => setFormData({...formData, minimumOrderAmount: parseFloat(e.target.value)})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6C7A59] focus:border-transparent"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Max Discount</label>
                  <input
                    type="number"
                    value={formData.maxDiscount}
                    onChange={(e) => setFormData({...formData, maxDiscount: parseFloat(e.target.value)})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6C7A59] focus:border-transparent"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Valid From</label>
                  <input
                    type="date"
                    value={formData.validFrom}
                    onChange={(e) => setFormData({...formData, validFrom: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6C7A59] focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Valid Until</label>
                  <input
                    type="date"
                    value={formData.validUntil}
                    onChange={(e) => setFormData({...formData, validUntil: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6C7A59] focus:border-transparent"
                    required
                  />
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                    className="rounded border-gray-300 text-[#6C7A59] focus:ring-[#6C7A59]"
                  />
                  <span className="ml-2 text-sm text-gray-700">Active</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isSpecialEvent}
                    onChange={(e) => setFormData({...formData, isSpecialEvent: e.target.checked})}
                    className="rounded border-gray-300 text-[#6C7A59] focus:ring-[#6C7A59]"
                  />
                  <span className="ml-2 text-sm text-gray-700">Special Event</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.autoGenerate}
                    onChange={(e) => setFormData({...formData, autoGenerate: e.target.checked})}
                    className="rounded border-gray-300 text-[#6C7A59] focus:ring-[#6C7A59]"
                  />
                  <span className="ml-2 text-sm text-gray-700">Auto Generate</span>
                </label>
              </div>
              {formData.isSpecialEvent && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Event Type</label>
                  <select
                    value={formData.eventType}
                    onChange={(e) => setFormData({...formData, eventType: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6C7A59] focus:border-transparent"
                  >
                    <option value="">Select Event Type</option>
                    <option value="birthday">Birthday</option>
                    <option value="holiday">Holiday</option>
                    <option value="seasonal">Seasonal</option>
                    <option value="milestone">Milestone</option>
                  </select>
                </div>
              )}
              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-[#6C7A59] to-[#5A6A4A] text-white py-2 rounded-xl hover:shadow-lg transition-all duration-200"
                >
                  {editingCoupon ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-xl hover:bg-gray-300 transition-all duration-200"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default Coupons;
