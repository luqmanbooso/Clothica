import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { HeartIcon, TrashIcon, ShoppingCartIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { useWishlist } from '../contexts/WishlistContext';
import { useCart } from '../contexts/CartContext';
import { useToast } from '../contexts/ToastContext';

const Wishlist = () => {
  const { wishlist, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { success, error } = useToast();
  const [loading, setLoading] = useState(true);

  const handleRemoveFromWishlist = (productId) => {
    removeFromWishlist(productId);
    success('Removed from wishlist');
  };

  useEffect(() => {
    // Simulate loading
    setTimeout(() => setLoading(false), 500);
  }, []);

  const handleAddToCart = (product) => {
    addToCart(product, 1);
    removeFromWishlist(product._id || product.id);
    success(`${product.name} added to cart!`);
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
      transition: { duration: 0.5 }
    }
  };

  if (loading || !wishlist) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6C7A59]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F1EE] py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          {/* Header */}
          <motion.div 
            className="text-center"
            variants={itemVariants}
          >
            <h1 className="text-4xl font-display font-bold text-[#1E1E1E] mb-4">
              My Wishlist
            </h1>
            <p className="text-lg text-[#6C7A59]">
              Save your favorite items for later
            </p>
          </motion.div>

          {/* Wishlist Items */}
          {wishlist && wishlist.length > 0 ? (
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              variants={itemVariants}
            >
              {wishlist.map((product) => (
                                 <motion.div
                   key={product._id || product.id}
                   className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                   whileHover={{ y: -5 }}
                 >
                  {/* Product Image */}
                  <div className="relative h-48 bg-gray-100">
                    <img
                      src={product.images?.[0] || product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2">
                                             <button
                         onClick={() => handleRemoveFromWishlist(product._id || product.id)}
                         className="w-8 h-8 bg-red-100 text-red-600 rounded-full flex items-center justify-center hover:bg-red-200 transition-colors"
                       >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="p-4">
                    <h3 className="font-semibold text-[#1E1E1E] mb-2 line-clamp-2">
                      {product.name}
                    </h3>
                    
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-lg font-bold text-[#1E1E1E]">
                        Rs. {product.price?.toLocaleString()}
                      </span>
                      <div className="flex items-center">
                        <HeartIcon className="h-4 w-4 text-red-500" />
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                      <span>{product.category}</span>
                      <span>{product.rating} ★</span>
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleAddToCart(product)}
                        className="flex-1 flex items-center justify-center px-3 py-2 bg-[#6C7A59] text-white rounded-lg hover:bg-[#5A6A4A] transition-colors"
                      >
                        <ShoppingCartIcon className="h-4 w-4 mr-1" />
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div 
              className="text-center py-12"
              variants={itemVariants}
            >
              <HeartIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Your wishlist is empty</h3>
              <p className="text-gray-600 mb-4">
                Start adding items to your wishlist to see them here
              </p>
              <Link
                to="/shop"
                className="px-4 py-2 bg-[#6C7A59] text-white rounded-xl hover:bg-[#5A6A4A] transition-colors"
              >
                Browse Products
              </Link>
            </motion.div>
          )}

          {/* Stats */}
          {wishlist && wishlist.length > 0 && (
            <motion.div 
              className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6"
              variants={itemVariants}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Items</p>
                  <p className="text-2xl font-display font-bold text-[#1E1E1E]">
                    {wishlist.length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-500 rounded-xl flex items-center justify-center">
                  <HeartIcon className="h-6 w-6 text-white" />
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Wishlist;
