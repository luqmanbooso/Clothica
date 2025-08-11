import React from 'react';
import { Link } from 'react-router-dom';
import { TruckIcon, ClockIcon, ShieldCheckIcon, GlobeAltIcon, MapPinIcon, PhoneIcon, EnvelopeIcon } from '@heroicons/react/24/outline';

const Shipping = () => {
  const shippingMethods = [
    {
      name: 'Standard Shipping',
      price: '$5.99',
      time: '3-5 business days',
      description: 'Reliable ground shipping for most orders',
      icon: TruckIcon
    },
    {
      name: 'Express Shipping',
      price: '$12.99',
      time: '1-2 business days',
      description: 'Fast delivery for urgent orders',
      icon: ClockIcon
    },
    {
      name: 'Free Shipping',
      price: 'Free',
      time: '5-7 business days',
      description: 'Free shipping on orders over $50',
      icon: ShieldCheckIcon
    }
  ];

  const shippingZones = [
    {
      region: 'Continental US',
      time: '3-7 business days',
      cost: 'From $5.99'
    },
    {
      region: 'Alaska & Hawaii',
      time: '5-10 business days',
      cost: 'From $12.99'
    },
    {
      region: 'International',
      time: '7-21 business days',
      cost: 'From $24.99'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Shipping Information</h1>
            <p className="text-lg text-gray-600">
              Fast, reliable shipping to get your fashion items to you quickly and safely
            </p>
          </div>

          {/* Shipping Methods */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Shipping Methods</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {shippingMethods.map((method, index) => (
                <div key={index} className="text-center p-6 border border-gray-200 rounded-xl hover:border-gray-300 transition-colors">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                    <method.icon className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{method.name}</h3>
                  <p className="text-2xl font-bold text-blue-600 mb-2">{method.price}</p>
                  <p className="text-sm text-gray-600 mb-2">{method.time}</p>
                  <p className="text-sm text-gray-500">{method.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping Zones */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Shipping Zones & Delivery Times</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Region</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Delivery Time</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Shipping Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {shippingZones.map((zone, index) => (
                    <tr key={index} className="border-b border-gray-100">
                      <td className="py-3 px-4 text-gray-900">{zone.region}</td>
                      <td className="py-3 px-4 text-gray-600">{zone.time}</td>
                      <td className="py-3 px-4 text-gray-600">{zone.cost}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Shipping Policies */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Shipping Policies</h2>
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 font-semibold">✓</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Order Processing</h3>
                  <p className="text-gray-600">Orders are typically processed within 24 hours during business days (Monday-Friday).</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 font-semibold">✓</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Tracking</h3>
                  <p className="text-gray-600">All orders include tracking information sent to your email once shipped.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 font-semibold">✓</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Free Shipping Threshold</h3>
                  <p className="text-gray-600">Free standard shipping on all orders over $50. No coupon code required.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 font-semibold">✓</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Holiday Shipping</h3>
                  <p className="text-gray-600">During peak seasons and holidays, delivery times may be extended by 1-2 business days.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Need Help with Shipping?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <PhoneIcon className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Call Us</h3>
                  <p className="text-gray-600">1-800-CLOTHICA</p>
                  <p className="text-sm text-gray-500">Mon-Fri 9AM-6PM EST</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <EnvelopeIcon className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Email Support</h3>
                  <p className="text-gray-600">shipping@clothica.com</p>
                  <p className="text-sm text-gray-500">24/7 support</p>
                </div>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center">
            <Link
              to="/shop"
              className="inline-flex items-center px-8 py-4 bg-blue-600 text-white font-semibold rounded-full hover:bg-blue-700 transition-colors"
            >
              Start Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Shipping;
