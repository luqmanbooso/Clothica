import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FiFilter, FiGrid, FiList, FiStar, FiShoppingCart, FiHeart } from 'react-icons/fi';
import axios from 'axios';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);

  const { addToCart } = useCart();
  const { addToWishlist, isInWishlist } = useWishlist();

  // Get current filters from URL
  const category = searchParams.get('category') || '';
  const search = searchParams.get('search') || '';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const sort = searchParams.get('sort') || 'createdAt';
  const order = searchParams.get('order') || 'desc';

  useEffect(() => {
    fetchProducts();
  }, [category, search, minPrice, maxPrice, sort, order, currentPage]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage,
        limit: 12,
        sort,
        order
      });

      if (category) params.append('category', category);
      if (search) params.append('search', search);
      if (minPrice) params.append('minPrice', minPrice);
      if (maxPrice) params.append('maxPrice', maxPrice);

      const response = await axios.get(`/api/products?${params}`);
      setProducts(response.data.products);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    newParams.delete('page'); // Reset to first page when filtering
    setSearchParams(newParams);
    setCurrentPage(1);
  };

  const handleAddToCart = (product) => {
    addToCart(product, 1, product.sizes[0]?.name || 'M', product.colors[0]?.name || 'Default');
  };

  const handleWishlistToggle = (product) => {
    addToWishlist(product);
  };

  const categories = [
    { value: '', label: 'All Categories' },
    { value: 'men', label: "Men's Clothing" },
    { value: 'women', label: "Women's Clothing" },
    { value: 'kids', label: "Kids' Clothing" },
    { value: 'accessories', label: 'Accessories' },
    { value: 'shoes', label: 'Shoes' },
    { value: 'bags', label: 'Bags' }
  ];

  const sortOptions = [
    { value: 'createdAt-desc', label: 'Newest First' },
    { value: 'createdAt-asc', label: 'Oldest First' },
    { value: 'price-asc', label: 'Price: Low to High' },
    { value: 'price-desc', label: 'Price: High to Low' },
    { value: 'rating-desc', label: 'Highest Rated' },
    { value: 'name-asc', label: 'Name: A to Z' }
  ];

  return (
    <div className="min-h-screen bg-secondary-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-secondary-900 mb-2">
            {category ? categories.find(c => c.value === category)?.label : 'All Products'}
          </h1>
          <p className="text-secondary-600">
            Discover our amazing collection of clothing and accessories
          </p>
        </div>

        {/* Filters and Controls */}
        <div className="bg-white rounded-xl shadow-soft p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            {/* Search */}
            <div className="flex-1 max-w-md">
              <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="input-field"
              />
            </div>

            {/* Controls */}
            <div className="flex items-center space-x-4">
              {/* Filter Button */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="btn-secondary flex items-center space-x-2"
              >
                <FiFilter className="w-4 h-4" />
                <span>Filters</span>
              </button>

              {/* View Mode */}
              <div className="flex items-center space-x-2 bg-secondary-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'grid' ? 'bg-white shadow-soft' : 'text-secondary-600'
                  }`}
                >
                  <FiGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'list' ? 'bg-white shadow-soft' : 'text-secondary-600'
                  }`}
                >
                  <FiList className="w-4 h-4" />
                </button>
              </div>

              {/* Sort */}
              <select
                value={`${sort}-${order}`}
                onChange={(e) => {
                  const [newSort, newOrder] = e.target.value.split('-');
                  handleFilterChange('sort', newSort);
                  handleFilterChange('order', newOrder);
                }}
                className="input-field max-w-xs"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-secondary-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                    className="input-field"
                  >
                    {categories.map(cat => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Price Range */}
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Price Range
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={minPrice}
                      onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                      className="input-field"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={maxPrice}
                      onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                      className="input-field"
                    />
                  </div>
                </div>

                {/* Clear Filters */}
                <div className="flex items-end">
                  <button
                    onClick={() => {
                      setSearchParams({});
                      setCurrentPage(1);
                    }}
                    className="btn-outline w-full"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-secondary-400 text-6xl mb-4">🛍️</div>
            <h3 className="text-xl font-semibold text-secondary-900 mb-2">No products found</h3>
            <p className="text-secondary-600">Try adjusting your filters or search terms</p>
          </div>
        ) : (
          <>
            <div className={`grid gap-6 ${
              viewMode === 'grid' 
                ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                : 'grid-cols-1'
            }`}>
              {products.map((product) => (
                <div key={product._id} className={`product-card group ${
                  viewMode === 'list' ? 'flex' : ''
                }`}>
                  <div className={`relative overflow-hidden ${viewMode === 'list' ? 'w-48' : ''}`}>
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className={`object-cover group-hover:scale-105 transition-transform duration-300 ${
                        viewMode === 'list' ? 'h-48 w-48' : 'w-full h-64'
                      }`}
                    />
                    <div className="absolute top-4 right-4 space-y-2">
                      <button
                        onClick={() => handleWishlistToggle(product)}
                        className={`p-2 rounded-full shadow-soft transition-colors ${
                          isInWishlist(product._id)
                            ? 'bg-accent-500 text-white'
                            : 'bg-white text-secondary-600 hover:text-accent-500'
                        }`}
                      >
                        <FiHeart className="w-4 h-4" />
                      </button>
                    </div>
                    {product.discount > 0 && (
                      <div className="absolute top-4 left-4 bg-error-500 text-white px-2 py-1 rounded-full text-sm font-medium">
                        -{product.discount}%
                      </div>
                    )}
                  </div>
                  <div className={`p-4 ${viewMode === 'list' ? 'flex-1' : ''}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-secondary-500 font-medium">{product.brand}</span>
                      <div className="flex items-center space-x-1">
                        <FiStar className="w-4 h-4 text-warning-400 fill-current" />
                        <span className="text-sm text-secondary-600">{product.rating}</span>
                      </div>
                    </div>
                    <h3 className="font-semibold text-secondary-900 mb-2 line-clamp-2">
                      {product.name}
                    </h3>
                    <p className="text-sm text-secondary-600 mb-4 line-clamp-2">
                      {product.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {product.discount > 0 ? (
                          <>
                            <span className="text-lg font-bold text-primary-600">
                              ${(product.price * (1 - product.discount / 100)).toFixed(2)}
                            </span>
                            <span className="text-sm text-secondary-500 line-through">
                              ${product.price}
                            </span>
                          </>
                        ) : (
                          <span className="text-lg font-bold text-primary-600">
                            ${product.price}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => handleAddToCart(product)}
                        className="p-2 bg-primary-500 text-white rounded-full hover:bg-primary-600 transition-colors"
                      >
                        <FiShoppingCart className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-8">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-2 rounded-lg transition-colors ${
                        currentPage === page
                          ? 'bg-primary-500 text-white'
                          : 'bg-white text-secondary-700 hover:bg-secondary-100'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Shop; 