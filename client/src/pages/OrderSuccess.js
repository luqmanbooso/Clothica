import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  CheckCircleIcon, 
  TruckIcon, 
  HomeIcon,
  ShoppingBagIcon,
  DocumentArrowDownIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import axios from 'axios';

const OrderSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const order = location.state?.order;
  const orderId = location.state?.orderId;
  const invoiceUrl = location.state?.invoiceUrl;
  
  const [isGeneratingInvoice, setIsGeneratingInvoice] = useState(false);
  const [invoiceGenerated, setInvoiceGenerated] = useState(false);

  // Debug: Log the order data to see what's actually being passed
  console.log('OrderSuccess - Received order:', order);
  console.log('OrderSuccess - Order ID:', orderId);
  console.log('OrderSuccess - Invoice URL:', invoiceUrl);

  if (!order) {
    console.log('OrderSuccess - No order data, redirecting to home');
    navigate('/');
    return null;
  }

  const handleGenerateInvoice = async () => {
    if (!orderId) {
      console.error('No order ID available for invoice generation');
      return;
    }

    setIsGeneratingInvoice(true);
    try {
      // Generate invoice
      const response = await axios.get(`/api/orders/${orderId}/invoice`, {
        responseType: 'blob'
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${orderId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      setInvoiceGenerated(true);
    } catch (error) {
      console.error('Error generating invoice:', error);
      // Fallback: open invoice in new tab
      if (invoiceUrl) {
        window.open(invoiceUrl, '_blank');
      }
    } finally {
      setIsGeneratingInvoice(false);
    }
  };

  const handleViewInvoice = () => {
    if (invoiceUrl) {
      window.open(invoiceUrl, '_blank');
    } else if (orderId) {
      window.open(`/api/orders/${orderId}/invoice`, '_blank');
    }
  };

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
              <DocumentArrowDownIcon className="h-6 w-6 text-[#6C7A59] mr-3" />
              Invoice & Receipt
            </h2>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleGenerateInvoice}
                disabled={isGeneratingInvoice}
                className="flex-1 bg-[#6C7A59] text-white py-3 px-6 rounded-lg font-semibold hover:bg-[#5A6A4A] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                {isGeneratingInvoice ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
                    Download Invoice
                  </>
                  )}
              </button>
              
              <button
                onClick={handleViewInvoice}
                className="flex-1 bg-white text-[#6C7A59] border-2 border-[#6C7A59] py-3 px-6 rounded-lg font-semibold hover:bg-[#6C7A59] hover:text-white transition-colors flex items-center justify-center"
              >
                <EyeIcon className="h-5 w-5 mr-2" />
                View Invoice
              </button>
            </div>
            {invoiceGenerated && (
              <p className="text-sm text-green-600 mt-3 text-center">
                ✓ Invoice downloaded successfully!
              </p>
            )}
          </div>
        )}

        {/* Order Details */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Order Details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Order Total</h3>
              <p className="text-2xl font-bold text-gray-900">Rs. {(order.total || 0).toLocaleString()}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Order Status</h3>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                {order.status || 'Processing'}
              </span>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Payment Method</h3>
              <p className="text-gray-900 capitalize">
                {order.paymentMethod === 'credit_card' ? 'Credit/Debit Card' : 
                 order.paymentMethod === 'cash_on_delivery' ? 'Cash on Delivery' : 
                 order.payment?.method === 'card' ? 'Credit/Debit Card' : 'Cash on Delivery'}
              </p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Shipping Method</h3>
              <p className="text-gray-900">
                {order.shippingMethod === 'standard' ? 'Standard Islandwide Delivery' : 
                 order.shippingMethod === 'express' ? 'Express Delivery' :
                 order.shippingMethod === 'same_day' ? 'Same Day Delivery' :
                 order.shipping?.method === 'standard' ? 'Standard Islandwide Delivery' : 'Express Delivery'}
              </p>
            </div>
          </div>
        </div>

        {/* Shipping Information */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <TruckIcon className="h-6 w-6 text-[#6C7A59] mr-3" />
            Shipping Information
          </h2>
          
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Name</p>
                <p className="text-gray-900">
                  {order.shippingAddress?.firstName || order.shipping?.address?.firstName || 'N/A'} {order.shippingAddress?.lastName || order.shipping?.address?.lastName || 'N/A'}
                </p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-500">Email</p>
                <p className="text-gray-900">{order.shippingAddress?.email || order.shipping?.address?.email || 'N/A'}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-500">Phone</p>
                <p className="text-gray-900">{order.shippingAddress?.phone || order.shipping?.address?.phone || 'N/A'}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-500">City</p>
                <p className="text-gray-900">{order.shippingAddress?.city || order.shipping?.address?.city || 'N/A'}</p>
              </div>
              
              <div className="md:col-span-2">
                <p className="text-sm font-medium text-gray-500">Address</p>
                <p className="text-gray-900">{order.shippingAddress?.address || order.shipping?.address?.address || 'N/A'}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-500">Province</p>
                <p className="text-gray-900">{order.shippingAddress?.province || order.shipping?.address?.province || order.shipping?.address?.state || 'N/A'}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-500">Postal Code</p>
                <p className="text-gray-900">{order.shippingAddress?.postalCode || order.shipping?.address?.postalCode || order.shipping?.address?.zipCode || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Order Items</h2>
          
          <div className="space-y-4">
            {order.items && order.items.length > 0 ? order.items.map((item, index) => (
              <div key={`${item._id || item.id || index}-${item.selectedSize || 'default'}-${item.selectedColor || 'default'}`} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                <img
                  src={item.images?.[0] || item.image || '/placeholder-product.jpg'}
                  alt={item.name || 'Product'}
                  className="w-16 h-16 object-cover rounded-lg"
                  onError={(e) => {
                    e.target.src = '/placeholder-product.jpg';
                  }}
                />
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-gray-900">{item.name || 'Product'}</h3>
                  <p className="text-sm text-gray-500">
                    {item.selectedColor || 'Default'} • {item.selectedSize || 'Default'} • Qty: {item.quantity || 1}
                  </p>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  Rs. {((item.price || 0) * (item.quantity || 1)).toLocaleString()}
                </span>
              </div>
            )) : (
              <div className="text-center py-4 text-gray-500">
                No items found in order
              </div>
            )}
          </div>
        </div>

        {/* Price Breakdown */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Price Breakdown</h2>
          
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-medium">Rs. {(order.subtotal || 0).toLocaleString()}</span>
            </div>
            
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Shipping</span>
              <span className="font-medium">
                {order.shippingCost === 0 ? 'Free' : `Rs. ${(order.shippingCost || 0).toLocaleString()}`}
              </span>
            </div>

            {order.discount && order.discount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Discount</span>
                <span className="font-medium text-green-600">-Rs. {order.discount.toLocaleString()}</span>
              </div>
            )}

            <div className="border-t border-gray-200 pt-3">
              <div className="flex justify-between">
                <span className="text-lg font-semibold text-gray-900">Total</span>
                <span className="text-lg font-bold text-gray-900">Rs. {(order.total || 0).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
          <h2 className="text-lg font-semibold text-blue-900 mb-4">What Happens Next?</h2>
          
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5">
                1
              </div>
              <div>
                <p className="text-sm font-medium text-blue-900">Order Confirmation</p>
                <p className="text-sm text-blue-700">You'll receive an email confirmation with your order details</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5">
                2
              </div>
              <div>
                <p className="text-sm font-medium text-blue-900">Processing</p>
                <p className="text-sm text-blue-700">We'll prepare your order and arrange shipping</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5">
                3
              </div>
              <div>
                <p className="text-sm font-medium text-blue-900">Delivery</p>
                <p className="text-sm text-blue-700">Your order will be delivered to your address in 3-5 business days</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => navigate('/')}
            className="flex-1 bg-[#6C7A59] text-white py-3 px-6 rounded-lg font-semibold hover:bg-[#5A6A4A] transition-colors flex items-center justify-center"
          >
            <HomeIcon className="h-5 w-5 mr-2" />
            Continue Shopping
          </button>
          
          <button
            onClick={() => navigate('/orders')}
            className="flex-1 bg-white text-[#6C7A59] border-2 border-[#6C7A59] py-3 px-6 rounded-lg font-semibold hover:bg-[#6C7A59] hover:text-white transition-colors flex items-center justify-center"
          >
            <ShoppingBagIcon className="h-5 w-5 mr-2" />
            View Orders
          </button>
        </div>

        {/* Contact Information */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Have questions about your order?</p>
          <p className="mt-1">
            Contact us at{' '}
            <a href="mailto:support@clothicalanka.com" className="text-[#6C7A59] hover:underline">
              support@clothicalanka.com
            </a>{' '}
            or call{' '}
            <a href="tel:+94112345678" className="text-[#6C7A59] hover:underline">
              +94 11 234 5678
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;

