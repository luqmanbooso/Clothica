import React from 'react';
import { XMarkIcon, GiftIcon, StarIcon, TruckIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

const WelcomeModal = ({ isOpen, onClose, userName }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-[#6C7A59] to-[#D6BFAF] p-6 rounded-t-2xl">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:text-gray-200 transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
          
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-white/20 mb-4">
              <span className="text-white font-bold text-2xl">C</span>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Welcome to Clothica! 🎉
            </h2>
            <p className="text-white/90">
              {userName ? `Hello ${userName}!` : 'Hello there!'} We're excited to have you join our fashion family.
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* First Purchase Benefits */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-xl border border-green-200">
            <div className="flex items-center space-x-3 mb-3">
              <GiftIcon className="h-6 w-6 text-green-600" />
              <h3 className="text-lg font-semibold text-green-800">First Purchase Benefits</h3>
            </div>
            <ul className="space-y-2 text-sm text-green-700">
              <li className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span><strong>20% OFF</strong> your first order</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span><strong>Free Shipping</strong> on orders over $50</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span><strong>500 Bonus Points</strong> to start</span>
              </li>
            </ul>
          </div>

          {/* Features */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">Why Choose Clothica?</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <TruckIcon className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-700">Fast Delivery</p>
                <p className="text-xs text-gray-500">3-5 business days</p>
              </div>
              
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <ShieldCheckIcon className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-700">Secure Shopping</p>
                <p className="text-xs text-gray-500">100% safe & secure</p>
              </div>
              
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <StarIcon className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-700">Premium Quality</p>
                <p className="text-xs text-gray-500">Best fabrics & designs</p>
              </div>
              
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <span className="text-2xl mx-auto mb-2 block">📞</span>
                <p className="text-sm font-medium text-gray-700">Customer Support</p>
                <p className="text-xs text-gray-500">24/7 Customer Support</p>
              </div>
            </div>
          </div>

          {/* Special Offers */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-xl border border-purple-200">
            <h3 className="text-lg font-semibold text-purple-800 mb-3">Special Offers for You</h3>
            <div className="space-y-2 text-sm text-purple-700">
                          <p>🎉 <strong>WELCOME20</strong> - 20% off first order</p>
            <p>🚚 <strong>FREESHIP50</strong> - Free shipping on orders above $50</p>
            <p>🎁 <strong>BONUS500</strong> - 500 loyalty points on signup</p>
            </div>
          </div>

          {/* Quick Start Guide */}
          <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
            <h3 className="text-lg font-semibold text-blue-800 mb-3">Quick Start Guide</h3>
            <div className="space-y-2 text-sm text-blue-700">
              <p>1️⃣ <strong>Browse</strong> our latest collections</p>
              <p>2️⃣ <strong>Add items</strong> to your cart</p>
              <p>3️⃣ <strong>Use WELCOME20</strong> for your discount</p>
              <p>4️⃣ <strong>Checkout</strong> with secure payment</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 bg-gray-50 rounded-b-2xl">
          <button
            onClick={onClose}
            className="w-full py-3 px-4 bg-gradient-to-r from-[#6C7A59] to-[#D6BFAF] text-white font-medium rounded-xl hover:from-[#5A6A4A] hover:to-[#C4B09F] transition-all duration-200"
          >
            Let's Start Shopping! 🛍️
          </button>
          <p className="text-center text-xs text-gray-500 mt-3">
            Need help? Contact us at <strong>+1 (555) 123-4567</strong>
          </p>
        </div>
      </div>
    </div>
  );
};

export default WelcomeModal;
