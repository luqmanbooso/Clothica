import React, { useState } from 'react';
import { XMarkIcon, ExclamationTriangleIcon, CameraIcon } from '@heroicons/react/24/outline';
import api from '../utils/api';
import { useToast } from '../contexts/ToastContext';

const IssueModal = ({ item, orderId, onClose, onSuccess }) => {
  const { success: showSuccess, error: showError } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    type: '',
    reason: '',
    description: '',
    images: []
  });

  const issueTypes = [
    { value: 'refund', label: 'Request Refund', description: 'Get your money back' },
    { value: 'return', label: 'Return Item', description: 'Send item back for refund' },
    { value: 'exchange', label: 'Exchange Item', description: 'Get a different size/color' },
    { value: 'damaged', label: 'Damaged Product', description: 'Item arrived damaged' },
    { value: 'wrong_item', label: 'Wrong Item Received', description: 'Received different product' },
    { value: 'not_as_described', label: 'Not as Described', description: 'Product doesn\'t match description' },
    { value: 'other', label: 'Other Issue', description: 'Something else' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length > 5) {
      showError('Maximum 5 images allowed');
      return;
    }

    // Convert files to base64 for demo (in production, upload to cloud storage)
    imageFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, {
            url: e.target.result,
            alt: file.name
          }]
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.type || !formData.reason) {
      showError('Please select issue type and provide a reason');
      return;
    }

    if (formData.reason.length < 10) {
      showError('Reason must be at least 10 characters long');
      return;
    }

    try {
      setLoading(true);
      
      const issueData = {
        orderId,
        orderItemId: item ? item._id : null,
        type: formData.type,
        reason: formData.reason,
        description: formData.description.trim(),
        images: formData.images
      };

      await api.post('/api/issues', issueData);
      
      showSuccess('Issue reported successfully! We will review and get back to you within 24-48 hours.');
      onSuccess();
    } catch (error) {
      console.error('Error reporting issue:', error);
      showError(error.response?.data?.message || 'Failed to report issue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <ExclamationTriangleIcon className="h-6 w-6 text-orange-500" />
            <h2 className="text-2xl font-bold text-gray-900">Report an Issue</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Order Info */}
        {item && (
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center space-x-4">
              <img
                src={(() => {
                  let imageUrl = null;
                  if (item.product && item.product.images && item.product.images.length > 0) {
                    if (typeof item.product.images[0] === 'object' && item.product.images[0].url) {
                      imageUrl = item.product.images[0].url;
                    } else if (typeof item.product.images[0] === 'string') {
                      imageUrl = item.product.images[0];
                    }
                  } else if (item.image) {
                    if (typeof item.image === 'object' && item.image.url) {
                      imageUrl = item.image.url;
                    } else if (typeof item.image === 'string') {
                      imageUrl = item.image;
                    }
                  }
                  return imageUrl && imageUrl.startsWith('http') ? imageUrl : 'https://via.placeholder.com/64';
                })()}
                alt={item.name || 'Product'}
                className="w-20 h-20 object-cover rounded-lg"
              />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
                <p className="text-sm text-gray-600">
                  Size: {item.selectedSize || 'One Size'} • Color: {item.selectedColor || 'Default'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Issue Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Issue Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              What type of issue are you experiencing? *
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {issueTypes.map((type) => (
                <label
                  key={type.value}
                  className={`relative flex cursor-pointer rounded-lg border p-4 focus:outline-none ${
                    formData.type === type.value
                      ? 'border-blue-500 ring-2 ring-blue-500'
                      : 'border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="type"
                    value={type.value}
                    checked={formData.type === type.value}
                    onChange={handleInputChange}
                    className="sr-only"
                  />
                  <div className="flex w-full items-center justify-between">
                    <div className="flex items-center">
                      <div className="text-sm">
                        <p className="font-medium text-gray-900">{type.label}</p>
                        <p className="text-gray-500">{type.description}</p>
                      </div>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Reason */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Please describe the issue in detail *
            </label>
            <textarea
              name="reason"
              value={formData.reason}
              onChange={handleInputChange}
              placeholder="Please provide a detailed explanation of the issue you're experiencing..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows="4"
              maxLength="1000"
              required
            />
            <p className="mt-1 text-sm text-gray-500">
              {formData.reason.length}/1000 characters
            </p>
          </div>

          {/* Additional Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Information (optional)
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Any additional details that might help us resolve your issue..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows="3"
              maxLength="2000"
            />
            <p className="mt-1 text-sm text-gray-500">
              {formData.description.length}/2000 characters
            </p>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Images (optional)
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
              <div className="space-y-1 text-center">
                <CameraIcon className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-600">
                  <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500">
                    <span>Upload files</span>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="sr-only"
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB each (max 5 images)</p>
              </div>
            </div>
            
            {/* Display uploaded images */}
            {formData.images.length > 0 && (
              <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
                {formData.images.map((image, index) => (
                  <div key={index} className="relative">
                    <img
                      src={image.url}
                      alt={image.alt}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Submitting...' : 'Submit Issue'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default IssueModal;


