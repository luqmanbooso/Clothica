import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeftIcon, TruckIcon, ClockIcon, MapPinIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';

const Shipping = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <Link 
              to="/" 
              className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium mb-4 transition-colors"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
            
            <div className="flex items-center mb-6">
              <div className="h-12 w-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mr-4">
                <TruckIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Shipping Information</h1>
                <p className="text-gray-600">Fast, reliable shipping to your doorstep</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="space-y-8">
            {/* Shipping Options */}
            <div className="bg-white rounded-lg shadow-sm p-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">Shipping Options</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center mb-4">
                    <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                      <TruckIcon className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Standard Shipping</h3>
                      <p className="text-sm text-gray-600">5-7 business days</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Cost:</span>
                      <span className="font-medium">$5.99</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Free on orders:</span>
                      <span className="font-medium">$50+</span>
                    </div>
                  </div>
                </div>

                <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center mb-4">
                    <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                      <ClockIcon className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Express Shipping</h3>
                      <p className="text-sm text-gray-600">2-3 business days</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Cost:</span>
                      <span className="font-medium">$12.99</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Free on orders:</span>
                      <span className="font-medium">$100+</span>
                    </div>
                  </div>
                </div>

                <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center mb-4">
                    <div className="h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                      <MapPinIcon className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Next Day Delivery</h3>
                      <p className="text-sm text-gray-600">1 business day</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Cost:</span>
                      <span className="font-medium">$19.99</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Available:</span>
                      <span className="font-medium">Select areas</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Shipping Zones */}
            <div className="bg-white rounded-lg shadow-sm p-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">Shipping Zones & Delivery Times</h2>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Zone</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">States/Regions</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Standard</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Express</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Next Day</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    <tr>
                      <td className="py-3 px-4 font-medium text-gray-900">Zone 1</td>
                      <td className="py-3 px-4 text-gray-700">Northeast (NY, NJ, PA, etc.)</td>
                      <td className="py-3 px-4 text-gray-700">3-4 days</td>
                      <td className="py-3 px-4 text-gray-700">1-2 days</td>
                      <td className="py-3 px-4 text-gray-700">Available</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-medium text-gray-900">Zone 2</td>
                      <td className="py-3 px-4 text-gray-700">Southeast (FL, GA, NC, etc.)</td>
                      <td className="py-3 px-4 text-gray-700">4-5 days</td>
                      <td className="py-3 px-4 text-gray-700">2-3 days</td>
                      <td className="py-3 px-4 text-gray-700">Available</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-medium text-gray-900">Zone 3</td>
                      <td className="py-3 px-4 text-gray-700">Midwest (IL, OH, MI, etc.)</td>
                      <td className="py-3 px-4 text-gray-700">4-6 days</td>
                      <td className="py-3 px-4 text-gray-700">2-3 days</td>
                      <td className="py-3 px-4 text-gray-700">Limited</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-medium text-gray-900">Zone 4</td>
                      <td className="py-3 px-4 text-gray-700">West Coast (CA, WA, OR)</td>
                      <td className="py-3 px-4 text-gray-700">5-7 days</td>
                      <td className="py-3 px-4 text-gray-700">3-4 days</td>
                      <td className="py-3 px-4 text-gray-700">Available</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-medium text-gray-900">Zone 5</td>
                      <td className="py-3 px-4 text-gray-700">Mountain States (CO, UT, AZ)</td>
                      <td className="py-3 px-4 text-gray-700">5-7 days</td>
                      <td className="py-3 px-4 text-gray-700">3-4 days</td>
                      <td className="py-3 px-4 text-gray-700">Not available</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* International Shipping */}
            <div className="bg-white rounded-lg shadow-sm p-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">International Shipping</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Canada</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Standard:</span>
                      <span className="font-medium">$15.99 (7-10 days)</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Express:</span>
                      <span className="font-medium">$25.99 (3-5 days)</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Other Countries</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Standard:</span>
                      <span className="font-medium">$25.99 (10-15 days)</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Express:</span>
                      <span className="font-medium">$45.99 (5-8 days)</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-yellow-800 text-sm">
                  <strong>Note:</strong> International orders may be subject to customs duties and taxes. These charges are the responsibility of the customer.
                </p>
              </div>
            </div>

            {/* Tracking & Notifications */}
            <div className="bg-white rounded-lg shadow-sm p-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">Order Tracking & Notifications</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Real-time Tracking</h3>
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3"></div>
                      Track your order from warehouse to doorstep
                    </li>
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3"></div>
                      Real-time delivery updates via email and SMS
                    </li>
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3"></div>
                      Delivery confirmation with photo proof
                    </li>
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3"></div>
                      Estimated delivery time updates
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Shipping Notifications</h3>
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-green-600 rounded-full mt-2 mr-3"></div>
                      Order confirmation email
                    </li>
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-green-600 rounded-full mt-2 mr-3"></div>
                      Shipping confirmation with tracking number
                    </li>
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-green-600 rounded-full mt-2 mr-3"></div>
                      Out for delivery notification
                    </li>
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-green-600 rounded-full mt-2 mr-3"></div>
                      Delivery confirmation
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Shipping Policies */}
            <div className="bg-white rounded-lg shadow-sm p-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">Shipping Policies</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Processing Time</h3>
                  <p className="text-gray-700">
                    Orders are typically processed and shipped within 1-2 business days. Orders placed after 2 PM EST will be processed the next business day.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Holiday Shipping</h3>
                  <p className="text-gray-700">
                    During peak seasons and holidays, processing times may be extended by 1-2 business days. We'll notify you of any delays via email.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Address Accuracy</h3>
                  <p className="text-gray-700">
                    Please ensure your shipping address is complete and accurate. Incorrect addresses may result in delivery delays or additional charges.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Signature Required</h3>
                  <p className="text-gray-700">
                    Orders over $200 require a signature upon delivery. You'll be notified if signature is required for your order.
                  </p>
                </div>
              </div>
            </div>

            {/* FAQ */}
            <div className="bg-white rounded-lg shadow-sm p-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">Frequently Asked Questions</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">When will my order ship?</h3>
                  <p className="text-gray-700">
                    Most orders ship within 1-2 business days. You'll receive a shipping confirmation email with tracking information once your order ships.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Can I change my shipping address?</h3>
                  <p className="text-gray-700">
                    Address changes can be made within 2 hours of placing your order. Contact customer service for assistance.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">What if my package is lost or damaged?</h3>
                  <p className="text-gray-700">
                    We fully insure all shipments. If your package is lost or damaged, contact us immediately and we'll help resolve the issue.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Do you ship to PO boxes?</h3>
                  <p className="text-gray-700">
                    Yes, we ship to PO boxes for standard shipping. Express and next-day delivery may not be available for PO box addresses.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact */}
          <div className="mt-8 text-center">
            <p className="text-gray-600 mb-4">
              Have questions about shipping? Our customer service team is here to help.
            </p>
            <Link 
              to="/contact" 
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Contact Customer Service
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Shipping;
