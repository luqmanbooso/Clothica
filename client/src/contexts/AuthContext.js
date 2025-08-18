import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

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

  // Initialize axios defaults and interceptors
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Token is handled by api interceptor
      checkAuthStatus();
    } else {
      setLoading(false);
    }

    // Token management is handled by api interceptor
  }, []);

  const checkAuthStatus = async () => {
    try {
      // Ensure token is set in headers before making the request
      const token = localStorage.getItem('token');
      if (token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await api.get('/api/auth/me');
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
      const response = await api.post('/api/auth/register', userData);
      
      const { token, user: newUser, message, requiresOTPVerification } = response.data;
      
      // Only log in user if no OTP verification is required (Google accounts)
      if (!requiresOTPVerification && token) {
        // Store token
        localStorage.setItem('token', token);
        
        // Set token in API headers immediately
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // Set user state
        setUser(newUser);
        setIsAuthenticated(true);
        setIsAdmin(newUser.role === 'admin');
      }
      
      return { success: true, message, requiresOTPVerification };
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      setAuthError(message);
      return { success: false, message };
    }
  };

  const login = async (credentials) => {
    try {
      setAuthError(null);
      const response = await api.post('/api/auth/login', credentials);
      
      const { token, refreshToken, user: userData } = response.data;
      
      // Store tokens
      localStorage.setItem('token', token);
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
      }
      
      // Set token in API headers immediately
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Set user state
      setUser(userData);
      setIsAuthenticated(true);
      setIsAdmin(userData.role === 'admin');
      
      // Check if there's a redirect path stored
      const redirectPath = sessionStorage.getItem('redirectAfterLogin');
      if (redirectPath) {
        sessionStorage.removeItem('redirectAfterLogin');
        window.location.href = redirectPath;
      }
      
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
      const response = await api.post('/api/auth/google/signup', { idToken });
      
      const { token, user: userData, requiresProfileCompletion } = response.data;
      
      // Store token
      localStorage.setItem('token', token);
      
      // Set token in API headers immediately
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
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
      const response = await api.post('/api/auth/google/login', { idToken });
      
      const { token, user: userData, requiresProfileCompletion } = response.data;
      
      if (!token) {
        throw new Error('No token received from server');
      }
      
      // Store token in localStorage
      localStorage.setItem('token', token);
      
      // Update API instance with new token
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Set user state
      setUser(userData);
      setIsAuthenticated(true);
      setIsAdmin(userData.role === 'admin');
      
      // Verify token is properly set in headers
      console.log('Google login successful:', { user: userData, token: token.substring(0, 20) + '...' });
      console.log('API headers after login:', api.defaults.headers.common['Authorization']);
      
      return { success: true, requiresProfileCompletion };
    } catch (error) {
      console.error('Google login error:', error);
      const message = error.response?.data?.message || 'Google login failed';
      setAuthError(message);
      return { success: false, message };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    // Token cleanup handled by api interceptor
    setUser(null);
    setIsAuthenticated(false);
    setIsAdmin(false);
    setAuthError(null);
  };

  const updateProfile = async (profileData) => {
    try {
      setAuthError(null);
      const response = await api.put('/api/auth/profile', profileData);
      
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
      const response = await api.put('/api/auth/change-password', passwordData);
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
      const response = await api.post('/api/auth/send-otp', { phone });
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
      const response = await api.post('/api/auth/verify-otp', { otp });
      
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
      const response = await api.post('/api/auth/resend-verification', { email });
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
      const response = await api.post('/api/auth/verify-email', { token });
      
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
      const response = await api.post('/api/auth/forgot-password', { email });
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
      const response = await api.post('/api/auth/reset-password', { token, password });
      return { success: true, message: response.data.message };
    } catch (error) {
      const message = error.response?.data?.message || 'Password reset failed';
      setAuthError(message);
      return { success: false, message };
    }
  };

  const verifyEmailOTP = async (email, otp) => {
    try {
      setAuthError(null);
      const response = await api.post('/api/auth/verify-email-otp', { email, otp });
      
      const { token, user: newUser } = response.data;
      
      // Store token
      localStorage.setItem('token', token);
      
      // Set token in API headers immediately
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Set user state
      setUser(newUser);
      setIsAuthenticated(true);
      setIsAdmin(newUser.role === 'admin');
      
      return { success: true, message: response.data.message };
    } catch (error) {
      const message = error.response?.data?.message || 'OTP verification failed';
      setAuthError(message);
      return { success: false, message };
    }
  };

  const clearError = () => {
    setAuthError(null);
  };

  // Helper function to ensure token is properly set
  const ensureTokenSet = () => {
    const token = localStorage.getItem('token');
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      console.log('Token ensured in headers:', api.defaults.headers.common['Authorization']?.substring(0, 20) + '...');
      return true;
    }
    return false;
  };

  const completeProfile = async (profileData) => {
    try {
      setAuthError(null);
      const response = await api.put('/api/auth/complete-profile', profileData);
      
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
    verifyEmailOTP,
    clearError,
    ensureTokenSet
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
