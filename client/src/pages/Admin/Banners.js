import React, { useState, useEffect } from 'react';
import { FiImage, FiPlus, FiEdit, FiTrash2, FiEye, FiEyeOff, FiCalendar, FiLink } from 'react-icons/fi';
import axios from 'axios';
import { useToast } from '../../contexts/ToastContext';

const AdminBanners = () => {
  const { success: showSuccess, error: showError } = useToast();
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/admin/banners');
      setBanners(response.data);
    } catch (error) {
      console.error('Error fetching banners:', error);
      showError('Failed to load banners');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (formData) => {
    try {
      if (editingBanner) {
        await axios.put(`/api/admin/banners/${editingBanner._id}`, formData);
        showSuccess('Banner updated successfully');
      } else {
        await axios.post('/api/admin/banners', formData);
        showSuccess('Banner created successfully');
      }
      setShowModal(false);
      setEditingBanner(null);
      fetchBanners();
    } catch (error) {
      console.error('Error saving banner:', error);
      showError('Failed to save banner');
    }
  };

  const handleDelete = async (bannerId) => {
    if (!window.confirm('Are you sure you want to delete this banner?')) {
      return;
    }

    try {
      await axios.delete(`/api/admin/banners/${bannerId}`);
      showSuccess('Banner deleted successfully');
      fetchBanners();
    } catch (error) {
      console.error('Error deleting banner:', error);
      showError('Failed to delete banner');
    }
  };

  const handleStatusToggle = async (bannerId, currentStatus) => {
    try {
      await axios.put(`/api/admin/banners/${bannerId}`, {
        isActive: !currentStatus
      });
      showSuccess('Banner status updated');
      fetchBanners();
    } catch (error) {
      console.error('Error updating banner status:', error);
      showError('Failed to update banner status');
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (banner) => {
    const now = new Date();
    const startDate = new Date(banner.startDate);
    const endDate = banner.endDate ? new Date(banner.endDate) : null;
    
    if (!banner.isActive) return 'text-red-600 bg-red-100';
    if (now < startDate) return 'text-blue-600 bg-blue-100';
    if (endDate && now > endDate) return 'text-gray-600 bg-gray-100';
    return 'text-green-600 bg-green-100';
  };

  const getStatusText = (banner) => {
    const now = new Date();
    const startDate = new Date(banner.startDate);
    const endDate = banner.endDate ? new Date(banner.endDate) : null;
    
    if (!banner.isActive) return 'Inactive';
    if (now < startDate) return 'Upcoming';
    if (endDate && now > endDate) return 'Expired';
    return 'Active';
  };

  const getPositionColor = (position) => {
    switch (position) {
      case 'hero': return 'bg-blue-100 text-blue-800';
      case 'featured': return 'bg-green-100 text-green-800';
      case 'sidebar': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
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
              Manage Banners
            </h1>
            <p className="mt-2 text-gray-600">
              Create and manage homepage banners and promotional content
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <FiPlus className="h-4 w-4" />
            <span>Add Banner</span>
          </button>
        </div>
      </div>

      {/* Banners Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {banners.map((banner) => (
          <div key={banner._id} className="bg-white rounded-xl shadow-lg overflow-hidden">
            {/* Banner Image */}
            <div className="relative h-48 bg-gray-200">
              {banner.image ? (
                <img
                  src={banner.image}
                  alt={banner.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <FiImage className="h-12 w-12 text-gray-400" />
                </div>
              )}
              
              {/* Action Buttons */}
              <div className="absolute top-2 right-2 flex items-center space-x-1">
                <button
                  onClick={() => handleStatusToggle(banner._id, banner.isActive)}
                  className={`p-1 rounded bg-white/80 backdrop-blur-sm ${
                    banner.isActive 
                      ? 'text-green-600 hover:text-green-800' 
                      : 'text-red-600 hover:text-red-800'
                  }`}
                  title={banner.isActive ? 'Deactivate' : 'Activate'}
                >
                  {banner.isActive ? <FiEye className="h-4 w-4" /> : <FiEyeOff className="h-4 w-4" />}
                </button>
                <button
                  onClick={() => {
                    setEditingBanner(banner);
                    setShowModal(true);
                  }}
                  className="p-1 rounded bg-white/80 backdrop-blur-sm text-blue-600 hover:text-blue-800"
                  title="Edit"
                >
                  <FiEdit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(banner._id)}
                  className="p-1 rounded bg-white/80 backdrop-blur-sm text-red-600 hover:text-red-800"
                  title="Delete"
                >
                  <FiTrash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Banner Content */}
            <div className="p-6">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {banner.title}
                  </h3>
                  {banner.subtitle && (
                    <p className="text-sm text-gray-600 mt-1">
                      {banner.subtitle}
                    </p>
                  )}
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPositionColor(banner.position)}`}>
                  {banner.position.charAt(0).toUpperCase() + banner.position.slice(1)}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Order:</span>
                  <span className="font-medium">{banner.order}</span>
                </div>
                {banner.link && (
                  <div className="flex items-center space-x-1 text-sm text-gray-600">
                    <FiLink className="h-3 w-3" />
                    <span className="truncate">{banner.link}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Target:</span>
                  <span className="font-medium capitalize">{banner.targetAudience}</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-1 text-gray-500">
                  <FiCalendar className="h-3 w-3" />
                  <span>{formatDate(banner.startDate)}</span>
                  {banner.endDate && (
                    <>
                      <span>-</span>
                      <span>{formatDate(banner.endDate)}</span>
                    </>
                  )}
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(banner)}`}>
                  {getStatusText(banner)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Banner Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingBanner ? 'Edit Banner' : 'Add New Banner'}
              </h3>
              <BannerForm
                banner={editingBanner}
                onClose={() => {
                  setShowModal(false);
                  setEditingBanner(null);
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

// Banner Form Component
const BannerForm = ({ banner, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    title: banner?.title || '',
    subtitle: banner?.subtitle || '',
    image: banner?.image || '',
    link: banner?.link || '',
    linkText: banner?.linkText || '',
    position: banner?.position || 'hero',
    order: banner?.order || 0,
    isActive: banner?.isActive ?? true,
    startDate: banner?.startDate ? new Date(banner.startDate).toISOString().split('T')[0] : '',
    endDate: banner?.endDate ? new Date(banner.endDate).toISOString().split('T')[0] : '',
    backgroundColor: banner?.backgroundColor || '#ffffff',
    textColor: banner?.textColor || '#000000',
    targetAudience: banner?.targetAudience || 'all'
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submitData = {
        ...formData,
        order: parseInt(formData.order),
        endDate: formData.endDate || null
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
            Banner Title
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Subtitle
          </label>
          <input
            type="text"
            value={formData.subtitle}
            onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Image URL
        </label>
        <input
          type="url"
          value={formData.image}
          onChange={(e) => setFormData({ ...formData, image: e.target.value })}
          required
          placeholder="https://example.com/image.jpg"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Link URL
          </label>
          <input
            type="url"
            value={formData.link}
            onChange={(e) => setFormData({ ...formData, link: e.target.value })}
            placeholder="https://example.com"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Link Text
          </label>
          <input
            type="text"
            value={formData.linkText}
            onChange={(e) => setFormData({ ...formData, linkText: e.target.value })}
            placeholder="Shop Now"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Position
          </label>
          <select
            value={formData.position}
            onChange={(e) => setFormData({ ...formData, position: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="hero">Hero</option>
            <option value="featured">Featured</option>
            <option value="sidebar">Sidebar</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Display Order
          </label>
          <input
            type="number"
            value={formData.order}
            onChange={(e) => setFormData({ ...formData, order: e.target.value })}
            min="0"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Target Audience
          </label>
          <select
            value={formData.targetAudience}
            onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Users</option>
            <option value="men">Men</option>
            <option value="women">Women</option>
            <option value="kids">Kids</option>
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
            End Date (Optional)
          </label>
          <input
            type="date"
            value={formData.endDate}
            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Background Color
          </label>
          <input
            type="color"
            value={formData.backgroundColor}
            onChange={(e) => setFormData({ ...formData, backgroundColor: e.target.value })}
            className="w-full h-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Text Color
          </label>
          <input
            type="color"
            value={formData.textColor}
            onChange={(e) => setFormData({ ...formData, textColor: e.target.value })}
            className="w-full h-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
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
          {loading ? 'Saving...' : (banner ? 'Update Banner' : 'Create Banner')}
        </button>
      </div>
    </form>
  );
};

export default AdminBanners;
