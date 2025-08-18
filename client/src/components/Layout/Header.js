import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  MagnifyingGlassIcon, 
  ShoppingBagIcon, 
  HeartIcon, 
  UserIcon, 
  Bars3Icon, 
  XMarkIcon,
  SparklesIcon,
  StarIcon,
  TruckIcon,
  ShieldCheckIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';
import { 
  ShoppingBagIcon as ShoppingBagSolid,
  HeartIcon as HeartSolid
} from '@heroicons/react/24/solid';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { useWishlist } from '../../contexts/WishlistContext';
import LoyaltyBadge from '../Loyalty/LoyaltyBadge';
import NotificationBell from '../NotificationBell';
import api from '../../utils/api';

const Header = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { getCartCount } = useCart();
  const { wishlist } = useWishlist();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [categoryCounts, setCategoryCounts] = useState({
    all: 0,
    mens: 0,
    womens: 0,
    accessories: 0,
    footwear: 0
  });

  const [showTopBanner, setShowTopBanner] = useState(true);

  const cartCount = getCartCount();
  const wishlistCount = wishlist.length;

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch category counts only when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchCategoryCounts();
    }
  }, [isAuthenticated]);

  const fetchCategoryCounts = async () => {
    try {
      const response = await api.get('/api/products/categories');
      setCategoryCounts(response.data);
    } catch (error) {
      console.error('Error fetching category counts:', error);
      // Fallback to default counts
      setCategoryCounts({
        all: 8,
        men: 3,
        women: 1,
        kids: 0,
        accessories: 2,
        shoes: 1,
        bags: 1
      });
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleCloseBanner = () => {
    setShowTopBanner(false);
  };

  const isActive = (path) => location.pathname === path;



  return (
    <>
      {/* Top Banner */}
      {!isAdmin && showTopBanner && (
        <div className="bg-gradient-to-r from-[#6C7A59] via-[#5A6A4A] to-[#D6BFAF] text-white text-sm py-2 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <TruckIcon className="w-4 h-4" />
                <span>Free shipping on orders over $50</span>
              </div>
              <div className="hidden sm:flex items-center space-x-2">
                <ShieldCheckIcon className="w-4 h-4" />
                <span>30-day returns</span>
              </div>
              <div className="hidden md:flex items-center space-x-2">
                <StarIcon className="w-4 h-4" />
                <span>Premium quality</span>
              </div>
            </div>
            <div className="flex items-center space-x-4 text-xs">
              <Link to="/contact" className="hover:text-[#D6BFAF] transition-colors">Contact</Link>
              <Link to="/shipping" className="hover:text-[#D6BFAF] transition-colors">Shipping</Link>
              <Link to="/terms" className="hover:text-[#D6BFAF] transition-colors">Terms</Link>
            </div>
          </div>
          
          {/* Close Button */}
          <button
            onClick={handleCloseBanner}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 p-1 hover:bg-white/20 rounded-full transition-colors"
            aria-label="Close banner"
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Header */}
      <header className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-100' 
          : 'bg-white'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-[#6C7A59] to-[#D6BFAF] rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                  <span className="text-white font-bold text-xl">C</span>
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-[#D6BFAF] to-[#6C7A59] rounded-full flex items-center justify-center">
                  <SparklesIcon className="w-2 h-2 text-white" />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-display font-bold bg-gradient-to-r from-[#6C7A59] to-[#D6BFAF] bg-clip-text text-transparent">
                  Clothica
                </span>
                <span className="text-xs text-gray-500 -mt-1">Premium Fashion</span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            {!isAdmin && (
              <nav className="hidden lg:flex items-center space-x-6">
                {/* Shop Dropdown */}
                <div className="relative group">
                  <button className={`relative px-3 py-2 font-medium transition-all duration-200 flex items-center space-x-1 ${
                    isActive('/shop') 
                      ? 'text-[#6C7A59]' 
                      : 'text-gray-700 hover:text-[#6C7A59]'
                  }`}>
                    <span>Shop</span>
                    <ChevronDownIcon className="w-4 h-4 transition-transform group-hover:rotate-180" />
                    {isActive('/shop') && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#6C7A59] to-[#D6BFAF]"></div>
                    )}
                  </button>
                
                {/* Shop Dropdown Menu */}
                <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <div className="p-4">
                    <div className="mb-4">
                      <Link 
                        to="/shop" 
                        className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <div>
                            <div className="font-semibold text-gray-900">All Products</div>
                            <div className="text-sm text-gray-500">{categoryCounts.all} products</div>
                          </div>
                        </div>
                      </Link>
                    </div>
                    
                    <div className="space-y-2">
                      <Link 
                        to="/shop?category=men" 
                        className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <div>
                            <div className="font-semibold text-gray-900">Men's Fashion</div>
                            <div className="text-sm text-gray-500">{categoryCounts.men} products</div>
                          </div>
                        </div>
                      </Link>
                      
                      <Link 
                        to="/shop?category=women" 
                        className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <div>
                            <div className="font-semibold text-gray-900">Women's Fashion</div>
                            <div className="text-sm text-gray-500">{categoryCounts.women} products</div>
                          </div>
                        </div>
                      </Link>
                      
                      <Link 
                        to="/shop?category=accessories" 
                        className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <div>
                            <div className="font-semibold text-gray-900">Accessories</div>
                            <div className="text-sm text-gray-500">{categoryCounts.accessories} products</div>
                          </div>
                        </div>
                      </Link>
                      
                      <Link 
                        to="/shop?category=shoes" 
                        className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <div>
                            <div className="font-semibold text-gray-900">Shoes</div>
                            <div className="text-sm text-gray-500">{categoryCounts.shoes} products</div>
                          </div>
                        </div>
                      </Link>
                      
                      <Link 
                        to="/shop?category=kids" 
                        className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <div>
                            <div className="font-semibold text-gray-900">Kids</div>
                            <div className="text-sm text-gray-500">{categoryCounts.kids} products</div>
                          </div>
                        </div>
                      </Link>
                      
                      <Link 
                        to="/shop?category=bags" 
                        className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <div>
                            <div className="font-semibold text-gray-900">Bags</div>
                            <div className="text-sm text-gray-500">{categoryCounts.bags} products</div>
                          </div>
                        </div>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              <Link 
                to="/about" 
                className={`relative px-3 py-2 font-medium transition-all duration-200 ${
                  isActive('/about') 
                    ? 'text-[#6C7A59]' 
                    : 'text-gray-700 hover:text-[#6C7A59]'
                }`}
              >
                About
                {isActive('/about') && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#6C7A59] to-[#D6BFAF]"></div>
                )}
              </Link>

              <Link 
                to="/contact" 
                className={`relative px-3 py-2 font-medium transition-all duration-200 ${
                  isActive('/contact') 
                    ? 'text-[#6C7A59]' 
                    : 'text-gray-700 hover:text-[#6C7A59]'
                }`}
              >
                Contact
                {isActive('/contact') && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#6C7A59] to-[#D6BFAF]"></div>
                )}
              </Link>
            </nav>
            )}

            {/* Search Bar */}
            {!isAdmin && (
              <div className="hidden lg:flex flex-1 max-w-md mx-8">
              <form onSubmit={handleSearch} className="w-full">
                <div className="relative group">
                  <input
                    type="text"
                    placeholder="Search for products, brands, and more..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setIsSearchFocused(true)}
                    onBlur={() => setIsSearchFocused(false)}
                    className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#6C7A59] focus:border-transparent transition-all duration-200 group-hover:border-[#6C7A59]"
                  />
                  <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  {isSearchFocused && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 p-4">
                      <div className="text-sm text-gray-500">Popular searches:</div>
                      <div className="mt-2 space-y-2">
                        {['Summer dresses', 'Denim jackets', 'Sneakers', 'Accessories'].map((term) => (
                          <button
                            key={term}
                            onClick={() => {
                              setSearchQuery(term);
                              navigate(`/shop?search=${encodeURIComponent(term)}`);
                            }}
                            className="block w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 text-gray-700 hover:text-[#6C7A59] transition-colors"
                          >
                            {term}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </form>
            </div>
            )}

            {/* User Actions */}
            <div className="flex items-center space-x-4">
              {/* Loyalty Badge */}
              {!isAdmin && <LoyaltyBadge />}
              
              {/* Search Icon for Mobile */}
              {!isAdmin && (
                <button className="lg:hidden text-gray-700 hover:text-[#6C7A59] transition-colors">
                  <MagnifyingGlassIcon className="w-6 h-6" />
                </button>
              )}

              {/* Wishlist */}
              {!isAdmin && (
                <Link to="/wishlist" className="relative group">
                <div className="p-2 rounded-xl group-hover:bg-gray-50 transition-all duration-200">
                  {wishlistCount > 0 ? (
                    <HeartSolid className="w-6 h-6 text-red-500" />
                  ) : (
                    <HeartIcon className="w-6 h-6 text-gray-700 group-hover:text-red-500 transition-colors" />
                  )}
                  {wishlistCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                      {wishlistCount}
                    </span>
                  )}
                </div>
              </Link>
              )}

              {/* Cart */}
              {!isAdmin && (
                <Link to="/cart" className="relative group">
                <div className="p-2 rounded-xl group-hover:bg-gray-50 transition-all duration-200">
                  {cartCount > 0 ? (
                    <ShoppingBagSolid className="w-6 h-6 text-[#6C7A59]" />
                  ) : (
                    <ShoppingBagIcon className="w-6 h-6 text-gray-700 group-hover:text-[#6C7A59] transition-colors" />
                  )}
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-[#6C7A59] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                      {cartCount}
                    </span>
                  )}
                </div>
              </Link>
              )}

              {/* Notification Bell */}
              {isAuthenticated && (
                <NotificationBell />
              )}

              {/* User Menu */}
              {isAuthenticated ? (
                <div className="relative group">
                  <button className="flex items-center space-x-2 p-2 rounded-xl group-hover:bg-gray-50 transition-all duration-200">
                    <div className="w-8 h-8 bg-gradient-to-r from-[#6C7A59] to-[#D6BFAF] rounded-full flex items-center justify-center">
                      <UserIcon className="w-4 h-4 text-white" />
                    </div>
                    <span className="hidden sm:block font-medium text-gray-700">{user?.name}</span>
                  </button>
                  <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <div className="p-2">
                      <Link to="/profile" className="flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-gray-50 text-gray-700 hover:text-[#6C7A59] transition-colors">
                        <UserIcon className="w-5 h-5" />
                        <span>Profile</span>
                      </Link>
                      <Link to="/orders" className="flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-gray-50 text-gray-700 hover:text-[#6C7A59] transition-colors">
                        <ShoppingBagIcon className="w-5 h-5" />
                        <span>Orders</span>
                      </Link>
                      <Link to="/loyalty" className="flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-gray-50 text-gray-700 hover:text-[#6C7A59] transition-colors">
                        <StarIcon className="w-5 h-5" />
                        <span>Loyalty</span>
                      </Link>
                      <Link to="/reviews-issues" className="flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-gray-50 text-gray-700 hover:text-[#6C7A59] transition-colors">
                        <StarIcon className="w-5 h-5" />
                        <span>Reviews & Issues</span>
                      </Link>
                      {isAdmin && (
                        <Link to="/admin/dashboard" className="flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-gray-50 text-gray-700 hover:text-[#6C7A59] transition-colors">
                          <StarIcon className="w-5 h-5" />
                          <span>Admin Panel</span>
                        </Link>
                      )}
                      <div className="border-t border-gray-100 my-2"></div>
                      <button
                        onClick={handleLogout}
                        className="flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-red-50 text-red-600 w-full text-left transition-colors"
                      >
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <Link 
                  to="/login" 
                  className="bg-gradient-to-r from-[#6C7A59] to-[#D6BFAF] text-white px-6 py-2 rounded-xl font-medium hover:from-[#5A6A4A] hover:to-[#C4B09F] transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  Sign In
                </Link>
              )}

              {/* Mobile Menu Button */}
              {!isAdmin && (
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="lg:hidden p-2 rounded-xl hover:bg-gray-50 transition-all duration-200"
                >
                  {isMobileMenuOpen ? (
                    <XMarkIcon className="w-6 h-6 text-gray-700" />
                  ) : (
                    <Bars3Icon className="w-6 h-6 text-gray-700" />
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {!isAdmin && isMobileMenuOpen && (
          <div className="lg:hidden bg-white border-t border-gray-100">
            <div className="px-4 py-6 space-y-4">
              {/* Mobile Search */}
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6C7A59]"
                />
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              </form>

              {/* Mobile Navigation */}
              <nav className="space-y-2">
                {/* Mobile Shop Categories */}
                <div>
                  <div className="px-4 py-2 text-sm font-semibold text-gray-500 uppercase tracking-wider">Shop Categories</div>
                  <Link 
                    to="/shop" 
                    className="block px-4 py-3 rounded-xl transition-colors text-gray-700 hover:bg-gray-50"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <div className="flex items-center space-x-3">
                      <div>
                        <div className="font-medium">All Products</div>
                        <div className="text-sm text-gray-500">8 products</div>
                      </div>
                    </div>
                  </Link>
                  <Link 
                    to="/shop?category=mens" 
                    className="block px-4 py-3 rounded-xl transition-colors text-gray-700 hover:bg-gray-50"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <div className="flex items-center space-x-3">
                      <div>
                        <div className="font-medium">Men's Fashion</div>
                        <div className="text-sm text-gray-500">3 products</div>
                      </div>
                    </div>
                  </Link>
                  <Link 
                    to="/shop?category=womens" 
                    className="block px-4 py-3 rounded-xl transition-colors text-gray-700 hover:bg-gray-50"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <div className="flex items-center space-x-3">
                      <div>
                        <div className="font-medium">Women's Fashion</div>
                        <div className="text-sm text-gray-500">1 product</div>
                      </div>
                    </div>
                  </Link>
                  <Link 
                    to="/shop?category=accessories" 
                    className="block px-4 py-3 rounded-xl transition-colors text-gray-700 hover:bg-gray-50"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <div className="flex items-center space-x-3">
                      <div>
                        <div className="font-medium">Accessories</div>
                        <div className="text-sm text-gray-500">2 products</div>
                      </div>
                    </div>
                  </Link>
                  <Link 
                    to="/shop?category=footwear" 
                    className="block px-4 py-3 rounded-xl transition-colors text-gray-700 hover:bg-gray-50"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <div className="flex items-center space-x-3">
                      <div>
                        <div className="font-medium">Footwear</div>
                        <div className="text-sm text-gray-500">1 product</div>
                      </div>
                    </div>
                  </Link>
                </div>
                
                <Link 
                  to="/contact" 
                  className={`block px-4 py-3 rounded-xl transition-colors ${
                    isActive('/contact') ? 'bg-indigo-50 text-indigo-600' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Contact
                </Link>
              </nav>


            </div>
          </div>
        )}
      </header>
    </>
  );
};

export default Header; 