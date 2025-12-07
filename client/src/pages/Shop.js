import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  FiSearch, 
  FiFilter, 
  FiGrid, 
  FiList, 
  FiHeart, 
  FiShoppingCart,
  FiStar,
  FiEye,
  FiClock,
  FiTag,
  FiTrendingUp,
  FiPackage,
  FiTruck,
  FiShield,
  FiAward
} from 'react-icons/fi';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import api from '../utils/api';
import Banner from '../components/Banner';

const Shop = () => {
  const { addToCart = () => {} } = useCart();
  const { addToWishlist, removeFromWishlist, wishlist = [] } = useWishlist();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/products/');
      const list = Array.isArray(response.data) ? response.data : [];
      const normalized = list.map((p) => ({
        ...p,
        _id: p._id || p.id,
        id: p.id || p._id,
        images: p.images || [],
        image: p.image || null,
        price: p.price || 0,
        stock: p.stock ?? 0
      }));
      setProducts(normalized);
      setTotalProducts(normalized.length);
      setCategories(['all']);
    } catch (error) {
      console.error('Error loading products:', error);
      setProducts([]);
      setTotalProducts(0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const handleAddToCart = (product) => {
    addToCart(product, 1);
  };

  const handleWishlistToggle = (product) => {
    const isInWishlist = wishlist && wishlist.some(item => item._id === product._id);
    if (isInWishlist) {
      removeFromWishlist(product._id);
    } else {
      addToWishlist(product);
    }
  };

  const isInWishlist = (productId) => {
    return wishlist && wishlist.some(item => item._id === productId);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 }
    }
  };

  if (loading && products.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F5F1E8] to-[#E6E6FA] flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-r from-[#D4AF37] to-[#E8B4B8] rounded-full flex items-center justify-center mx-auto mb-6 animate-spin">
            <FiPackage className="w-10 h-10 text-white" />
          </div>
          <p className="text-xl text-[#6C7A59] font-medium">Loading amazing products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F1E8] to-[#E6E6FA]">
      {/* Hero Section */}
      <section className="py-20 px-6 bg-gradient-to-br from-[#0F0F0F] via-[#1A1A1A] to-[#2A2A2A] relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-r from-[#D4AF37]/20 to-[#E8B4B8]/20 rounded-full blur-3xl animate-pulse-soft"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-r from-[#6C7A59]/20 to-[#9CAF88]/20 rounded-full blur-3xl animate-pulse-soft" style={{animationDelay: '2s'}}></div>
        </div>
        
        <motion.div 
          className="max-w-7xl mx-auto text-center relative z-10"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.h1 
            className="text-6xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#F5F1E8] via-[#D4AF37] to-[#6C7A59] mb-8"
            variants={itemVariants}
          >
            SHOP CLOTHICA
          </motion.h1>
          <motion.p 
            className="text-2xl text-[#E6E6FA] max-w-3xl mx-auto leading-relaxed mb-12"
            variants={itemVariants}
          >
            Discover our curated collection of premium fashion items
          </motion.p>
          
          {/* Search Bar */}
          <motion.div 
            className="max-w-2xl mx-auto"
            variants={itemVariants}
          >
            <div className="relative">
              <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 h-6 w-6 text-[#6C7A59]" />
              <input
                type="text"
                placeholder="Search for products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-12 py-4 bg-white/95 backdrop-blur-sm border-2 border-[#6C7A59]/30 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#6C7A59]/20 focus:border-[#6C7A59] text-lg"
              />
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Banner Section */}
      <section className="py-8 px-6">
        <div className="max-w-7xl mx-auto">
          <Banner 
            position="top" 
            page="shop" 
            autoPlay={true}
            interval={5000}
            showNavigation={true}
            showDots={true}
            height="400px"
          />
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 px-6">
        <motion.div 
          className="max-w-7xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.h2 
            className="text-4xl font-black text-[#1E1E1E] text-center mb-12"
            variants={itemVariants}
          >
            Shop by Category
          </motion.h2>
          
          <motion.div 
            className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6"
            variants={itemVariants}
          >
            <motion.button
              whileHover={{ scale: 1.05, y: -5 }}
              onClick={() => setSelectedCategory('all')}
              className={`p-6 rounded-3xl text-center transition-all duration-300 ${
                selectedCategory === 'all' 
                  ? 'bg-gradient-to-r from-[#6C7A59] to-[#9CAF88] text-white shadow-2xl' 
                  : 'bg-white/95 backdrop-blur-sm border border-[#6C7A59]/20 hover:border-[#6C7A59]/40'
              }`}
            >
              <FiGrid className="w-7 h-7 mx-auto mb-2 text-[#6C7A59]" />
              <div className="font-bold">All</div>
            </motion.button>
            
            {categories && categories.length > 0 && categories.map((category) => (
              <motion.button
                key={category._id}
                whileHover={{ scale: 1.05, y: -5 }}
                onClick={() => setSelectedCategory(category._id)}
                className={`p-6 rounded-3xl text-center transition-all duration-300 ${
                  selectedCategory === category._id 
                    ? 'bg-gradient-to-r from-[#D4AF37] to-[#E8B4B8] text-white shadow-2xl' 
                    : 'bg-white/95 backdrop-blur-sm border border-[#6C7A59]/20 hover:border-[#6C7A59]/40'
                }`}
              >
                <FiTag className="w-7 h-7 mx-auto mb-2 text-[#6C7A59]" />
                <div className="font-bold">{category.name}</div>
              </motion.button>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* Products Section */}
      <section className="py-16 px-6">
        <motion.div 
          className="max-w-7xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Sidebar Banner */}
          <div className="mb-8">
            <Banner 
              position="sidebar" 
              page="shop" 
              autoPlay={false}
              showNavigation={false}
              showDots={false}
              height="200px"
            />
          </div>
          {/* Controls */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
            <div className="flex items-center space-x-4">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 bg-white/95 backdrop-blur-sm border-2 border-[#6C7A59]/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6C7A59]/20"
              >
                <option value="newest">Newest First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-xl transition-all duration-300 ${
                    viewMode === 'grid' 
                      ? 'bg-[#6C7A59] text-white' 
                      : 'bg-white/95 text-[#6C7A59] hover:bg-[#6C7A59]/10'
                  }`}
                >
                  <FiGrid className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-xl transition-all duration-300 ${
                    viewMode === 'list' 
                      ? 'bg-[#6C7A59] text-white' 
                      : 'bg-white/95 text-[#6C7A59] hover:bg-[#6C7A59]/10'
                  }`}
                >
                  <FiList className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            <div className="text-[#6C7A59] font-medium">
              {loading ? 'Loading...' : `${totalProducts || 0} products found`}
            </div>
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="text-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6C7A59] mx-auto mb-4"></div>
              <p className="text-[#6C7A59] font-medium">Loading products...</p>
            </div>
          ) : products && products.length > 0 ? (
            /* Products Grid */
            <motion.div 
              className={viewMode === 'grid' 
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8' 
                : 'space-y-6'
              }
              variants={itemVariants}
            >
              {products.map((product, index) => (
              <motion.div
                key={product._id}
                variants={itemVariants}
                whileHover={{ scale: 1.02, y: -5 }}
                className={`bg-white/95 backdrop-blur-sm rounded-3xl shadow-xl border border-[#6C7A59]/20 overflow-hidden group hover:shadow-2xl transition-all duration-500 ${
                  viewMode === 'list' ? 'flex' : ''
                }`}
              >
                {/* Product Image */}
                <div className={`relative ${viewMode === 'list' ? 'w-48 h-48' : 'h-64'}`}>
                  <img
                    src={product.images?.[0] || '/placeholder-product.jpg'}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  
                  {/* Quick Actions Overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleWishlistToggle(product)}
                        className={`p-3 rounded-full transition-all duration-300 ${
                          isInWishlist(product._id)
                            ? 'bg-[#B35D5D] text-white'
                            : 'bg-white/90 text-[#6C7A59] hover:bg-white'
                        }`}
                      >
                        <FiHeart className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleAddToCart(product)}
                        className="p-3 bg-[#6C7A59] text-white rounded-full hover:bg-[#9CAF88] transition-all duration-300"
                      >
                        <FiShoppingCart className="h-5 w-5" />
                      </button>
                      <Link
                        to={`/product/${product._id}`}
                        className="p-3 bg-white/90 text-[#6C7A59] rounded-full hover:bg-white transition-all duration-300"
                      >
                        <FiEye className="h-5 w-5" />
                      </Link>
                    </div>
                  </div>
                  
                  {/* Badges */}
                  {product.discount > 0 && (
                    <div className="absolute top-3 left-3 bg-gradient-to-r from-[#B35D5D] to-[#E8B4B8] text-white px-3 py-1 rounded-full text-sm font-bold">
                      -{product.discount}%
                    </div>
                  )}
                  {product.isNew && (
                    <div className="absolute top-3 right-3 bg-gradient-to-r from-[#D4AF37] to-[#E8B4B8] text-white px-3 py-1 rounded-full text-sm font-bold">
                      NEW
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className={`p-6 ${viewMode === 'list' ? 'flex-1' : ''}`}>
                  <div className="mb-4">
                    <h3 className="text-xl font-black text-[#1E1E1E] mb-2 group-hover:text-[#6C7A59] transition-colors duration-300">
                      {product.name}
                    </h3>
                    <p className="text-[#6C7A59] text-sm line-clamp-2">
                      {product.description}
                    </p>
                  </div>

                  {/* Price and Rating */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      {product.discount > 0 ? (
                        <>
                          <span className="text-2xl font-black text-[#B35D5D]">
                            Rs. {Math.round(product.price * (1 - product.discount / 100))}
                          </span>
                          <span className="text-lg text-[#6C7A59] line-through">
                            Rs. {product.price}
                          </span>
                        </>
                      ) : (
                        <span className="text-2xl font-black text-[#6C7A59]">
                          Rs. {product.price}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      <FiStar className="h-4 w-4 text-[#D4AF37]" />
                      <span className="text-sm font-bold text-[#6C7A59]">
                        {product.rating || 4.5}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleAddToCart(product)}
                      className="flex-1 bg-gradient-to-r from-[#6C7A59] to-[#9CAF88] text-white font-bold py-3 px-4 rounded-2xl hover:from-[#9CAF88] hover:to-[#6C7A59] transition-all duration-300 transform hover:scale-105"
                    >
                      Add to Cart
                    </button>
                    <button
                      onClick={() => handleWishlistToggle(product)}
                      className={`p-3 rounded-2xl transition-all duration-300 ${
                        isInWishlist(product._id)
                          ? 'bg-[#B35D5D] text-white'
                          : 'bg-[#F5F1E8] text-[#6C7A59] hover:bg-[#6C7A59] hover:text-white'
                      }`}
                    >
                      <FiHeart className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
            </motion.div>
          ) : (
            /* Empty State */
            <div className="text-center py-16">
              <FiSearch className="h-16 w-16 text-[#6C7A59] mx-auto mb-4" />
              <h3 className="text-2xl font-black text-[#1E1E1E] mb-2">No products found</h3>
              <p className="text-[#6C7A59] mb-6">Try adjusting your search or filter criteria</p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                  setSortBy('newest');
                }}
                className="bg-gradient-to-r from-[#6C7A59] to-[#9CAF88] text-white font-bold py-3 px-6 rounded-2xl hover:from-[#9CAF88] hover:to-[#6C7A59] transition-all duration-300"
              >
                Clear Filters
              </button>
            </div>
          )}

          {/* Pagination */}
          {!loading && products && products.length > 0 && totalProducts > 12 && (
            <motion.div 
              className="flex justify-center mt-12"
              variants={itemVariants}
            >
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-white/95 backdrop-blur-sm border border-[#6C7A59]/30 rounded-xl text-[#6C7A59] hover:bg-[#6C7A59]/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                >
                  Previous
                </button>
                
                <span className="px-4 py-2 bg-[#6C7A59] text-white rounded-xl font-bold">
                  {currentPage}
                </span>
                
                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage * 12 >= totalProducts}
                  className="px-4 py-2 bg-white/95 backdrop-blur-sm border border-[#6C7A59]/30 rounded-xl text-[#6C7A59] hover:bg-[#6C7A59]/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                >
                  Next
                </button>
              </div>
            </motion.div>
          )}
        </motion.div>
      </section>

      {/* Middle Banner Section */}
      <section className="py-8 px-6">
        <div className="max-w-7xl mx-auto">
          <Banner 
            position="middle" 
            page="shop" 
            autoPlay={true}
            interval={6000}
            showNavigation={true}
            showDots={true}
            height="300px"
          />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-gradient-to-br from-[#F5F1E8] to-[#E6E6FA]">
        <motion.div 
          className="max-w-7xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.h2 
            className="text-4xl font-black text-[#1E1E1E] text-center mb-16"
            variants={itemVariants}
          >
            Why Choose Clothica?
          </motion.h2>
          
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
            variants={itemVariants}
          >
            {[
              { icon: FiPackage, title: 'Premium Quality', desc: 'Curated selection of high-end fashion items' },
              { icon: FiTruck, title: 'Fast Shipping', desc: 'Free shipping on orders above Rs. 10K' },
              { icon: FiShield, title: 'Secure Shopping', desc: '100% secure payment and buyer protection' },
              { icon: FiAward, title: 'Best Prices', desc: 'Competitive pricing with regular discounts' }
            ].map((feature, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.05, y: -5 }}
                className="text-center group"
              >
                <div className="w-16 h-16 bg-gradient-to-r from-[#6C7A59] to-[#9CAF88] rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-all duration-300">
                  <feature.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-black text-[#1E1E1E] mb-2">
                  {feature.title}
                </h3>
                <p className="text-[#6C7A59]">
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </section>
    </div>
  );
};

export default Shop; 
