import React from 'react';
import { Link } from 'react-router-dom';
import { FiX, FiSearch, FiShoppingCart, FiHeart, FiUser, FiHome, FiGrid, FiStar } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';

const MobileMenu = ({ isOpen, onClose, user, isAuthenticated, isAdmin }) => {
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />
      
      {/* Menu */}
      <div className="absolute right-0 top-0 h-full w-80 bg-white shadow-large">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-secondary-200">
            <h2 className="text-lg font-semibold text-secondary-900">Menu</h2>
            <button
              onClick={onClose}
              className="text-secondary-500 hover:text-secondary-700"
            >
              <FiX className="w-6 h-6" />
            </button>
          </div>

          {/* Search */}
          <div className="p-4 border-b border-secondary-200">
            <div className="relative">
              <input
                type="text"
                placeholder="Search products..."
                className="w-full pl-10 pr-4 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 w-4 h-4" />
            </div>
          </div>

          {/* Navigation */}
          <div className="flex-1 overflow-y-auto">
            <nav className="p-4 space-y-4">
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-secondary-500 uppercase tracking-wider">
                  Main
                </h3>
                <Link
                  to="/"
                  onClick={onClose}
                  className="flex items-center space-x-3 p-3 rounded-lg text-secondary-700 hover:bg-secondary-50 hover:text-primary-500 transition-colors"
                >
                  <FiHome className="w-5 h-5" />
                  <span>Home</span>
                </Link>
                <Link
                  to="/shop"
                  onClick={onClose}
                  className="flex items-center space-x-3 p-3 rounded-lg text-secondary-700 hover:bg-secondary-50 hover:text-primary-500 transition-colors"
                >
                  <FiGrid className="w-5 h-5" />
                  <span>Shop</span>
                </Link>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-secondary-500 uppercase tracking-wider">
                  Categories
                </h3>
                <Link
                  to="/shop?category=men"
                  onClick={onClose}
                  className="block p-3 rounded-lg text-secondary-700 hover:bg-secondary-50 hover:text-primary-500 transition-colors"
                >
                  Men's Clothing
                </Link>
                <Link
                  to="/shop?category=women"
                  onClick={onClose}
                  className="block p-3 rounded-lg text-secondary-700 hover:bg-secondary-50 hover:text-primary-500 transition-colors"
                >
                  Women's Clothing
                </Link>
                <Link
                  to="/shop?category=kids"
                  onClick={onClose}
                  className="block p-3 rounded-lg text-secondary-700 hover:bg-secondary-50 hover:text-primary-500 transition-colors"
                >
                  Kids' Clothing
                </Link>
                <Link
                  to="/shop?category=accessories"
                  onClick={onClose}
                  className="block p-3 rounded-lg text-secondary-700 hover:bg-secondary-50 hover:text-primary-500 transition-colors"
                >
                  Accessories
                </Link>
                <Link
                  to="/shop?category=shoes"
                  onClick={onClose}
                  className="block p-3 rounded-lg text-secondary-700 hover:bg-secondary-50 hover:text-primary-500 transition-colors"
                >
                  Shoes
                </Link>
              </div>

              {isAuthenticated && (
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-secondary-500 uppercase tracking-wider">
                    Account
                  </h3>
                  <Link
                    to="/profile"
                    onClick={onClose}
                    className="flex items-center space-x-3 p-3 rounded-lg text-secondary-700 hover:bg-secondary-50 hover:text-primary-500 transition-colors"
                  >
                    <FiUser className="w-5 h-5" />
                    <span>Profile</span>
                  </Link>
                  <Link
                    to="/orders"
                    onClick={onClose}
                    className="flex items-center space-x-3 p-3 rounded-lg text-secondary-700 hover:bg-secondary-50 hover:text-primary-500 transition-colors"
                  >
                    <FiShoppingCart className="w-5 h-5" />
                    <span>Orders</span>
                  </Link>
                  <Link
                    to="/wishlist"
                    onClick={onClose}
                    className="flex items-center space-x-3 p-3 rounded-lg text-secondary-700 hover:bg-secondary-50 hover:text-primary-500 transition-colors"
                  >
                    <FiHeart className="w-5 h-5" />
                    <span>Wishlist</span>
                  </Link>
                  {isAdmin && (
                    <Link
                      to="/admin"
                      onClick={onClose}
                      className="flex items-center space-x-3 p-3 rounded-lg text-secondary-700 hover:bg-secondary-50 hover:text-primary-500 transition-colors"
                    >
                      <FiGrid className="w-5 h-5" />
                      <span>Admin Dashboard</span>
                    </Link>
                  )}
                </div>
              )}
            </nav>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-secondary-200">
            {isAuthenticated ? (
              <button
                onClick={handleLogout}
                className="w-full btn-primary"
              >
                Sign Out
              </button>
            ) : (
              <div className="space-y-2">
                <Link
                  to="/login"
                  onClick={onClose}
                  className="w-full btn-primary block text-center"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={onClose}
                  className="w-full btn-outline block text-center"
                >
                  Create Account
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileMenu; 
