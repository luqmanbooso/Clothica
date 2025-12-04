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

// Helper to resolve a usable user id for the new Spring Boot backend
const resolveUserId = (explicitId) => {
  const stored = localStorage.getItem('userId');
  if (explicitId) return explicitId;
  if (stored) return parseInt(stored, 10);
  if (process.env.REACT_APP_DEFAULT_USER_ID) {
    return parseInt(process.env.REACT_APP_DEFAULT_USER_ID, 10);
  }
  return 1; // sensible fallback for demos
};

const isAdminCredential = (username) => {
  if (!username) return false;
  const u = username.toLowerCase();
  return u === 'admin' || u === 'admin@clothica.com';
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Restore session from localStorage (backend does not expose /me)
  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedProfile = localStorage.getItem('userProfile');
    if (token && storedProfile) {
      try {
        const parsed = JSON.parse(storedProfile);
        setUser(parsed);
        setIsAuthenticated(true);
        setIsAdmin(!!parsed.isAdmin);
        api.defaults.headers.common.Authorization = `Bearer ${token}`;
      } catch (e) {
        localStorage.removeItem('userProfile');
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  }, []);

  const register = async (userData) => {
    try {
      setAuthError(null);
      const payload = {
        name: userData.name,
        username: userData.email || userData.username,
        email: userData.email || userData.username,
        password: userData.password,
        roles: 'ROLE_USER'
      };
      const response = await api.post('/api/auth/register', payload);

      // Auto-login after successful registration for smoother demos
      if (payload.username && userData.password) {
        await login({ username: payload.username, password: userData.password, userId: userData.userId });
      }

      return { success: true, message: response.data || 'Registered successfully.' };
    } catch (error) {
      const message = typeof error.response?.data === 'string'
        ? error.response.data
        : error.response?.data?.message || 'Registration failed';
      setAuthError(message);
      return { success: false, message };
    }
  };

  const login = async (credentials) => {
    try {
      setAuthError(null);
      const username = credentials.email || credentials.username;
      const response = await api.post('/api/auth/generatetoken', {
        username,
        password: credentials.password
      });

      const token = typeof response.data === 'string' ? response.data : response.data?.token;
      if (!token) {
        throw new Error('No token returned from server');
      }

      localStorage.setItem('token', token);
      api.defaults.headers.common.Authorization = `Bearer ${token}`;

      const derivedId = resolveUserId(credentials.userId);
      localStorage.setItem('userId', derivedId.toString());

      const role = isAdminCredential(username) ? 'admin' : 'user';
      const profile = {
        id: derivedId,
        email: username,
        name: username,
        role
      };

      localStorage.setItem('userProfile', JSON.stringify(profile));
      setUser(profile);
      setIsAuthenticated(true);
      setIsAdmin(role === 'admin');

      const redirectPath = sessionStorage.getItem('redirectAfterLogin');
      if (redirectPath) {
        sessionStorage.removeItem('redirectAfterLogin');
        window.location.href = redirectPath;
      }

      return { success: true };
    } catch (error) {
      const message = typeof error.response?.data === 'string'
        ? error.response.data
        : error.response?.data?.message || 'Login failed';
      setAuthError(message);
      return { success: false, message };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userProfile');
    setUser(null);
    setIsAuthenticated(false);
    setIsAdmin(false);
    setAuthError(null);
  };

  // Basic profile updater for local state only
  const updateProfile = async (profileData) => {
    const updated = { ...(user || {}), ...profileData };
    setUser(updated);
    localStorage.setItem('userProfile', JSON.stringify(updated));
    return { success: true, message: 'Profile updated locally (server endpoint not available yet).' };
  };

  // Unsupported endpoints on the new backend - return graceful fallbacks
  const unsupported = async () => ({
    success: false,
    message: 'This action is not supported on the current backend yet.'
  });

  const changePassword = unsupported;
  const sendOTP = unsupported;
  const verifyOTP = unsupported;
  const resendVerification = unsupported;
  const verifyEmail = unsupported;
  const forgotPassword = unsupported;
  const resetPassword = unsupported;
  const verifyEmailOTP = unsupported;
  const googleSignup = unsupported;
  const googleLogin = unsupported;
  const completeProfile = unsupported;

  const clearError = () => {
    setAuthError(null);
  };

  const ensureTokenSet = () => {
    const token = localStorage.getItem('token');
    if (token) {
      api.defaults.headers.common.Authorization = `Bearer ${token}`;
      return true;
    }
    return false;
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
