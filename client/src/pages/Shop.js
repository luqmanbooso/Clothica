import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { StarIcon, ShoppingBagIcon, HeartIcon, EyeIcon, FunnelIcon, Squares2X2Icon, ListBulletIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import api from '../utils/api';
import { useWishlist } from '../contexts/WishlistContext';
import { useCart } from '../contexts/CartContext';
import { useToast } from '../contexts/ToastContext';
import { motion } from 'framer-motion';

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    priceRange: '',
    rating: '',
    sortBy: 'newest'
  });
  const [totalProducts, setTotalProducts] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const { addToWishlist, isInWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { success, error, warning } = useToast();

  // Helper function to validate category
  const isValidCategory = (categoryId) => {
    return categories.some(cat => cat.id === categoryId);
  };

  const handleAddToWishlist = (product) => {
    addToWishlist(product);
    if (isInWishlist(product._id)) {
      success('Removed from wishlist');
    } else {
      success(`${product.name} added to wishlist!`);
    }
  };

  const handleAddToCart = async (product) => {
    const result = await addToCart(product);
    if (result.success) {
      success(result.message || `${product.name} added to cart!`);
    } else {
      error(result.message || 'Failed to add item to cart');
    }
  };

  // Categories will be loaded from API
  const [categories, setCategories] = useState([]);

  const priceRanges = [
    { id: 'all', name: 'All Prices' },
    { id: '0-1000', name: 'Under Rs. 1,000' },
    { id: '1000-5000', name: 'Rs. 1,000 - Rs. 5,000' },
    { id: '5000-10000', name: 'Rs. 5,000 - Rs. 10,000' },
    { id: '10000+', name: 'Over Rs. 10,000' }
  ];

  const sortOptions = [
    { id: 'newest', name: 'Newest First' },
    { id: 'price-low', name: 'Price: Low to High' },
    { id: 'price-high', name: 'Price: High to Low' },
    { id: 'rating', name: 'Highest Rated' },
    { id: 'popular', name: 'Most Popular' }
  ];

  useEffect(() => {
    loadProducts();
    loadCategories();
    updateCategoryCounts();
  }, []);

  useEffect(() => {
    // Handle initial load and URL parameters
    const category = searchParams.get('category');
    const priceRange = searchParams.get('priceRange');
    const rating = searchParams.get('rating');
    const sortBy = searchParams.get('sortBy');
    
    // Initialize filters from URL parameters
    const initialFilters = {
      category: category || '',
      priceRange: priceRange || '',
      rating: rating || '',
      sortBy: sortBy || 'newest'
    };
    
    setFilters(initialFilters);
  }, []); // Only run once on mount

  useEffect(() => {
    if (filters.category || filters.priceRange || filters.rating || filters.sortBy !== 'newest') {
      setCurrentPage(1); // Reset to first page when filters change
      loadProducts();
    }
  }, [filters]);

  useEffect(() => {
    const category = searchParams.get('category');
    if (category) {
      // Check if the category is valid before setting it
      if (isValidCategory(category)) {
        setFilters(prev => ({ ...prev, category }));
      } else {
        // If invalid category, clear the category filter and show all products
        setFilters(prev => ({ ...prev, category: '' }));
        // Remove the invalid category from URL and redirect to clean shop page
        const newSearchParams = new URLSearchParams(searchParams);
        newSearchParams.delete('category');
        setSearchParams(newSearchParams);
        // Show warning to user
        warning(`Invalid category "${category}" detected. Showing all products instead.`);
      }
    } else {
      // If no category in URL, ensure filters are cleared
      setFilters(prev => ({ ...prev, category: '' }));
    }
  }, [searchParams, categories]);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        limit: 12,
        ...filters
      };

      // Add search query if present
      const search = searchParams.get('search');
      if (search) {
        params.search = search;
      }

      // Add price range filtering
      if (filters.priceRange && filters.priceRange !== 'all') {
        const [min, max] = filters.priceRange.split('-');
        if (min) params.minPrice = parseInt(min);
        if (max && max !== '+') params.maxPrice = parseInt(max);
      }

      // Add sorting
      if (filters.sortBy !== 'newest') {
        switch (filters.sortBy) {
          case 'price-low':
            params.sort = 'price';
            params.order = 'asc';
            break;
          case 'price-high':
            params.sort = 'price';
            params.order = 'desc';
            break;
          case 'rating':
            params.sort = 'rating';
            params.order = 'desc';
            break;
          case 'popular':
            params.sort = 'numReviews';
            params.order = 'desc';
            break;
          default:
            params.sort = 'createdAt';
            params.order = 'desc';
        }
      }

      const response = await api.get('/api/products', { params });
      setProducts(response.data.products);
      setTotalProducts(response.data.total);
      
      // If no products found and category filter is applied, try without category filter
      if (response.data.products.length === 0 && filters.category && filters.category !== 'all') {
        const fallbackParams = { ...params };
        delete fallbackParams.category;
        const fallbackResponse = await api.get('/api/products', { params: fallbackParams });
        setProducts(fallbackResponse.data.products);
        setTotalProducts(fallbackResponse.data.total);
        // Clear the category filter since it's not working
        setFilters(prev => ({ ...prev, category: '' }));
        warning(`No products found in "${filters.category}" category. Showing all products instead.`);
      }
      
      // If still no products found, show helpful message
      if (response.data.products.length === 0) {
        // Don't show error, just log it - this is normal when filters are too restrictive
      }
    } catch (error) {
      console.error('Error loading products:', error);
      // Don't show error toast for product loading failures - this is normal when filters are restrictive
      // Fallback to empty array instead of hardcoded data
      setProducts([]);
      setTotalProducts(0);

    } finally {
      setLoading(false);
    }
  }, [currentPage, filters, searchParams, warning]);

  const loadCategories = useCallback(async () => {
    try {
      // Use the public categories endpoint instead of admin
      const response = await api.get('/api/products/categories');
      const categoryData = response.data;
      
      // Transform the category data to match our component structure
      const loadedCategories = Object.keys(categoryData)
        .filter(categoryKey => categoryKey !== 'all') // Exclude 'all' as we'll handle it separately
        .map(categoryKey => ({
          id: categoryKey,
          name: categoryKey.charAt(0).toUpperCase() + categoryKey.slice(1), // Capitalize first letter
          icon: getCategoryIcon(categoryKey),
          color: getCategoryColor(categoryKey),
          count: categoryData[categoryKey] || 0
        }));
      
      // Add "All Products" option with the correct count from backend
      const allCategories = [
        { 
          id: 'all', 
          name: 'All Products', 
          icon: '🛍️',
          color: 'from-indigo-500 to-purple-500',
          count: categoryData['all'] || 0
        },
        ...loadedCategories
      ];
      
      setCategories(allCategories);
    } catch (error) {
      console.error('Error loading categories:', error);
      // Fallback to basic categories if API fails
      setCategories([
        { 
          id: 'all', 
          name: 'All Products', 
          icon: '🛍️',
          color: 'from-indigo-500 to-purple-500',
          count: 0
        },
        { 
          id: 'men', 
          name: 'Men', 
          icon: '👔',
          color: 'from-blue-500 to-cyan-500',
          count: 0
        },
        { 
          id: 'women', 
          name: 'Women', 
          icon: '👗',
          color: 'from-pink-500 to-rose-500',
          count: 0
        },
        { 
          id: 'kids', 
          name: 'Kids', 
          icon: '👶',
          color: 'from-green-500 to-emerald-500',
          count: 0
        },
        { 
          id: 'accessories', 
          name: 'Accessories', 
          icon: '👜',
          color: 'from-yellow-500 to-orange-500',
          count: 0
        },
        { 
          id: 'shoes', 
          name: 'Shoes', 
          icon: '👟',
          color: 'from-purple-500 to-pink-500',
          count: 0
        },
        { 
          id: 'bags', 
          name: 'Bags', 
          icon: '👜',
          color: 'from-amber-500 to-orange-500',
          count: 0
        }
      ]);
    }
  }, []);

  const getCategoryIcon = (categoryName) => {
    const iconMap = {
      'men': '👔',
      'women': '👗',
      'kids': '👶',
      'accessories': '👜',
      'shoes': '👟',
      'bags': '👜'
    };
    return iconMap[categoryName] || '🛍️';
  };

  const getCategoryColor = (categoryName) => {
    const colorMap = {
      'men': 'from-blue-500 to-cyan-500',
      'women': 'from-pink-500 to-rose-500',
      'kids': 'from-green-500 to-emerald-500',
      'accessories': 'from-yellow-500 to-orange-500',
      'shoes': 'from-purple-500 to-pink-500',
      'bags': 'from-amber-500 to-orange-500'
    };
    return colorMap[categoryName] || 'from-indigo-500 to-purple-500';
  };

  const updateCategoryCounts = useCallback(async () => {
    try {
      // We already have the counts from loadCategories, so we don't need to make another API call
      // This function is kept for backward compatibility but is no longer needed
      console.log('Category counts already loaded with categories');
    } catch (error) {
      console.error('Error updating category counts:', error);
    }
  }, []);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      priceRange: '',
      rating: '',
      sortBy: 'newest'
    });
    setCurrentPage(1);
    
    // Clear URL search parameters
    const newSearchParams = new URLSearchParams();
    setSearchParams(newSearchParams);
    
    // Reload products without filters
    loadProducts();
  };



  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<StarIconSolid key={i} className="h-4 w-4 text-yellow-400" />);
    }

    if (hasHalfStar) {
      stars.push(<StarIcon key={fullStars} className="h-4 w-4 text-yellow-400" />);
    }

    const remainingStars = 5 - Math.ceil(rating);
    for (let i = 0; i < remainingStars; i++) {
      stars.push(<StarIcon key={fullStars + hasHalfStar + i} className="h-4 w-4 text-gray-300" />);
    }

    return stars;
  };

  const ProductCard = ({ product }) => (
    <Link to={`/product/${product._id}`} className="group block">
      <div className="relative overflow-hidden rounded-lg bg-white shadow-sm hover:shadow-lg transition-all duration-300">
        {/* Product Image */}
        <div className="aspect-square overflow-hidden">
          <img
            src={product.images?.[0] || product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 group-hover:brightness-75 transition-all duration-300"
          />
        </div>
      
      {/* Badges */}
      <div className="absolute top-3 left-3 flex flex-col gap-2">
        {product.isNew && (
          <span className="inline-block px-2 py-1 bg-blue-600 text-white text-xs font-semibold rounded">
            NEW
          </span>
        )}

        {/* Spin Opportunity Badge */}
        {product.spinEligible && (
          <span className="inline-block px-2 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-semibold rounded animate-pulse">
            🎰 SPIN
          </span>
        )}
      </div>
      
      {/* Quick Actions */}
      <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleAddToWishlist(product); }}
          className={`p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors ${isInWishlist(product._id) ? 'text-red-500' : 'text-gray-600'}`}
          title={isInWishlist(product._id) ? 'Remove from Wishlist' : 'Add to Wishlist'}
        >
          <HeartIcon className={`h-5 w-5 ${isInWishlist(product._id) ? 'fill-current' : ''}`} />
        </button>
      </div>
      
      {/* Add to Cart Button */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 via-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleAddToCart(product); }}
          className="w-full flex items-center justify-center px-4 py-3 bg-white text-gray-900 font-semibold rounded-lg hover:bg-gray-100 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          <ShoppingBagIcon className="h-5 w-5 mr-2" />
          Add to Cart
        </button>
      </div>
    </div>
    
    {/* Product Info */}
    <div className="mt-4">
      <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-[#6C7A59] transition-colors">
        {product.name}
      </h3>
      
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <span className="text-lg font-bold text-gray-900">
            Rs. {product.price?.toLocaleString()}
          </span>

        </div>
        <div className="flex items-center">
          {renderStars(product.rating || 0)}
          <span className="ml-1 text-sm text-gray-500">
            ({product.numReviews || 0})
          </span>
        </div>
      </div>
      
      <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
        <span>{product.colors?.length || 0} colors</span>
        <span>{product.sizes?.length || 0} sizes</span>
      </div>
      
      {/* Special Offers Display */}
      {product.specialOffers && product.specialOffers.length > 0 && (
        <div className="mt-3 space-y-2">
          {product.specialOffers.slice(0, 2).map((offer, index) => (
            <motion.div
              key={offer._id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 * index }}
              className="relative overflow-hidden rounded-lg p-2 text-xs"
              style={{
                background: offer.displayGradient || `linear-gradient(135deg, ${offer.displayColor} 0%, ${offer.displayColor}dd 100%)`
              }}
            >
              <div className="text-white flex items-center justify-between">
                <div className="flex items-center space-x-1">
                  <span>{offer.displayIcon}</span>
                  <span className="font-medium">{offer.displayTitle || offer.name}</span>
                </div>
                <span className="font-bold">
                  {offer.discountType === 'percentage' && `${offer.discountValue}% OFF`}
                  {offer.discountType === 'fixed' && `LKR ${offer.discountValue} OFF`}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
      
      {/* Spin Opportunity Message */}
      {product.spinEligible && (
        <div className="mt-3 p-2 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg border border-purple-200">
          <div className="flex items-center space-x-2 text-xs text-purple-800">
            <span className="text-lg">🎰</span>
            <span>Unlock spin chances with this purchase!</span>
          </div>
        </div>
      )}
    </div>
  </Link>
);

  const ProductListItem = ({ product }) => (
    <Link to={`/product/${product._id}`} className="block">
    <div className="group bg-white rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 p-4">
      <div className="flex gap-4">
        {/* Product Image */}
        <div className="relative w-32 h-32 flex-shrink-0">
          <img
              src={product.images?.[0] || product.image}
            alt={product.name}
            className="w-full h-full object-cover rounded-lg"
          />
          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {product.isNew && (
              <span className="inline-block px-1 py-0.5 bg-blue-600 text-white text-xs font-semibold rounded">
                NEW
              </span>
            )}

          </div>
        </div>

        {/* Product Details */}
        <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-[#6C7A59] transition-colors">
              {product.name}
            </h3>
          
          <div className="flex items-center mb-2">
              {renderStars(product.rating || 0)}
            <span className="ml-2 text-sm text-gray-500">
                ({product.numReviews || 0} reviews)
            </span>
          </div>

          <p className="text-sm text-gray-600 mb-3">
              Available in {product.colors?.length || 0} colors and {product.sizes?.length || 0} sizes
          </p>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-xl font-bold text-gray-900">
                  Rs. {product.price?.toLocaleString()}
              </span>

            </div>

              <div className="flex items-center space-x-3">
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleAddToWishlist(product);
                  }}
                  className={`p-2 rounded-lg border-2 transition-all duration-200 ${
                    isInWishlist(product._id) 
                      ? 'border-red-300 bg-red-50 text-red-600 hover:bg-red-100' 
                      : 'border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-100'
                  }`}
                  title={isInWishlist(product._id) ? 'Remove from Wishlist' : 'Add to Wishlist'}
                >
                  <HeartIcon className={`h-4 w-4 ${isInWishlist(product._id) ? 'fill-current' : ''}`} />
              </button>
                
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleAddToCart(product);
                  }}
                  className="flex items-center px-4 py-2 bg-[#6C7A59] text-white font-semibold rounded-lg hover:bg-[#5A6A4A] transition-colors"
                >
                <ShoppingBagIcon className="h-5 w-5 mr-2" />
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    </Link>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Shop</h1>
          <p className="text-gray-600">
            Discover our curated collection of fashion items
          </p>
        </div>

        {/* Categories */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          {categories.map(category => (
            <div key={category.id}>
              {category.id === 'all' ? (
                <button
                  onClick={() => {
                    clearFilters();
                    navigate('/shop');
                  }}
                  className="w-full group relative overflow-hidden bg-gradient-to-br from-[#6C7A59] to-[#D6BFAF] p-6 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-white mb-1">{category.name}</h3>
                      <p className="text-white/80 text-sm">{category.count} products</p>
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors"></div>
                </button>
              ) : (
                <Link 
                  to={`/shop?category=${category.id}`}
                  onClick={(e) => {
                    // Prevent navigation if category is invalid
                    if (!isValidCategory(category.id)) {
                      e.preventDefault();
                      warning(`Invalid category "${category.id}" detected.`);
                      return;
                    }
                  }}
                >
              <div className="group relative overflow-hidden bg-gradient-to-br from-[#6C7A59] to-[#D6BFAF] p-6 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-white mb-1">{category.name}</h3>
                    <p className="text-white/80 text-sm">{category.count} products</p>
                  </div>
                </div>
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors"></div>
              </div>
            </Link>
              )}
            </div>
          ))}
            </div>

        {/* Filters and Sort */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Mobile Filter Toggle */}
            <div className="lg:hidden">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <FunnelIcon className="h-5 w-5 mr-2" />
                Filters
                <ChevronDownIcon className={`h-4 w-4 ml-2 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                </button>
              </div>

            {/* Desktop Filters */}
            <div className="hidden lg:flex items-center space-x-6">

              {/* Price Range Filter */}
              <div className="relative">
              <select
                  value={filters.priceRange}
                  onChange={(e) => handleFilterChange('priceRange', e.target.value)}
                  className="appearance-none px-4 py-2 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#6C7A59] focus:border-[#6C7A59]"
                >
                  {priceRanges.map(range => (
                    <option key={range.id} value={range.id}>
                      {range.name}
                  </option>
                ))}
              </select>
          </div>

              {/* Sort By */}
              <div className="relative">
                  <select
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  className="appearance-none px-4 py-2 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#6C7A59] focus:border-[#6C7A59]"
                >
                  {sortOptions.map(option => (
                    <option key={option.id} value={option.id}>
                      {option.name}
                      </option>
                    ))}
                  </select>
                </div>

              <button
                onClick={clearFilters}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Clear All
              </button>
                </div>

            {/* View Mode Toggle */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'grid' ? 'bg-[#6C7A59]/10 text-[#6C7A59]' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <Squares2X2Icon className="h-5 w-5" />
              </button>
                  <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'list' ? 'bg-[#6C7A59]/10 text-[#6C7A59]' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <ListBulletIcon className="h-5 w-5" />
                  </button>
            </div>
          </div>

          {/* Mobile Filters */}
          {showFilters && (
            <div className="lg:hidden mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price Range</label>
                  <select
                    value={filters.priceRange}
                    onChange={(e) => handleFilterChange('priceRange', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#6C7A59] focus:border-[#6C7A59]"
                  >
                    {priceRanges.map(range => (
                      <option key={range.id} value={range.id}>
                        {range.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Active Filters Indicator */}
        {(filters.category || filters.priceRange !== '' || filters.rating !== '' || filters.sortBy !== 'newest') ? (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-blue-800">Active Filters:</span>
                {filters.category && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Category: {categories.find(cat => cat.id === filters.category)?.name || filters.category}
                    <button
                      onClick={() => handleFilterChange('category', '')}
                      className="ml-1.5 text-blue-400 hover:text-blue-600"
                    >
                      ×
                    </button>
                  </span>
                )}
                {filters.priceRange && filters.priceRange !== 'all' && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Price: {priceRanges.find(range => range.id === filters.priceRange)?.name || filters.priceRange}
                    <button
                      onClick={() => handleFilterChange('priceRange', 'all')}
                      className="ml-1.5 text-blue-400 hover:text-blue-600"
                    >
                      ×
                    </button>
                  </span>
                )}
                {filters.rating && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Rating: {filters.rating}+ stars
                    <button
                      onClick={() => handleFilterChange('rating', '')}
                      className="ml-1.5 text-blue-400 hover:text-blue-600"
                    >
                      ×
                    </button>
                  </span>
                )}
                {filters.sortBy !== 'newest' && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Sort: {sortOptions.find(option => option.id === filters.sortBy)?.name || filters.sortBy}
                    <button
                      onClick={() => handleFilterChange('sortBy', 'newest')}
                      className="ml-1.5 text-blue-400 hover:text-blue-600"
                    >
                      ×
                    </button>
                  </span>
                )}
              </div>
              <button
                onClick={clearFilters}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Clear All
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-center">
              <span className="text-sm font-medium text-green-800">
                🎯 Showing all products - No filters applied
              </span>
            </div>
          </div>
        )}

        {/* Products Grid/List */}
        {loading ? (
          <div className={`grid gap-6 ${
            viewMode === 'grid' 
              ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
              : 'grid-cols-1'
          }`}>
            {[...Array(6)].map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="bg-gray-200 aspect-square rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
            ))}
          </div>
        ) : (
            <div className={`grid gap-6 ${
              viewMode === 'grid' 
              ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                : 'grid-cols-1'
            }`}>
            {(Array.isArray(products) ? products : []).map(product => (
              viewMode === 'grid' ? (
                <ProductCard key={product._id} product={product} />
              ) : (
                <ProductListItem key={product._id} product={product} />
              )
              ))}
            </div>
        )}

        {/* No Results */}
        {!loading && (!Array.isArray(products) || products.length === 0) && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-600 mb-4">Try adjusting your filters or search criteria</p>
                  <button
              onClick={clearFilters}
              className="px-4 py-2 bg-[#6C7A59] text-white font-semibold rounded-lg hover:bg-[#5A6A4A] transition-colors"
            >
              Clear Filters
                  </button>
                </div>
        )}
      </div>
    </div>
  );
};

export default Shop; 