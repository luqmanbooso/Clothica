import React, { useState, useEffect } from 'react';
import { FiTag, FiPlus, FiEdit, FiTrash2, FiEye, FiEyeOff, FiCalendar } from 'react-icons/fi';
import axios from 'axios';
import toast from 'react-hot-toast';

const AdminCoupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/admin/coupons');
      setCoupons(response.data);
    } catch (error) {
      console.error('Error fetching coupons:', error);
      toast.error('Failed to load coupons');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (formData) => {
    try {
      if (editingCoupon) {
        await axios.put(`/api/admin/coupons/${editingCoupon._id}`, formData);
        toast.success('Coupon updated successfully');
      } else {
        await axios.post('/api/admin/coupons', formData);
        toast.success('Coupon created successfully');
      }
      setShowModal(false);
      setEditingCoupon(null);
      fetchCoupons();
    } catch (error) {
      console.error('Error saving coupon:', error);
      toast.error('Failed to save coupon');
    }
  };

  const handleDelete = async (couponId) => {
    if (!window.confirm('Are you sure you want to delete this coupon?')) {
      return;
    }

    try {
      await axios.delete(`/api/admin/coupons/${couponId}`);
      toast.success('Coupon deleted successfully');
      fetchCoupons();
    } catch (error) {
      console.error('Error deleting coupon:', error);
      toast.error('Failed to delete coupon');
    }
  };

  const handleStatusToggle = async (couponId, currentStatus) => {
    try {
      await axios.put(`/api/admin/coupons/${couponId}`, {
        isActive: !currentStatus
      });
      toast.success('Coupon status updated');
      fetchCoupons();
    } catch (error) {
      console.error('Error updating coupon status:', error);
      toast.error('Failed to update coupon status');
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (coupon) => {
    const now = new Date();
    const startDate = new Date(coupon.startDate);
    const endDate = new Date(coupon.endDate);
    
    if (!coupon.isActive) return 'text-red-600 bg-red-100';
    if (now < startDate) return 'text-blue-600 bg-blue-100';
    if (now > endDate) return 'text-gray-600 bg-gray-100';
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) return 'text-orange-600 bg-orange-100';
    return 'text-green-600 bg-green-100';
  };

  const getStatusText = (coupon) => {
    const now = new Date();
    const startDate = new Date(coupon.startDate);
    const endDate = new Date(coupon.endDate);
    
    if (!coupon.isActive) return 'Inactive';
    if (now < startDate) return 'Upcoming';
    if (now > endDate) return 'Expired';
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) return 'Used Up';
    return 'Active';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Manage Coupons
            </h1>
            <p className="mt-2 text-gray-600">
              Create and manage discount coupons for your customers
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <FiPlus className="h-4 w-4" />
            <span>Add Coupon</span>
          </button>
        </div>
      </div>

      {/* Coupons Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {coupons.map((coupon) => (
          <div key={coupon._id} className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <FiTag className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {coupon.code}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {coupon.name}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleStatusToggle(coupon._id, coupon.isActive)}
                  className={`p-1 rounded ${
                    coupon.isActive 
                      ? 'text-green-600 hover:text-green-800' 
                      : 'text-red-600 hover:text-red-800'
                  }`}
                  title={coupon.isActive ? 'Deactivate' : 'Activate'}
                >
                  {coupon.isActive ? <FiEye className="h-4 w-4" /> : <FiEyeOff className="h-4 w-4" />}
                </button>
                <button
                  onClick={() => {
                    setEditingCoupon(coupon);
                    setShowModal(true);
                  }}
                  className="text-blue-600 hover:text-blue-800 p-1 rounded"
                  title="Edit"
                >
                  <FiEdit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(coupon._id)}
                  className="text-red-600 hover:text-red-800 p-1 rounded"
                  title="Delete"
                >
                  <FiTrash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Type:</span>
                <span className="font-medium">{coupon.type === 'percentage' ? 'Percentage' : 'Fixed Amount'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Value:</span>
                <span className="font-medium">
                  {coupon.type === 'percentage' ? `${coupon.value}%` : `$${coupon.value}`}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Usage:</span>
                <span className="font-medium">
                  {coupon.usedCount} / {coupon.usageLimit || '∞'}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-1 text-gray-500">
                <FiCalendar className="h-3 w-3" />
                <span>{formatDate(coupon.startDate)} - {formatDate(coupon.endDate)}</span>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(coupon)}`}>
                {getStatusText(coupon)}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Coupon Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingCoupon ? 'Edit Coupon' : 'Add New Coupon'}
              </h3>
              <CouponForm
                coupon={editingCoupon}
                onClose={() => {
                  setShowModal(false);
                  setEditingCoupon(null);
                }}
                onSubmit={handleSubmit}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Coupon Form Component
const CouponForm = ({ coupon, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    code: coupon?.code || '',
    name: coupon?.name || '',
    description: coupon?.description || '',
    type: coupon?.type || 'percentage',
    value: coupon?.value || 0,
    minimumOrderAmount: coupon?.minimumOrderAmount || 0,
    maximumDiscount: coupon?.maximumDiscount || 0,
    startDate: coupon?.startDate ? new Date(coupon.startDate).toISOString().split('T')[0] : '',
    endDate: coupon?.endDate ? new Date(coupon.endDate).toISOString().split('T')[0] : '',
    usageLimit: coupon?.usageLimit || '',
    userUsageLimit: coupon?.userUsageLimit || 1,
    isActive: coupon?.isActive ?? true
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submitData = {
        ...formData,
        usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : null,
        value: parseFloat(formData.value),
        minimumOrderAmount: parseFloat(formData.minimumOrderAmount),
        maximumDiscount: parseFloat(formData.maximumDiscount),
        userUsageLimit: parseInt(formData.userUsageLimit)
      };
      await onSubmit(submitData);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Coupon Code
          </label>
          <input
            type="text"
            value={formData.code}
            onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Coupon Name
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={2}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Type
          </label>
          <select
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="percentage">Percentage</option>
            <option value="fixed">Fixed Amount</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Value
          </label>
          <input
            type="number"
            value={formData.value}
            onChange={(e) => setFormData({ ...formData, value: e.target.value })}
            required
            min="0"
            step="0.01"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            value={formData.isActive ? 'active' : 'inactive'}
            onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'active' })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Start Date
          </label>
          <input
            type="date"
            value={formData.startDate}
            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            End Date
          </label>
          <input
            type="date"
            value={formData.endDate}
            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Minimum Order Amount
          </label>
          <input
            type="number"
            value={formData.minimumOrderAmount}
            onChange={(e) => setFormData({ ...formData, minimumOrderAmount: e.target.value })}
            min="0"
            step="0.01"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Maximum Discount
          </label>
          <input
            type="number"
            value={formData.maximumDiscount}
            onChange={(e) => setFormData({ ...formData, maximumDiscount: e.target.value })}
            min="0"
            step="0.01"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Usage Limit
          </label>
          <input
            type="number"
            value={formData.usageLimit}
            onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
            min="1"
            placeholder="Leave empty for unlimited"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          User Usage Limit
        </label>
        <input
          type="number"
          value={formData.userUsageLimit}
          onChange={(e) => setFormData({ ...formData, userUsageLimit: e.target.value })}
          min="1"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {loading ? 'Saving...' : (coupon ? 'Update Coupon' : 'Create Coupon')}
        </button>
      </div>
    </form>
  );
};

export default AdminCoupons;
