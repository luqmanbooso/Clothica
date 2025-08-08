import React, { useState, useEffect, useRef } from 'react';
import { 
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  EyeSlashIcon,
  StarIcon,
  CurrencyDollarIcon,
  CubeIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  PhotoIcon,
  XMarkIcon,
  ArrowUpTrayIcon,
  TagIcon,
  ScaleIcon,
  TruckIcon
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    price: 0,
    comparePrice: 0,
    stock: 0,
    sku: '',
    weight: 0,
    dimensions: { length: 0, width: 0, height: 0 },
    images: [],
    tags: [],
    isActive: true,
    isFeatured: false,
    hasVariants: false,
    variants: [],
    shipping: {
      weight: 0,
      freeShipping: false,
      shippingClass: 'standard'
    }
  });

  useEffect(() => {
    // Simulate loading data
    setTimeout(() => {
      setProducts([
        {
          id: 1,
          name: 'Premium Cotton T-Shirt',
          description: 'High-quality cotton t-shirt with comfortable fit',
          category: 'T-Shirts',
          price: 29.99,
          comparePrice: 39.99,
          stock: 150,
          sku: 'TSH-001',
          weight: 0.2,
          dimensions: { length: 28, width: 20, height: 2 },
          images: [
            'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=150&h=150&fit=crop',
            'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=150&h=150&fit=crop'
          ],
          tags: ['cotton', 'comfortable', 'casual'],
          rating: 4.8,
          reviews: 234,
          status: 'active',
          isFeatured: true,
          hasVariants: true,
          variants: [
            { id: 1, name: 'Small', stock: 50, price: 29.99 },
            { id: 2, name: 'Medium', stock: 60, price: 29.99 },
            { id: 3, name: 'Large', stock: 40, price: 29.99 }
          ],
          shipping: {
            weight: 0.2,
            freeShipping: false,
            shippingClass: 'standard'
          },
          createdAt: '2024-01-01'
        },
        {
          id: 2,
          name: 'Denim Jeans Classic',
          description: 'Classic denim jeans with perfect fit',
          category: 'Jeans',
          price: 79.99,
          comparePrice: 99.99,
          stock: 85,
          sku: 'JNS-002',
          weight: 0.5,
          dimensions: { length: 32, width: 12, height: 3 },
          images: [
            'https://images.unsplash.com/photo-1542272604-787c3835535d?w=150&h=150&fit=crop',
            'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=150&h=150&fit=crop'
          ],
          tags: ['denim', 'classic', 'comfortable'],
          rating: 4.6,
          reviews: 189,
          status: 'active',
          isFeatured: false,
          hasVariants: true,
          variants: [
            { id: 1, name: '30x32', stock: 30, price: 79.99 },
            { id: 2, name: '32x32', stock: 35, price: 79.99 },
            { id: 3, name: '34x32', stock: 20, price: 79.99 }
          ],
          shipping: {
            weight: 0.5,
            freeShipping: false,
            shippingClass: 'standard'
          },
          createdAt: '2024-01-02'
        },
        {
          id: 3,
          name: 'Casual Sneakers',
          description: 'Comfortable casual sneakers for everyday wear',
          category: 'Shoes',
          price: 89.99,
          comparePrice: 119.99,
          stock: 120,
          sku: 'SNK-003',
          weight: 0.8,
          dimensions: { length: 30, width: 12, height: 8 },
          images: [
            'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=150&h=150&fit=crop',
            'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=150&h=150&fit=crop'
          ],
          tags: ['casual', 'comfortable', 'sneakers'],
          rating: 4.7,
          reviews: 156,
          status: 'active',
          isFeatured: true,
          hasVariants: true,
          variants: [
            { id: 1, name: 'US 7', stock: 25, price: 89.99 },
            { id: 2, name: 'US 8', stock: 30, price: 89.99 },
            { id: 3, name: 'US 9', stock: 35, price: 89.99 },
            { id: 4, name: 'US 10', stock: 30, price: 89.99 }
          ],
          shipping: {
            weight: 0.8,
            freeShipping: true,
            shippingClass: 'premium'
          },
          createdAt: '2024-01-03'
        },
        {
          id: 4,
          name: 'Summer Dress',
          description: 'Light and breezy summer dress',
          category: 'Dresses',
          price: 59.99,
          comparePrice: 79.99,
          stock: 65,
          sku: 'DRS-004',
          weight: 0.3,
          dimensions: { length: 35, width: 15, height: 2 },
          images: [
            'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=150&h=150&fit=crop',
            'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=150&h=150&fit=crop'
          ],
          tags: ['summer', 'dress', 'light'],
          rating: 4.5,
          reviews: 142,
          status: 'active',
          isFeatured: false,
          hasVariants: true,
          variants: [
            { id: 1, name: 'XS', stock: 15, price: 59.99 },
            { id: 2, name: 'S', stock: 20, price: 59.99 },
            { id: 3, name: 'M', stock: 20, price: 59.99 },
            { id: 4, name: 'L', stock: 10, price: 59.99 }
          ],
          shipping: {
            weight: 0.3,
            freeShipping: false,
            shippingClass: 'standard'
          },
          createdAt: '2024-01-04'
        },
        {
          id: 5,
          name: 'Hoodie Sweatshirt',
          description: 'Warm and cozy hoodie for cold weather',
          category: 'Hoodies',
          price: 49.99,
          comparePrice: 69.99,
          stock: 95,
          sku: 'HOD-005',
          weight: 0.6,
          dimensions: { length: 30, width: 25, height: 3 },
          images: [
            'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=150&h=150&fit=crop',
            'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop'
          ],
          tags: ['hoodie', 'warm', 'casual'],
          rating: 4.4,
          reviews: 98,
          status: 'inactive',
          isFeatured: false,
          hasVariants: true,
          variants: [
            { id: 1, name: 'S', stock: 30, price: 49.99 },
            { id: 2, name: 'M', stock: 35, price: 49.99 },
            { id: 3, name: 'L', stock: 30, price: 49.99 }
          ],
          shipping: {
            weight: 0.6,
            freeShipping: false,
            shippingClass: 'standard'
          },
          createdAt: '2024-01-05'
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const categories = ['all', 'T-Shirts', 'Jeans', 'Shoes', 'Dresses', 'Hoodies', 'Accessories', 'Outerwear'];
  const sortOptions = [
    { value: 'name', label: 'Name' },
    { value: 'price', label: 'Price' },
    { value: 'stock', label: 'Stock' },
    { value: 'rating', label: 'Rating' },
    { value: 'created', label: 'Date Created' }
  ];

  // Helper functions
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setUploadingImage(true);
      // Simulate image upload
      setTimeout(() => {
        const reader = new FileReader();
        reader.onload = (e) => {
          setImagePreview(e.target.result);
          setFormData(prev => ({
            ...prev,
            images: [...prev.images, e.target.result]
          }));
        };
        reader.readAsDataURL(file);
        setUploadingImage(false);
      }, 1000);
    }
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleAddProduct = () => {
    setFormData({
      name: '',
      description: '',
      category: '',
      price: 0,
      comparePrice: 0,
      stock: 0,
      sku: '',
      weight: 0,
      dimensions: { length: 0, width: 0, height: 0 },
      images: [],
      tags: [],
      isActive: true,
      isFeatured: false,
      hasVariants: false,
      variants: [],
      shipping: {
        weight: 0,
        freeShipping: false,
        shippingClass: 'standard'
      }
    });
    setImagePreview(null);
    setEditingProduct(null);
    setShowAddModal(true);
  };

  const handleEditProduct = (product) => {
    setFormData({
      name: product.name,
      description: product.description,
      category: product.category,
      price: product.price,
      comparePrice: product.comparePrice,
      stock: product.stock,
      sku: product.sku,
      weight: product.weight,
      dimensions: product.dimensions,
      images: product.images,
      tags: product.tags,
      isActive: product.status === 'active',
      isFeatured: product.isFeatured,
      hasVariants: product.hasVariants,
      variants: product.variants,
      shipping: product.shipping
    });
    setImagePreview(null);
    setEditingProduct(product);
    setShowAddModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingProduct) {
      setProducts(prev => prev.map(product => 
        product.id === editingProduct.id 
          ? { 
              ...product, 
              ...formData, 
              status: formData.isActive ? 'active' : 'inactive',
              updatedAt: new Date().toISOString().split('T')[0]
            }
          : product
      ));
    } else {
      const newProduct = {
        id: Date.now(),
        ...formData,
        status: formData.isActive ? 'active' : 'inactive',
        rating: 0,
        reviews: 0,
        createdAt: new Date().toISOString().split('T')[0]
      };
      setProducts(prev => [...prev, newProduct]);
    }
    setShowAddModal(false);
    setEditingProduct(null);
    setImagePreview(null);
  };

  const handleDeleteProduct = (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      setProducts(prev => prev.filter(product => product.id !== productId));
    }
  };

  const toggleProductStatus = (productId) => {
    setProducts(prev => prev.map(product => 
      product.id === productId 
        ? { 
            ...product, 
            status: product.status === 'active' ? 'inactive' : 'active',
            updatedAt: new Date().toISOString().split('T')[0]
          }
        : product
    ));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStockStatus = (stock) => {
    if (stock === 0) return { color: 'text-red-600', text: 'Out of Stock' };
    if (stock < 10) return { color: 'text-orange-600', text: 'Low Stock' };
    return { color: 'text-green-600', text: 'In Stock' };
  };

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
        case 'created':
          return new Date(b.createdAt) - new Date(a.createdAt);
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
          onClick={handleAddProduct}
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
                src={product.images[0]}
                          alt={product.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 right-2 flex space-x-1">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(product.status)}`}>
                  {product.status}
                </span>
                {product.isFeatured && (
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    Featured
                  </span>
                )}
              </div>
              {product.images.length > 1 && (
                <div className="absolute bottom-2 left-2">
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-black bg-opacity-50 text-white">
                    +{product.images.length - 1} more
                  </span>
                </div>
              )}
                      </div>

            {/* Product Info */}
            <div className="p-4">
              <h3 className="font-semibold text-[#1E1E1E] mb-2 line-clamp-2">
                          {product.name}
              </h3>
              
              <div className="flex items-center justify-between mb-3">
                <div>
                  <span className="text-lg font-bold text-[#1E1E1E]">
                    ${product.price}
                  </span>
                  {product.comparePrice > product.price && (
                    <span className="text-sm text-gray-500 line-through ml-2">
                      ${product.comparePrice}
                    </span>
                  )}
                        </div>
                <div className="flex items-center">
                  <StarIcon className="h-4 w-4 text-yellow-400" />
                  <span className="text-sm text-gray-600 ml-1">{product.rating}</span>
                        </div>
                      </div>

              <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                <span>{product.category}</span>
                <span>{product.reviews} reviews</span>
                    </div>

              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center text-sm">
                  <CubeIcon className="h-4 w-4 mr-1" />
                  <span className={getStockStatus(product.stock).color}>
                    {getStockStatus(product.stock).text}
                    </span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <TagIcon className="h-4 w-4 mr-1" />
                  <span>{product.sku}</span>
                </div>
              </div>

              {product.hasVariants && (
                <div className="mb-3">
                  <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                    {product.variants.length} variants
                      </span>
                </div>
              )}

              {/* Actions */}
              <div className="flex space-x-2">
                      <button
                  onClick={() => handleEditProduct(product)}
                  className="flex-1 flex items-center justify-center px-3 py-2 bg-[#6C7A59] text-white rounded-lg hover:bg-[#5A6A4A] transition-colors"
                >
                  <PencilIcon className="h-4 w-4 mr-1" />
                  Edit
                      </button>
                      <button
                  onClick={() => toggleProductStatus(product.id)}
                  className={`flex items-center justify-center px-3 py-2 rounded-lg transition-colors ${
                    product.status === 'active' 
                      ? 'bg-green-100 text-green-600 hover:bg-green-200' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {product.status === 'active' ? <EyeIcon className="h-4 w-4" /> : <EyeSlashIcon className="h-4 w-4" />}
                      </button>
                      <button
                  onClick={() => handleDeleteProduct(product.id)}
                  className="flex items-center justify-center px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                      >
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

      {/* Add/Edit Product Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-2xl p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-display font-bold text-[#1E1E1E]">
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
    </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Product Name</label>
          <input
            type="text"
            value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6C7A59] focus:border-transparent"
            required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6C7A59] focus:border-transparent"
                      required
                    >
                      <option value="">Select Category</option>
                      {categories.filter(cat => cat !== 'all').map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>
        </div>

        <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6C7A59] focus:border-transparent"
                    rows="3"
          />
        </div>

                {/* Pricing */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Price ($)</label>
          <input
            type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value)})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6C7A59] focus:border-transparent"
                      min="0"
            step="0.01"
            required
          />
        </div>
        <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Compare Price ($)</label>
          <input
            type="number"
                      value={formData.comparePrice}
                      onChange={(e) => setFormData({...formData, comparePrice: parseFloat(e.target.value)})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6C7A59] focus:border-transparent"
            min="0"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">SKU</label>
                    <input
                      type="text"
                      value={formData.sku}
                      onChange={(e) => setFormData({...formData, sku: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6C7A59] focus:border-transparent"
                    />
                  </div>
        </div>

                {/* Stock and Inventory */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Stock Quantity</label>
                    <input
                      type="number"
                      value={formData.stock}
                      onChange={(e) => setFormData({...formData, stock: parseInt(e.target.value)})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6C7A59] focus:border-transparent"
                      min="0"
            required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Weight (kg)</label>
                    <input
                      type="number"
                      value={formData.weight}
                      onChange={(e) => setFormData({...formData, weight: parseFloat(e.target.value)})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6C7A59] focus:border-transparent"
                      min="0"
                      step="0.01"
                    />
                  </div>
        </div>

                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Product Images</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <div className="space-y-4">
                      <PhotoIcon className="h-12 w-12 text-gray-400 mx-auto" />
        <div>
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="flex items-center justify-center px-4 py-2 bg-[#6C7A59] text-white rounded-xl hover:bg-[#5A6A4A] transition-colors"
                          disabled={uploadingImage}
                        >
                          {uploadingImage ? (
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          ) : (
                            <>
                              <ArrowUpTrayIcon className="h-5 w-5 mr-2" />
                              Upload Image
                            </>
                          )}
                        </button>
                      </div>
                      <p className="text-sm text-gray-500">
                        PNG, JPG, GIF up to 10MB
                      </p>
        </div>
      </div>

                  {/* Image Preview */}
                  {formData.images.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Uploaded Images</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {formData.images.map((image, index) => (
                          <div key={index} className="relative">
                            <img
                              src={image}
                              alt={`Product ${index + 1}`}
                              className="w-full h-24 object-cover rounded-lg"
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                            >
                              <XMarkIcon className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
      </div>

                {/* Settings */}
                <div className="flex items-center space-x-6">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                      className="rounded border-gray-300 text-[#6C7A59] focus:ring-[#6C7A59]"
                    />
                    <span className="ml-2 text-sm text-gray-700">Active</span>
                  </label>
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={formData.isFeatured}
                      onChange={(e) => setFormData({...formData, isFeatured: e.target.checked})}
                      className="rounded border-gray-300 text-[#6C7A59] focus:ring-[#6C7A59]"
                    />
                    <span className="ml-2 text-sm text-gray-700">Featured</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.hasVariants}
                      onChange={(e) => setFormData({...formData, hasVariants: e.target.checked})}
                      className="rounded border-gray-300 text-[#6C7A59] focus:ring-[#6C7A59]"
                    />
                    <span className="ml-2 text-sm text-gray-700">Has Variants</span>
        </label>
      </div>

                {/* Submit Buttons */}
                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-[#6C7A59] to-[#5A6A4A] text-white py-3 rounded-xl hover:shadow-lg transition-all duration-200"
                  >
                    {editingProduct ? 'Update Product' : 'Create Product'}
                  </button>
        <button
          type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl hover:bg-gray-300 transition-all duration-200"
        >
          Cancel
        </button>
      </div>
    </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Products; 