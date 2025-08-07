import React, { useState, useEffect } from 'react';
import { FiUser, FiMail, FiPhone, FiMapPin, FiEdit2, FiSave, FiX, FiPlus } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    avatar: user?.avatar || ''
  });
  const [addresses, setAddresses] = useState(user?.addresses || []);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States',
    isDefault: false
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        avatar: user.avatar || ''
      });
      setAddresses(user.addresses || []);
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddressChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewAddress(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await updateProfile(formData);
      setEditMode(false);
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddAddress = async () => {
    if (!newAddress.street || !newAddress.city || !newAddress.state || !newAddress.zipCode) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const updatedAddresses = [...addresses, newAddress];
      await updateProfile({ addresses: updatedAddresses });
      setAddresses(updatedAddresses);
      setNewAddress({
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'United States',
        isDefault: false
      });
      setShowAddressForm(false);
      toast.success('Address added successfully!');
    } catch (error) {
      console.error('Address add error:', error);
      toast.error('Failed to add address. Please try again.');
    }
  };

  const handleRemoveAddress = async (index) => {
    try {
      const updatedAddresses = addresses.filter((_, i) => i !== index);
      await updateProfile({ addresses: updatedAddresses });
      setAddresses(updatedAddresses);
      toast.success('Address removed successfully!');
    } catch (error) {
      console.error('Address remove error:', error);
      toast.error('Failed to remove address. Please try again.');
    }
  };

  const handleSetDefaultAddress = async (index) => {
    try {
      const updatedAddresses = addresses.map((address, i) => ({
        ...address,
        isDefault: i === index
      }));
      await updateProfile({ addresses: updatedAddresses });
      setAddresses(updatedAddresses);
      toast.success('Default address updated!');
    } catch (error) {
      console.error('Default address error:', error);
      toast.error('Failed to update default address. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-secondary-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-secondary-900">
            My Profile
          </h1>
          <p className="mt-2 text-secondary-600">
            Manage your account information and addresses
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Information */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-soft p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-secondary-900">
                  Personal Information
                </h2>
                <button
                  onClick={() => setEditMode(!editMode)}
                  className="flex items-center space-x-2 text-primary-600 hover:text-primary-700 transition-colors"
                >
                  {editMode ? <FiX className="h-4 w-4" /> : <FiEdit2 className="h-4 w-4" />}
                  <span>{editMode ? 'Cancel' : 'Edit'}</span>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Avatar */}
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
                    {user?.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-2xl font-bold text-primary-700">
                        {user?.name?.charAt(0) || 'U'}
                      </span>
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-secondary-900">
                      {user?.name}
                    </h3>
                    <p className="text-secondary-600">
                      Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      Full Name
                    </label>
                    <div className="relative">
                      <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-secondary-400" />
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        disabled={!editMode}
                        className="input-field pl-10 disabled:bg-secondary-50"
                        placeholder="Full Name"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      Email
                    </label>
                    <div className="relative">
                      <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-secondary-400" />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        disabled={!editMode}
                        className="input-field pl-10 disabled:bg-secondary-50"
                        placeholder="Email Address"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      Phone Number
                    </label>
                    <div className="relative">
                      <FiPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-secondary-400" />
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        disabled={!editMode}
                        className="input-field pl-10 disabled:bg-secondary-50"
                        placeholder="Phone Number"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      Avatar URL
                    </label>
                    <input
                      type="url"
                      name="avatar"
                      value={formData.avatar}
                      onChange={handleChange}
                      disabled={!editMode}
                      className="input-field disabled:bg-secondary-50"
                      placeholder="Avatar URL (optional)"
                    />
                  </div>
                </div>

                {/* Save Button */}
                {editMode && (
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={loading}
                      className="btn-primary flex items-center space-x-2"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>Saving...</span>
                        </>
                      ) : (
                        <>
                          <FiSave className="h-4 w-4" />
                          <span>Save Changes</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </form>
            </div>
          </div>

          {/* Account Stats */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-soft p-6">
              <h2 className="text-lg font-semibold text-secondary-900 mb-4">
                Account Overview
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg">
                  <span className="text-sm text-secondary-600">Account Type</span>
                  <span className="text-sm font-medium text-secondary-900 capitalize">
                    {user?.role || 'user'}
                  </span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg">
                  <span className="text-sm text-secondary-600">Status</span>
                  <span className={`text-sm font-medium ${
                    user?.isActive ? 'text-success-600' : 'text-error-600'
                  }`}>
                    {user?.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg">
                  <span className="text-sm text-secondary-600">Member Since</span>
                  <span className="text-sm font-medium text-secondary-900">
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Addresses Section */}
        <div className="mt-8">
          <div className="bg-white rounded-xl shadow-soft p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-secondary-900">
                Shipping Addresses
              </h2>
              <button
                onClick={() => setShowAddressForm(!showAddressForm)}
                className="btn-secondary flex items-center space-x-2"
              >
                <FiPlus className="h-4 w-4" />
                <span>Add Address</span>
              </button>
            </div>

            {/* Add Address Form */}
            {showAddressForm && (
              <div className="mb-6 p-4 border border-secondary-200 rounded-lg bg-secondary-50">
                <h3 className="text-lg font-medium text-secondary-900 mb-4">
                  Add New Address
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      Street Address *
                    </label>
                    <input
                      type="text"
                      name="street"
                      value={newAddress.street}
                      onChange={handleAddressChange}
                      className="input-field"
                      placeholder="Street Address"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      City *
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={newAddress.city}
                      onChange={handleAddressChange}
                      className="input-field"
                      placeholder="City"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      State *
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={newAddress.state}
                      onChange={handleAddressChange}
                      className="input-field"
                      placeholder="State"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      ZIP Code *
                    </label>
                    <input
                      type="text"
                      name="zipCode"
                      value={newAddress.zipCode}
                      onChange={handleAddressChange}
                      className="input-field"
                      placeholder="ZIP Code"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      Country
                    </label>
                    <select
                      name="country"
                      value={newAddress.country}
                      onChange={handleAddressChange}
                      className="input-field"
                    >
                      <option value="United States">United States</option>
                      <option value="Canada">Canada</option>
                      <option value="United Kingdom">United Kingdom</option>
                      <option value="Australia">Australia</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        name="isDefault"
                        checked={newAddress.isDefault}
                        onChange={handleAddressChange}
                        className="rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-sm text-secondary-700">Set as default address</span>
                    </label>
                  </div>
                </div>
                
                <div className="flex space-x-3 mt-4">
                  <button
                    onClick={handleAddAddress}
                    className="btn-primary"
                  >
                    Add Address
                  </button>
                  <button
                    onClick={() => setShowAddressForm(false)}
                    className="btn-outline"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Addresses List */}
            <div className="space-y-4">
              {addresses.length === 0 ? (
                <div className="text-center py-8">
                  <FiMapPin className="mx-auto h-12 w-12 text-secondary-400 mb-4" />
                  <h3 className="text-lg font-medium text-secondary-900 mb-2">
                    No addresses yet
                  </h3>
                  <p className="text-secondary-600 mb-4">
                    Add your first shipping address to get started
                  </p>
                  <button
                    onClick={() => setShowAddressForm(true)}
                    className="btn-primary"
                  >
                    Add Address
                  </button>
                </div>
              ) : (
                addresses.map((address, index) => (
                  <div
                    key={index}
                    className="border border-secondary-200 rounded-lg p-4 hover:border-secondary-300 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <FiMapPin className="h-4 w-4 text-secondary-400" />
                          <span className="text-sm font-medium text-secondary-900">
                            {address.isDefault && (
                              <span className="bg-primary-100 text-primary-700 px-2 py-1 rounded-full text-xs mr-2">
                                Default
                              </span>
                            )}
                            Shipping Address
                          </span>
                        </div>
                        <p className="text-secondary-700">
                          {address.street}
                        </p>
                        <p className="text-secondary-700">
                          {address.city}, {address.state} {address.zipCode}
                        </p>
                        <p className="text-secondary-700">
                          {address.country}
                        </p>
                      </div>
                      
                      <div className="flex space-x-2">
                        {!address.isDefault && (
                          <button
                            onClick={() => handleSetDefaultAddress(index)}
                            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                          >
                            Set Default
                          </button>
                        )}
                        <button
                          onClick={() => handleRemoveAddress(index)}
                          className="text-sm text-error-600 hover:text-error-700 font-medium"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile; 