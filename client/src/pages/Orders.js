import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { FiPackage, FiCalendar, FiDollarSign, FiMapPin, FiEye } from 'react-icons/fi';
import api from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

const Orders = () => {
  const { success: showSuccess, error: showError } = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      
      // Debug: Check if user is authenticated and token exists
      const token = localStorage.getItem('token');
      console.log('User authenticated:', !!user);
      console.log('Token exists:', !!token);
      console.log('Token preview:', token ? `${token.substring(0, 20)}...` : 'No token');
      
      const response = await api.get('/api/orders/my-orders');
      setOrders(response.data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      showError('Failed to load orders');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [showError, user]);

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [fetchOrders, user]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'processing': return 'text-blue-600 bg-blue-100';
      case 'shipped': return 'text-purple-600 bg-purple-100';
      case 'completed': return 'text-green-600 bg-green-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return '⏳';
      case 'processing': return '⚙️';
      case 'shipped': return '🚚';
      case 'completed': return '✅';
      case 'cancelled': return '❌';
      default: return '📋';
    }
  };



  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h2>
          <p className="text-gray-600 mb-4">Please log in to view your orders.</p>
          <Link to="/login" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6C7A59] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            My Orders
          </h1>
          <p className="mt-2 text-gray-600">
            Track your order history and status
          </p>
        </div>

        {!orders || orders.length === 0 ? (
          <div className="text-center py-12">
            <FiPackage className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              No orders yet
            </h2>
            <p className="text-gray-600 mb-6">
              Start shopping to see your orders here
            </p>
            <Link 
              to="/shop" 
              className="inline-flex items-center px-6 py-3 bg-[#6C7A59] text-white font-medium rounded-lg hover:bg-[#5A6A4A] transition-colors"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order._id} className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300">
                {/* Order Header */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Order #{order._id?.slice(-8) || 'Unknown'}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Placed on {new Date(order.createdAt || order.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)} {order.status?.charAt(0).toUpperCase() + order.status?.slice(1) || 'Unknown'}
                    </span>
                  </div>
                </div>

                {/* Order Summary */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                    <FiDollarSign className="h-4 w-4 text-[#6C7A59]" />
                    <div>
                      <p className="text-xs text-gray-500">Total</p>
                      <p className="font-semibold text-gray-900">Rs. {(order.total || 0).toLocaleString()}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                    <FiPackage className="h-4 w-4 text-[#6C7A59]" />
                    <div>
                      <p className="text-xs text-gray-500">Items</p>
                      <p className="font-semibold text-gray-900">{order.items?.length || 0}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                    <FiCalendar className="h-4 w-4 text-[#6C7A59]" />
                    <div>
                      <p className="text-xs text-gray-500">Updated</p>
                      <p className="font-semibold text-gray-900">
                        {new Date(order.updatedAt || order.createdAt || order.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                    <FiMapPin className="h-4 w-4 text-[#6C7A59]" />
                    <div>
                      <p className="text-xs text-gray-500">Payment</p>
                      <p className="font-semibold text-gray-900 capitalize">
                        {order.paymentMethod === 'credit_card' ? 'Card' : 
                         order.paymentMethod === 'cash_on_delivery' ? 'COD' : 
                         order.paymentMethod || 'Unknown'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Order Items Preview */}
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Order Items</h4>
                  <div className="space-y-2">
                    {order.items?.slice(0, 3).map((item, index) => (
                      <div key={index} className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg">
                        <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                          {(() => {
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
                            
                            if (imageUrl && imageUrl.startsWith('http')) {
                              return <img src={imageUrl} alt={item.name || 'Product'} className="w-full h-full object-cover rounded-lg" />;
                            }
                            
                            // Fallback to package icon
                            return <FiPackage className="h-5 w-5 text-gray-400" />;
                          })()}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{item.name || 'Product'}</p>
                          <p className="text-xs text-gray-500">
                            {item.selectedColor || 'Default'} • {item.selectedSize || 'Default'} • Qty: {item.quantity || 1}
                          </p>
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          Rs. {((item.price || 0) * (item.quantity || 1)).toLocaleString()}
                        </span>
                      </div>
                    ))}
                    {order.items?.length > 3 && (
                      <p className="text-xs text-gray-500 text-center py-2">
                        +{order.items.length - 3} more items
                      </p>
                    )}
                  </div>
                </div>

                {/* Shipping Address */}
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm text-gray-600 mb-1">Shipping Address:</p>
                      <p className="text-sm text-gray-900">
                        {order.shippingAddress?.firstName} {order.shippingAddress?.lastName}<br />
                        {order.shippingAddress?.address || 'No address'}<br />
                        {order.shippingAddress?.city || 'No city'}, {order.shippingAddress?.province || order.shippingAddress?.state || 'No province'} {order.shippingAddress?.postalCode || order.shippingAddress?.zipCode || 'No postal code'}<br />
                        {order.shippingAddress?.country || 'Sri Lanka'}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <Link
                        to={`/order/${order._id}`}
                        className="inline-flex items-center px-4 py-2 bg-[#6C7A59] text-white text-sm font-medium rounded-lg hover:bg-[#5A6A4A] transition-colors"
                      >
                        <FiEye className="h-4 w-4 mr-2" />
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders; 