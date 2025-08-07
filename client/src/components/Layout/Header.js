import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiSearch, FiShoppingCart, FiHeart, FiUser, FiMenu, FiX } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';

const Header = ({ user, isAuthenticated, isAdmin, cartCount, wishlistCount, onMobileMenuToggle }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="bg-white shadow-soft sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-accent-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">C</span>
            </div>
            <span className="text-xl font-display font-bold text-gradient">Clothica</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-secondary-700 hover:text-primary-500 font-medium transition-colors">
              Home
            </Link>
            <Link to="/shop" className="text-secondary-700 hover:text-primary-500 font-medium transition-colors">
              Shop
            </Link>
            <div className="relative group">
              <button className="text-secondary-700 hover:text-primary-500 font-medium transition-colors">
                Categories
              </button>
              <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-large opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                <div className="py-2">
                  <Link to="/shop?category=men" className="block px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-50">
                    Men's Clothing
                  </Link>
                  <Link to="/shop?category=women" className="block px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-50">
                    Women's Clothing
                  </Link>
                  <Link to="/shop?category=kids" className="block px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-50">
                    Kids' Clothing
                  </Link>
                  <Link to="/shop?category=accessories" className="block px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-50">
                    Accessories
                  </Link>
                  <Link to="/shop?category=shoes" className="block px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-50">
                    Shoes
                  </Link>
                </div>
              </div>
            </div>
          </nav>

          {/* Search Bar */}
          <div className="hidden lg:flex flex-1 max-w-md mx-8">
            <form onSubmit={handleSearch} className="w-full">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400" />
              </div>
            </form>
          </div>

          {/* User Actions */}
          <div className="flex items-center space-x-4">
            {/* Search Icon for Mobile */}
            <button className="lg:hidden text-secondary-700 hover:text-primary-500">
              <FiSearch className="w-5 h-5" />
            </button>

            {/* Wishlist */}
            <Link to="/wishlist" className="relative text-secondary-700 hover:text-primary-500 transition-colors">
              <FiHeart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-accent-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart */}
            <Link to="/cart" className="relative text-secondary-700 hover:text-primary-500 transition-colors">
              <FiShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* User Menu */}
            {isAuthenticated ? (
              <div className="relative group">
                <button className="flex items-center space-x-2 text-secondary-700 hover:text-primary-500 transition-colors">
                  <FiUser className="w-5 h-5" />
                  <span className="hidden sm:block font-medium">{user?.name}</span>
                </button>
                <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-large opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <div className="py-2">
                    <Link to="/profile" className="block px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-50">
                      Profile
                    </Link>
                    <Link to="/orders" className="block px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-50">
                      Orders
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-error-600 hover:bg-error-50"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <Link to="/login" className="btn-primary">
                Sign In
              </Link>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={onMobileMenuToggle}
              className="md:hidden text-secondary-700 hover:text-primary-500"
            >
              <FiMenu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header; 