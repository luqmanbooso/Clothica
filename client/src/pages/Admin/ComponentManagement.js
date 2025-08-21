import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  PhotoIcon, TicketIcon, GiftIcon, StarIcon, 
  PlusIcon, ArrowLeftIcon, CheckCircleIcon
} from '@heroicons/react/24/outline';
import { useToast } from '../../contexts/ToastContext';
import api from '../../utils/api';

const ComponentManagement = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  
  // State Management
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('banners');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [componentType, setComponentType] = useState('banner');

  useEffect(() => {
    if (eventId) {
      fetchEventData();
    }
  }, [eventId]);

  const fetchEventData = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/admin/events/${eventId}`);
      setEvent(response.data);
    } catch (error) {
      showError('Failed to fetch event data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#6C7A59]"></div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Event not found</p>
        <button onClick={() => navigate('/admin/campaign-hub')} className="mt-4 text-blue-600 hover:text-blue-700">
          ← Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      {/* Header */}
      <div className="mb-8">
        <button 
          onClick={() => navigate('/admin/campaign-hub')}
          className="flex items-center text-[#6C7A59] hover:text-[#5A6A4A] mb-4"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Back to Campaign Hub
        </button>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {event.name} - Component Management
        </h1>
        <p className="text-gray-600">
          Manage banners, discounts, special offers, and spin wheels for this event
        </p>
      </div>

      {/* Event Overview Card */}
      <motion.div 
        className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <PhotoIcon className="h-8 w-8 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{event.components?.banners?.length || 0}</p>
            <p className="text-sm text-gray-600">Banners</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <TicketIcon className="h-8 w-8 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{event.components?.discounts?.length || 0}</p>
            <p className="text-sm text-gray-600">Discounts</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <GiftIcon className="h-8 w-8 text-purple-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{event.components?.specialOffers?.length || 0}</p>
            <p className="text-sm text-gray-600">Special Offers</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <StarIcon className="h-8 w-8 text-yellow-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{event.components?.spinWheel?.enabled ? 1 : 0}</p>
            <p className="text-sm text-gray-600">Spin Wheel</p>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 mb-8">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'banners', name: 'Banners', icon: PhotoIcon, count: event.components?.banners?.length || 0 },
              { id: 'discounts', name: 'Discounts', icon: TicketIcon, count: event.components?.discounts?.length || 0 },
              { id: 'specialOffers', name: 'Special Offers', icon: GiftIcon, count: event.components?.specialOffers?.length || 0 },
              { id: 'spinWheel', name: 'Spin Wheel', icon: StarIcon, count: event.components?.spinWheel?.enabled ? 1 : 0 }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                    activeTab === tab.id
                      ? 'border-[#6C7A59] text-[#6C7A59]'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {tab.name}
                  <span className="bg-gray-100 text-gray-900 py-1 px-2 rounded-full text-xs">
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'banners' && (
            <div className="text-center py-12">
              <PhotoIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Banner Management</h3>
              <p className="text-gray-600 mb-6">Create and manage banners for this event</p>
              <button className="bg-[#6C7A59] text-white px-6 py-3 rounded-lg hover:bg-[#5A6A4A] transition-colors">
                <PlusIcon className="h-5 w-5 mr-2 inline" />
                Add Banner
              </button>
            </div>
          )}

          {activeTab === 'discounts' && (
            <div className="text-center py-12">
              <TicketIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Discount Management</h3>
              <p className="text-gray-600 mb-6">Create and manage discounts for this event</p>
              <button className="bg-[#6C7A59] text-white px-6 py-3 rounded-lg hover:bg-[#5A6A4A] transition-colors">
                <PlusIcon className="h-5 w-5 mr-2 inline" />
                Add Discount
              </button>
            </div>
          )}

          {activeTab === 'specialOffers' && (
            <div className="text-center py-12">
              <GiftIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Special Offer Management</h3>
              <p className="text-gray-600 mb-6">Create and manage special offers for this event</p>
              <button className="bg-[#6C7A59] text-white px-6 py-3 rounded-lg hover:bg-[#5A6A4A] transition-colors">
                <PlusIcon className="h-5 w-5 mr-2 inline" />
                Add Special Offer
              </button>
            </div>
          )}

          {activeTab === 'spinWheel' && (
            <div className="text-center py-12">
              <StarIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Spin Wheel Management</h3>
              <p className="text-gray-600 mb-6">Configure spin wheel rewards for this event</p>
              <button className="bg-[#6C7A59] text-white px-6 py-3 rounded-lg hover:bg-[#5A6A4A] transition-colors">
                <PlusIcon className="h-5 w-5 mr-2 inline" />
                Configure Spin Wheel
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Event Status */}
      <motion.div 
        className="bg-white rounded-xl p-6 shadow-lg border border-gray-200"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Event Status</h3>
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                event.status === 'active' 
                  ? 'text-green-600 bg-green-100' 
                  : 'text-gray-600 bg-gray-100'
              }`}>
                {event.status}
              </span>
              {event.status === 'active' && (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircleIcon className="h-5 w-5" />
                  <span className="text-sm">All components are active</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="text-right">
            <p className="text-sm text-gray-600">Event Duration</p>
            <p className="text-lg font-semibold text-gray-900">
              {event.duration} days
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ComponentManagement;
