import React from 'react';
import { useReactToPrint } from 'react-to-print';
import { PrinterIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const Invoice = ({ order, onClose }) => {
  const componentRef = React.useRef();
  const [isGeneratingPDF, setIsGeneratingPDF] = React.useState(false);

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: `Invoice-${order?._id?.slice(-8) || 'Unknown'}`,
    onAfterPrint: () => console.log('Print completed'),
    onBeforeGetContent: () => {
      if (!componentRef.current) {
        console.error('Print content ref is not available');
        return false;
      }
      return true;
    }
  });

  const generatePDF = async () => {
    try {
      setIsGeneratingPDF(true);
      const element = componentRef.current;
      if (!element) return;

      // Convert HTML to canvas
      const canvas = await html2canvas(element, {
        scale: 1.5, // Balanced quality and performance
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        width: element.scrollWidth,
        height: element.scrollHeight
      });

      // Create PDF
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      // Calculate dimensions
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 295; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 0;

      // Add first page
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Add additional pages if needed
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Save PDF
      const fileName = `Invoice-${order._id?.slice(-8) || 'Unknown'}-${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);

      // Show success message
      alert(`PDF generated successfully: ${fileName}`);

      // Reset state
      setIsGeneratingPDF(false);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
      
      // Reset state
      setIsGeneratingPDF(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Date not available';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  const calculateSubtotal = () => {
    return order.items?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0;
  };

  const calculateTax = () => {
    return (order.tax || 0); // Use tax from order or 0
  };

  const calculateTotal = () => {
    return calculateSubtotal() + (order.shippingCost || 0) + calculateTax();
  };

  // Safety check for order object - must be after all hooks
  if (!order) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Error</h2>
          <p className="text-gray-600 mb-4">Order data is not available.</p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto print:shadow-none print:rounded-none">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Invoice</h2>
          <div className="flex items-center space-x-3">
            <button
              onClick={generatePDF}
              disabled={isGeneratingPDF}
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGeneratingPDF ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 mr-2 border-b-2 border-white"></div>
                  Generating PDF...
                </>
              ) : (
                <>
                  <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                  Download PDF
                </>
              )}
            </button>
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
        <div ref={componentRef} className="p-6 bg-white">
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
            <p className="text-sm text-gray-500">123 Fashion Ave, Colombo, Sri Lanka</p>
            <p className="text-sm text-gray-500">+94 11 234 5678 | info@clothicalanka.com</p>
          </div>

          {/* Invoice Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Bill To:</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="font-medium text-gray-900">
                  {order.user?.name || 'Customer'}
                </p>
                <p className="text-gray-600">{order.user?.email || 'Email not available'}</p>
                <p className="text-gray-600">{order.shippingAddress?.phone || 'Phone not available'}</p>
                <p className="text-gray-600">{order.shippingAddress?.street || 'Address not available'}</p>
                <p className="text-gray-600">
                  {order.shippingAddress?.city || 'City'}, {order.shippingAddress?.state || 'State'} {order.shippingAddress?.zipCode || 'ZIP'}
                </p>
                <p className="text-gray-600">{order.shippingAddress?.country || 'Country'}</p>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Invoice Details:</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Invoice Number:</span>
                  <span className="font-medium">#{order._id?.slice(-8) || 'Unknown'}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Order Date:</span>
                  <span className="font-medium">{formatDate(order.createdAt)}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Payment Method:</span>
                  <span className="font-medium capitalize">{order.paymentMethod || 'Not specified'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    (order.status || 'unknown') === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    (order.status || 'unknown') === 'processing' ? 'bg-blue-100 text-blue-800' :
                    (order.status || 'unknown') === 'shipped' ? 'bg-purple-100 text-purple-800' :
                    (order.status || 'unknown') === 'delivered' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {(order.status || 'unknown').charAt(0).toUpperCase() + (order.status || 'unknown').slice(1)}
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
                  {order.items && order.items.length > 0 ? (
                    order.items.map((item, index) => (
                      <tr key={index} className="border-b border-gray-100">
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-3">
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
                              
                              return imageUrl && imageUrl.startsWith('http') ? imageUrl : 'https://via.placeholder.com/50';
                            })()}
                            alt={item.name || 'Product'}
                            className="w-12 h-12 object-cover rounded-lg"
                          />
                            <div>
                              <p className="font-medium text-gray-900">{item.name}</p>
                              <p className="text-sm text-gray-500">SKU: {item._id?.slice(-6) || 'N/A'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-center text-gray-600">{item.selectedSize || 'One Size'}</td>
                        <td className="py-4 px-4 text-center text-gray-600">{item.selectedColor || 'Default'}</td>
                        <td className="py-4 px-4 text-center text-gray-600">{item.quantity}</td>
                        <td className="py-4 px-4 text-right text-gray-600">Rs. {item.price.toLocaleString()}</td>
                        <td className="py-4 px-4 text-right font-medium text-gray-900">
                          Rs. {(item.price * item.quantity).toLocaleString()}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="py-8 text-center text-gray-500">
                        No items found
                      </td>
                    </tr>
                  )}
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
                  <span>Rs. {calculateSubtotal().toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping:</span>
                  <span>Rs. {(order.shippingCost || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Tax:</span>
                  <span>Rs. {calculateTax().toLocaleString()}</span>
                </div>
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between text-lg font-bold text-gray-900">
                    <span>Total:</span>
                    <span>Rs. {calculateTotal().toLocaleString()}</span>
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
                  Customer Support: +94 11 234 5678<br />
                  Email: support@clothicalanka.com<br />
                  Hours: Mon-Fri 9AM-6PM (IST)
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

