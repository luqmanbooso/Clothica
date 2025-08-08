import React, { useState, useEffect } from 'react';
import { 
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  StarIcon,
  CurrencyDollarIcon,
  CubeIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    // Simulate loading data
    setTimeout(() => {
      setProducts([
        {
          id: 1,
          name: 'Premium Cotton T-Shirt',
          category: 'T-Shirts',
          price: 29.99,
          stock: 150,
          rating: 4.8,
          reviews: 234,
          image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=150&h=150&fit=crop',
          status: 'active'
        },
        {
          id: 2,
          name: 'Denim Jeans Classic',
          category: 'Jeans',
          price: 79.99,
          stock: 85,
          rating: 4.6,
          reviews: 189,
          image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=150&h=150&fit=crop',
          status: 'active'
        },
        {
          id: 3,
          name: 'Casual Sneakers',
          category: 'Shoes',
          price: 89.99,
          stock: 120,
          rating: 4.7,
          reviews: 156,
          image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=150&h=150&fit=crop',
          status: 'active'
        },
        {
          id: 4,
          name: 'Summer Dress',
          category: 'Dresses',
          price: 59.99,
          stock: 65,
          rating: 4.5,
          reviews: 142,
          image: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=150&h=150&fit=crop',
          status: 'active'
        },
        {
          id: 5,
          name: 'Hoodie Sweatshirt',
          category: 'Hoodies',
          price: 49.99,
          stock: 95,
          rating: 4.4,
          reviews: 98,
          image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=150&h=150&fit=crop',
          status: 'inactive'
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const categories = ['all', 'T-Shirts', 'Jeans', 'Shoes', 'Dresses', 'Hoodies'];
  const sortOptions = [
    { value: 'name', label: 'Name' },
    { value: 'price', label: 'Price' },
    { value: 'stock', label: 'Stock' },
    { value: 'rating', label: 'Rating' }
  ];

  const filteredProducts = products
    .filter(product => 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (selectedCategory === 'all' || product.category === selectedCategory)
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'price':
          return b.price - a.price;
        case 'stock':
          return b.stock - a.stock;
        case 'rating':
          return b.rating - a.rating;
        default:
          return a.name.localeCompare(b.name);
      }
    });

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
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6C7A59]"></div>
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div 
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between"
        variants={itemVariants}
      >
        <div>
          <h1 className="text-3xl font-display font-bold text-[#1E1E1E]">Products</h1>
          <p className="text-gray-600 mt-1">Manage your product catalog</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="mt-4 sm:mt-0 flex items-center px-4 py-2 bg-[#6C7A59] text-white rounded-xl hover:bg-[#5A6A4A] transition-all duration-200 transform hover:scale-105"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Product
        </button>
      </motion.div>

      {/* Filters and Search */}
      <motion.div 
        className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6"
        variants={itemVariants}
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6C7A59] focus:border-[#6C7A59] transition-all duration-200"
            />
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6C7A59] focus:border-[#6C7A59] transition-all duration-200"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category}
                </option>
              ))}
            </select>
          </div>

          {/* Sort */}
          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6C7A59] focus:border-[#6C7A59] transition-all duration-200"
            >
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>
                  Sort by {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Results Count */}
          <div className="flex items-center justify-center md:justify-end">
            <span className="text-sm text-gray-600">
              {filteredProducts.length} products found
            </span>
          </div>
        </div>
      </motion.div>

      {/* Products Grid */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        variants={itemVariants}
      >
        {filteredProducts.map((product) => (
          <motion.div
            key={product.id}
            className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            whileHover={{ y: -5 }}
          >
            {/* Product Image */}
            <div className="relative h-48 bg-gray-100">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 right-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  product.status === 'active' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {product.status}
                </span>
              </div>
            </div>

            {/* Product Info */}
            <div className="p-4">
              <h3 className="font-semibold text-[#1E1E1E] mb-2 line-clamp-2">
                {product.name}
              </h3>
              
              <div className="flex items-center justify-between mb-3">
                <span className="text-lg font-bold text-[#1E1E1E]">
                  ${product.price}
                </span>
                <div className="flex items-center">
                  <StarIcon className="h-4 w-4 text-yellow-400" />
                  <span className="text-sm text-gray-600 ml-1">{product.rating}</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                <span>{product.category}</span>
                <span>{product.reviews} reviews</span>
              </div>

              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <CubeIcon className="h-4 w-4 mr-1" />
                  <span>{product.stock} in stock</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-2">
                <button className="flex-1 flex items-center justify-center px-3 py-2 bg-[#6C7A59] text-white rounded-lg hover:bg-[#5A6A4A] transition-colors">
                  <PencilIcon className="h-4 w-4 mr-1" />
                  Edit
                </button>
                <button className="flex items-center justify-center px-3 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors">
                  <EyeIcon className="h-4 w-4" />
                </button>
                <button className="flex items-center justify-center px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors">
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Empty State */}
      {filteredProducts.length === 0 && (
        <motion.div 
          className="text-center py-12"
          variants={itemVariants}
        >
          <CubeIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No products found</h3>
          <p className="text-gray-600 mb-4">
            Try adjusting your search or filter criteria
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('all');
            }}
            className="px-4 py-2 bg-[#6C7A59] text-white rounded-xl hover:bg-[#5A6A4A] transition-colors"
          >
            Clear Filters
          </button>
        </motion.div>
      )}

      {/* Stats */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-4 gap-6"
        variants={itemVariants}
      >
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Products</p>
              <p className="text-2xl font-display font-bold text-[#1E1E1E]">
                {products.length}
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
              <CubeIcon className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Products</p>
              <p className="text-2xl font-display font-bold text-[#1E1E1E]">
                {products.filter(p => p.status === 'active').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
              <CheckCircleIcon className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Low Stock</p>
              <p className="text-2xl font-display font-bold text-[#1E1E1E]">
                {products.filter(p => p.stock < 50).length}
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center">
              <ExclamationTriangleIcon className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Value</p>
              <p className="text-2xl font-display font-bold text-[#1E1E1E]">
                ${products.reduce((sum, p) => sum + (p.price * p.stock), 0).toLocaleString()}
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <CurrencyDollarIcon className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Products; 