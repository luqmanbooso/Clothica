import React, { useState, useEffect } from 'react';
import {
  MegaphoneIcon,
  TicketIcon,
  CalendarIcon,
  ChartBarIcon // Using ChartBarIcon instead of PresentationChartLineIcon which might not be in v2
} from '@heroicons/react/24/outline';
import Banners from './Banners';
import Coupons from './Coupons';
import Events from './Events';
import api from '../../utils/api';

const CampaignHub = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    activeBanners: 0,
    activeCoupons: 0,
    activeEvents: 0
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Parallel fetch for stats
      const [bannersRes, couponsRes, eventsRes] = await Promise.allSettled([
        api.get('/api/admin/banners'),
        api.get('/api/admin/coupons'),
        api.get('/api/admin/events')
      ]);

      setStats({
        activeBanners: bannersRes.status === 'fulfilled' ? bannersRes.value.data.banners?.filter(b => b.isActive).length || 0 : 0,
        activeCoupons: couponsRes.status === 'fulfilled' ? couponsRes.value.data?.filter(c => c.isActive).length || 0 : 0,
        activeEvents: eventsRes.status === 'fulfilled' ? eventsRes.value.data.events?.filter(e => e.isActive).length || 0 : 0
      });
    } catch (error) {
      console.error('Error fetching campaign stats:', error);
    }
  };

  const tabs = [
    { id: 'overview', name: 'Overview', icon: ChartBarIcon },
    { id: 'banners', name: 'Banners', icon: MegaphoneIcon },
    { id: 'coupons', name: 'Coupons', icon: TicketIcon },
    { id: 'events', name: 'Events', icon: CalendarIcon },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-display font-bold text-[#1E1E1E]">Campaign Hub</h1>
        <p className="text-gray-600 mt-2">Manage all your marketing campaigns, banners, and promotions in one place.</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-all duration-200
                  ${activeTab === tab.id
                    ? 'border-[#6C7A59] text-[#6C7A59]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                <Icon
                  className={`
                    -ml-0.5 mr-2 h-5 w-5
                    ${activeTab === tab.id ? 'text-[#6C7A59]' : 'text-gray-400 group-hover:text-gray-500'}
                  `}
                  aria-hidden="true"
                />
                {tab.name}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Content Area */}
      <div className="min-h-[400px]">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in-up">
            <div
              onClick={() => setActiveTab('banners')}
              className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-50 rounded-xl">
                  <MegaphoneIcon className="h-6 w-6 text-blue-600" />
                </div>
                <span className="text-sm font-medium text-gray-500">Active</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">{stats.activeBanners}</h3>
              <p className="text-gray-600">Active Banners</p>
            </div>

            <div
              onClick={() => setActiveTab('coupons')}
              className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-50 rounded-xl">
                  <TicketIcon className="h-6 w-6 text-green-600" />
                </div>
                <span className="text-sm font-medium text-gray-500">Active</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">{stats.activeCoupons}</h3>
              <p className="text-gray-600">Active Coupons</p>
            </div>

            <div
              onClick={() => setActiveTab('events')}
              className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-purple-50 rounded-xl">
                  <CalendarIcon className="h-6 w-6 text-purple-600" />
                </div>
                <span className="text-sm font-medium text-gray-500">Upcoming</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">{stats.activeEvents}</h3>
              <p className="text-gray-600">Active Events</p>
            </div>
          </div>
        )}

        {activeTab === 'banners' && <Banners />}
        {activeTab === 'coupons' && <Coupons />}
        {activeTab === 'events' && <Events />}
      </div>
    </div>
  );
};

export default CampaignHub;
