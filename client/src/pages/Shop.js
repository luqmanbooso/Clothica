import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { StarIcon, ShoppingBagIcon, HeartIcon, EyeIcon, FunnelIcon, Squares2X2Icon, ListBulletIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import axios from 'axios';
import { useWishlist } from '../contexts/WishlistContext';
import { useCart } from '../contexts/CartContext';
import toast from 'react-hot-toast';

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
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

  // Static categories - no CRUD needed
  const [categories, setCategories] = useState([
    { 
      id: 'all', 
      name: 'All Products', 
      icon: '🛍️',
      color: 'from-indigo-500 to-purple-500',
      count: 0
    },
    { 
      id: 'mens', 
      name: "Men's Fashion", 
      icon: '👔',
      color: 'from-blue-500 to-cyan-500',
      count: 0
    },
    { 
      id: 'womens', 
      name: "Women's Fashion", 
      icon: '👗',
      color: 'from-pink-500 to-rose-500',
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
      id: 'footwear', 
      name: 'Footwear', 
      icon: '👟',
      color: 'from-green-500 to-emerald-500',
      count: 0
    }
  ]);

  const priceRanges = [
    { id: 'all', name: 'All Prices' },
    { id: '0-25', name: 'Under $25' },
    { id: '25-50', name: '$25 - $50' },
    { id: '50-100', name: '$50 - $100' },
    { id: '100+', name: 'Over $100' }
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
    updateCategoryCounts();
  }, []);

  useEffect(() => {
    if (filters.category || filters.priceRange || filters.rating || filters.sortBy !== 'newest') {
      loadProducts();
    }
  }, [filters]);

  useEffect(() => {
    const category = searchParams.get('category');
    if (category) {
      setFilters(prev => ({ ...prev, category }));
    }
  }, [searchParams]);

  const loadProducts = async () => {
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
        if (min) params.minPrice = min;
        if (max) params.maxPrice = max;
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

      const response = await axios.get('/api/products', { params });
      setProducts(response.data.products);
      setTotalProducts(response.data.total);
    } catch (error) {
      console.error('Error loading products:', error);
      toast.error('Failed to load products');
      // Fallback to sample data
      setProducts([
        {
          _id: 1,
          name: "Premium Cotton T-Shirt",
          price: 29.99,
          originalPrice: 39.99,
          image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
          rating: 4.5,
          numReviews: 128,
          category: "mens",
          isNew: true,
          discount: 25,
          colors: ['Black', 'White', 'Navy'],
          sizes: ['S', 'M', 'L', 'XL']
        },
        {
          _id: 2,
          name: "Classic Denim Jeans",
          price: 79.99,
          originalPrice: 99.99,
          image: "https://images.unsplash.com/photo-1542272604-787c3835535d?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
          rating: 4.8,
          numReviews: 256,
          category: "mens",
          isNew: false,
          discount: 20,
          colors: ['Blue', 'Black'],
          sizes: ['30', '32', '34', '36']
        },
        {
          _id: 3,
          name: "Summer Dress Collection",
          price: 59.99,
          originalPrice: 79.99,
          image: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
          rating: 4.6,
          numReviews: 189,
          category: "womens",
          isNew: true,
          discount: 25,
          colors: ['Pink', 'Blue', 'White'],
          sizes: ['XS', 'S', 'M', 'L']
        },
        {
          _id: 4,
          name: "Casual Sneakers",
          price: 89.99,
          originalPrice: 119.99,
          image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
          rating: 4.7,
          numReviews: 342,
          category: "footwear",
          isNew: false,
          discount: 25,
          colors: ['White', 'Black', 'Gray'],
          sizes: ['7', '8', '9', '10', '11']
        },
        {
          _id: 5,
          name: "Leather Handbag",
          price: 129.99,
          originalPrice: 159.99,
          image: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
          rating: 4.9,
          numReviews: 89,
          category: "accessories",
          isNew: true,
          discount: 19,
          colors: ['Brown', 'Black'],
          sizes: ['One Size']
        },
        {
          _id: 6,
          name: "Formal Shirt",
          price: 49.99,
          originalPrice: 69.99,
          image: "https://images.unsplash.com/photo-1516257984-b1b4f7074865?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
          rating: 4.4,
          numReviews: 156,
          category: "mens",
          isNew: false,
          discount: 29,
          colors: ['White', 'Blue', 'Pink'],
          sizes: ['S', 'M', 'L', 'XL']
        },
        {
          _id: 7,
          name: "Designer Sunglasses",
          price: 89.99,
          originalPrice: 129.99,
          image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
          rating: 4.3,
          numReviews: 78,
          category: "accessories",
          isNew: true,
          discount: 31,
          colors: ['Black', 'Brown', 'Silver'],
          sizes: ['One Size']
        },
        {
          _id: 8,
          name: "Athletic Shorts",
          price: 34.99,
          originalPrice: 49.99,
          image: "https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
          rating: 4.6,
          numReviews: 203,
          category: "mens",
          isNew: false,
          discount: 30,
          colors: ['Black', 'Gray', 'Blue'],
          sizes: ['S', 'M', 'L', 'XL']
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const updateCategoryCounts = async () => {
    try {
      const response = await axios.get('/api/products/categories');
      const categoryCounts = response.data;
      
      setCategories(prev => prev.map(cat => ({
        ...cat,
        count: categoryCounts[cat.id] || 0
      })));
    } catch (error) {
      console.error('Error loading category counts:', error);
      // Keep the default counts if API fails
    }
  };

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
  };

  const handleAddToWishlist = (product) => {
    addToWishlist(product);
  };

  const handleAddToCart = (product) => {
    addToCart(product, 1);
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
    <div className="group">
      <div className="relative overflow-hidden rounded-lg bg-white shadow-sm hover:shadow-lg transition-all duration-300">
        {/* Product Image */}
        <div className="aspect-square overflow-hidden">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          />
        </div>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {product.isNew && (
            <span className="inline-block px-2 py-1 bg-blue-600 text-white text-xs font-semibold rounded">
              NEW
            </span>
          )}
          {product.discount && (
            <span className="inline-block px-2 py-1 bg-red-600 text-white text-xs font-semibold rounded">
              -{product.discount}%
            </span>
          )}
        </div>

        {/* Quick Actions */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button className="p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors">
            <HeartIcon className="h-5 w-5 text-gray-600" />
          </button>
          <Link to={`/product/${product._id}`} className="p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors">
            <EyeIcon className="h-5 w-5 text-gray-600" />
          </Link>
        </div>

        {/* Add to Cart Button */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button className="w-full flex items-center justify-center px-4 py-2 bg-white text-gray-900 font-semibold rounded-lg hover:bg-gray-100 transition-colors">
            <ShoppingBagIcon className="h-5 w-5 mr-2" />
            Add to Cart
          </button>
        </div>
      </div>

      {/* Product Info */}
      <div className="mt-4">
        <Link to={`/product/${product._id}`} className="block">
          <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-[#6C7A59] transition-colors">
            {product.name}
          </h3>
        </Link>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <span className="text-lg font-bold text-gray-900">
              ${product.price}
            </span>
            {product.originalPrice && (
              <span className="text-sm text-gray-500 line-through">
                ${product.originalPrice}
              </span>
            )}
          </div>
          <div className="flex items-center">
            {renderStars(product.rating)}
            <span className="ml-1 text-sm text-gray-500">
              ({product.numReviews})
            </span>
          </div>
        </div>
        
        {/* Color and Size Options */}
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>{product.colors.length} colors</span>
          <span>{product.sizes.length} sizes</span>
        </div>
      </div>
    </div>
  );

  const ProductListItem = ({ product }) => (
    <div className="group bg-white rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 p-4">
      <div className="flex gap-4">
        {/* Product Image */}
        <div className="relative w-32 h-32 flex-shrink-0">
          <img
            src={product.image}
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
            {product.discount && (
              <span className="inline-block px-1 py-0.5 bg-red-600 text-white text-xs font-semibold rounded">
                -{product.discount}%
              </span>
            )}
          </div>
        </div>

        {/* Product Details */}
        <div className="flex-1">
          <Link to={`/product/${product._id}`} className="block">
            <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-[#6C7A59] transition-colors">
              {product.name}
            </h3>
          </Link>
          
          <div className="flex items-center mb-2">
            {renderStars(product.rating)}
            <span className="ml-2 text-sm text-gray-500">
              ({product.numReviews} reviews)
            </span>
          </div>

          <p className="text-sm text-gray-600 mb-3">
            Available in {product.colors.length} colors and {product.sizes.length} sizes
          </p>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-xl font-bold text-gray-900">
                ${product.price}
              </span>
              {product.originalPrice && (
                <span className="text-sm text-gray-500 line-through">
                  ${product.originalPrice}
                </span>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <HeartIcon className="h-5 w-5" />
              </button>
              <button className="flex items-center px-4 py-2 bg-[#6C7A59] text-white font-semibold rounded-lg hover:bg-[#5A6A4A] transition-colors">
                <ShoppingBagIcon className="h-5 w-5 mr-2" />
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
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
            <Link key={category.id} to={`/shop?category=${category.id}`}>
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