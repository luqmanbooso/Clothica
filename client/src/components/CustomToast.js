import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircleIcon, 
  ExclamationTriangleIcon, 
  InformationCircleIcon,
  XMarkIcon 
} from '@heroicons/react/24/outline';

const CustomToast = ({ 
  message, 
  type = 'success', 
  isVisible, 
  onClose, 
  duration = 5000 
}) => {
  React.useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  const getToastStyles = () => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-gradient-to-r from-green-500 to-emerald-600',
          icon: CheckCircleIcon,
          iconColor: 'text-green-100',
          border: 'border-green-400'
        };
      case 'error':
        return {
          bg: 'bg-gradient-to-r from-red-500 to-rose-600',
          icon: ExclamationTriangleIcon,
          iconColor: 'text-red-100',
          border: 'border-red-400'
        };
      case 'warning':
        return {
          bg: 'bg-gradient-to-r from-yellow-500 to-amber-600',
          icon: ExclamationTriangleIcon,
          iconColor: 'text-yellow-100',
          border: 'border-yellow-400'
        };
      case 'info':
        return {
          bg: 'bg-gradient-to-r from-blue-500 to-indigo-600',
          icon: InformationCircleIcon,
          iconColor: 'text-blue-100',
          border: 'border-blue-400'
        };
      default:
        return {
          bg: 'bg-gradient-to-r from-gray-500 to-slate-600',
          icon: InformationCircleIcon,
          iconColor: 'text-gray-100',
          border: 'border-gray-400'
        };
    }
  };

  const styles = getToastStyles();
  const IconComponent = styles.icon;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.8 }}
          transition={{ 
            type: "spring", 
            stiffness: 300, 
            damping: 30,
            duration: 0.3 
          }}
          className={`fixed top-4 right-4 z-50 max-w-sm w-full`}
        >
          <div className={`${styles.bg} rounded-xl shadow-2xl border ${styles.border} overflow-hidden`}>
            <div className="flex items-center p-4">
              <div className="flex-shrink-0">
                <IconComponent className={`h-6 w-6 ${styles.iconColor}`} />
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-white">
                  {message}
                </p>
              </div>
              <div className="ml-4 flex-shrink-0">
                <button
                  onClick={onClose}
                  className="inline-flex text-white hover:text-white/80 focus:outline-none focus:ring-2 focus:ring-white/50 rounded-lg p-1 transition-colors"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            {/* Progress bar */}
            <div className="h-1 bg-white/20">
              <motion.div
                initial={{ width: "100%" }}
                animate={{ width: "0%" }}
                transition={{ duration: duration / 1000, ease: "linear" }}
                className="h-full bg-white/60"
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CustomToast;
