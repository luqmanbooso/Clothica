import React, { useState, useEffect } from 'react';
import { FiImage, FiPlus, FiEdit, FiTrash2, FiEye, FiEyeOff, FiCalendar, FiLink, FiXCircle } from 'react-icons/fi';
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
      // Fallback to sample data if API fails
      setBanners([
        {
          _id: 1,
          title: 'Summer Collection',
          subtitle: 'New Arrivals',
          description: 'Discover the latest summer styles',
          image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800',
          link: '/shop?category=summer',
          isActive: true,
          priority: 1,
          startDate: '2024-06-01',
          endDate: '2024-08-31',
          targetAudience: 'all',
          clicks: 1250,
          impressions: 15000
        }
      ]);
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
                  alt={banner.title || banner.name}
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
                    {banner.title || banner.name}
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
                  <span className="text-gray-600">Priority:</span>
                  <span className="font-medium">{banner.priority || banner.order || 1}</span>
                </div>
                {banner.actionUrl && (
                  <div className="flex items-center space-x-1 text-sm text-gray-600">
                    <FiLink className="h-3 w-3" />
                    <span className="truncate">{banner.actionUrl}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Target:</span>
                  <div className="text-sm text-gray-600">
                    {banner.targetAudience || 'all'} • {banner.showOnPages || 'all'}
                  </div>
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
    description: banner?.description || '',
    image: banner?.image || '',
    actionUrl: banner?.actionUrl || banner?.link || '', // Map link to actionUrl
    ctaText: banner?.ctaText || banner?.linkText || 'Shop Now', // Map linkText to ctaText
    position: banner?.position || 'hero',
    priority: banner?.priority || banner?.order || 1, // Map order to priority
    isActive: banner?.isActive ?? true,
    startDate: banner?.startDate ? new Date(banner.startDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    endDate: banner?.endDate ? new Date(banner.endDate).toISOString().split('T')[0] : '',
    displayColor: banner?.displayColor || banner?.backgroundColor || '#6C7A59',
    ctaColor: banner?.ctaColor || banner?.textColor || '#FFFFFF',
    targetAudience: banner?.targetAudience || 'all',
    showOnPages: banner?.showOnPages || 'home',
    status: banner?.status || 'draft'
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submitData = {
        ...formData,
        priority: parseInt(formData.priority),
        endDate: formData.endDate || null,
        // Use single values instead of arrays
        targetAudience: formData.targetAudience,
        showOnPages: formData.showOnPages,
        // Map frontend fields to backend model fields
        name: formData.title, // Banner model expects 'name' field
        actionType: 'link', // Default action type
        status: formData.status || 'draft',
        isActive: formData.isActive
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
          Banner Image
        </label>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files[0];
              if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                  setFormData({ ...formData, image: e.target.result });
                };
                reader.readAsDataURL(file);
              }
            }}
            className="hidden"
            id="banner-image-upload"
          />
          <label htmlFor="banner-image-upload" className="cursor-pointer">
            <div className="space-y-4">
              <FiImage className="h-12 w-12 text-gray-400 mx-auto" />
              <div>
                <button
                  type="button"
                  onClick={() => document.getElementById('banner-image-upload').click()}
                  className="flex items-center justify-center px-4 py-2 bg-[#6C7A59] text-white rounded-lg hover:bg-[#5A6A4A] transition-colors"
                >
                  <FiPlus className="h-5 w-5 mr-2" />
                  Upload Image
                </button>
              </div>
              <p className="text-sm text-gray-500">
                PNG, JPG, GIF up to 5MB
              </p>
            </div>
          </label>
        </div>
        
        {/* Image Preview */}
        {formData.image && (
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Preview</h4>
            <div className="relative">
              <img
                src={formData.image}
                alt="Banner preview"
                className="w-full h-32 object-cover rounded-lg"
              />
              <button
                type="button"
                onClick={() => setFormData({ ...formData, image: '' })}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
              >
                <FiXCircle className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Link URL
          </label>
          <input
            type="url"
            value={formData.actionUrl}
            onChange={(e) => setFormData({ ...formData, actionUrl: e.target.value })}
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
            value={formData.ctaText}
            onChange={(e) => setFormData({ ...formData, ctaText: e.target.value })}
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
            value={formData.priority}
            onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
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
            <option value="new">New Users</option>
            <option value="returning">Returning Users</option>
            <option value="bronze">Bronze Members</option>
            <option value="silver">Silver Members</option>
            <option value="gold">Gold Members</option>
            <option value="vip">VIP Members</option>
            <option value="guest">Guest Users</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Show On Pages
          </label>
          <select
            value={formData.showOnPages}
            onChange={(e) => setFormData({ ...formData, showOnPages: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Pages</option>
            <option value="home">Home Page</option>
            <option value="shop">Shop Page</option>
            <option value="product">Product Pages</option>
            <option value="category">Category Pages</option>
            <option value="cart">Cart Page</option>
            <option value="checkout">Checkout Page</option>
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
            value={formData.displayColor}
            onChange={(e) => setFormData({ ...formData, displayColor: e.target.value })}
            className="w-full h-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Text Color
          </label>
          <input
            type="color"
            value={formData.ctaColor}
            onChange={(e) => setFormData({ ...formData, ctaColor: e.target.value })}
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
