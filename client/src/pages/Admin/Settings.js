import React, { useState, useEffect } from 'react';
import { FiSettings, FiSave, FiGlobe, FiMail, FiShield, FiCreditCard, FiTruck, FiBell } from 'react-icons/fi';
import axios from 'axios';
import { useToast } from '../../contexts/ToastContext';

const AdminSettings = () => {
  const [settings, setSettings] = useState({
    siteName: 'Clothica',
    siteDescription: 'Modern Fashion Store',
    contactEmail: 'admin@clothica.com',
    currency: 'USD',
    taxRate: 8.5,
    shippingCost: 5.99
  });
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const { success: showSuccess, error: showError } = useToast();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/admin/settings');
      setSettings(response.data);
    } catch (error) {
      console.error('Error fetching settings:', error);
      showError('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      await axios.put('/api/admin/settings', settings);
      showSuccess('Settings updated successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      showError('Failed to save settings. Please try again.');
    } finally {
      setIsSaving(false);
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
              Settings
            </h1>
            <p className="mt-2 text-gray-600">
              Configure your store settings and preferences
            </p>
          </div>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors disabled:opacity-50"
          >
            <FiSave className="h-4 w-4" />
            <span>{isSaving ? 'Saving...' : 'Save Settings'}</span>
          </button>
        </div>
      </div>

      {/* Settings Content */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">General Settings</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Site Name
            </label>
            <input
              type="text"
              value={settings.siteName}
              onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contact Email
            </label>
            <input
              type="email"
              value={settings.contactEmail}
              onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Currency
            </label>
            <select
              value={settings.currency}
              onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="CAD">CAD (C$)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tax Rate (%)
            </label>
            <input
              type="number"
              value={settings.taxRate}
              onChange={(e) => setSettings({ ...settings, taxRate: parseFloat(e.target.value) })}
              min="0"
              max="100"
              step="0.1"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Default Shipping Cost
            </label>
            <input
              type="number"
              value={settings.shippingCost}
              onChange={(e) => setSettings({ ...settings, shippingCost: parseFloat(e.target.value) })}
              min="0"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Site Description
          </label>
          <textarea
            value={settings.siteDescription}
            onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
