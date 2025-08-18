import React, { useState } from 'react';
import { XMarkIcon, StarIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import api from '../utils/api';
import { useToast } from '../contexts/ToastContext';

const ReviewModal = ({ item, orderId, onClose, onSuccess }) => {
  const { success: showSuccess, error: showError } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    productRating: 0,
    deliveryRating: 0,
    customerServiceRating: 5, // Default to 5 for customer service
    productReview: '',
    deliveryReview: '',
    customerServiceReview: ''
  });

  const handleRatingChange = (type, rating) => {
    setFormData(prev => ({
      ...prev,
      [type]: rating
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.productRating === 0 || formData.deliveryRating === 0) {
      showError('Please provide ratings for product and delivery');
      return;
    }

    // Enhanced validation
    if (formData.productReview.trim().length < 5) {
      showError('Product review must be at least 5 characters long');
      return;
    }

    if (formData.deliveryReview.trim().length < 5) {
      showError('Delivery review must be at least 5 characters long');
      return;
    }

    try {
      setLoading(true);
      
      const reviewData = {
        orderId,
        productId: item.product._id || item.product,
        productRating: formData.productRating,
        deliveryRating: formData.deliveryRating,
        customerServiceRating: formData.customerServiceRating || 5, // Default to 5 if not provided
        productReview: formData.productReview.trim(),
        deliveryReview: formData.deliveryReview.trim(),
        customerServiceReview: formData.customerServiceReview.trim()
      };

      console.log('Submitting review:', reviewData);
      const response = await api.post('/api/reviews', reviewData);
      console.log('Review submission response:', response);
      
      showSuccess('🎉 Review submitted successfully! It will be visible after admin approval.');
      onSuccess();
    } catch (error) {
      console.error('Error submitting review:', error);
      showError(error.response?.data?.message || 'Failed to submit review. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStarRating = (type, rating, onChange) => (
    <div className="flex items-center space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(type, star)}
          className="text-2xl text-yellow-400 hover:text-yellow-500 transition-colors"
        >
          {star <= rating ? (
            <StarIconSolid className="h-6 w-6" />
          ) : (
            <StarIcon className="h-6 w-6" />
          )}
        </button>
      ))}
      <span className="ml-2 text-sm text-gray-600">
        {rating > 0 && `${rating}/5`}
      </span>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Write a Review</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Product Info */}
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

        {/* Review Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                     {/* Product Rating */}
           <div>
             <label className="block text-sm font-medium text-gray-700 mb-2">
               Product Rating * <span className="text-red-500">(Required)</span>
             </label>
             {renderStarRating('productRating', formData.productRating, handleRatingChange)}
             <textarea
               name="productReview"
               value={formData.productReview}
               onChange={handleInputChange}
               placeholder="Share your thoughts about the product quality, fit, design, etc. (minimum 5 characters) *"
               className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
               rows="3"
               maxLength="1000"
               required
             />
             <p className="mt-1 text-sm text-gray-500">
               {formData.productReview.length}/1000 characters
             </p>
           </div>

                     {/* Delivery Rating */}
           <div>
             <label className="block text-sm font-medium text-gray-700 mb-2">
               Delivery Experience * <span className="text-red-500">(Required)</span>
             </label>
             {renderStarRating('deliveryRating', formData.deliveryRating, handleRatingChange)}
             <textarea
               name="deliveryReview"
               value={formData.deliveryReview}
               onChange={handleInputChange}
               placeholder="How was your delivery experience? Packaging, speed, condition, etc. (minimum 5 characters) *"
               className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
               rows="3"
               maxLength="500"
               required
             />
             <p className="mt-1 text-sm text-gray-500">
               {formData.deliveryReview.length}/500 characters
             </p>
           </div>

          {/* Customer Service Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Customer Service Rating (optional)
            </label>
            {renderStarRating('customerServiceRating', formData.customerServiceRating, handleRatingChange)}
            <textarea
              name="customerServiceReview"
              value={formData.customerServiceReview}
              onChange={handleInputChange}
              placeholder="How was your experience with our customer service team? (optional)"
              className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows="3"
              maxLength="500"
            />
          </div>

                     {/* Progress Indicator */}
           <div className="pt-4 border-t border-gray-200">
             <div className="mb-4">
               <div className="flex justify-between text-sm text-gray-600 mb-2">
                 <span>Review Progress</span>
                 <span>{formData.productRating > 0 && formData.deliveryRating > 0 ? '100%' : '50%'}</span>
               </div>
               <div className="w-full bg-gray-200 rounded-full h-2">
                 <div 
                   className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                   style={{ 
                     width: `${formData.productRating > 0 && formData.deliveryRating > 0 ? 100 : 50}%` 
                   }}
                 ></div>
               </div>
             </div>
             
             {/* Submit Button */}
             <div className="flex justify-end space-x-3">
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
                 disabled={loading || formData.productRating === 0 || formData.deliveryRating === 0}
                 className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
               >
                 {loading ? (
                   <>
                     <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                     <span>Submitting...</span>
                   </>
                 ) : (
                   <>
                     <span>Submit Review</span>
                     <span className="text-sm">✓</span>
                   </>
                 )}
               </button>
             </div>
           </div>
        </form>
      </div>
    </div>
  );
};

export default ReviewModal;
