import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  CubeIcon,
  MagnifyingGlassIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import api from '../../utils/api';
import { useToast } from '../../contexts/ToastContext';
import { getPlaceholderImageUrl } from '../../utils/imageHelpers';

const emptyForm = {
  name: '',
  category: '',
  subcategory: '',
  brand: '',
  description: '',
  price: 0,
  stock: 0,
  image: '',
  images: [],
  isNew: false,
};

const Products = () => {
  const { success: showSuccess, error: showError } = useToast();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [uploading, setUploading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);

  const normalizeProduct = (p) => {
    if (!p) return null;
    const stock = p.inventory?.totalStock ?? p.stock ?? 0;
    return {
      ...p,
      _id: p._id || p.id,
      stock,
      price: p.price ?? 0,
      isNew: p.isNew ?? false,
      image: p.image || p.images?.[0] || '',
      images: p.images || [],
    };
  };

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/admin/products');
      const list = Array.isArray(res.data) ? res.data : res.data?.products || [];
      setProducts(list.map(normalizeProduct).filter(Boolean));
    } catch (err) {
      console.error('Error fetching products', err);
      showError('Failed to load products');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [showError]);

  const filteredProducts = useMemo(() => {
    if (!search.trim()) return products;
    const term = search.toLowerCase();
    return products.filter(
      (p) =>
        p.name?.toLowerCase().includes(term) ||
        p.category?.toLowerCase().includes(term) ||
        p.brand?.toLowerCase().includes(term),
    );
  }, [products, search]);

  const stats = useMemo(() => {
    const total = products.length;
    const outOfStock = products.filter((p) => (p.stock ?? 0) === 0).length;
    const lowStock = products.filter((p) => (p.stock ?? 0) > 0 && (p.stock ?? 0) <= 5).length;
    return { total, outOfStock, lowStock };
  }, [products]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      name: formData.name,
      description: formData.description,
      price: Number(formData.price) || 0,
      stock: Number(formData.stock) || 0,
      category: formData.category || '',
      subcategory: formData.subcategory || '',
      brand: formData.brand || '',
      isNew: !!formData.isNew,
      image: formData.image || formData.images[0] || '',
      images: formData.images || [],
    };

    try {
      if (editingProduct) {
        await api.put(`/api/admin/products/${editingProduct._id}`, payload);
        showSuccess('Product updated');
      } else {
        await api.post('/api/admin/products', payload);
        showSuccess('Product created');
      }
      setShowProductModal(false);
      setEditingProduct(null);
      setFormData(emptyForm);
      fetchProducts();
    } catch (err) {
      console.error('Error saving product', err);
      showError('Failed to save product');
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name || '',
      category: product.category || '',
      subcategory: product.subcategory || '',
      brand: product.brand || '',
      description: product.description || '',
      price: product.price || 0,
      stock: product.stock ?? 0,
      image: product.image || product.images?.[0] || '',
      images: product.images || [],
      isNew: product.isNew || false,
    });
    setShowProductModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await api.delete(`/api/admin/products/${id}`);
      showSuccess('Product deleted');
      fetchProducts();
    } catch (err) {
      console.error('Error deleting product', err);
      showError('Failed to delete product');
    }
  };

  const renderStockBadge = (stock) => {
    if (stock <= 0) return <span className="px-2 py-1 rounded-full text-xs bg-red-100 text-red-700">Out of stock</span>;
    if (stock <= 5) return <span className="px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-700">Low</span>;
    return <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-700">In stock</span>;
  };

  const fetchCategoriesList = useCallback(async () => {
    try {
      const res = await api.get('/api/admin/categories');
      const list = Array.isArray(res.data) ? res.data : res.data?.categories || [];
      setCategories(list);
    } catch (err) {
      console.error('Error fetching categories', err);
      setCategories([]);
    }
  }, []);

  const fetchSubcategoriesList = useCallback(async () => {
    try {
      const res = await api.get('/api/admin/categories/subcategories');
      const list = Array.isArray(res.data) ? res.data : res.data?.subcategories || [];
      setSubcategories(list);
    } catch (err) {
      console.error('Error fetching subcategories', err);
      setSubcategories([]);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
    fetchCategoriesList();
    fetchSubcategoriesList();
  }, [fetchProducts, fetchCategoriesList, fetchSubcategoriesList]);

  const uploadFileToCloud = async (file, makePrimary = false) => {
    const data = new FormData();
    data.append('file', file);
    try {
      setUploading(true);
      const res = await api.post('/api/admin/uploads/image', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const url = res.data?.url;
      if (url) {
        setFormData((prev) => {
          const nextImages = [...prev.images, url];
          return {
            ...prev,
            image: makePrimary || !prev.image ? url : prev.image,
            images: nextImages,
          };
        });
        showSuccess('Image uploaded');
      } else {
        showError('Upload did not return a URL');
      }
    } catch (err) {
      console.error('Upload error', err);
      showError('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin h-12 w-12 rounded-full border-b-2 border-[#6C7A59]" />
      </div>
    );
  }

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-600">Manage products with a minimal set of fields.</p>
        </div>
        <div className="flex gap-3">
          <div className="flex items-center bg-white rounded-lg shadow-sm border px-3">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="px-2 py-2 outline-none"
              placeholder="Search products..."
            />
          </div>
          <button
            onClick={() => {
              setEditingProduct(null);
              setFormData(emptyForm);
              setShowProductModal(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#6C7A59] text-white rounded-lg shadow hover:bg-[#5A6A4A]"
          >
            <PlusIcon className="h-5 w-5" />
            Add Product
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-[#6C7A59]">
          <p className="text-sm text-gray-600">Total Products</p>
          <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-red-500">
          <p className="text-sm text-gray-600">Out of Stock</p>
          <p className="text-3xl font-bold text-gray-900">{stats.outOfStock}</p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-yellow-500">
          <p className="text-sm text-gray-600">Low Stock</p>
          <p className="text-3xl font-bold text-gray-900">{stats.lowStock}</p>
        </div>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center shadow-sm border">
          <p className="text-lg text-gray-600">No products yet. Add your first product.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <motion.div
              key={product._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-sm border overflow-hidden flex flex-col"
            >
              <div className="relative h-40 bg-gray-100">
                <img
                  src={product.image || getPlaceholderImageUrl()}
                  alt={product.name}
                  className="h-40 w-full object-cover"
                  onError={(e) => {
                    e.target.src = getPlaceholderImageUrl();
                  }}
                />
                <div className="absolute top-2 right-2 space-y-1">
                  {product.isNew && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-700">
                      <CheckCircleIcon className="h-4 w-4 mr-1" />
                      New
                    </span>
                  )}
                </div>
              </div>

              <div className="p-4 flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{product.name}</h3>
                  {renderStockBadge(product.stock ?? 0)}
                </div>
                <p className="text-sm text-gray-600 line-clamp-2 mb-3">{product.description}</p>
                <div className="text-sm text-gray-700 mb-2">
                  <span className="font-semibold">Price:</span> Rs {(product.price || 0).toLocaleString()}
                </div>
                <div className="text-xs text-gray-500 mb-4">
                  {product.category || 'Uncategorized'} {product.brand ? `• ${product.brand}` : ''}
                </div>

                <div className="mt-auto flex items-center gap-2">
                  <button
                    onClick={() => handleEdit(product)}
                    className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 text-sm bg-[#6C7A59] text-white rounded-lg hover:bg-[#5A6A4A]"
                  >
                    <PencilIcon className="h-4 w-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(product._id)}
                    className="inline-flex items-center justify-center gap-1 px-3 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600"
                  >
                    <TrashIcon className="h-4 w-4" />
                    Delete
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {showProductModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-lg">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
              <button
                onClick={() => {
                  setShowProductModal(false);
                  setEditingProduct(null);
                  setFormData(emptyForm);
                }}
                className="text-gray-400 hover:text-gray-600 text-xl"
              >
                ×
              </button>
            </div>

            <form className="p-6 space-y-6" onSubmit={handleSubmit}>
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6C7A59] focus:border-transparent bg-white"
                  >
                    <option value="">Select category</option>
                    {categories.map((cat, idx) => {
                      const label = cat.name ?? cat.category ?? cat.title ?? cat.slug ?? cat.id ?? cat._id;
                      const value = label || '';
                      return (
                        <option key={`${value}-${idx}`} value={value}>
                          {label || 'Category'}
                        </option>
                      );
                    })}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Subcategory</label>
                  <select
                    name="subcategory"
                    value={formData.subcategory}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6C7A59] focus:border-transparent bg-white"
                  >
                    <option value="">Select subcategory</option>
                    {subcategories.map((sub, idx) => {
                      const label = sub.name ?? sub.title ?? sub.slug ?? sub.id ?? sub._id ?? sub;
                      const value = label || '';
                      return (
                        <option key={`${value}-${idx}`} value={value}>
                          {label || 'Subcategory'}
                        </option>
                      );
                    })}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Brand</label>
                  <input
                    type="text"
                    name="brand"
                    value={formData.brand}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6C7A59] focus:border-transparent"
                    placeholder="Brand name"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price (LKR) <span className="text-red-500">*</span>
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
                    Stock <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleInputChange}
                    required
                    min="0"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6C7A59] focus:border-transparent"
                    placeholder="Units in stock"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <label className="flex items-center gap-3 mt-8">
                  <input
                    type="checkbox"
                    name="isNew"
                    checked={formData.isNew}
                    onChange={handleInputChange}
                    className="h-5 w-5 text-[#6C7A59] focus:ring-[#6C7A59]"
                  />
                  <span className="text-sm text-gray-800">Mark as new product</span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6C7A59] focus:border-transparent"
                  placeholder="Detailed product description..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Primary Image</label>
                <div className="flex items-center gap-3 flex-wrap">
                  {formData.image && (
                    <img
                      src={formData.image}
                      alt="Primary"
                      className="h-16 w-16 object-cover rounded border"
                      onError={(e) => {
                        e.target.src = getPlaceholderImageUrl();
                      }}
                    />
                  )}
                  <label className="px-4 py-2 bg-gray-100 border rounded-lg cursor-pointer text-sm">
                    {uploading ? 'Uploading...' : 'Upload file'}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) uploadFileToCloud(file, true);
                        e.target.value = '';
                      }}
                      disabled={uploading}
                    />
                  </label>
                </div>
                <p className="text-sm text-gray-500 mt-1">Upload to set the main image.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Additional Images</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 space-y-3">
                  <label className="inline-flex px-4 py-2 bg-gray-100 border rounded-lg cursor-pointer text-sm">
                    {uploading ? 'Uploading...' : 'Upload file'}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) uploadFileToCloud(file, false);
                        e.target.value = '';
                      }}
                      disabled={uploading}
                    />
                  </label>
                  {formData.images.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
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
                              setFormData((prev) => ({ ...prev, images: newImages }));
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

              <div className="flex items-center justify-end gap-4 border-t border-gray-200 pt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowProductModal(false);
                    setEditingProduct(null);
                    setFormData(emptyForm);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-[#6C7A59] rounded-lg hover:bg-[#5A6A4A]"
                >
                  {editingProduct ? 'Update Product' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default Products;

