import React, { useState, useEffect } from 'react';
import { PlusIcon, PencilIcon, TrashIcon, EyeIcon, EyeSlashIcon, PhotoIcon } from '@heroicons/react/24/outline';
import api from '../../utils/api';
import { useToast } from '../../contexts/ToastContext';

const Banners = () => {
  const { success: showSuccess, error: showError } = useToast();
  const [banners, setBanners] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    title: '',
    subtitle: '',
    image: '',
    position: 'hero',
    priority: 1,
    eventId: '',
    isActive: true,
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    cta: { text: 'Shop Now', link: '' }
  });

  useEffect(() => {
    fetchBanners();
    fetchEvents();
  }, []);

  const fetchBanners = async () => {
    try {
      const response = await api.get('/api/admin/banners');
      setBanners(response.data.banners || []);
    } catch (error) {
      console.error('Error fetching banners:', error);
      setBanners([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchEvents = async () => {
    try {
      const response = await api.get('/api/admin/events');
      setEvents(response.data.events || []);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingBanner) {
        await api.put(`/api/admin/banners/${editingBanner._id}`, formData);
        showSuccess('Banner updated successfully!');
      } else {
        await api.post('/api/admin/banners', formData);
        showSuccess('Banner created successfully!');
      }
      setShowModal(false);
      resetForm();
      fetchBanners();
    } catch (error) {
      showError('Failed to save banner');
    }
  };

  const handleDelete = async (bannerId) => {
    if (window.confirm('Delete this banner?')) {
      try {
        await api.delete(`/api/admin/banners/${bannerId}`);
        showSuccess('Banner deleted');
        fetchBanners();
      } catch (error) {
        showError('Failed to delete banner');
      }
    }
  };

  const handleToggleStatus = async (bannerId, currentStatus) => {
    try {
      await api.patch(`/api/admin/banners/${bannerId}/toggle`);
      showSuccess('Status updated');
      fetchBanners();
    } catch (error) {
      showError('Failed to update status');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '', title: '', subtitle: '', image: '', position: 'hero',
      priority: 1, eventId: '', isActive: true,
      startDate: new Date().toISOString().split('T')[0], endDate: '',
      cta: { text: 'Shop Now', link: '' }
    });
    setEditingBanner(null);
  };

  const handleEdit = (banner) => {
    setEditingBanner(banner);
    setFormData({
      name: banner.name || '',
      title: banner.title || '',
      subtitle: banner.subtitle || '',
      image: banner.image || '',
      position: banner.position || 'hero',
      priority: banner.priority || 1,
      eventId: banner.eventId?._id || '',
      isActive: banner.isActive ?? true,
      startDate: banner.startDate ? new Date(banner.startDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      endDate: banner.endDate ? new Date(banner.endDate).toISOString().split('T')[0] : '',
      cta: { text: banner.cta?.text || 'Shop Now', link: banner.cta?.link || '' }
    });
    setShowModal(true);
  };

  const getStatusColor = (banner) => {
    if (!banner.isActive) return 'text-red-600 bg-red-100';
    const now = new Date();
    const startDate = new Date(banner.startDate);
    const endDate = banner.endDate ? new Date(banner.endDate) : null;
    if (now < startDate) return 'text-blue-600 bg-blue-100';
    if (endDate && now > endDate) return 'text-gray-600 bg-gray-100';
    return 'text-green-600 bg-green-100';
  };

  const getStatusText = (banner) => {
    if (!banner.isActive) return 'Inactive';
    const now = new Date();
    const startDate = new Date(banner.startDate);
    const endDate = banner.endDate ? new Date(banner.endDate) : null;
    if (now < startDate) return 'Upcoming';
    if (endDate && now > endDate) return 'Expired';
    return 'Active';
  };

  if (loading) {
    return <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6C7A59]"></div></div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Banner Management</h1>
            <p className="mt-2 text-gray-600">Create and manage promotional banners with event integration</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="bg-[#6C7A59] text-white px-4 py-2 rounded-lg hover:bg-[#5A6A4A] flex items-center"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Create Banner
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {banners.map((banner, index) => (
          <div key={banner._id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
            <div className="relative h-48 bg-gray-100">
              {banner.image ? (
                <img src={banner.image} alt={banner.title || banner.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <PhotoIcon className="h-12 w-12 text-gray-400" />
                </div>
              )}
              
              <div className="absolute top-2 left-2">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(banner)}`}>
                  {getStatusText(banner)}
                </span>
              </div>
              
              <div className="absolute bottom-2 right-2 flex gap-1">
                <button
                  onClick={() => handleToggleStatus(banner._id, banner.isActive)}
                  className="p-1 rounded bg-white/80 backdrop-blur-sm hover:bg-white"
                >
                  {banner.isActive ? <EyeIcon className="h-4 w-4 text-green-600" /> : <EyeSlashIcon className="h-4 w-4 text-red-600" />}
                </button>
                <button onClick={() => handleEdit(banner)} className="p-1 rounded bg-white/80 backdrop-blur-sm hover:bg-white">
                  <PencilIcon className="h-4 w-4 text-blue-600" />
                </button>
                <button onClick={() => handleDelete(banner._id)} className="p-1 rounded bg-white/80 backdrop-blur-sm hover:bg-white">
                  <TrashIcon className="h-4 w-4 text-red-600" />
                </button>
              </div>
            </div>

            <div className="p-4">
              <h3 className="font-semibold text-gray-900 mb-2">{banner.title || banner.name}</h3>
              {banner.subtitle && <p className="text-sm text-gray-600 mb-2">{banner.subtitle}</p>}
              
              <div className="space-y-1 text-sm text-gray-600">
                <div>Position: {banner.position}</div>
                <div>Priority: {banner.priority}</div>
                {banner.eventId && <div>Event: {banner.eventId.name}</div>}
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div><div className="font-semibold text-blue-600">{banner.analytics?.displays || 0}</div><div className="text-gray-500">Displays</div></div>
                  <div><div className="font-semibold text-green-600">{banner.analytics?.clicks || 0}</div><div className="text-gray-500">Clicks</div></div>
                  <div><div className="font-semibold text-purple-600">{banner.analytics?.conversions || 0}</div><div className="text-gray-500">Conversions</div></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingBanner ? 'Edit Banner' : 'Create New Banner'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Banner Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6C7A59] focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6C7A59] focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Position</label>
                  <select
                    name="position"
                    value={formData.position}
                    onChange={(e) => setFormData({...formData, position: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6C7A59] focus:border-transparent"
                  >
                    <option value="hero">Hero</option>
                    <option value="top">Top</option>
                    <option value="middle">Middle</option>
                    <option value="bottom">Bottom</option>
                    <option value="sidebar">Sidebar</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                  <input
                    type="number"
                    name="priority"
                    value={formData.priority}
                    onChange={(e) => setFormData({...formData, priority: parseInt(e.target.value)})}
                    min="1"
                    max="10"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6C7A59] focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Event (Optional)</label>
                  <select
                    name="eventId"
                    value={formData.eventId}
                    onChange={(e) => setFormData({...formData, eventId: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6C7A59] focus:border-transparent"
                  >
                    <option value="">No Event</option>
                    {events.map(event => (
                      <option key={event._id} value={event._id}>{event.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Image URL *</label>
                <input
                  type="url"
                  name="image"
                  value={formData.image}
                  onChange={(e) => setFormData({...formData, image: e.target.value})}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6C7A59] focus:border-transparent"
                  placeholder="https://..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6C7A59] focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">End Date (Optional)</label>
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6C7A59] focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-4 border-t border-gray-200 pt-6">
                <button
                  type="button"
                  onClick={() => {setShowModal(false); resetForm();}}
                  className="px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                
                <button
                  type="submit"
                  className="px-8 py-3 text-sm font-medium text-white bg-[#6C7A59] rounded-lg hover:bg-[#5A6A4A]"
                >
                  {editingBanner ? 'Update Banner' : 'Create Banner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Banners;
