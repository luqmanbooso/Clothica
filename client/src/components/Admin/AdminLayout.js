import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Bars3Icon, 
  XMarkIcon,
  HomeIcon,
  CubeIcon,
  ShoppingCartIcon,
  UsersIcon,
  TagIcon,
  TicketIcon,
  PhotoIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  SparklesIcon,
  ClockIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';

const AdminLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const formatTime = () => {
    return currentTime.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navigation = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: HomeIcon },
    { name: 'Products', href: '/admin/products', icon: CubeIcon },
    { name: 'Orders', href: '/admin/orders', icon: ShoppingCartIcon },
    { name: 'Users', href: '/admin/users', icon: UsersIcon },
    { name: 'Categories', href: '/admin/categories', icon: TagIcon },
    { name: 'Coupons', href: '/admin/coupons', icon: TicketIcon },
    { name: 'Banners', href: '/admin/banners', icon: PhotoIcon },
    { name: 'Monetization', href: '/admin/monetization', icon: CurrencyDollarIcon },
    { name: 'Analytics', href: '/admin/analytics', icon: ChartBarIcon },
    { name: 'Settings', href: '/admin/settings', icon: Cog6ToothIcon },
  ];

  const isActive = (path) => location.pathname === path;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.3,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.3 }
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F1EE]">
      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <div className="absolute inset-0 bg-black/50" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 left-0 z-50 w-64 bg-[#1E1E1E] shadow-xl lg:hidden"
          >
            <div className="flex h-full flex-col">
              {/* Sidebar Header */}
              <div className="flex h-16 items-center justify-between px-6 border-b border-gray-700">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#6C7A59] to-[#D6BFAF] rounded-xl flex items-center justify-center">
                    <SparklesIcon className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-xl font-display font-bold text-white">Admin</span>
                </div>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              {/* Navigation */}
              <nav className="flex-1 px-4 py-6 space-y-2">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                      isActive(item.href)
                        ? 'bg-[#6C7A59] text-white shadow-lg'
                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    }`}
                  >
                    <item.icon className="h-5 w-5" />
                    <span className="font-medium">{item.name}</span>
                  </Link>
                ))}
              </nav>

              {/* User Section */}
              <div className="border-t border-gray-700 p-4">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#6C7A59] to-[#D6BFAF] rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold">
                      {user?.firstName?.charAt(0) || 'A'}
                    </span>
                  </div>
                  <div>
                    <p className="text-white font-medium">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-gray-400 text-sm">Administrator</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-3 px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-white rounded-xl transition-all duration-200"
                >
                  <ArrowRightOnRectangleIcon className="h-5 w-5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-[#1E1E1E] shadow-xl">
          {/* Sidebar Header */}
          <div className="flex h-16 items-center px-6 border-b border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#6C7A59] to-[#D6BFAF] rounded-xl flex items-center justify-center">
                <SparklesIcon className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-display font-bold text-white">Admin</span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive(item.href)
                    ? 'bg-[#6C7A59] text-white shadow-lg'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <item.icon className="h-5 w-5" />
                <span className="font-medium">{item.name}</span>
              </Link>
            ))}
          </nav>

          {/* User Section */}
          <div className="border-t border-gray-700 p-4">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-[#6C7A59] to-[#D6BFAF] rounded-full flex items-center justify-center">
                <span className="text-white font-semibold">
                  {user?.firstName?.charAt(0) || 'A'}
                </span>
              </div>
              <div>
                <p className="text-white font-medium">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-gray-400 text-sm">Administrator</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-white rounded-xl transition-all duration-200"
            >
              <ArrowRightOnRectangleIcon className="h-5 w-5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Top Bar */}
        <div className="sticky top-0 z-30 bg-white shadow-sm border-b border-gray-200">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <Bars3Icon className="h-6 w-6" />
              </button>
              <div className="ml-4 lg:ml-0">
                <h1 className="text-2xl font-display font-bold text-[#1E1E1E]">
                  {navigation.find(item => isActive(item.href))?.name || 'Dashboard'}
                </h1>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex items-center space-x-3 text-sm">
                <div className="flex items-center space-x-2 text-gray-600">
                  <ClockIcon className="h-4 w-4" />
                  <span>{formatTime()}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-gray-600">{getGreeting()},</span>
                  <span className="font-semibold text-[#1E1E1E]">
                    {user?.firstName} {user?.lastName}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <motion.main 
          className="p-4 sm:p-6 lg:p-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants}>
        {children}
          </motion.div>
        </motion.main>
      </div>
    </div>
  );
};

export default AdminLayout; 