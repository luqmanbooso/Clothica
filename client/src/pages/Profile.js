import React, { useState, useEffect } from 'react';
import { FiUser, FiMail, FiPhone, FiMapPin, FiEdit2, FiSave, FiX, FiPlus } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';
import { useToast } from '../contexts/ToastContext';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const { success: showSuccess, error: showError } = useToast();
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
  const [showOTPForm, setShowOTPForm] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);

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
      showSuccess('Profile updated successfully!');
    } catch (error) {
      console.error('Profile update error:', error);
      showError('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddAddress = async () => {
    if (!newAddress.street || !newAddress.city || !newAddress.state || !newAddress.zipCode) {
      showError('Please fill in all required fields');
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
      showSuccess('Address added successfully!');
    } catch (error) {
      console.error('Address add error:', error);
      showError('Failed to add address. Please try again.');
    }
  };

  const handleRemoveAddress = async (index) => {
    try {
      const updatedAddresses = addresses.filter((_, i) => i !== index);
      await updateProfile({ addresses: updatedAddresses });
      setAddresses(updatedAddresses);
      showSuccess('Address removed successfully!');
    } catch (error) {
      console.error('Address remove error:', error);
      showError('Failed to remove address. Please try again.');
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
      showSuccess('Default address updated!');
    } catch (error) {
      console.error('Default address error:', error);
      showError('Failed to update default address. Please try again.');
    }
  };

  const handleSendOTP = async () => {
    if (!formData.phone) {
      showError('Please enter a phone number first');
      return;
    }

    setOtpLoading(true);
    try {
      const response = await api.post('/api/auth/send-otp', { phone: formData.phone });
      showSuccess('OTP sent to your email!');
      setShowOTPForm(true);
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to send OTP');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp) {
      showError('Please enter the OTP');
      return;
    }

    try {
      const response = await api.post('/api/auth/verify-otp', { otp });
      showSuccess('Phone verified successfully!');
      setShowOTPForm(false);
      setOtp('');
      // Refresh user data to show verified status
      window.location.reload();
    } catch (error) {
      showError(error.response?.data?.message || 'OTP verification failed');
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

        {/* Profile Completion Banner for Google Users */}
        {user?.isGoogleAccount && !user?.profileComplete && (
          <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-medium text-blue-900 mb-2">
                  Complete Your Profile
                </h3>
                <p className="text-blue-700 mb-4">
                  Welcome to Clothica! Your Google account is verified. To complete your profile and start shopping, please add your phone number (with verification) and shipping address.
                </p>
                <div className="flex items-center space-x-4 text-sm text-blue-600">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${user?.phone ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                    <span>Phone Number</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${user?.addresses && user.addresses.length > 0 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                    <span>Shipping Address</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

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
                     <div className="flex items-center space-x-2">
                       <h3 className="text-lg font-semibold text-secondary-900">
                         {user?.name}
                       </h3>
                       {user?.isGoogleAccount && (
                         <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                           ✓ Google Verified
                         </span>
                       )}
                     </div>
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
                      {user?.googleProvided?.name && (
                        <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Google Provided
                        </span>
                      )}
                    </label>
                    <div className="relative">
                      <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-secondary-400" />
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        disabled={!editMode || user?.googleProvided?.name}
                        className={`input-field pl-10 ${!editMode || user?.googleProvided?.name ? 'disabled:bg-secondary-50' : ''}`}
                        placeholder={user?.googleProvided?.name ? "Name from Google account" : "Full Name"}
                      />
                    </div>
                    {user?.googleProvided?.name && (
                      <p className="mt-1 text-xs text-secondary-500">
                        Name provided by Google account and cannot be changed
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      Email
                      {user?.googleProvided?.email && (
                        <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Google Provided
                        </span>
                      )}
                    </label>
                    <div className="relative">
                      <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-secondary-400" />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        disabled={!editMode || user?.googleProvided?.email}
                        className={`input-field pl-10 ${!editMode || user?.googleProvided?.email ? 'disabled:bg-secondary-50' : ''}`}
                        placeholder={user?.googleProvided?.email ? "Email from Google account" : "Email Address"}
                      />
                    </div>
                    {user?.googleProvided?.email && (
                      <p className="mt-1 text-xs text-secondary-500">
                        Email provided by Google account and cannot be changed
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      Phone Number
                      {user?.googleProvided?.phone && (
                        <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Google Provided
                        </span>
                      )}
                    </label>
                    <div className="relative">
                      <FiPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-secondary-400" />
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        disabled={!editMode || user?.googleProvided?.phone}
                        className={`input-field pl-10 ${!editMode || user?.googleProvided?.phone ? 'disabled:bg-secondary-50' : ''}`}
                        placeholder={user?.googleProvided?.phone ? "Phone number from Google account" : "Phone Number"}
                      />
                    </div>
                    {user?.googleProvided?.phone && (
                      <p className="mt-1 text-xs text-secondary-500">
                        Phone number provided by Google account and cannot be changed
                      </p>
                    )}
                    
                    {/* Phone Verification Section */}
                    {editMode && formData.phone && !user?.googleProvided?.phone && (
                      <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-blue-800">
                            Phone Verification Status
                          </span>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            user?.isPhoneVerified 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {user?.isPhoneVerified ? 'Verified' : 'Not Verified'}
                          </span>
                        </div>
                        
                        {!user?.isPhoneVerified ? (
                          <div className="space-y-2">
                            <p className="text-xs text-blue-700">
                              Verify your phone number to complete your profile
                            </p>
                            <div className="flex space-x-2">
                                                          <button
                              type="button"
                              onClick={() => handleSendOTP()}
                              disabled={otpLoading}
                              className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors disabled:opacity-50"
                            >
                              {otpLoading ? 'Sending...' : 'Send OTP'}
                            </button>
                            </div>
                          </div>
                        ) : (
                          <p className="text-xs text-green-700">
                            ✓ Phone number verified successfully
                          </p>
                        )}
                      </div>
                    )}
                    
                    {/* OTP Verification Form */}
                    {showOTPForm && (
                      <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-yellow-800">
                            Enter OTP
                          </span>
                          <button
                            type="button"
                            onClick={() => setShowOTPForm(false)}
                            className="text-xs text-yellow-600 hover:text-yellow-800"
                          >
                            ✕
                          </button>
                        </div>
                        <div className="space-y-2">
                          <input
                            type="text"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            placeholder="Enter 6-digit OTP"
                            maxLength={6}
                            className="w-full px-3 py-2 border border-yellow-300 rounded text-center text-lg font-mono tracking-widest focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                          />
                          <div className="flex space-x-2">
                            <button
                              type="button"
                              onClick={handleVerifyOTP}
                              className="flex-1 bg-yellow-600 text-white px-3 py-2 rounded text-sm hover:bg-yellow-700 transition-colors"
                            >
                              Verify OTP
                            </button>
                            <button
                              type="button"
                              onClick={handleSendOTP}
                              disabled={otpLoading}
                              className="px-3 py-2 border border-yellow-300 text-yellow-700 rounded text-sm hover:bg-yellow-50 transition-colors disabled:opacity-50"
                            >
                              {otpLoading ? 'Sending...' : 'Resend'}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
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
                {/* Profile Completion Progress */}
                {user?.isGoogleAccount && (
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-blue-900">Profile Completion</span>
                      <span className="text-sm text-blue-600">
                        {user?.profileComplete ? '100%' : 'Incomplete'}
                      </span>
                    </div>
                    <div className="w-full bg-blue-200 rounded-full h-2 mb-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ 
                          width: `${user?.profileComplete ? 100 : 
                            ((user?.phone && user?.isPhoneVerified ? 50 : 0) + (user?.addresses && user.addresses.length > 0 ? 50 : 0))}%` 
                        }}
                      ></div>
                    </div>
                    <div className="text-xs text-blue-600 space-y-1">
                      <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${user?.phone && user?.isPhoneVerified ? 'bg-green-500' : user?.phone ? 'bg-yellow-500' : 'bg-gray-300'}`}></div>
                        <span>Phone Number {user?.phone && !user?.isPhoneVerified && '(Needs Verification)'}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${user?.addresses && user.addresses.length > 0 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                        <span>Shipping Address</span>
                      </div>
                    </div>
                  </div>
                )}

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