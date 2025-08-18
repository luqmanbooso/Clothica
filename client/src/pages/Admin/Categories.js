import React, { useState, useEffect } from 'react';
import { 
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  TagIcon,
  CubeIcon
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import axios from 'axios';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [expandedCategories, setExpandedCategories] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    parentId: '',
    image: '',
    isActive: true,
    sortOrder: 0
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/admin/categories');
      setCategories(response.data.map(cat => ({
        id: cat._id,
        name: cat.name,
        description: cat.description || '',
        parentId: cat.parent,
        productCount: 0, // Will be updated separately
        isActive: cat.isActive,
        sortOrder: cat.order || 0,
        image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400', // Default image
        children: []
      })));
    } catch (error) {
      console.error('Error fetching categories:', error);
      // Fallback to empty array if API fails
      setCategories([]);
    } finally {
      setLoading(false);
    }
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

  const handleAddCategory = () => {
    setFormData({
      name: '',
      description: '',
      parentId: '',
      image: '',
      isActive: true,
      sortOrder: 0
    });
    setEditingCategory(null);
    setShowAddModal(true);
  };

  const handleEditCategory = (category) => {
    setFormData({
      name: category.name,
      description: category.description,
      parentId: category.parentId || '',
      image: category.image,
      isActive: category.isActive,
      sortOrder: category.sortOrder
    });
    setEditingCategory(category);
    setShowAddModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingCategory) {
      // Update existing category
      setCategories(prev => prev.map(cat => 
        cat.id === editingCategory.id 
          ? { ...cat, ...formData }
          : cat
      ));
    } else {
      // Add new category
      const newCategory = {
        id: Date.now(),
        ...formData,
        productCount: 0,
        children: []
      };
      setCategories(prev => [...prev, newCategory]);
    }
    setShowAddModal(false);
    setEditingCategory(null);
  };

  const handleDeleteCategory = (categoryId) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      setCategories(prev => prev.filter(cat => cat.id !== categoryId));
    }
  };

  const toggleExpanded = (categoryId) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  const getParentCategories = () => {
    return categories.filter(cat => !cat.parentId);
  };

  const filteredCategories = categories.filter(category => {
    const matchesSearch = category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         category.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' && category.isActive) ||
                         (filterStatus === 'inactive' && !category.isActive);
    return matchesSearch && matchesStatus;
  });

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
          <h1 className="text-2xl font-display font-bold text-[#1E1E1E]">Categories</h1>
          <p className="text-gray-600 mt-1">Manage your product categories and subcategories</p>
          </div>
          <button
          onClick={handleAddCategory}
          className="mt-4 sm:mt-0 flex items-center px-4 py-2 bg-gradient-to-r from-[#6C7A59] to-[#5A6A4A] text-white rounded-xl hover:shadow-lg transition-all duration-200"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Category
        </button>
      </motion.div>

      {/* Filters */}
      <motion.div 
        className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6"
        variants={itemVariants}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <input
              type="text"
              placeholder="Search categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6C7A59] focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6C7A59] focus:border-transparent"
            >
              <option value="all">All Categories</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
          </div>
          <div className="flex items-end">
            <div className="text-sm text-gray-600">
              <span className="font-semibold">{filteredCategories.length}</span> categories found
            </div>
          </div>
        </div>
      </motion.div>

      {/* Categories List */}
      <motion.div 
        className="bg-white rounded-2xl shadow-lg border border-gray-100"
        variants={itemVariants}
      >
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-display font-bold text-[#1E1E1E]">All Categories</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {filteredCategories.map((category) => (
              <div key={category.id} className="border border-gray-200 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#6C7A59] to-[#D6BFAF] rounded-lg flex items-center justify-center">
                      <TagIcon className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-semibold text-[#1E1E1E]">{category.name}</h4>
                        {!category.isActive && (
                          <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">Inactive</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{category.description}</p>
                      <div className="flex items-center space-x-4 mt-2">
                        <div className="flex items-center text-sm text-gray-600">
                          <CubeIcon className="h-4 w-4 mr-1" />
                          {category.productCount} products
                        </div>
                        {category.children && category.children.length > 0 && (
                          <div className="flex items-center text-sm text-gray-600">
                            <TagIcon className="h-4 w-4 mr-1" />
                            {category.children.length} subcategories
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {category.children && category.children.length > 0 && (
                      <button
                        onClick={() => toggleExpanded(category.id)}
                        className="p-2 text-gray-600 hover:text-[#6C7A59] transition-colors"
                      >
                        {expandedCategories.has(category.id) ? (
                          <ChevronDownIcon className="h-5 w-5" />
                        ) : (
                          <ChevronRightIcon className="h-5 w-5" />
                        )}
                      </button>
                    )}
                    <button
                      onClick={() => handleEditCategory(category)}
                      className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(category.id)}
                      className="p-2 text-gray-600 hover:text-red-600 transition-colors"
                    >
                      <TrashIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

                {/* Subcategories */}
                {category.children && category.children.length > 0 && expandedCategories.has(category.id) && (
                  <div className="mt-4 ml-8 space-y-3">
                    {category.children.map((subcategory) => (
                      <div key={subcategory.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-[#6C7A59] to-[#D6BFAF] rounded-lg flex items-center justify-center">
                            <TagIcon className="h-4 w-4 text-white" />
                </div>
                <div>
                            <h5 className="font-medium text-[#1E1E1E]">{subcategory.name}</h5>
                            <p className="text-sm text-gray-600">{subcategory.description}</p>
                            <div className="flex items-center text-sm text-gray-600 mt-1">
                              <CubeIcon className="h-4 w-4 mr-1" />
                              {subcategory.productCount} products
                            </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                            onClick={() => handleEditCategory(subcategory)}
                            className="p-1 text-gray-600 hover:text-blue-600 transition-colors"
                          >
                            <PencilIcon className="h-4 w-4" />
                </button>
                <button
                            onClick={() => handleDeleteCategory(subcategory.id)}
                            className="p-1 text-gray-600 hover:text-red-600 transition-colors"
                          >
                            <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
                    ))}
                  </div>
                )}
          </div>
        ))}
      </div>
        </div>
      </motion.div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-2xl p-6 w-full max-w-md mx-4"
          >
            <h3 className="text-xl font-display font-bold text-[#1E1E1E] mb-4">
                {editingCategory ? 'Edit Category' : 'Add New Category'}
              </h3>
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
        <input
          type="text"
          value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6C7A59] focus:border-transparent"
          required
        />
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
        <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Parent Category</label>
          <select
                  value={formData.parentId}
                  onChange={(e) => setFormData({...formData, parentId: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6C7A59] focus:border-transparent"
                >
                  <option value="">No Parent (Top Level)</option>
                  {getParentCategories().map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
          </select>
        </div>
      <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Image URL</label>
        <input
                  type="url"
                  value={formData.image}
                  onChange={(e) => setFormData({...formData, image: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6C7A59] focus:border-transparent"
                  placeholder="https://example.com/image.jpg"
        />
      </div>
              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                    className="rounded border-gray-300 text-[#6C7A59] focus:ring-[#6C7A59]"
                  />
                  <span className="ml-2 text-sm text-gray-700">Active</span>
        </label>
      </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-[#6C7A59] to-[#5A6A4A] text-white py-2 rounded-xl hover:shadow-lg transition-all duration-200"
                >
                  {editingCategory ? 'Update' : 'Create'}
                </button>
        <button
          type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-xl hover:bg-gray-300 transition-all duration-200"
        >
          Cancel
        </button>
      </div>
    </form>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default Categories;
