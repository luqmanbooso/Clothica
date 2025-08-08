import React from 'react';
import { Link } from 'react-router-dom';
import { HomeIcon, ShoppingBagIcon, UserIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center">
        {/* 404 Icon */}
        <div className="mb-8">
          <div className="mx-auto h-32 w-32 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mb-6">
            <span className="text-6xl font-bold text-white">404</span>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Page Not Found</h1>
            <p className="text-gray-600">
              Sorry, we couldn't find the page you're looking for. It might have been moved, deleted, or you entered the wrong URL.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Link 
                to="/" 
                className="flex items-center justify-center w-full px-4 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                <HomeIcon className="h-5 w-5 mr-2" />
                Go to Homepage
              </Link>
              
              <Link 
                to="/shop" 
                className="flex items-center justify-center w-full px-4 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                <ShoppingBagIcon className="h-5 w-5 mr-2" />
                Browse Products
              </Link>
              
              <Link 
                to="/profile" 
                className="flex items-center justify-center w-full px-4 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                <UserIcon className="h-5 w-5 mr-2" />
                My Account
              </Link>
            </div>
          </div>

          {/* Popular Pages */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Popular Pages</h2>
            <div className="grid grid-cols-2 gap-3">
              <Link 
                to="/shop" 
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                Shop All
              </Link>
              <Link 
                to="/shipping" 
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                Shipping Info
              </Link>
              <Link 
                to="/terms" 
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                Terms of Service
              </Link>
              <Link 
                to="/privacy" 
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                Privacy Policy
              </Link>
            </div>
          </div>

          {/* Back Button */}
          <div className="text-center">
            <button 
              onClick={() => window.history.back()}
              className="inline-flex items-center text-gray-600 hover:text-gray-700 font-medium transition-colors"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Go Back
            </button>
          </div>

          {/* Help Section */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-900 mb-2">Need Help?</h3>
            <p className="text-sm text-blue-800 mb-3">
              If you believe this is an error, please contact our support team.
            </p>
            <Link 
              to="/contact" 
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Contact Support →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
