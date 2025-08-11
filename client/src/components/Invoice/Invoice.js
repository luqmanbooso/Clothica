import React from 'react';
import { useReactToPrint } from 'react-to-print';
import { PrinterIcon, DownloadIcon } from '@heroicons/react/24/outline';

const Invoice = ({ order, onClose }) => {
  const componentRef = React.useRef();

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: `Invoice-${order._id.slice(-8)}`,
    onAfterPrint: () => console.log('Print completed'),
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const calculateSubtotal = () => {
    return order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const calculateTax = () => {
    return calculateSubtotal() * 0.08; // 8% tax
  };

  const calculateTotal = () => {
    return calculateSubtotal() + order.shipping + calculateTax();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Invoice</h2>
          <div className="flex items-center space-x-3">
            <button
              onClick={handlePrint}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              <PrinterIcon className="h-4 w-4 mr-2" />
              Print
            </button>
            <button
              onClick={onClose}
              className="inline-flex items-center px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>

        {/* Invoice Content */}
        <div ref={componentRef} className="p-6">
          {/* Company Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-[#6C7A59] to-[#D6BFAF] rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">C</span>
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-[#6C7A59] to-[#D6BFAF] bg-clip-text text-transparent">
                Clothica
              </h1>
            </div>
            <p className="text-gray-600">Premium Fashion & Lifestyle</p>
            <p className="text-sm text-gray-500">123 Fashion Ave, New York, NY 10001</p>
            <p className="text-sm text-gray-500">1-800-CLOTHICA | info@clothica.com</p>
          </div>

          {/* Invoice Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Bill To:</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="font-medium text-gray-900">
                  {order.shipping.firstName} {order.shipping.lastName}
                </p>
                <p className="text-gray-600">{order.shipping.email}</p>
                <p className="text-gray-600">{order.shipping.phone}</p>
                <p className="text-gray-600">{order.shipping.address}</p>
                <p className="text-gray-600">
                  {order.shipping.city}, {order.shipping.state} {order.shipping.zipCode}
                </p>
                <p className="text-gray-600">{order.shipping.country}</p>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Invoice Details:</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Invoice Number:</span>
                  <span className="font-medium">#{order._id.slice(-8)}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Order Date:</span>
                  <span className="font-medium">{formatDate(order.createdAt)}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Payment Method:</span>
                  <span className="font-medium capitalize">{order.payment.method}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                    order.status === 'shipped' ? 'bg-purple-100 text-purple-800' :
                    order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Items:</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left py-3 px-4 font-semibold text-gray-900 border-b border-gray-200">Item</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-900 border-b border-gray-200">Size</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-900 border-b border-gray-200">Color</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-900 border-b border-gray-200">Qty</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-900 border-b border-gray-200">Price</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-900 border-b border-gray-200">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item, index) => (
                    <tr key={index} className="border-b border-gray-100">
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-3">
                          <img
                            src={item.product.images?.[0] || 'https://via.placeholder.com/50'}
                            alt={item.product.name}
                            className="w-12 h-12 object-cover rounded-lg"
                          />
                          <div>
                            <p className="font-medium text-gray-900">{item.product.name}</p>
                            <p className="text-sm text-gray-500">SKU: {item.product._id.slice(-6)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-center text-gray-600">{item.size || 'One Size'}</td>
                      <td className="py-4 px-4 text-center text-gray-600">{item.color || 'Default'}</td>
                      <td className="py-4 px-4 text-center text-gray-600">{item.quantity}</td>
                      <td className="py-4 px-4 text-right text-gray-600">${item.price.toFixed(2)}</td>
                      <td className="py-4 px-4 text-right font-medium text-gray-900">
                        ${(item.price * item.quantity).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totals */}
          <div className="flex justify-end mb-8">
            <div className="w-80">
              <div className="space-y-3">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal:</span>
                  <span>${calculateSubtotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping:</span>
                  <span>${order.shipping.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Tax (8%):</span>
                  <span>${calculateTax().toFixed(2)}</span>
                </div>
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between text-lg font-bold text-gray-900">
                    <span>Total:</span>
                    <span>${calculateTotal().toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Thank you for your order!</h4>
                <p className="text-sm text-gray-600">
                  We appreciate your business and hope you enjoy your new items. 
                  If you have any questions, please don't hesitate to contact us.
                </p>
              </div>
              <div className="text-right">
                <h4 className="font-semibold text-gray-900 mb-2">Need Help?</h4>
                <p className="text-sm text-gray-600">
                  Customer Support: 1-800-CLOTHICA<br />
                  Email: support@clothica.com<br />
                  Hours: Mon-Fri 9AM-6PM EST
                </p>
              </div>
            </div>
          </div>

          {/* Print Notice */}
          <div className="text-center text-xs text-gray-500 mt-8 print:hidden">
            <p>This invoice was generated on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Invoice;

