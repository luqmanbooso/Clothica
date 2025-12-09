import React, { useState, useEffect, useCallback } from 'react';
import {
  StarIcon,
  ShoppingBagIcon,
  HeartIcon,
  EyeIcon,
  StarIcon as StarIconSolid,
  ChevronLeftIcon,
  ChevronRightIcon,
  ShieldCheckIcon,
  ArrowPathIcon,
  TruckIcon,
  CheckCircleIcon,
  ShareIcon,
  PlusIcon,
  MinusIcon,
  HomeIcon,
  FaceFrownIcon,
  FireIcon,
  BoltIcon,
  SparklesIcon,
  BookOpenIcon,
  WrenchScrewdriverIcon,
  SwatchIcon,
  ArrowsPointingOutIcon,
  HashtagIcon,
  ChatBubbleLeftRightIcon,
  ChatBubbleLeftEllipsisIcon,
  InformationCircleIcon,
  CheckBadgeIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import {
  FiShoppingCart,
  FiHeart,
  FiShare2,
  FiStar,
  FiUsers,
  FiTruck,
  FiShield,
  FiRefreshCw,
  FiCheck,
  FiX,
  FiPlus,
  FiMinus,
  FiEye,
  FiZoomIn
} from 'react-icons/fi';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import api from '../utils/api';
import Banner from '../components/Banner';

const ProductDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { addToCart, getCartCount } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [showReviews, setShowReviews] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [validationErrors, setValidationErrors] = useState({});
  const [salesData, setSalesData] = useState(null);
  const [loadError, setLoadError] = useState(null);

  useEffect(() => {
    loadProduct();
    loadSalesData();
  }, [id, loadSalesData]);

  useEffect(() => {
    if (product) {
      loadRelatedProducts();
    }
  }, [product, id, loadRelatedProducts]);

  const loadProduct = useCallback(async () => {
    setLoading(true);
    try {
      console.log('Loading product with ID:', id);
      const response = await api.get(`/api/products/${id}`);
      const data = response.data || {};
      const normalized = {
        ...data,
        _id: data._id || data.id || id,
        id: data.id || data._id || id,
        images: data.images || [],
        image: data.image || data.images?.[0],
        price: data.price || 0,
        stock: data.stock ?? 0,
        rating: data.rating || 0,
        numReviews: data.numReviews || 0
      };
      setProduct(normalized);
      setSelectedColor('Default');
      setSelectedSize('Default');
    } catch (error) {
      console.error('Error loading product:', error);
      console.error('Error details:', error.response?.data || error.message);
      setLoadError('Failed to load product');
      setProduct(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const loadRelatedProducts = useCallback(async () => {
    try {
      const response = await api.get('/api/products/');
      const list = Array.isArray(response.data) ? response.data : [];
      const normalized = list
        .filter(p => (p.id || p._id || '').toString() !== id.toString())
        .slice(0, 4)
        .map((p) => ({
          ...p,
          _id: p._id || p.id,
          id: p.id || p._id,
          image: p.image || p.images?.[0],
          price: p.price || 0
        }));
      setRelatedProducts(normalized);
    } catch (error) {
      console.error('Error loading related products:', error);
      setRelatedProducts([]);
    }
  }, [id]);

  const loadSalesData = useCallback(async () => {
    setSalesData({ quantity: 0, total: 0, orders: 0 });
  }, []);

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<StarIconSolid key={i} className="h-5 w-5 text-yellow-400" />);
    }

    if (hasHalfStar) {
      stars.push(<StarIcon key={fullStars} className="h-5 w-5 text-yellow-400" />);
    }

    const remainingStars = 5 - Math.ceil(rating);
    for (let i = 0; i < remainingStars; i++) {
      stars.push(<StarIcon key={fullStars + hasHalfStar + i} className="h-5 w-5 text-gray-300" />);
    }

    return stars;
  };

  const handleAddToCart = async () => {
    const errors = {};
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    // Clear validation errors
    setValidationErrors({});

    const result = await addToCart(product, quantity, selectedSize, selectedColor);

    if (result.success) {
      setSuccessMessage(result.message || 'Added to cart successfully!');
      setShowSuccess(true);

      setTimeout(() => {
        setShowSuccess(false);
        setSuccessMessage('');
      }, 3000);
    } else {
      setValidationErrors({ general: result.message });
    }
  };

  const handleWishlist = () => {
    if (isInWishlist(product._id)) {
      removeFromWishlist(product._id);
      setSuccessMessage('Removed from wishlist');
    } else {
      addToWishlist(product);
      setSuccessMessage('Added to wishlist!');
    }

    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      setSuccessMessage('');
    }, 3000);
  };

  // Animation variants
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
      transition: { duration: 0.5 }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F5F1E8] via-[#E6E6FA] to-[#F0F8FF] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="animate-spin rounded-full h-20 w-20 border-4 border-[#6C7A59] border-t-transparent mx-auto mb-6"></div>
          <p className="text-[#D4AF37] font-bold text-xl">Loading Product...</p>
        </motion.div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F5F1E8] via-[#E6E6FA] to-[#F0F8FF] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <FaceFrownIcon className="h-20 w-20 mx-auto text-gray-400 mb-2" />
          <h2 className="text-3xl font-black text-[#1E1E1E] mb-4">Product not found</h2>
          <p className="text-[#D4AF37] mb-8 text-lg">The product you're looking for doesn't exist or has been removed.</p>
          <Link
            to="/shop"
            className="bg-gradient-to-r from-[#6C7A59] to-[#9CAF88] text-white font-bold py-4 px-8 rounded-2xl hover:from-[#9CAF88] hover:to-[#6C7A59] transition-all duration-300 transform hover:scale-105"
          >
            Continue Shopping
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-[#F5F1E8] via-[#E6E6FA] to-[#F0F8FF]"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Success Message */}
        <AnimatePresence>
          {showSuccess && (
            <motion.div
              initial={{ opacity: 0, x: 100, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 100, scale: 0.8 }}
              className="fixed top-20 right-4 bg-gradient-to-r from-[#6C7A59] to-[#9CAF88] text-white rounded-2xl p-6 flex items-center z-50 shadow-2xl border border-white/20 backdrop-blur-sm"
            >
              <FiCheck className="w-6 h-6 mr-3 text-[#D4AF37] animate-pulse" />
              <span className="font-bold text-lg">{successMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Enhanced Breadcrumb */}
        <motion.nav
          className="flex mb-8"
          aria-label="Breadcrumb"
          variants={itemVariants}
        >
          <ol className="flex items-center space-x-3 bg-white/90 backdrop-blur-sm px-6 py-3 rounded-2xl border border-[#6C7A59]/20 shadow-lg">
            <li>
              <Link
                to="/"
                className="text-[#6C7A59] hover:text-[#D4AF37] font-medium transition-all duration-300 hover:scale-105 transform flex items-center gap-1"
              >
                <HomeIcon className="h-5 w-5" /> Home
              </Link>
            </li>
            <li>
              <ChevronRightIcon className="h-5 w-5 text-[#D4AF37]" />
            </li>
            <li>
              <Link
                to="/shop"
                className="text-[#6C7A59] hover:text-[#D4AF37] font-medium transition-all duration-300 hover:scale-105 transform flex items-center gap-1"
              >
                <ShoppingBagIcon className="h-5 w-5" /> Shop
              </Link>
            </li>
            <li>
              <ChevronRightIcon className="h-5 w-5 text-[#D4AF37]" />
            </li>
            <li className="text-[#1E1E1E] font-black bg-gradient-to-r from-[#D4AF37] to-[#E8B4B8] bg-clip-text text-transparent">
              {product.name}
            </li>
          </ol>
        </motion.nav>

        {/* Product Page Banner */}
        <motion.div
          className="mb-8"
          variants={itemVariants}
        >
          <Banner
            position="top"
            page="product"
            autoPlay={true}
            interval={4000}
            showNavigation={true}
            showDots={true}
            height="250px"
          />
        </motion.div>

        <motion.div
          className="grid grid-cols-1 lg:grid-cols-3 gap-16"
          variants={containerVariants}
        >
          {/* Enhanced Product Images */}
          <motion.div
            className="space-y-6"
            variants={itemVariants}
          >
            {/* Main Image with Enhanced Styling */}
            <motion.div
              className="relative group"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              <div className="aspect-square bg-gradient-to-br from-[#F5F1E8] to-[#E6E6FA] rounded-3xl overflow-hidden shadow-2xl border-4 border-white/50 hover:border-[#D4AF37]/50 transition-all duration-500">
                <img
                  src={product.images?.[selectedImage] || "/placeholder-product.jpg"}
                  alt={product.name}
                  className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-700"
                />

                {/* Image Overlay Effects */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                {/* Quick Actions Overlay */}
                <motion.div
                  className="absolute top-4 right-4 flex flex-col gap-2"
                  initial={{ opacity: 0, x: 20 }}
                  whileHover={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <motion.button
                    onClick={handleWishlist}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className={`p-3 rounded-full shadow-lg transition-all duration-300 backdrop-blur-sm ${isInWishlist(product._id)
                        ? 'bg-[#E8B4B8] text-white border-2 border-white/30'
                        : 'bg-white/90 text-[#6C7A59] hover:bg-[#D4AF37] hover:text-white border-2 border-[#6C7A59]/20'
                      }`}
                  >
                    <FiHeart className="h-6 w-6" />
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-3 bg-white/90 text-[#6C7A59] rounded-full shadow-lg hover:bg-[#6C7A59] hover:text-white transition-all duration-300 backdrop-blur-sm border-2 border-[#6C7A59]/20"
                  >
                    <FiShare2 className="h-6 w-6" />
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-3 bg-white/90 text-[#6C7A59] rounded-full shadow-lg hover:bg-[#6C7A59] hover:text-white transition-all duration-300 backdrop-blur-sm border-2 border-[#6C7A59]/20"
                  >
                    <FiZoomIn className="h-6 w-6" />
                  </motion.button>
                </motion.div>

                {/* Product Badges */}
                <div className="absolute top-4 left-4 space-y-2">
                  {product.discount > 0 && (
                    <motion.div
                      className="bg-gradient-to-r from-[#D4AF37] to-[#E8B4B8] text-black font-bold px-4 py-2 rounded-full text-sm shadow-lg backdrop-blur-sm border border-white/30"
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <FireIcon className="h-5 w-5 inline mr-1" /> {product.discount}% OFF
                    </motion.div>
                  )}
                  {product.stock < 10 && product.stock > 0 && (
                    <motion.div
                      className="bg-gradient-to-r from-[#B35D5D] to-[#E8B4B8] text-white font-bold px-4 py-2 rounded-full text-sm shadow-lg backdrop-blur-sm border border-white/30"
                      animate={{ opacity: [1, 0.7, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <BoltIcon className="h-5 w-5 inline mr-1" /> Only {product.stock} Left!
                    </motion.div>
                  )}
                  {product.stock === 0 && (
                    <div className="bg-gradient-to-r from-gray-600 to-gray-800 text-white font-bold px-4 py-2 rounded-full text-sm shadow-lg backdrop-blur-sm border border-white/30">
                      <XCircleIcon className="h-5 w-5 inline mr-1" /> Out of Stock
                    </div>
                  )}
                  {product.rating >= 4.5 && (
                    <div className="bg-gradient-to-r from-[#6C7A59] to-[#9CAF88] text-white font-bold px-4 py-2 rounded-full text-sm shadow-lg backdrop-blur-sm border border-white/30">
                      <StarIconSolid className="h-5 w-5 inline mr-1" /> BEST SELLER
                    </div>
                  )}
                </div>

                {/* Navigation Arrows */}
                {product.images && product.images.length > 1 && (
                  <>
                    <motion.button
                      onClick={() => setSelectedImage((prev) => (prev - 1 + product.images.length) % product.images.length)}
                      whileHover={{ scale: 1.1, x: -2 }}
                      whileTap={{ scale: 0.9 }}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 p-3 bg-white/90 backdrop-blur-sm rounded-full hover:bg-[#D4AF37] hover:text-white transition-all duration-300 shadow-lg border-2 border-[#6C7A59]/20"
                    >
                      <ChevronLeftIcon className="h-6 w-6" />
                    </motion.button>
                    <motion.button
                      onClick={() => setSelectedImage((prev) => (prev + 1) % product.images.length)}
                      whileHover={{ scale: 1.1, x: 2 }}
                      whileTap={{ scale: 0.9 }}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 p-3 bg-white/90 backdrop-blur-sm rounded-full hover:bg-[#D4AF37] hover:text-white transition-all duration-300 shadow-lg border-2 border-[#6C7A59]/20"
                    >
                      <ChevronRightIcon className="h-6 w-6" />
                    </motion.button>
                  </>
                )}
              </div>

              {/* Enhanced Thumbnail Images */}
              {product.images && product.images.length > 1 && (
                <motion.div
                  className="grid grid-cols-4 gap-3"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {product.images.map((image, index) => (
                    <motion.button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      variants={itemVariants}
                      className={`aspect-square bg-gradient-to-br from-[#F5F1E8] to-[#E6E6FA] rounded-2xl overflow-hidden border-4 transition-all duration-300 ${selectedImage === index
                          ? 'border-[#D4AF37] shadow-xl scale-105 ring-4 ring-[#D4AF37]/20'
                          : 'border-white/70 hover:border-[#D4AF37]/50 shadow-lg'
                        }`}
                    >
                      <img
                        src={image}
                        alt={`${product.name} ${index + 1}`}
                        className="w-full h-full object-cover object-center"
                      />
                    </motion.button>
                  ))}
                </motion.div>
              )}
            </motion.div>
          </motion.div>

          {/* Enhanced Product Info */}
          <motion.div
            className="space-y-8"
            variants={itemVariants}
          >
            {/* Product Header */}
            <motion.div
              className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-[#6C7A59]/20"
              variants={itemVariants}
            >
              <div className="flex items-center gap-3 mb-4">
                {product.isNew && (
                  <motion.span
                    className="inline-block px-4 py-2 bg-gradient-to-r from-[#6C7A59] to-[#9CAF88] text-white text-sm font-bold rounded-full shadow-lg"
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <SparklesIcon className="h-5 w-5 inline mr-1" /> NEW
                  </motion.span>
                )}
                {product.discount > 0 && (
                  <motion.span
                    className="inline-block px-4 py-2 bg-gradient-to-r from-[#B35D5D] to-[#E8B4B8] text-white text-sm font-bold rounded-full shadow-lg"
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
                  >
                    <FireIcon className="h-5 w-5 inline mr-1" /> -{product.discount}% OFF
                  </motion.span>
                )}
                {product.stock < 10 && product.stock > 0 && (
                  <span className="inline-block px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-700 text-white text-sm font-bold rounded-full shadow-lg">
                    <BoltIcon className="h-5 w-5 inline mr-1" /> Limited Stock
                  </span>
                )}
              </div>

              <h1 className="text-4xl font-black text-[#1E1E1E] mb-4 bg-gradient-to-r from-[#1E1E1E] to-[#6C7A59] bg-clip-text text-transparent leading-tight">
                {product.name}
              </h1>

              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    {renderStars(product.rating || 4.5)}
                    <span className="text-lg font-bold text-[#6C7A59]">
                      {(product.rating || 4.5).toFixed(1)}
                    </span>
                  </div>
                  <span className="text-[#6C7A59] font-medium">
                    ({product.numReviews || product.reviews?.length || 0} reviews)
                  </span>
                </div>

                <motion.button
                  onClick={() => setShowReviews(true)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="text-[#D4AF37] hover:text-[#B8941F] font-bold transition-colors duration-300 flex items-center gap-2"
                >
                  <FiStar className="h-5 w-5" />
                  Write a review
                </motion.button>
              </div>

              {/* Sales Information */}
              {salesData && (salesData.quantity > 0 || salesData.orders > 0) && (
                <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <FiUsers className="h-5 w-5 text-blue-600" />
                      <span className="text-sm font-medium text-blue-900">
                        {salesData.quantity} sold recently
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FiTruck className="h-5 w-5 text-green-600" />
                      <span className="text-sm font-medium text-green-900">
                        {salesData.orders} happy customers
                      </span>
                    </div>
                    {salesData.quantity > 10 && (
                      <div className="flex items-center gap-2">
                        <FiCheck className="h-5 w-5 text-orange-600" />
                        <span className="text-sm font-medium text-orange-900">
                          Popular choice
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-4 mb-6">
                {product.discount > 0 ? (
                  <>
                    <span className="text-4xl font-black text-[#B35D5D]">
                      Rs. {Math.round(product.price * (1 - product.discount / 100))}
                    </span>
                    <span className="text-2xl text-[#6C7A59] line-through font-bold">
                      Rs. {product.price}
                    </span>
                    <span className="bg-gradient-to-r from-[#B35D5D] to-[#E8B4B8] text-white font-bold px-3 py-1 rounded-full text-sm">
                      Save Rs. {Math.round(product.price * (product.discount / 100))}
                    </span>
                  </>
                ) : (
                  <span className="text-4xl font-black text-[#6C7A59]">Rs. {product.price}</span>
                )}
              </div>

              {/* Stock Status */}
              <div className="mb-6">
                <div className="flex items-center gap-3">
                  {product.stock > 0 ? (
                    <>
                      <FiCheck className="h-6 w-6 text-[#6C7A59]" />
                      <span className="text-[#6C7A59] font-bold">
                        {product.stock > 10 ? 'In Stock' : `Only ${product.stock} left`}
                      </span>
                    </>
                  ) : (
                    <>
                      <FiX className="h-6 w-6 text-red-500" />
                      <span className="text-red-500 font-bold">Out of Stock</span>
                    </>
                  )}
                </div>
                {product.stock > 0 && product.stock <= 10 && (
                  <div className="mt-2 bg-gradient-to-r from-orange-100 to-red-100 rounded-2xl p-3 border border-orange-200">
                    <p className="text-orange-800 font-medium text-sm">
                      <BoltIcon className="h-5 w-5 inline mr-1" /> Hurry! Only {product.stock} items left in stock. Order now to avoid disappointment!
                    </p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Enhanced Product Description */}
            <motion.div
              className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-[#6C7A59]/20"
              variants={itemVariants}
            >
              <h3 className="text-2xl font-black text-[#1E1E1E] mb-4 flex items-center gap-3">
                <BookOpenIcon className="h-6 w-6" /> Description
              </h3>
              <p className="text-[#6C7A59] leading-relaxed text-lg font-medium">
                {product.description}
              </p>
            </motion.div>

            {/* Enhanced Features */}
            {product.features && product.features.length > 0 && (
              <motion.div
                className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-[#6C7A59]/20"
                variants={itemVariants}
              >
                <h3 className="text-2xl font-black text-[#1E1E1E] mb-6 flex items-center gap-3">
                  <SparklesIcon className="h-6 w-6" /> Key Features
                </h3>
                <motion.ul
                  className="space-y-4"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {product.features.map((feature, index) => (
                    <motion.li
                      key={index}
                      className="flex items-center text-[#6C7A59] font-medium text-lg"
                      variants={itemVariants}
                      whileHover={{ x: 5, scale: 1.02 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="w-3 h-3 bg-gradient-to-r from-[#D4AF37] to-[#E8B4B8] rounded-full mr-4 shadow-lg"></div>
                      {feature}
                    </motion.li>
                  ))}
                </motion.ul>
              </motion.div>
            )}

            {/* Enhanced Material and Care */}
            {(product.material || product.care) && (
              <motion.div
                className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-[#6C7A59]/20"
                variants={itemVariants}
              >
                <h3 className="text-2xl font-black text-[#1E1E1E] mb-6 flex items-center gap-3">
                  <WrenchScrewdriverIcon className="h-6 w-6" /> Material & Care
                </h3>
                <div className="space-y-4">
                  {product.material && (
                    <div className="flex items-center text-[#6C7A59] font-medium text-lg">
                      <div className="w-3 h-3 bg-gradient-to-r from-[#6C7A59] to-[#9CAF88] rounded-full mr-4"></div>
                      <span className="font-bold mr-3">Material:</span>
                      <span>{product.material}</span>
                    </div>
                  )}
                  {product.care && (
                    <div className="flex items-center text-[#6C7A59] font-medium text-lg">
                      <div className="w-3 h-3 bg-gradient-to-r from-[#D4AF37] to-[#E8B4B8] rounded-full mr-4"></div>
                      <span className="font-bold mr-3">Care:</span>
                      <span>{product.care}</span>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Enhanced Color Selection */}
            {product.colors && product.colors.length > 0 && (
              <motion.div
                className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-[#6C7A59]/20"
                variants={itemVariants}
              >
                <h3 className="text-2xl font-black text-[#1E1E1E] mb-6 flex items-center gap-3">
                  <SwatchIcon className="h-6 w-6" /> Choose Color
                </h3>
                <div className="flex flex-wrap gap-4">
                  {product.colors.map((color, index) => (
                    <motion.button
                      key={color.name || color}
                      onClick={() => setSelectedColor(color.name || color)}
                      whileHover={{ scale: 1.1, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      className={`relative w-12 h-12 rounded-2xl border-4 transition-all duration-300 shadow-lg ${selectedColor === (color.name || color)
                          ? 'border-[#D4AF37] scale-110 ring-4 ring-[#D4AF37]/20'
                          : 'border-white hover:border-[#6C7A59]/50'
                        }`}
                      style={{ backgroundColor: color.hex || color }}
                      title={color.name || color}
                    >
                      {selectedColor === (color.name || color) && (
                        <motion.div
                          className="absolute inset-0 rounded-xl flex items-center justify-center"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ duration: 0.2 }}
                        >
                          <FiCheck className="h-6 w-6 text-white drop-shadow-lg" />
                        </motion.div>
                      )}
                    </motion.button>
                  ))}
                </div>
                {selectedColor && (
                  <motion.p
                    className="mt-4 text-[#6C7A59] font-bold"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    Selected: {selectedColor}
                  </motion.p>
                )}
                {validationErrors.color && (
                  <motion.p
                    className="mt-4 text-red-500 font-bold flex items-center gap-2"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    <FiX className="h-5 w-5" />
                    {validationErrors.color}
                  </motion.p>
                )}
              </motion.div>
            )}

            {/* Enhanced Size Selection */}
            {product.sizes && product.sizes.length > 0 && (
              <motion.div
                className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-[#6C7A59]/20"
                variants={itemVariants}
              >
                <h3 className="text-2xl font-black text-[#1E1E1E] mb-6 flex items-center gap-3">
                  <ArrowsPointingOutIcon className="h-6 w-6" /> Choose Size
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  {product.sizes.map((size, index) => (
                    <motion.button
                      key={size.name || size}
                      onClick={() => setSelectedSize(size.name || size)}
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      className={`py-4 px-6 border-3 rounded-2xl font-bold text-lg transition-all duration-300 shadow-lg ${selectedSize === (size.name || size)
                          ? 'border-[#D4AF37] bg-gradient-to-r from-[#D4AF37] to-[#E8B4B8] text-white shadow-xl'
                          : 'border-[#6C7A59]/30 text-[#6C7A59] hover:border-[#6C7A59] hover:bg-[#6C7A59]/10'
                        }`}
                    >
                      {size.name || size}
                    </motion.button>
                  ))}
                </div>
                {selectedSize && (
                  <motion.p
                    className="mt-4 text-[#6C7A59] font-bold"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    Selected Size: {selectedSize}
                  </motion.p>
                )}
                {validationErrors.size && (
                  <motion.p
                    className="mt-4 text-red-500 font-bold flex items-center gap-2"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    <FiX className="h-5 w-5" />
                    {validationErrors.size}
                  </motion.p>
                )}
              </motion.div>
            )}

            {/* Enhanced Quantity Selection */}
            <motion.div
              className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-[#6C7A59]/20"
              variants={itemVariants}
            >
              <h3 className="text-2xl font-black text-[#1E1E1E] mb-6 flex items-center gap-3">
                <HashtagIcon className="h-6 w-6" /> Quantity
              </h3>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <motion.button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    disabled={quantity <= 1}
                    className="w-12 h-12 bg-gradient-to-r from-[#6C7A59] to-[#9CAF88] text-white rounded-2xl flex items-center justify-center hover:from-[#9CAF88] hover:to-[#6C7A59] transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FiMinus className="h-6 w-6" />
                  </motion.button>

                  <div className="bg-gradient-to-r from-[#F5F1E8] to-[#E6E6FA] rounded-2xl px-6 py-3 border-2 border-[#6C7A59]/30">
                    <span className="text-2xl font-black text-[#6C7A59]">{quantity}</span>
                  </div>

                  <motion.button
                    onClick={() => setQuantity(Math.min(product.stock || 99, quantity + 1))}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    disabled={quantity >= (product.stock || 99)}
                    className="w-12 h-12 bg-gradient-to-r from-[#6C7A59] to-[#9CAF88] text-white rounded-2xl flex items-center justify-center hover:from-[#9CAF88] hover:to-[#6C7A59] transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FiPlus className="h-6 w-6" />
                  </motion.button>
                </div>

                <div className="text-right">
                  <p className="text-[#6C7A59] font-bold text-lg">
                    {product.stock || 0} available
                  </p>
                  {quantity * (product.discount > 0 ? Math.round(product.price * (1 - product.discount / 100)) : product.price) && (
                    <p className="text-[#D4AF37] font-black text-xl">
                      Total: Rs. {quantity * (product.discount > 0 ? Math.round(product.price * (1 - product.discount / 100)) : product.price)}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Enhanced Action Buttons */}
            <motion.div
              className="space-y-4"
              variants={itemVariants}
            >
              <motion.button
                onClick={handleAddToCart}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                disabled={product.stock === 0}
                className={`w-full flex items-center justify-center px-8 py-5 font-black text-xl rounded-3xl transition-all duration-300 shadow-xl ${product.stock === 0
                    ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                    : 'bg-gradient-to-r from-[#6C7A59] to-[#9CAF88] text-white hover:from-[#9CAF88] hover:to-[#6C7A59] hover:shadow-2xl'
                  }`}
              >
                <FiShoppingCart className="h-6 w-6 mr-3" />
                {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                {product.stock > 0 && (
                  <motion.div
                    className="ml-3 bg-white/20 rounded-full px-3 py-1 text-sm"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    Rs. {quantity * (product.discount > 0 ? Math.round(product.price * (1 - product.discount / 100)) : product.price)}
                  </motion.div>
                )}
              </motion.button>

              <div className="grid grid-cols-2 gap-4">
                <motion.button
                  onClick={handleWishlist}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className={`flex items-center justify-center px-6 py-4 border-3 font-bold text-lg rounded-3xl transition-all duration-300 shadow-lg ${isInWishlist(product._id)
                      ? 'border-[#E8B4B8] bg-gradient-to-r from-[#E8B4B8] to-[#F5C6CB] text-white hover:shadow-xl'
                      : 'border-[#6C7A59] text-[#6C7A59] hover:bg-[#6C7A59] hover:text-white hover:shadow-xl'
                    }`}
                >
                  <FiHeart className="h-5 w-5 mr-2" />
                  {isInWishlist(product._id) ? 'Wishlisted' : 'Wishlist'}
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center justify-center px-6 py-4 border-3 border-[#D4AF37] text-[#D4AF37] font-bold text-lg rounded-3xl hover:bg-[#D4AF37] hover:text-white transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  <FiShare2 className="h-5 w-5 mr-2" />
                  Share
                </motion.button>
              </div>

              {/* Trust Indicators */}
              <motion.div
                className="grid grid-cols-3 gap-4 mt-6"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                <motion.div
                  className="text-center p-4 bg-white/95 backdrop-blur-sm rounded-2xl border border-[#6C7A59]/20 shadow-lg"
                  variants={itemVariants}
                  whileHover={{ scale: 1.05, y: -2 }}
                >
                  <FiShield className="h-8 w-8 text-[#6C7A59] mx-auto mb-2" />
                  <p className="text-sm font-bold text-[#6C7A59]">Secure Payment</p>
                </motion.div>

                <motion.div
                  className="text-center p-4 bg-white/95 backdrop-blur-sm rounded-2xl border border-[#6C7A59]/20 shadow-lg"
                  variants={itemVariants}
                  whileHover={{ scale: 1.05, y: -2 }}
                >
                  <FiTruck className="h-8 w-8 text-[#6C7A59] mx-auto mb-2" />
                  <p className="text-sm font-bold text-[#6C7A59]">Fast Delivery</p>
                </motion.div>

                <motion.div
                  className="text-center p-4 bg-white/95 backdrop-blur-sm rounded-2xl border border-[#6C7A59]/20 shadow-lg"
                  variants={itemVariants}
                  whileHover={{ scale: 1.05, y: -2 }}
                >
                  <FiRefreshCw className="h-8 w-8 text-[#6C7A59] mx-auto mb-2" />
                  <p className="text-sm font-bold text-[#6C7A59]">Easy Returns</p>
                </motion.div>
              </motion.div>
            </motion.div>

            {/* Enhanced Product Details */}
            <motion.div
              className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-[#6C7A59]/20"
              variants={itemVariants}
            >
              <h3 className="text-2xl font-black text-[#1E1E1E] mb-6 flex items-center gap-3">
                <InformationCircleIcon className="h-6 w-6" /> Product Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {product.sku && (
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-gradient-to-r from-[#6C7A59] to-[#9CAF88] rounded-full"></div>
                    <span className="text-[#6C7A59] font-bold">SKU:</span>
                    <span className="text-[#1E1E1E] font-medium">{product.sku}</span>
                  </div>
                )}
                {product.category && (
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-gradient-to-r from-[#D4AF37] to-[#E8B4B8] rounded-full"></div>
                    <span className="text-[#6C7A59] font-bold">Category:</span>
                    <span className="text-[#1E1E1E] font-medium capitalize">{product.category}</span>
                  </div>
                )}
                {product.brand && (
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-gradient-to-r from-[#6C7A59] to-[#9CAF88] rounded-full"></div>
                    <span className="text-[#6C7A59] font-bold">Brand:</span>
                    <span className="text-[#1E1E1E] font-medium">{product.brand}</span>
                  </div>
                )}
                {product.subcategory && (
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-gradient-to-r from-[#D4AF37] to-[#E8B4B8] rounded-full"></div>
                    <span className="text-[#6C7A59] font-bold">Subcategory:</span>
                    <span className="text-[#1E1E1E] font-medium capitalize">{product.subcategory}</span>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>

          {/* Sidebar Banner */}
          <motion.div
            className="lg:col-span-1"
            variants={itemVariants}
          >
            <Banner
              position="sidebar"
              page="product"
              autoPlay={false}
              showNavigation={false}
              showDots={false}
              height="400px"
            />
          </motion.div>
        </motion.div>

        {/* Enhanced Reviews Section */}
        <motion.section
          className="mt-16"
          variants={itemVariants}
        >
          <motion.div
            className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-[#6C7A59]/20"
            variants={itemVariants}
          >
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-black text-[#1E1E1E] flex items-center gap-3">
                <ChatBubbleLeftRightIcon className="h-6 w-6" /> Customer Reviews
              </h2>
              <motion.button
                onClick={() => setShowReviews(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-[#D4AF37] to-[#E8B4B8] text-white font-bold py-3 px-6 rounded-2xl hover:from-[#E8B4B8] hover:to-[#D4AF37] transition-all duration-300"
              >
                Write a Review
              </motion.button>
            </div>

            <div className="grid gap-6">
              {product.reviews && product.reviews.length > 0 ? (
                product.reviews.map((review, index) => (
                  <motion.div
                    key={review._id}
                    className="bg-gradient-to-r from-[#F5F1E8] to-[#E6E6FA] rounded-2xl p-6 border border-[#6C7A59]/20 shadow-lg"
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-bold text-[#1E1E1E] text-lg">
                            {review.user?.name || 'Anonymous User'}
                          </span>
                          {review.verified && (
                            <span className="inline-block px-3 py-1 bg-gradient-to-r from-[#6C7A59] to-[#9CAF88] text-white text-xs font-bold rounded-full">
                              <CheckBadgeIcon className="h-4 w-4 mr-1" /> Verified Purchase
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1">
                            {renderStars(review.rating)}
                          </div>
                          <span className="text-[#6C7A59] font-medium">
                            {new Date(review.createdAt || review.date).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    {review.title && (
                      <h4 className="font-bold text-[#1E1E1E] mb-3 text-lg">{review.title}</h4>
                    )}
                    <p className="text-[#6C7A59] text-lg leading-relaxed">{review.comment || review.text}</p>
                  </motion.div>
                ))
              ) : (
                <motion.div
                  className="text-center py-12 bg-gradient-to-r from-[#F5F1E8] to-[#E6E6FA] rounded-3xl border-2 border-dashed border-[#6C7A59]/30"
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <ChatBubbleLeftEllipsisIcon className="h-16 w-16 text-[#6C7A59] mx-auto mb-4" />
                  <h3 className="text-2xl font-black text-[#1E1E1E] mb-4">No reviews yet</h3>
                  <p className="text-[#6C7A59] text-lg mb-6">Be the first to share your experience with this product!</p>
                  <motion.button
                    onClick={() => setShowReviews(true)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-gradient-to-r from-[#6C7A59] to-[#9CAF88] text-white font-bold py-4 px-8 rounded-2xl hover:from-[#9CAF88] hover:to-[#6C7A59] transition-all duration-300"
                  >
                    Write First Review
                  </motion.button>
                </motion.div>
              )}
            </div>
          </motion.div>
        </motion.section>

        {/* Enhanced Related Products */}
        <motion.section className="mt-16">
          <motion.h2
            className="text-3xl font-black text-[#1E1E1E] mb-8 flex items-center gap-3"
            variants={itemVariants}
          >
            <ShoppingBagIcon className="h-6 w-6" /> You might also like
          </motion.h2>
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {relatedProducts.map((product, index) => (
              <motion.div
                key={product._id}
                variants={itemVariants}
                whileHover={{ y: -5, scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                <Link to={`/product/${product._id}`} className="group block">
                  <div className="relative overflow-hidden rounded-2xl bg-white shadow-lg hover:shadow-2xl transition-all duration-500 border border-[#6C7A59]/20">
                    <img
                      src={product.images?.[0] || "/placeholder-product.jpg"}
                      alt={product.name}
                      className="w-full aspect-square object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute top-3 left-3 space-y-2">
                      {product.isNew && (
                        <span className="inline-block px-3 py-1 bg-gradient-to-r from-[#6C7A59] to-[#9CAF88] text-white text-xs font-bold rounded-full shadow-lg">
                          <SparklesIcon className="h-5 w-5 inline mr-1" /> NEW
                        </span>
                      )}
                      {product.discount > 0 && (
                        <span className="inline-block px-3 py-1 bg-gradient-to-r from-[#B35D5D] to-[#E8B4B8] text-white text-xs font-bold rounded-full shadow-lg">
                          <FireIcon className="h-4 w-4 inline mr-1" /> -{product.discount}%
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="mt-4 p-4 bg-white/95 backdrop-blur-sm rounded-2xl border border-[#6C7A59]/20">
                    <h3 className="font-black text-[#1E1E1E] mb-2 text-lg leading-tight group-hover:text-[#6C7A59] transition-colors duration-300">
                      {product.name}
                    </h3>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-[#6C7A59] text-lg">
                          Rs. {product.discount > 0 ? Math.round(product.price * (1 - product.discount / 100)) : product.price}
                        </span>
                        {product.discount > 0 && (
                          <span className="text-sm text-[#B35D5D] line-through font-medium">
                            Rs. {product.price}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center">
                        {renderStars(product.rating || 0)}
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </motion.section>

        {/* Sticky Bottom Banner */}
        <motion.div
          className="fixed bottom-0 left-0 right-0 z-40"
          variants={itemVariants}
        >
          <Banner
            position="sticky"
            page="product"
            autoPlay={true}
            interval={8000}
            showNavigation={true}
            showDots={false}
            height="80px"
          />
        </motion.div>
      </div>
    </motion.div>
  );
};

export default ProductDetail; 
