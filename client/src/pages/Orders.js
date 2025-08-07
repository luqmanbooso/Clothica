import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiPackage, FiCalendar, FiDollarSign } from 'react-icons/fi';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/orders/my-orders');
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'processing': return 'text-blue-600 bg-blue-100';
      case 'shipped': return 'text-purple-600 bg-purple-100';
      case 'delivered': return 'text-green-600 bg-green-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-secondary-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-secondary-900">
            My Orders
          </h1>
          <p className="mt-2 text-secondary-600">
            Track your order history and status
          </p>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-12">
            <FiPackage className="mx-auto h-16 w-16 text-secondary-400 mb-4" />
            <h2 className="text-2xl font-display font-semibold text-secondary-900 mb-2">
              No orders yet
            </h2>
            <p className="text-secondary-600 mb-6">
              Start shopping to see your orders here
            </p>
            <Link to="/shop" className="btn-primary">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order._id} className="bg-white rounded-xl shadow-soft p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-secondary-900">
                      Order #{order._id.slice(-8)}
                    </h3>
                    <p className="text-sm text-secondary-600">
                      Placed on {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="flex items-center space-x-2">
                    <FiDollarSign className="h-4 w-4 text-secondary-400" />
                    <span className="text-sm text-secondary-600">Total:</span>
                    <span className="font-semibold text-secondary-900">${order.total.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <FiPackage className="h-4 w-4 text-secondary-400" />
                    <span className="text-sm text-secondary-600">Items:</span>
                    <span className="font-semibold text-secondary-900">{order.items.length}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <FiCalendar className="h-4 w-4 text-secondary-400" />
                    <span className="text-sm text-secondary-600">Updated:</span>
                    <span className="font-semibold text-secondary-900">
                      {new Date(order.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="border-t border-secondary-200 pt-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm text-secondary-600 mb-1">Shipping Address:</p>
                      <p className="text-sm text-secondary-900">
                        {order.shippingAddress.street}, {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
                      </p>
                    </div>
                    <Link
                      to={`/order/${order._id}`}
                      className="btn-outline text-sm"
                    >
                      View Details
                    </Link>
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