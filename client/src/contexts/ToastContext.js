import React, { createContext, useContext, useState, useCallback } from 'react';
import CustomToast from '../components/CustomToast';

const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'success', duration = 5000) => {
    const id = Date.now() + Math.random();
    const newToast = { id, message, type, duration, isVisible: true };
    
    setToasts(prev => [...prev, newToast]);
    
    // Auto remove after duration
    setTimeout(() => {
      hideToast(id);
    }, duration);
    
    return id;
  }, []);

  const hideToast = useCallback((id) => {
    setToasts(prev => prev.map(toast => 
      toast.id === id ? { ...toast, isVisible: false } : toast
    ));
    
    // Remove from array after animation
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, 300);
  }, []);

  const success = useCallback((message, duration) => {
    return showToast(message, 'success', duration);
  }, [showToast]);

  const error = useCallback((message, duration) => {
    return showToast(message, 'error', duration);
  }, [showToast]);

  const warning = useCallback((message, duration) => {
    return showToast(message, 'warning', duration);
  }, [showToast]);

  const info = useCallback((message, duration) => {
    return showToast(message, 'info', duration);
  }, [showToast]);

  const value = {
    showToast,
    hideToast,
    success,
    error,
    warning,
    info
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      {toasts.map(toast => (
        <CustomToast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          isVisible={toast.isVisible}
          onClose={() => hideToast(toast.id)}
          duration={toast.duration}
        />
      ))}
    </ToastContext.Provider>
  );
};
