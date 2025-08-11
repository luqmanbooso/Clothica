import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Initialize axios defaults
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      checkAuthStatus();
    } else {
      setLoading(false);
    }
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await axios.get('/api/auth/me');
      setUser(response.data);
      setIsAuthenticated(true);
      setIsAdmin(response.data.role === 'admin');
    } catch (error) {
      console.error('Auth check failed:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setAuthError(null);
      const response = await axios.post('/api/auth/register', userData);
      
      const { token, user: newUser, message } = response.data;
      
      // Store token
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Set user state
      setUser(newUser);
      setIsAuthenticated(true);
      setIsAdmin(newUser.role === 'admin');
      
      return { success: true, message };
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      setAuthError(message);
      return { success: false, message };
    }
  };

  const login = async (credentials) => {
    try {
      setAuthError(null);
      const response = await axios.post('/api/auth/login', credentials);
      
      const { token, user: userData } = response.data;
      
      // Store token
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Set user state
      setUser(userData);
      setIsAuthenticated(true);
      setIsAdmin(userData.role === 'admin');
      
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      setAuthError(message);
      return { success: false, message };
    }
  };

  const googleSignup = async (idToken) => {
    try {
      setAuthError(null);
      const response = await axios.post('/api/auth/google/signup', { idToken });
      
      const { token, user: userData, requiresProfileCompletion } = response.data;
      
      // Store token
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Set user state
      setUser(userData);
      setIsAuthenticated(true);
      setIsAdmin(userData.role === 'admin');
      
      return { success: true, requiresProfileCompletion };
    } catch (error) {
      const message = error.response?.data?.message || 'Google signup failed';
      setAuthError(message);
      return { success: false, message };
    }
  };

  const googleLogin = async (idToken) => {
    try {
      setAuthError(null);
      const response = await axios.post('/api/auth/google/login', { idToken });
      
      const { token, user: userData, requiresProfileCompletion } = response.data;
      
      // Store token
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Set user state
      setUser(userData);
      setIsAuthenticated(true);
      setIsAdmin(userData.role === 'admin');
      
      return { success: true, requiresProfileCompletion };
    } catch (error) {
      const message = error.response?.data?.message || 'Google login failed';
      setAuthError(message);
      return { success: false, message };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
    setIsAuthenticated(false);
    setIsAdmin(false);
    setAuthError(null);
  };

  const updateProfile = async (profileData) => {
    try {
      setAuthError(null);
      const response = await axios.put('/api/auth/profile', profileData);
      
      setUser(response.data.user);
      return { success: true, message: response.data.message };
    } catch (error) {
      const message = error.response?.data?.message || 'Profile update failed';
      setAuthError(message);
      return { success: false, message };
    }
  };

  const changePassword = async (passwordData) => {
    try {
      setAuthError(null);
      const response = await axios.put('/api/auth/change-password', passwordData);
      return { success: true, message: response.data.message };
    } catch (error) {
      const message = error.response?.data?.message || 'Password change failed';
      setAuthError(message);
      return { success: false, message };
    }
  };

  const sendOTP = async (phone) => {
    try {
      setAuthError(null);
      const response = await axios.post('/api/auth/send-otp', { phone });
      return { success: true, message: response.data.message };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to send OTP';
      setAuthError(message);
      return { success: false, message };
    }
  };

  const verifyOTP = async (otp) => {
    try {
      setAuthError(null);
      const response = await axios.post('/api/auth/verify-otp', { otp });
      
      // Update user state to reflect phone verification
      if (response.data.message === 'Phone verified successfully!') {
        setUser(prev => ({ ...prev, isPhoneVerified: true }));
      }
      
      return { success: true, message: response.data.message };
    } catch (error) {
      const message = error.response?.data?.message || 'OTP verification failed';
      setAuthError(message);
      return { success: false, message };
    }
  };

  const resendVerification = async (email) => {
    try {
      setAuthError(null);
      const response = await axios.post('/api/auth/resend-verification', { email });
      return { success: true, message: response.data.message };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to resend verification';
      setAuthError(message);
      return { success: false, message };
    }
  };

  const verifyEmail = async (token) => {
    try {
      setAuthError(null);
      const response = await axios.post('/api/auth/verify-email', { token });
      
      // Update user state to reflect email verification
      if (response.data.message === 'Email verified successfully!') {
        setUser(prev => ({ ...prev, isEmailVerified: true }));
      }
      
      return { success: true, message: response.data.message };
    } catch (error) {
      const message = error.response?.data?.message || 'Email verification failed';
      setAuthError(message);
      return { success: false, message };
    }
  };

  const forgotPassword = async (email) => {
    try {
      setAuthError(null);
      const response = await axios.post('/api/auth/forgot-password', { email });
      return { success: true, message: response.data.message };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to process password reset request';
      setAuthError(message);
      return { success: false, message };
    }
  };

  const resetPassword = async (token, password) => {
    try {
      setAuthError(null);
      const response = await axios.post('/api/auth/reset-password', { token, password });
      return { success: true, message: response.data.message };
    } catch (error) {
      const message = error.response?.data?.message || 'Password reset failed';
      setAuthError(message);
      return { success: false, message };
    }
  };

  const clearError = () => {
    setAuthError(null);
  };

  const completeProfile = async (profileData) => {
    try {
      setAuthError(null);
      const response = await axios.put('/api/auth/complete-profile', profileData);
      
      // Update user state
      setUser(response.data.user);
      
      return { success: true, message: response.data.message, requiresPhoneVerification: response.data.requiresPhoneVerification };
    } catch (error) {
      const message = error.response?.data?.message || 'Profile completion failed';
      setAuthError(message);
      return { success: false, message };
    }
  };

  const value = {
    user,
    isAuthenticated,
    isAdmin,
    loading,
    authError,
    register,
    login,
    googleSignup,
    googleLogin,
    logout,
    updateProfile,
    completeProfile,
    changePassword,
    sendOTP,
    verifyOTP,
    resendVerification,
    verifyEmail,
    forgotPassword,
    resetPassword,
    clearError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
