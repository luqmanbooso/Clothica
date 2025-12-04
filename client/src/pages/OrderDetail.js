import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiPackage, FiTruck, FiCalendar, FiDollarSign, FiMapPin, FiArrowLeft, FiPrinter } from 'react-icons/fi';
import api from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import Invoice from '../components/Invoice/Invoice';
import ReviewModal from '../components/ReviewModal';
import IssueModal from '../components/IssueModal';

const OrderDetail = () => {
  const { id } = useParams();
  const { error: showError } = useToast();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showInvoice, setShowInvoice] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState({ show: false, item: null, orderId: null });
  const [showIssueModal, setShowIssueModal] = useState({ show: false, item: null, orderId: null });
  const { user } = useAuth();

  const fetchOrder = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/orders/${id}`);
      const data = response.data || {};
      const mappedItems = (data.orderItems || data.items || []).map((item) => ({
        ...item,
        _id: item.id || item._id || item.productId,
        id: item.id || item._id || item.productId,
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        price: item.price || item.itemTotal || 0
      }));

      const normalized = {
        ...data,
        _id: data.id || data._id || id,
        id: data.id || data._id || id,
        orderNumber: data.orderNumber || data.id || data._id,
        total: data.totalAmount || data.total || 0,
        status: data.status?.toLowerCase() || 'pending',
        orderItems: mappedItems,
        items: mappedItems
      };
      setOrder(normalized);
    } catch (error) {
      console.error('Error fetching order:', error);
      showError('Failed to load order details');
    } finally {
      setLoading(false);
    }
  }, [id, showError]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'processing': return 'text-blue-600 bg-blue-100';
      case 'shipped': return 'text-purple-600 bg-purple-100';
      case 'complete': return 'text-green-600 bg-green-100';
      case 'completed': return 'text-green-600 bg-green-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-secondary-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-secondary-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-display font-semibold text-secondary-900 mb-2">
            Order not found
          </h2>
          <p className="text-secondary-600 mb-4">
            The order you're looking for doesn't exist or has been removed.
          </p>
          <Link to="/orders" className="btn-primary">
            Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-secondary-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <Link to="/orders" className="inline-flex items-center space-x-2 text-primary-600 hover:text-primary-700 mb-4">
              <FiArrowLeft className="h-4 w-4" />
              <span>Back to Orders</span>
            </Link>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-display font-bold text-secondary-900">
                  Order Details
                </h1>
                <p className="mt-2 text-secondary-600">
                  Order #{(order.orderNumber || order._id || '').toString().slice(-8)}
                </p>
              </div>
              <button
                onClick={() => setShowInvoice(true)}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                <FiPrinter className="h-4 w-4 mr-2" />
                View Invoice
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Order Information */}
            <div className="lg:col-span-2 space-y-6">
              {/* Order Status */}
              <div className="bg-white rounded-xl shadow-soft p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-secondary-900">
                    Order Status
                  </h2>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center space-x-2">
                    <FiCalendar className="h-4 w-4 text-secondary-400" />
                    <div>
                      <p className="text-xs text-secondary-600">Order Date</p>
                      <p className="text-sm font-medium text-secondary-900">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <FiDollarSign className="h-4 w-4 text-secondary-400" />
                    <div>
                      <p className="text-xs text-secondary-600">Total Amount</p>
                      <p className="text-sm font-medium text-secondary-900">
                        Rs. {order.total.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <FiPackage className="h-4 w-4 text-secondary-400" />
                    <div>
                      <p className="text-xs text-secondary-600">Items</p>
                      <p className="text-sm font-medium text-secondary-900">
                        {order.items.length}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="bg-white rounded-xl shadow-soft p-6">
                <h2 className="text-xl font-semibold text-secondary-900 mb-4">
                  Order Items
                </h2>
                <div className="space-y-4">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex items-center space-x-4 p-4 border border-secondary-200 rounded-lg">
                      <img
                        src={(() => {
                          // The image data is in item.product.images, not item.image
                          let imageUrl = null;
                          
                          if (item.product && item.product.images && item.product.images.length > 0) {
                            // Handle array of image objects
                            if (typeof item.product.images[0] === 'object' && item.product.images[0].url) {
                              imageUrl = item.product.images[0].url;
                            } else if (typeof item.product.images[0] === 'string') {
                              imageUrl = item.product.images[0];
                            }
                          } else if (item.image) {
                            // Fallback to item.image if it exists
                            if (typeof item.image === 'object' && item.image.url) {
                              imageUrl = item.image.url;
                            } else if (typeof item.image === 'string') {
                              imageUrl = item.image;
                            }
                          }
                          
                          return imageUrl && imageUrl.startsWith('http') ? imageUrl : 'https://via.placeholder.com/64';
                        })()}
                        alt={item.name || 'Product'}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-secondary-900">
                          {item.name}
                        </h3>
                        <p className="text-sm text-secondary-600">
                          Size: {item.selectedSize || 'One Size'} • Color: {item.selectedColor || 'Default'}
                        </p>
                        <p className="text-sm text-secondary-600">
                          Quantity: {item.quantity}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-secondary-900">
                          Rs. {(item.price * item.quantity).toLocaleString()}
                        </p>
                        <p className="text-sm text-secondary-600">
                          Rs. {item.price.toLocaleString()} each
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

              {/* Review and Issue Management */}
              
              {(order.status === 'complete' || order.status === 'Complete' || order.status === 'completed' || order.status === 'Completed' || order.status?.toLowerCase() === 'complete' || order.status?.toLowerCase() === 'completed') && (
                <div className="bg-white rounded-xl shadow-soft p-6">
                  <h2 className="text-xl font-semibold text-secondary-900 mb-4">
                    Review & Issue Management
                  </h2>
                  
                  <div className="space-y-4">
                    {order.items.map((item, index) => (
                      <div key={index} className="border border-secondary-200 rounded-lg p-4">
                        <div className="flex items-center space-x-4 mb-4">
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
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                          <div className="flex-1">
                            <h3 className="text-xl font-semibold text-secondary-900">{item.name}</h3>
                            <p className="text-sm text-secondary-600">
                              Size: {item.selectedSize || 'One Size'} • Color: {item.selectedColor || 'Default'}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex space-x-3">
                          <button
                            onClick={() => setShowReviewModal({ show: true, item, orderId: order.id || order._id })}
                            className="flex-1 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
                          >
                            Write Review
                          </button>
                          <button
                            onClick={() => setShowIssueModal({ show: true, item, orderId: order.id || order._id })}
                            className="flex-1 px-4 py-2 bg-orange-600 text-white text-sm font-medium rounded-lg hover:bg-orange-700 transition-colors"
                          >
                            Report Issue
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Issue Management for Non-Complete Orders */}
              {order.status !== 'complete' && order.status !== 'Complete' && order.status !== 'completed' && order.status !== 'Completed' && order.status !== 'cancelled' && order.status !== 'Cancelled' && (
                <div className="bg-white rounded-xl shadow-soft p-6">
                  <h2 className="text-xl font-semibold text-secondary-900 mb-4">
                    Need Help?
                  </h2>
                  <p className="text-secondary-600 mb-4">
                    Having an issue with your order? We're here to help!
                  </p>
                  <button
                    onClick={() => setShowIssueModal({ show: true, item: null, orderId: order.id || order._id })}
                    className="px-6 py-2 bg-orange-600 text-white font-medium rounded-lg hover:bg-orange-700 transition-colors"
                  >
                    Report Issue
                  </button>
                </div>
              )}
            </div>

            {/* Shipping Information */}
            <div className="bg-white rounded-xl shadow-soft p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <FiMapPin className="h-5 w-5 text-primary-600" />
                  <h2 className="text-xl font-semibold text-secondary-900">
                    Shipping Information
                  </h2>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-secondary-600">Address</p>
                    <p className="text-secondary-900">
                      {order.shippingAddress.street}
                    </p>
                    <p className="text-secondary-900">
                      {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
                    </p>
                    <p className="text-secondary-900">
                      {order.shippingAddress.country}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-secondary-600">Phone</p>
                    <p className="text-secondary-900">
                      {order.shippingAddress.phone}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-soft p-6 sticky top-24">
                <h2 className="text-lg font-semibold text-secondary-900 mb-4">
                  Order Summary
                </h2>
                
                <div className="space-y-3">
                  <div className="flex justify-between text-secondary-600">
                    <span>Subtotal</span>
                    <span>Rs. {order.subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-secondary-600">
                    <span>Shipping</span>
                    <span>{order.shippingCost === 0 ? 'Free' : `Rs. ${order.shippingCost.toLocaleString()}`}</span>
                  </div>
                  <div className="flex justify-between text-secondary-600">
                    <span>Tax</span>
                    <span>Rs. {(order.tax || 0).toLocaleString()}</span>
                  </div>
                  <div className="border-t border-secondary-200 pt-3">
                    <div className="flex justify-between text-lg font-semibold text-secondary-900">
                      <span>Total</span>
                      <span>Rs. {order.total.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {order.notes && (
                  <div className="mt-6 pt-6 border-t border-secondary-200">
                    <h3 className="text-sm font-medium text-secondary-700 mb-2">
                      Order Notes
                    </h3>
                    <p className="text-sm text-secondary-600">
                      {order.notes}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {showInvoice && order && (
        <Invoice
          order={order}
          onClose={() => setShowInvoice(false)}
        />
      )}

      {/* Review Modal */}
      {showReviewModal.show && showReviewModal.item && (
        <ReviewModal
          item={showReviewModal.item}
          orderId={showReviewModal.orderId}
          onClose={() => setShowReviewModal({ show: false, item: null, orderId: null })}
          onSuccess={() => {
            setShowReviewModal({ show: false, item: null, orderId: null });
            // Optionally refresh order data or show success message
          }}
        />
      )}

      {/* Issue Modal */}
      {showIssueModal.show && (
        <IssueModal
          item={showIssueModal.item}
          orderId={showIssueModal.orderId}
          onClose={() => setShowIssueModal({ show: false, item: null, orderId: null })}
          onSuccess={() => {
            setShowIssueModal({ show: false, item: null, orderId: null });
            // Optionally refresh order data or show success message
          }}
        />
      )}
    </>
  );
};

export default OrderDetail; 
