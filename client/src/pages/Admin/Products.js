import React, { useState, useEffect, useCallback } from 'react';
import { 
  PlusIcon, MagnifyingGlassIcon, CubeIcon, ExclamationTriangleIcon,
  CheckCircleIcon, StarIcon, PhotoIcon, PencilIcon, TrashIcon,
  DocumentArrowDownIcon, DocumentArrowUpIcon, BuildingOfficeIcon,
  TruckIcon, ChartBarIcon, TagIcon, InformationCircleIcon
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import api from '../../utils/api';
import { useToast } from '../../contexts/ToastContext';
import { getProductImageUrl, getPlaceholderImageUrl } from '../../utils/imageHelpers';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [stockStatusFilter, setStockStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: '',
    subcategory: '',
    brand: '',
    description: '',
    shortDescription: '',
    price: 0,
    originalPrice: 0,
    costPrice: 0,
    images: [],
    colors: [],
    sizes: [],
    tags: [],
    inventory: {
      lowStockThreshold: 10,
      criticalStockThreshold: 5,
      reorderPoint: 20
    },
    supplier: {
      name: '',
      contact: '',
      email: '',
      phone: '',
      leadTime: 0,
      minimumOrder: 0
    },
    specifications: {
      material: '',
      care: '',
      weight: 0,
      countryOfOrigin: '',
      warranty: ''
    },
    isActive: true,
    isFeatured: false,
    isNew: false,
    isOnSale: false
  });
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  
  // Inventory Analytics
  const [inventoryAnalytics, setInventoryAnalytics] = useState({
    totalProducts: 0,
    outOfStock: 0,
    lowStock: 0,
    criticalStock: 0,
    totalValue: 0,
    lowStockValue: 0
  });
  
  // Alerts
  const [inventoryAlerts, setInventoryAlerts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  
  // Stock Management
  const [stockHistory, setStockHistory] = useState([]);
  const [showStockModal, setShowStockModal] = useState(false);
  const [selectedProductForStock, setSelectedProductForStock] = useState(null);
  const [stockAction, setStockAction] = useState('adjustment');
  const [stockReason, setStockReason] = useState('');
  const [stockQuantity, setStockQuantity] = useState(0);
  const [stockNotes, setStockNotes] = useState('');

  // Advanced Filters
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [supplierFilter, setSupplierFilter] = useState('all');
  const [warehouseFilter, setWarehouseFilter] = useState('all');

  const { success: showSuccess, error: showError } = useToast();

  // Helper Functions
  const getStockStatus = (stock, threshold = 10) => {
    if (stock === 0) return { status: 'out-of-stock', color: 'text-red-600', bg: 'bg-red-100' };
    if (stock <= threshold) return { status: 'low-stock', color: 'text-orange-600', bg: 'bg-orange-100' };
    return { status: 'in-stock', color: 'text-green-600', bg: 'bg-green-100' };
  };

  const formatCurrency = (amount) => `Rs. ${(amount || 0).toLocaleString()}`;

  const formatSKU = (sku) => {
    return sku || 'N/A';
  };

  // Fetch Products with Advanced Filtering
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm,
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
        brand: selectedBrand !== 'all' ? selectedBrand : undefined,
        stockStatus: stockStatusFilter !== 'all' ? stockStatusFilter : undefined,
        sortBy,
        sortOrder
      };
      
      const response = await api.get('/api/admin/products', { params });
      setProducts(response.data.products || []);
      setTotalPages(response.data.totalPages || 1);
      setTotalProducts(response.data.total || 0);
    } catch (error) {
      console.error('Error fetching products:', error);
      showError('Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage, searchTerm, selectedCategory, selectedBrand, stockStatusFilter, sortBy, sortOrder, showError]);

  // Fetch Categories & Brands
  const fetchCategories = useCallback(async () => {
    try {
      const response = await api.get('/api/admin/categories');
      setCategories(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
    }
  }, []);

  const fetchBrands = useCallback(async () => {
    try {
      // Extract unique brands from products
      const uniqueBrands = [...new Set(products.map(p => p.brand).filter(Boolean))];
      setBrands(Array.isArray(uniqueBrands) ? uniqueBrands : []);
    } catch (error) {
      console.error('Error fetching brands:', error);
      setBrands([]);
    }
  }, [products]);

  // Fetch Inventory Analytics
  const fetchInventoryAnalytics = useCallback(async () => {
    try {
      // Calculate analytics from products data
      const totalProducts = products.length;
      const outOfStock = products.filter(p => (p.inventory?.totalStock || 0) === 0).length;
      const lowStock = products.filter(p => {
        const stock = p.inventory?.totalStock || 0;
        const threshold = p.inventory?.lowStockThreshold || 10;
        return stock > 0 && stock <= threshold;
      }).length;
      const criticalStock = products.filter(p => {
        const stock = p.inventory?.totalStock || 0;
        const threshold = p.inventory?.criticalStockThreshold || 5;
        return stock > 0 && stock <= threshold;
      }).length;
      const totalValue = products.reduce((sum, p) => sum + ((p.inventory?.totalStock || 0) * (p.price || 0)), 0);
      const lowStockValue = products.filter(p => {
        const stock = p.inventory?.totalStock || 0;
        const threshold = p.inventory?.lowStockThreshold || 10;
        return stock > 0 && stock <= threshold;
      }).reduce((sum, p) => sum + ((p.inventory?.totalStock || 0) * (p.price || 0)), 0);

      setInventoryAnalytics({
        totalProducts,
        outOfStock,
        lowStock,
        criticalStock,
        totalValue,
        lowStockValue
      });
    } catch (error) {
      console.error('Error calculating inventory analytics:', error);
    }
  }, [products]);

  // Fetch Inventory Alerts
  const fetchInventoryAlerts = useCallback(async () => {
    try {
      const response = await api.get('/api/admin/inventory/alerts');
      setInventoryAlerts(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching inventory alerts:', error);
      setInventoryAlerts([]);
    }
  }, []);

  // Fetch stock history for a product
  const fetchStockHistory = async (productId) => {
    try {
      const response = await api.get(`/api/admin/products/${productId}/stock-history`);
      setStockHistory(response.data || []);
    } catch (error) {
      console.error('Error fetching stock history:', error);
      showError('Failed to load stock history');
    }
  };

  // Initialize Data
  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchInventoryAlerts();
  }, [fetchProducts, fetchCategories, fetchInventoryAlerts]);

  // Update brands when products change
  useEffect(() => {
    fetchBrands();
    fetchInventoryAnalytics();
  }, [fetchBrands, fetchInventoryAnalytics]);

  // Enhanced filtering
  const filteredProducts = products.filter(product => {
    const matchesSearch = !searchTerm || 
      product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const matchesBrand = selectedBrand === 'all' || product.brand === selectedBrand;
    
    // Enhanced stock status filtering
    let matchesStockStatus = true;
    if (stockStatusFilter !== 'all') {
      const stock = product.inventory?.totalStock || 0;
      const lowThreshold = product.inventory?.lowStockThreshold || 10;
      const criticalThreshold = product.inventory?.criticalStockThreshold || 5;
      
      switch (stockStatusFilter) {
        case 'in-stock':
          matchesStockStatus = stock > lowThreshold;
          break;
        case 'low-stock':
          matchesStockStatus = stock > 0 && stock <= lowThreshold;
          break;
        case 'critical':
          matchesStockStatus = stock > 0 && stock <= criticalThreshold;
          break;
        case 'out-of-stock':
          matchesStockStatus = stock === 0;
          break;
        default:
          matchesStockStatus = true;
      }
    }

    // Price range filtering
    const matchesPriceRange = (!priceRange.min || product.price >= parseFloat(priceRange.min)) &&
                             (!priceRange.max || product.price <= parseFloat(priceRange.max));

    // Date range filtering
    const matchesDateRange = (!dateRange.start || new Date(product.createdAt) >= new Date(dateRange.start)) &&
                            (!dateRange.end || new Date(product.createdAt) <= new Date(dateRange.end));

    // Supplier filtering
    const matchesSupplier = supplierFilter === 'all' || product.supplier?.name === supplierFilter;
    
    return matchesSearch && matchesCategory && matchesBrand && matchesStockStatus && 
           matchesPriceRange && matchesDateRange && matchesSupplier;
  });

  const handleBulkAction = async (action) => {
    if (selectedProducts.length === 0) {
      showError('Please select products first');
      return;
    }

    try {
      await api.post('/api/admin/products/bulk-action', {
        productIds: selectedProducts,
        action
      });
      
      showSuccess(`Bulk ${action} completed successfully`);
      setSelectedProducts([]);
      setShowBulkActions(false);
      fetchProducts();
    } catch (error) {
      console.error('Error performing bulk action:', error);
      showError('Failed to perform bulk action');
    }
  };

  const toggleProductSelection = (productId) => {
    setSelectedProducts(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const selectAllProducts = () => {
    if (selectedProducts.length === filteredProducts.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(filteredProducts.map(p => p._id));
    }
  };

  const handleDelete = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await api.delete(`/api/admin/products/${productId}`);
        showSuccess('Product deleted successfully');
        fetchProducts();
      } catch (error) {
        console.error('Error deleting product:', error);
        showError('Failed to delete product');
      }
    }
  };

  // Enhanced stock update with history tracking
  const handleStockUpdate = async (productId, newStock, action = 'adjustment', reason = 'Manual stock update', notes = '') => {
    try {
      const response = await api.post(`/api/admin/products/${productId}/stock`, {
        quantity: newStock,
        type: action,
        reason: reason,
        notes: notes,
        timestamp: new Date().toISOString()
      });
      
      showSuccess('Stock updated successfully');
      
      // Update local state
      setProducts(prev => prev.map(p => 
        p._id === productId 
          ? { ...p, inventory: { ...p.inventory, totalStock: newStock } }
          : p
      ));
      
      // Refresh stock history
      if (selectedProductForStock?._id === productId) {
        fetchStockHistory(productId);
      }
      
      fetchProducts();
    } catch (error) {
      console.error('Error updating stock:', error);
      showError('Failed to update stock');
    }
  };

  // Handle stock action submission
  const handleStockAction = async () => {
    if (!selectedProductForStock || !stockQuantity || !stockReason) {
      showError('Please fill in all required fields');
      return;
    }

    try {
      const currentStock = selectedProductForStock.inventory?.totalStock || 0;
      let newStock = currentStock;

      switch (stockAction) {
        case 'adjustment':
          newStock = stockQuantity;
          break;
        case 'addition':
          newStock = currentStock + stockQuantity;
          break;
        case 'subtraction':
          newStock = Math.max(0, currentStock - stockQuantity);
          break;
        case 'restock':
          newStock = currentStock + stockQuantity;
          break;
        default:
          newStock = stockQuantity;
      }

      await handleStockUpdate(
        selectedProductForStock._id, 
        newStock, 
        stockAction, 
        stockReason, 
        stockNotes
      );

      // Reset form
      setStockAction('adjustment');
      setStockReason('');
      setStockQuantity(0);
      setStockNotes('');
      setShowStockModal(false);
      setSelectedProductForStock(null);
    } catch (error) {
      console.error('Error performing stock action:', error);
      showError('Failed to perform stock action');
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === 'checkbox' ? checked : (type === 'number' ? parseFloat(value) || 0 : value)
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : (type === 'number' ? parseFloat(value) || 0 : value)
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await api.put(`/api/admin/products/${editingProduct._id}`, formData);
        showSuccess('Product updated successfully! ');
      } else {
        await api.post('/api/admin/products', formData);
        showSuccess('Product created successfully! ');
      }
      setShowProductModal(false);
      resetForm();
      fetchProducts();
    } catch (error) {
      console.error('Error saving product:', error);
      showError('Failed to save product');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      sku: '',
      category: '',
      subcategory: '',
      brand: '',
      description: '',
      shortDescription: '',
      price: 0,
      originalPrice: 0,
      costPrice: 0,
      images: [],
      colors: [],
      sizes: [],
      tags: [],
      inventory: {
        lowStockThreshold: 10,
        criticalStockThreshold: 5,
        reorderPoint: 20
      },
      supplier: {
        name: '',
        contact: '',
        email: '',
        phone: '',
        leadTime: 0,
        minimumOrder: 0
      },
      specifications: {
        material: '',
        care: '',
        weight: 0,
        countryOfOrigin: '',
        warranty: ''
      },
      isActive: true,
      isFeatured: false,
      isNew: false,
      isOnSale: false
    });
    setEditingProduct(null);
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name || '',
      sku: product.sku || '',
      category: product.category || '',
      subcategory: product.subcategory || '',
      brand: product.brand || '',
      description: product.description || '',
      shortDescription: product.shortDescription || '',
      price: product.price || 0,
      originalPrice: product.originalPrice || 0,
      costPrice: product.costPrice || 0,
      images: product.images || [],
      colors: product.colors || [],
      sizes: product.sizes || [],
      tags: product.tags || [],
      inventory: {
        totalStock: product.inventory?.totalStock || 0,
        lowStockThreshold: product.inventory?.lowStockThreshold || 10,
        criticalStockThreshold: product.inventory?.criticalStockThreshold || 5,
        reorderPoint: product.inventory?.reorderPoint || 5
      },
      supplier: {
        name: product.supplier?.name || '',
        contact: product.supplier?.contact || '',
        email: product.supplier?.email || '',
        phone: product.supplier?.phone || '',
        leadTime: product.supplier?.leadTime || 0,
        minimumOrder: product.supplier?.minimumOrder || 0
      },
      specifications: {
        material: product.specifications?.material || '',
        care: product.specifications?.care || '',
        weight: product.specifications?.weight || 0,
        countryOfOrigin: product.specifications?.countryOfOrigin || '',
        warranty: product.specifications?.warranty || ''
      },
      isActive: product.isActive !== undefined ? product.isActive : true,
      isFeatured: product.isFeatured || false,
      isNew: product.isNew || false,
      isOnSale: product.isOnSale || false
    });
    setShowProductModal(true);
  };

  return (
    <motion.div 
      className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        Products & Inventory Management
      </h1>
      
      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Products</p>
              <p className="text-2xl font-bold text-gray-900">{products.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <CubeIcon className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Low Stock</p>
              <p className="text-2xl font-bold text-orange-600">{inventoryAlerts.length}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <ExclamationTriangleIcon className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Products</p>
              <p className="text-2xl font-bold text-green-600">
                {products.filter(p => p.isActive).length}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircleIcon className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Featured</p>
              <p className="text-2xl font-bold text-purple-600">
                {products.filter(p => p.isFeatured).length}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <StarIcon className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Controls Section */}
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={selectedProducts.length === filteredProducts.length && filteredProducts.length > 0}
                onChange={selectAllProducts}
                className="rounded border-gray-300 text-[#6C7A59] focus:ring-[#6C7A59] w-4 h-4"
              />
              <span className="text-sm text-gray-600">Select All</span>
            </div>
            
            <div className="relative flex-1 max-w-md">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6C7A59] focus:border-transparent"
              />
            </div>
            
            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6C7A59] focus:border-transparent"
            >
              <option value="all">All Categories</option>
              {Array.isArray(categories) && categories.map(category => (
                <option key={category._id || category} value={category.name || category}>
                  {category.name || category}
                </option>
              ))}
            </select>
            
            {/* Brand Filter */}
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6C7A59] focus:border-transparent"
            >
              <option value="all">All Brands</option>
              {Array.isArray(brands) && brands.map(brand => (
                <option key={brand} value={brand}>{brand}</option>
              ))}
            </select>
            
            {/* Stock Status Filter */}
            <select
              value={stockStatusFilter}
              onChange={(e) => setStockStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6C7A59] focus:border-transparent"
            >
              <option value="all">All Stock</option>
              <option value="in-stock">In Stock</option>
              <option value="low-stock">Low Stock</option>
              <option value="critical">Critical</option>
              <option value="out-of-stock">Out of Stock</option>
            </select>
          </div>
          
          <div className="flex items-center gap-3">
            {selectedProducts.length > 0 && (
              <button
                onClick={() => setShowBulkActions(!showBulkActions)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
              >
                {selectedProducts.length} Selected
              </button>
            )}
            
            <button
              onClick={() => {
                resetForm();
                setShowProductModal(true);
              }}
              className="flex items-center px-6 py-2 bg-[#6C7A59] text-white rounded-lg hover:bg-[#5A6A4A] transition-colors shadow-lg"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Add Product
            </button>
          </div>
        </div>

        {/* Bulk Actions */}
        {showBulkActions && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleBulkAction('activate')}
                className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm"
              >
                Activate All
              </button>
              <button
                onClick={() => handleBulkAction('deactivate')}
                className="px-3 py-1 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors text-sm"
              >
                Deactivate All
              </button>
              <button
                onClick={() => handleBulkAction('feature')}
                className="px-3 py-1 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors text-sm"
              >
                Feature All
              </button>
              <button
                onClick={() => handleBulkAction('delete')}
                className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm"
              >
                Delete All
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6C7A59] mx-auto"></div>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-12">
          <CubeIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
          <p className="text-gray-600">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product, index) => (
            <motion.div
              key={product._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5, scale: 1.02 }}
              className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300"
            >
              {/* Product Image */}
              <div className="h-48 relative bg-gray-100">
                <div className="absolute top-2 left-2 z-10">
                  <input
                    type="checkbox"
                    checked={selectedProducts.includes(product._id)}
                    onChange={() => toggleProductSelection(product._id)}
                    className="rounded border-gray-300 text-[#6C7A59] focus:ring-[#6C7A59] w-5 h-5"
                  />
                </div>
                
                {(() => {
                  const imageUrl = getProductImageUrl(product);
                  return imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = getPlaceholderImageUrl();
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <PhotoIcon className="h-12 w-12 text-gray-400" />
                    </div>
                  );
                })()}
                
                {/* Stock Status Badge */}
                <div className="absolute top-2 right-2">
                  {getStockStatus(
                    product.inventory?.totalStock || 0,
                    product.inventory?.lowStockThreshold || 10
                  ).status === 'out-of-stock' ? (
                    <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
                  ) : getStockStatus(
                    product.inventory?.totalStock || 0,
                    product.inventory?.lowStockThreshold || 10
                  ).status === 'low-stock' ? (
                    <ExclamationTriangleIcon className="h-5 w-5 text-orange-600" />
                  ) : (
                    <CheckCircleIcon className="h-5 w-5 text-green-600" />
                  )}
                </div>
                
                {/* Featured Badge */}
                {product.isFeatured && (
                  <div className="absolute bottom-2 left-2">
                    <div className="bg-yellow-500 text-white text-xs px-2 py-1 rounded-full">
                      Featured
                    </div>
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{product.name}</h3>
                <p className="text-sm text-gray-600 mb-2">SKU: {product.sku || 'N/A'}</p>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>
                
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-[#6C7A59]">
                      {formatCurrency(product.price)}
                    </span>
                    {product.originalPrice > product.price && (
                      <span className="text-sm text-gray-500 line-through">
                        {formatCurrency(product.originalPrice)}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <StarIcon className="h-4 w-4 text-yellow-500 fill-current" />
                    <span className="text-sm text-gray-600">{product.rating || '4.0'}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-sm px-2 py-1 rounded-full ${
                    getStockStatus(
                      product.inventory?.totalStock || 0,
                      product.inventory?.lowStockThreshold || 10
                    ).bg
                  } ${
                    getStockStatus(
                      product.inventory?.totalStock || 0,
                      product.inventory?.lowStockThreshold || 10
                    ).color
                  }`}>
                    Stock: {product.inventory?.totalStock || 0}
                  </span>
                  
                  <span className="text-sm text-gray-600">
                    {product.category} • {product.brand}
                  </span>
                </div>
                
                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => handleEdit(product)}
                    className="flex-1 flex items-center justify-center px-3 py-2 bg-[#6C7A59] text-white rounded-lg hover:bg-[#5A6A4A] transition-colors text-sm shadow-md"
                  >
                    <PencilIcon className="h-4 w-4 mr-1" />
                    Edit
                  </button>
                  
                  <button 
                    onClick={() => {
                      setSelectedProductForStock(product);
                      setShowStockModal(true);
                    }}
                    className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm shadow-md"
                    title="Manage Stock"
                  >
                    <CubeIcon className="h-4 w-4" />
                  </button>
                  
                  <button 
                    onClick={() => handleDelete(product._id)}
                    className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm shadow-md"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
      
      {/* Modals will be added here */}
      
      {/* Product Modal */}
      {showProductModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </h2>
                <button
                  onClick={() => {
                    setShowProductModal(false);
                    setEditingProduct(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>
            </div>

            <form className="p-6 space-y-6" onSubmit={handleSubmit}>
              {/* Basic Information */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <CubeIcon className="h-5 w-5 mr-2 text-blue-600" />
                  Basic Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Product Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6C7A59] focus:border-transparent"
                      placeholder="Enter product name..."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      SKU <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="sku"
                      value={formData.sku}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6C7A59] focus:border-transparent"
                      placeholder="Auto-generated if empty"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6C7A59] focus:border-transparent"
                    >
                      <option value="">Select Category</option>
                      <option value="men">Men</option>
                      <option value="women">Women</option>
                      <option value="kids">Kids</option>
                      <option value="accessories">Accessories</option>
                      <option value="shoes">Shoes</option>
                      <option value="bags">Bags</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Subcategory <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="subcategory"
                      value={formData.subcategory}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6C7A59] focus:border-transparent"
                      placeholder="e.g., t-shirts, jeans, sneakers..."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Brand <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="brand"
                      value={formData.brand}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6C7A59] focus:border-transparent"
                      placeholder="Enter brand name..."
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      required
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6C7A59] focus:border-transparent"
                      placeholder="Detailed product description..."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Short Description
                    </label>
                    <textarea
                      name="shortDescription"
                      value={formData.shortDescription}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6C7A59] focus:border-transparent"
                      placeholder="Brief product summary..."
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Images
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                    <div className="text-center">
                      <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="mt-4">
                        <label className="cursor-pointer">
                          <span className="mt-2 block text-sm font-medium text-gray-900">
                            Upload images or add URLs
                          </span>
                          <input
                            type="file"
                            multiple
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              // Handle file upload here
                              const files = Array.from(e.target.files);
                              console.log('Files selected:', files);
                              // TODO: Implement image upload
                            }}
                          />
                        </label>
                      </div>
                      <div className="mt-4">
                        <input
                          type="url"
                          placeholder="Or paste image URL and press Enter"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter' && e.target.value.trim()) {
                              const newImages = [...formData.images, e.target.value.trim()];
                              setFormData(prev => ({ ...prev, images: newImages }));
                              e.target.value = '';
                            }
                          }}
                        />
                      </div>
                      {formData.images.length > 0 && (
                        <div className="mt-4 grid grid-cols-3 gap-2">
                          {formData.images.map((img, index) => (
                            <div key={index} className="relative">
                              <img
                                src={img}
                                alt={`Product ${index + 1}`}
                                className="w-full h-20 object-cover rounded border"
                                onError={(e) => {
                                  e.target.src = getPlaceholderImageUrl();
                                }}
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const newImages = formData.images.filter((_, i) => i !== index);
                                  setFormData(prev => ({ ...prev, images: newImages }));
                                }}
                                className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tags
                  </label>
                  <input
                    type="text"
                    placeholder="Enter tags separated by commas"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6C7A59] focus:border-transparent"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const tags = e.target.value.split(',').map(tag => tag.trim()).filter(Boolean);
                        setFormData(prev => ({ ...prev, tags: [...new Set([...prev.tags, ...tags])] }));
                        e.target.value = '';
                      }
                    }}
                  />
                  {formData.tags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {formData.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => {
                              const newTags = formData.tags.filter((_, i) => i !== index);
                              setFormData(prev => ({ ...prev, tags: newTags }));
                            }}
                            className="ml-1 text-blue-600 hover:text-blue-900"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Colors & Sizes */}
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-xl">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <TagIcon className="h-5 w-5 mr-2 text-indigo-600" />
                  Colors & Sizes
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Available Colors
                    </label>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        placeholder="Color name"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && e.target.value.trim()) {
                            const colorName = e.target.value.trim();
                            const newColor = { name: colorName, hex: '#000000', available: true };
                            setFormData(prev => ({ ...prev, colors: [...prev.colors, newColor] }));
                            e.target.value = '';
                          }
                        }}
                      />
                      <input
                        type="color"
                        className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                        onChange={(e) => {
                          // Update the last added color's hex value
                          if (formData.colors.length > 0) {
                            const updatedColors = [...formData.colors];
                            updatedColors[updatedColors.length - 1].hex = e.target.value;
                            setFormData(prev => ({ ...prev, colors: updatedColors }));
                          }
                        }}
                      />
                    </div>
                    {formData.colors.length > 0 && (
                      <div className="space-y-2">
                        {formData.colors.map((color, index) => (
                          <div key={index} className="flex items-center gap-2 p-2 border border-gray-200 rounded">
                            <div
                              className="w-6 h-6 rounded-full border"
                              style={{ backgroundColor: color.hex }}
                            />
                            <span className="flex-1 text-sm">{color.name}</span>
                            <label className="flex items-center text-sm">
                              <input
                                type="checkbox"
                                checked={color.available}
                                onChange={(e) => {
                                  const updatedColors = [...formData.colors];
                                  updatedColors[index].available = e.target.checked;
                                  setFormData(prev => ({ ...prev, colors: updatedColors }));
                                }}
                                className="mr-1"
                              />
                              Available
                            </label>
                            <button
                              type="button"
                              onClick={() => {
                                const newColors = formData.colors.filter((_, i) => i !== index);
                                setFormData(prev => ({ ...prev, colors: newColors }));
                              }}
                              className="text-red-500 hover:text-red-700 text-sm"
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Available Sizes
                    </label>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        placeholder="Size (e.g., S, M, L, 32, 34)"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && e.target.value.trim()) {
                            const sizeName = e.target.value.trim();
                            const newSize = { name: sizeName, available: true, stock: 0 };
                            setFormData(prev => ({ ...prev, sizes: [...prev.sizes, newSize] }));
                            e.target.value = '';
                          }
                        }}
                      />
                    </div>
                    {formData.sizes.length > 0 && (
                      <div className="space-y-2">
                        {formData.sizes.map((size, index) => (
                          <div key={index} className="flex items-center gap-2 p-2 border border-gray-200 rounded">
                            <span className="flex-1 text-sm font-medium">{size.name}</span>
                            <input
                              type="number"
                              placeholder="Stock"
                              value={size.stock}
                              onChange={(e) => {
                                const updatedSizes = [...formData.sizes];
                                updatedSizes[index].stock = parseInt(e.target.value) || 0;
                                setFormData(prev => ({ ...prev, sizes: updatedSizes }));
                              }}
                              className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                              min="0"
                            />
                            <label className="flex items-center text-sm">
                              <input
                                type="checkbox"
                                checked={size.available}
                                onChange={(e) => {
                                  const updatedSizes = [...formData.sizes];
                                  updatedSizes[index].available = e.target.checked;
                                  setFormData(prev => ({ ...prev, sizes: updatedSizes }));
                                }}
                                className="mr-1"
                              />
                              Available
                            </label>
                            <button
                              type="button"
                              onClick={() => {
                                const newSizes = formData.sizes.filter((_, i) => i !== index);
                                setFormData(prev => ({ ...prev, sizes: newSizes }));
                              }}
                              className="text-red-500 hover:text-red-700 text-sm"
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Pricing & Inventory */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <ChartBarIcon className="h-5 w-5 mr-2 text-green-600" />
                  Pricing & Inventory
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      required
                      min="0"
                      step="0.01"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6C7A59] focus:border-transparent"
                      placeholder="0.00"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Original Price
                    </label>
                    <input
                      type="number"
                      name="originalPrice"
                      value={formData.originalPrice}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6C7A59] focus:border-transparent"
                      placeholder="0.00"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cost Price
                    </label>
                    <input
                      type="number"
                      name="costPrice"
                      value={formData.costPrice}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6C7A59] focus:border-transparent"
                      placeholder="0.00"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Low Stock Threshold
                    </label>
                    <input
                      type="number"
                      name="inventory.lowStockThreshold"
                      value={formData.inventory.lowStockThreshold}
                      onChange={handleInputChange}
                      min="0"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6C7A59] focus:border-transparent"
                      placeholder="10"
                    />
                    <p className="text-xs text-gray-500 mt-1">Alert when stock falls below this level</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Critical Stock Threshold
                    </label>
                    <input
                      type="number"
                      name="inventory.criticalStockThreshold"
                      value={formData.inventory.criticalStockThreshold}
                      onChange={handleInputChange}
                      min="0"
                      className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6C7A59] focus:border-transparent"
                      placeholder="5"
                    />
                    <p className="text-xs text-gray-500 mt-1">Critical alert level</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Reorder Point
                    </label>
                    <input
                      type="number"
                      name="inventory.reorderPoint"
                      value={formData.inventory.reorderPoint}
                      onChange={handleInputChange}
                      min="0"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6C7A59] focus:border-transparent"
                      placeholder="20"
                    />
                    <p className="text-xs text-gray-500 mt-1">Trigger automatic reordering</p>
                  </div>
                </div>
                
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-start">
                    <InformationCircleIcon className="h-5 w-5 text-blue-500 mt-0.5 mr-2" />
                    <div>
                      <p className="text-sm font-medium text-blue-900">Stock Management Note</p>
                      <p className="text-xs text-blue-700 mt-1">
                        Stock levels are managed separately in the Inventory section. 
                        These settings control when alerts and reorder notifications are triggered.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Product Specifications */}
              <div className="bg-gradient-to-r from-orange-50 to-red-50 p-6 rounded-xl">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <CubeIcon className="h-5 w-5 mr-2 text-orange-600" />
                  Product Specifications
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Material
                    </label>
                    <input
                      type="text"
                      name="specifications.material"
                      value={formData.specifications.material}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6C7A59] focus:border-transparent"
                      placeholder="e.g., 100% Cotton, Leather, etc."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Care Instructions
                    </label>
                    <input
                      type="text"
                      name="specifications.care"
                      value={formData.specifications.care}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6C7A59] focus:border-transparent"
                      placeholder="e.g., Machine wash cold, Hand wash only"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Weight (kg)
                    </label>
                    <input
                      type="number"
                      name="specifications.weight"
                      value={formData.specifications.weight}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6C7A59] focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Country of Origin
                    </label>
                    <input
                      type="text"
                      name="specifications.countryOfOrigin"
                      value={formData.specifications.countryOfOrigin}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6C7A59] focus:border-transparent"
                      placeholder="e.g., Sri Lanka, USA, etc."
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Warranty
                    </label>
                    <input
                      type="text"
                      name="specifications.warranty"
                      value={formData.specifications.warranty}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6C7A59] focus:border-transparent"
                      placeholder="e.g., 1 year warranty, No warranty"
                    />
                  </div>
                </div>
              </div>

              {/* Supplier Information */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <TruckIcon className="h-5 w-5 mr-2 text-purple-600" />
                  Supplier Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Supplier Name
                    </label>
                    <input
                      type="text"
                      name="supplier.name"
                      value={formData.supplier.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6C7A59] focus:border-transparent"
                      placeholder="Enter supplier name..."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contact Person
                    </label>
                    <input
                      type="text"
                      name="supplier.contact"
                      value={formData.supplier.contact}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6C7A59] focus:border-transparent"
                      placeholder="Enter contact person..."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      name="supplier.email"
                      value={formData.supplier.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6C7A59] focus:border-transparent"
                      placeholder="Enter email..."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone
                    </label>
                    <input
                      type="tel"
                      name="supplier.phone"
                      value={formData.supplier.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6C7A59] focus:border-transparent"
                      placeholder="Enter phone number..."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Lead Time (Days)
                    </label>
                    <input
                      type="number"
                      name="supplier.leadTime"
                      value={formData.supplier.leadTime}
                      onChange={handleInputChange}
                      min="0"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6C7A59] focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Minimum Order
                    </label>
                    <input
                      type="number"
                      name="supplier.minimumOrder"
                      value={formData.supplier.minimumOrder}
                      onChange={handleInputChange}
                      min="0"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6C7A59] focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Product Status */}
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-6 rounded-xl">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <StarIcon className="h-5 w-5 mr-2 text-yellow-600" />
                  Product Status & Features
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center gap-6">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="isActive"
                        checked={formData.isActive}
                        onChange={handleInputChange}
                        className="rounded border-gray-300 text-[#6C7A59] focus:ring-[#6C7A59] mr-2"
                      />
                      <span className="text-sm font-medium text-gray-700">Active Product</span>
                    </label>
                    
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="isFeatured"
                        checked={formData.isFeatured}
                        onChange={handleInputChange}
                        className="rounded border-gray-300 text-[#6C7A59] focus:ring-[#6C7A59] mr-2"
                      />
                      <span className="text-sm font-medium text-gray-700">Featured Product</span>
                    </label>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="isNew"
                        checked={formData.isNew}
                        onChange={handleInputChange}
                        className="rounded border-gray-300 text-[#6C7A59] focus:ring-[#6C7A59] mr-2"
                      />
                      <span className="text-sm font-medium text-gray-700">New Product</span>
                    </label>
                    
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="isOnSale"
                        checked={formData.isOnSale}
                        onChange={handleInputChange}
                        className="rounded border-gray-300 text-[#6C7A59] focus:ring-[#6C7A59] mr-2"
                      />
                      <span className="text-sm font-medium text-gray-700">On Sale</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-end gap-4 border-t border-gray-200 pt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowProductModal(false);
                    setEditingProduct(null);
                  }}
                  className="px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                
                <button
                  type="submit"
                  className="px-8 py-3 text-sm font-medium text-white bg-[#6C7A59] rounded-lg hover:bg-[#5A6A4A] transition-colors shadow-md"
                >
                  {editingProduct ? 'Update Product' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stock Management Modal */}
      {showStockModal && selectedProductForStock && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">
                  Stock Management - {selectedProductForStock.name}
                </h2>
                <button
                  onClick={() => {
                    setShowStockModal(false);
                    setSelectedProductForStock(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Current Stock Info */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Current Stock Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Current Stock:</span>
                    <span className="ml-2 text-lg font-bold text-blue-600">
                      {selectedProductForStock.inventory?.totalStock || 0}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Low Stock Threshold:</span>
                    <span className="ml-2 text-lg font-bold text-orange-600">
                      {selectedProductForStock.inventory?.lowStockThreshold || 10}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Critical Threshold:</span>
                    <span className="ml-2 text-lg font-bold text-red-600">
                      {selectedProductForStock.inventory?.criticalStockThreshold || 5}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Reorder Point:</span>
                    <span className="ml-2 text-lg font-bold text-purple-600">
                      {selectedProductForStock.inventory?.reorderPoint || 5}
                    </span>
                  </div>
                </div>
              </div>

              {/* Stock Action Form */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Stock Action</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Action Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={stockAction}
                      onChange={(e) => setStockAction(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6C7A59] focus:border-transparent"
                    >
                      <option value="adjustment">Set Stock to Specific Value</option>
                      <option value="addition">Add to Current Stock</option>
                      <option value="subtraction">Subtract from Current Stock</option>
                      <option value="restock">Restock Product</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Quantity <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={stockQuantity}
                      onChange={(e) => setStockQuantity(parseInt(e.target.value) || 0)}
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6C7A59] focus:border-transparent"
                      placeholder="Enter quantity"
                    />
                  </div>
                </div>
                
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={stockReason}
                    onChange={(e) => setStockReason(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6C7A59] focus:border-transparent"
                  >
                    <option value="">Select Reason</option>
                    <option value="Manual adjustment">Manual adjustment</option>
                    <option value="Restock from supplier">Restock from supplier</option>
                    <option value="Return from customer">Return from customer</option>
                    <option value="Damage/Loss">Damage/Loss</option>
                    <option value="Inventory count">Inventory count</option>
                    <option value="Transfer between locations">Transfer between locations</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes
                  </label>
                  <textarea
                    value={stockNotes}
                    onChange={(e) => setStockNotes(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6C7A59] focus:border-transparent"
                    placeholder="Additional notes about this stock change..."
                  />
                </div>
              </div>

              {/* Stock History */}
              <div className="bg-gradient-to-r from-gray-50 to-slate-50 p-4 rounded-xl">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900">Stock History</h3>
                  <button
                    onClick={() => fetchStockHistory(selectedProductForStock._id)}
                    className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Refresh
                  </button>
                </div>
                
                {stockHistory.length > 0 ? (
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {stockHistory.map((record, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-white rounded-lg border">
                        <div className="text-sm">
                          <span className="font-medium">{record.type}</span>
                          <span className="text-gray-500 ml-2">- {record.reason}</span>
                        </div>
                        <div className="text-sm text-gray-600">
                          {new Date(record.timestamp).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm text-center py-4">No stock history available</p>
                )}
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-4 border-t border-gray-200 pt-6">
                <button
                  onClick={() => {
                    setShowStockModal(false);
                    setSelectedProductForStock(null);
                  }}
                  className="px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                
                <button
                  onClick={handleStockAction}
                  className="px-8 py-3 text-sm font-medium text-white bg-[#6C7A59] rounded-lg hover:bg-[#5A6A4A] transition-colors shadow-md"
                >
                  Update Stock
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
    </motion.div>
  );
};

export default Products;

