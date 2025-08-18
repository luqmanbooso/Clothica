import React, { useState, useEffect, useCallback } from 'react';
import { StarIcon, ExclamationTriangleIcon, ClockIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import api from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

const ReviewsAndIssues = () => {
  const { user } = useAuth();
  const { error: showError } = useToast();
  const [activeTab, setActiveTab] = useState('reviews');
  const [reviews, setReviews] = useState([]);
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewsPage, setReviewsPage] = useState(1);
  const [issuesPage, setIssuesPage] = useState(1);
  const [hasMoreReviews, setHasMoreReviews] = useState(true);
  const [hasMoreIssues, setHasMoreIssues] = useState(true);

  const fetchReviews = useCallback(async (page = 1, append = false) => {
    try {
      const response = await api.get(`/api/reviews/my-reviews?page=${page}&limit=10`);
      console.log('Reviews API Response:', response);
      
      // Handle different response structures
      let newReviews = [];
      if (Array.isArray(response.data)) {
        newReviews = response.data;
      } else if (Array.isArray(response.data?.reviews)) {
        newReviews = response.data.reviews;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        newReviews = response.data.data;
      } else {
        console.warn('Unexpected reviews response structure:', response.data);
        newReviews = [];
      }
      
      if (append) {
        setReviews(prev => [...prev, ...newReviews]);
      } else {
        setReviews(newReviews);
      }
      
      setHasMoreReviews(newReviews.length === 10);
      setReviewsPage(page);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      showError('Failed to load reviews');
      setReviews([]);
    }
  }, [showError]);

  const fetchIssues = useCallback(async (page = 1, append = false) => {
    try {
      const response = await api.get(`/api/issues/my-issues?page=${page}&limit=10`);
      console.log('Issues API Response:', response);
      
      // Handle different response structures
      let newIssues = [];
      if (Array.isArray(response.data)) {
        newIssues = response.data;
      } else if (Array.isArray(response.data?.issues)) {
        newIssues = response.data.issues;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        newIssues = response.data.data;
      } else {
        console.warn('Unexpected issues response structure:', response.data);
        newIssues = [];
      }
      
      if (append) {
        setIssues(prev => [...prev, ...newIssues]);
      } else {
        setIssues(newIssues);
      }
      
      setHasMoreIssues(newIssues.length === 10);
      setIssuesPage(page);
    } catch (error) {
      console.error('Error fetching issues:', error);
      showError('Failed to load issues');
      setIssues([]);
    }
  }, [showError]);

  useEffect(() => {
    if (user) {
      setLoading(true);
      Promise.all([
        fetchReviews(1, false),
        fetchIssues(1, false)
      ]).finally(() => setLoading(false));
    }
  }, [user, fetchReviews, fetchIssues]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'under_review': return 'bg-blue-100 text-blue-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'processing': return 'bg-purple-100 text-purple-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <ClockIcon className="h-4 w-4" />;
      case 'under_review': return <ClockIcon className="h-4 w-4" />;
      case 'approved': return <CheckCircleIcon className="h-4 w-4" />;
      case 'rejected': return <XCircleIcon className="h-4 w-4" />;
      case 'processing': return <ClockIcon className="h-4 w-4" />;
      case 'completed': return <CheckCircleIcon className="h-4 w-4" />;
      case 'cancelled': return <XCircleIcon className="h-4 w-4" />;
      default: return <ClockIcon className="h-4 w-4" />;
    }
  };

  const renderStarRating = (rating) => (
    <div className="flex items-center space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <span key={star} className="text-yellow-400">
          {star <= rating ? (
            <StarIconSolid className="h-4 w-4" />
          ) : (
            <StarIcon className="h-4 w-4" />
          )}
        </span>
      ))}
      <span className="ml-1 text-sm text-gray-600">{rating}/5</span>
    </div>
  );

  // Ensure reviews and issues are always arrays
  const safeReviews = Array.isArray(reviews) ? reviews : [];
  const safeIssues = Array.isArray(issues) ? issues : [];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                 {/* Header */}
         <div className="mb-8">
           <h1 className="text-3xl font-bold text-gray-900">Reviews & Issues</h1>
           <p className="mt-2 text-gray-600">
             Manage your product reviews and track issue resolution
           </p>
         </div>

         {/* Debug Info - Remove in production */}
         <div className="mb-6 p-4 bg-gray-100 rounded-lg text-sm">
           <p><strong>Debug Info:</strong></p>
           <p>Reviews type: {typeof reviews}, length: {Array.isArray(reviews) ? reviews.length : 'N/A'}</p>
           <p>Issues type: {typeof issues}, length: {Array.isArray(issues) ? issues.length : 'N/A'}</p>
           <p>Safe Reviews length: {safeReviews.length}</p>
           <p>Safe Issues length: {safeIssues.length}</p>
         </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
                             <button
                 onClick={() => setActiveTab('reviews')}
                 className={`py-2 px-1 border-b-2 font-medium text-sm ${
                   activeTab === 'reviews'
                     ? 'border-blue-500 text-blue-600'
                     : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                 }`}
               >
                 Reviews ({safeReviews.length})
               </button>
               <button
                 onClick={() => setActiveTab('issues')}
                 className={`py-2 px-1 border-b-2 font-medium text-sm ${
                   activeTab === 'issues'
                     ? 'border-blue-500 text-blue-600'
                     : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                 }`}
               >
                 Issues ({safeIssues.length})
               </button>
            </nav>
          </div>
        </div>

        {/* Content */}
                 {activeTab === 'reviews' && (
           <div className="space-y-6">
             {safeReviews.length === 0 ? (
              <div className="text-center py-12">
                <StarIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No reviews yet</h3>
                <p className="mt-1 text-sm text-gray-500">
                  You haven't written any reviews yet. Reviews will appear here after you submit them.
                </p>
              </div>
            ) : (
              <>
                                 <div className="grid gap-6">
                   {safeReviews.map((review) => (
                    <div key={review._id} className="bg-white rounded-lg shadow p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-4">
                          <img
                            src={(() => {
                              let imageUrl = null;
                              if (review.product && review.product.images && review.product.images.length > 0) {
                                if (typeof review.product.images[0] === 'object' && review.product.images[0].url) {
                                  imageUrl = review.product.images[0].url;
                                } else if (typeof review.product.images[0] === 'string') {
                                  imageUrl = review.product.images[0];
                                }
                              }
                              return imageUrl && imageUrl.startsWith('http') ? imageUrl : 'https://via.placeholder.com/64';
                            })()}
                            alt={review.product?.name || 'Product'}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                              {review.product?.name || 'Product'}
                            </h3>
                            <p className="text-sm text-gray-600">
                              Order #{review.order?.orderNumber || review.order?.slice(-8)}
                            </p>
                          </div>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(review.status)}`}>
                          {review.status.charAt(0).toUpperCase() + review.status.slice(1)}
                        </span>
                      </div>

                                             <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                         <div>
                           <label className="text-sm font-medium text-gray-700">Product Rating</label>
                           {renderStarRating(review.rating?.product || 0)}
                           {review.review?.product && (
                             <p className="mt-2 text-sm text-gray-600">{review.review.product}</p>
                           )}
                         </div>
                         <div>
                           <label className="text-sm font-medium text-gray-700">Delivery Rating</label>
                           {renderStarRating(review.rating?.delivery || 0)}
                           {review.review?.delivery && (
                             <p className="mt-2 text-sm text-gray-600">{review.review.delivery}</p>
                           )}
                         </div>
                         <div>
                           <label className="text-sm font-medium text-gray-700">Customer Service</label>
                           {(review.rating?.customerService || 0) > 0 ? (
                             <>
                               {renderStarRating(review.rating.customerService)}
                               {review.review?.customerService && (
                                 <p className="mt-2 text-sm text-gray-600">{review.review.customerService}</p>
                               )}
                             </>
                           ) : (
                             <p className="text-sm text-gray-500">Not rated</p>
                           )}
                         </div>
                       </div>

                      <div className="text-xs text-gray-500">
                        Submitted on {new Date(review.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>

                {hasMoreReviews && (
                  <div className="text-center">
                    <button
                      onClick={() => fetchReviews(reviewsPage + 1, true)}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Load More Reviews
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

                 {activeTab === 'issues' && (
           <div className="space-y-6">
             {safeIssues.length === 0 ? (
              <div className="text-center py-12">
                <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No issues reported</h3>
                <p className="mt-1 text-sm text-gray-500">
                  You haven't reported any issues yet. Reported issues will appear here.
                </p>
              </div>
            ) : (
              <>
                                 <div className="grid gap-6">
                   {safeIssues.map((issue) => (
                    <div key={issue._id} className="bg-white rounded-lg shadow p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-4">
                          <div className="flex-shrink-0">
                            <ExclamationTriangleIcon className="h-8 w-8 text-orange-500" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 capitalize">
                              {issue.type.replace('_', ' ')}
                            </h3>
                            <p className="text-sm text-gray-600">
                              Order #{issue.order?.orderNumber || issue.order?.slice(-8)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(issue.status)}`}>
                            {getStatusIcon(issue.status)}
                            <span className="ml-1">{issue.status.charAt(0).toUpperCase() + issue.status.slice(1)}</span>
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            issue.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                            issue.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                            issue.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {issue.priority.charAt(0).toUpperCase() + issue.priority.slice(1)} Priority
                          </span>
                        </div>
                      </div>

                                             <div className="mb-4">
                         <h4 className="text-sm font-medium text-gray-700 mb-2">Issue Description</h4>
                         <p className="text-gray-900">{issue.reason || 'No reason provided'}</p>
                         {issue.description && (
                           <p className="text-gray-600 mt-2">{issue.description}</p>
                         )}
                       </div>

                       {issue.resolution && issue.resolution.action && issue.resolution.action !== 'none' && (
                         <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                           <h4 className="text-sm font-medium text-blue-900 mb-2">Resolution</h4>
                           <p className="text-blue-800">
                             Action: {issue.resolution.action.replace('_', ' ').charAt(0).toUpperCase() + issue.resolution.action.replace('_', ' ').slice(1)}
                           </p>
                           {issue.resolution.amount && (
                             <p className="text-blue-800">
                               Amount: Rs. {issue.resolution.amount.toLocaleString()}
                             </p>
                           )}
                           {issue.resolution.notes && (
                             <p className="text-blue-800 mt-2">{issue.resolution.notes}</p>
                           )}
                         </div>
                       )}

                      <div className="text-xs text-gray-500">
                        Reported on {new Date(issue.createdAt).toLocaleDateString()}
                        {issue.updatedAt !== issue.createdAt && (
                          <span className="ml-4">
                            Last updated on {new Date(issue.updatedAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {hasMoreIssues && (
                  <div className="text-center">
                    <button
                      onClick={() => fetchIssues(issuesPage + 1, true)}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Load More Issues
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewsAndIssues;
