import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  CheckCircleIcon, 
  TruckIcon, 
  HomeIcon,
  ShoppingBagIcon,
  DocumentArrowDownIcon,
  EyeIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';

const OrderSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [orderData, setOrderData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isGeneratingInvoice, setIsGeneratingInvoice] = useState(false);
  const [invoiceGenerated, setInvoiceGenerated] = useState(false);

  useEffect(() => {
    // Check if we have order data in location state
    const stateOrder = location.state?.order;
    const stateOrderId = location.state?.orderId;
    
    console.log('OrderSuccess - Location state:', location.state);
    console.log('OrderSuccess - State order:', stateOrder);
    console.log('OrderSuccess - State order ID:', stateOrderId);

    if (stateOrder && stateOrderId) {
      // We have valid order data, store it in sessionStorage for refresh protection
      const orderKey = `order_${stateOrderId}`;
      sessionStorage.setItem(orderKey, JSON.stringify({
        order: stateOrder,
        orderId: stateOrderId,
        timestamp: Date.now(),
        total: location.state.total,
        shippingCost: location.state.shippingCost,
        paymentMethod: location.state.paymentMethod,
        shippingMethod: location.state.shippingMethod,
        items: location.state.items,
        shippingAddress: location.state.shippingAddress
      }));
      
      setOrderData({
        order: stateOrder,
        orderId: stateOrderId,
        total: location.state.total,
        shippingCost: location.state.shippingCost,
        paymentMethod: location.state.paymentMethod,
        shippingMethod: location.state.shippingMethod,
        items: location.state.items || [],
        shippingAddress: location.state.shippingAddress || {}
      });
      setIsLoading(false);
    } else {
      // No order data in state, check sessionStorage for recent orders
      checkSessionStorageForOrder();
    }
  }, [location.state]);

  const checkSessionStorageForOrder = () => {
    try {
      // Look for any recent order in sessionStorage
      const keys = Object.keys(sessionStorage);
      const orderKeys = keys.filter(key => key.startsWith('order_'));
      
      if (orderKeys.length > 0) {
        // Get the most recent order
        let mostRecentOrder = null;
        let mostRecentTimestamp = 0;
        
        orderKeys.forEach(key => {
          try {
            const stored = JSON.parse(sessionStorage.getItem(key));
            if (stored && stored.timestamp && stored.timestamp > mostRecentTimestamp) {
              mostRecentOrder = stored;
              mostRecentTimestamp = stored.timestamp;
            }
          } catch (e) {
            console.error('Error parsing stored order:', e);
          }
        });
        
        if (mostRecentOrder && (Date.now() - mostRecentOrder.timestamp) < 300000) { // 5 minutes
          console.log('OrderSuccess - Found recent order in sessionStorage:', mostRecentOrder);
          setOrderData(mostRecentOrder);
          setIsLoading(false);
          return;
        }
      }
      
      // No valid order found, redirect to home
      console.log('OrderSuccess - No valid order found, redirecting to home');
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Error checking sessionStorage:', error);
      navigate('/', { replace: true });
    }
  };

  const handleGenerateInvoice = async () => {
    if (!orderData?.orderId) {
      console.error('No order ID available for invoice generation');
      return;
    }

    setIsGeneratingInvoice(true);
    setTimeout(() => {
      setInvoiceGenerated(true);
      setIsGeneratingInvoice(false);
      setError('Invoice downloads are not available on this backend yet.');
    }, 400);
  };

  const handleViewInvoice = () => {
    setError('Invoice downloads are not available on this backend yet.');
  };

  const handleGoHome = () => {
    // Clear order data from sessionStorage
    if (orderData?.orderId) {
      const orderKey = `order_${orderData.orderId}`;
      sessionStorage.removeItem(orderKey);
    }
    navigate('/', { replace: true });
  };

  const handleContinueShopping = () => {
    // Clear order data from sessionStorage
    if (orderData?.orderId) {
      const orderKey = `order_${orderData.orderId}`;
      sessionStorage.removeItem(orderKey);
    }
    navigate('/shop', { replace: true });
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <ExclamationTriangleIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Something went wrong</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={handleGoHome}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  // Show success state
  if (!orderData) {
    return null;
  }

  const { order, orderId, total, shippingCost, paymentMethod, shippingMethod, items, shippingAddress } = orderData;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Header */}
        <div className="text-center mb-12">
          <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-green-100 mb-6">
            <CheckCircleIcon className="h-12 w-12 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Order Placed Successfully! 🎉
          </h1>
          <p className="text-lg text-gray-600">
            Thank you for your purchase! We're excited to deliver your Sri Lankan fashion items.
          </p>
          {orderId && (
            <p className="text-sm text-gray-500 mt-2">
              Order ID: <span className="font-mono bg-gray-100 px-2 py-1 rounded">{orderId}</span>
            </p>
          )}
        </div>

        {/* Invoice Actions */}
        {orderId && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
              Invoice & Receipt
            </h2>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleGenerateInvoice}
                disabled={isGeneratingInvoice}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isGeneratingInvoice ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
                    Download Invoice
                  </>
                  )}
              </button>
              <button
                onClick={handleViewInvoice}
                className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <EyeIcon className="h-4 w-4 mr-2" />
                View Invoice
              </button>
            </div>
          </div>
        )}

        {/* Order Details */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <ShoppingBagIcon className="h-5 w-5 mr-2" />
            Order Details
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Order Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium">LKR {total?.toLocaleString() || '0'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping:</span>
                  <span className="font-medium">
                    {shippingCost === 0 ? 'FREE' : `LKR ${shippingCost?.toLocaleString() || '0'}`}
                  </span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="font-semibold text-gray-900">Total:</span>
                  <span className="font-semibold text-gray-900">
                    LKR {((total || 0) + (shippingCost || 0)).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Payment & Shipping</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Method:</span>
                  <span className="font-medium capitalize">{paymentMethod || 'Unknown'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping Method:</span>
                  <span className="font-medium capitalize">{shippingMethod || 'Standard'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className="font-medium text-green-600">Processing</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Shipping Address */}
        {shippingAddress && Object.keys(shippingAddress).length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <TruckIcon className="h-5 w-5 mr-2" />
              Shipping Address
            </h2>
            <div className="text-sm text-gray-600">
              <p className="mb-1">{shippingAddress.firstName} {shippingAddress.lastName}</p>
              <p className="mb-1">{shippingAddress.address}</p>
              <p className="mb-1">{shippingAddress.city}, {shippingAddress.province} {shippingAddress.postalCode}</p>
              <p className="mb-1">{shippingAddress.country}</p>
              <p className="mb-1">Phone: {shippingAddress.phone}</p>
              <p>Email: {shippingAddress.email}</p>
            </div>
          </div>
        )}

        {/* Order Items */}
        {items && items.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h2>
            <div className="space-y-4">
              {items.map((item, index) => (
                <div key={index} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                  <img
                    src={item.images?.[0] || item.image || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2YzZjRmNiIvPjx0ZXh0IHg9IjE1MCIgeT0iMTUwIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IiM2YjcyODAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiPlByb2R1Y3QgSW1hZ2U8L3RleHQ+PHRleHQgeD0iMTUwIiB5PSIxNzAiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxMiIgZmlsbD0iIzljYTNhZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSI+Tm8gSW1hZ2UgQXZhaWxhYmxlPC90ZXh0Pjwvc3ZnPg=='}
                    alt={item.name || 'Product'}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{item.name || 'Unknown Product'}</h3>
                    <p className="text-sm text-gray-600">
                      Qty: {item.quantity || 1}
                      {item.selectedSize && ` • Size: ${item.selectedSize}`}
                      {item.selectedColor && ` • Color: ${item.selectedColor}`}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">
                      LKR {((item.price || 0) * (item.quantity || 1)).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={handleGoHome}
            className="flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
          >
            <HomeIcon className="h-5 w-5 mr-2" />
            Go Home
          </button>
          <button
            onClick={handleContinueShopping}
            className="flex items-center justify-center px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
          >
            <ShoppingBagIcon className="h-5 w-5 mr-2" />
            Continue Shopping
          </button>
        </div>

        {/* Additional Info */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            A confirmation email with your invoice has been sent to your email address.
          </p>
          <p className="text-xs text-gray-400 mt-2">
            If you have any questions, please contact our support team.
          </p>
        </div>

      </div>

    </div>
  );
};

export default OrderSuccess;
