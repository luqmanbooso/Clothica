import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { EnvelopeIcon, ArrowLeftIcon, CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

const ForgotPassword = () => {
  const { forgotPassword, authError, clearError } = useAuth();
  const { success, error } = useToast();
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  // Clear auth errors when component mounts
  useEffect(() => {
    clearError();
  }, [clearError]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      error('Please enter your email address');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      error('Please enter a valid email address');
      return;
    }

    setLoading(true);

    try {
      const result = await forgotPassword(email);
      if (result.success) {
        setIsSubmitted(true);
        success('Password reset email sent successfully!');
      } else {
        error(result.message);
      }
    } catch (error) {
      error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100">
              <CheckCircleIcon className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="mt-6 text-3xl font-bold text-gray-900">
              Check Your Email
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              We've sent a password reset link to <strong>{email}</strong>
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center space-y-4">
              <p className="text-sm text-gray-600">
                Click the link in the email to reset your password. The link will expire in 1 hour.
              </p>
              
              <div className="space-y-3">
                <button
                  onClick={() => setIsSubmitted(false)}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-gradient-to-r from-[#6C7A59] to-[#D6BFAF] hover:from-[#5A6A4A] hover:to-[#C4B09F] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#6C7A59] transition-all duration-200"
                >
                  Send Another Email
                </button>
                
                <Link
                  to="/login"
                  className="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-xl shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#6C7A59] transition-colors"
                >
                  Back to Login
                </Link>
              </div>
            </div>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Didn't receive the email? Check your spam folder or{' '}
              <button
                onClick={() => setIsSubmitted(false)}
                className="font-medium text-[#6C7A59] hover:text-[#5A6A4A] transition-colors"
              >
                try again
              </button>
            </p>
          </div>

          {/* Additional Help */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <CheckCircleIcon className="h-5 w-5 text-blue-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">
                  Need Help?
                </h3>
                <div className="mt-2 text-sm text-blue-700">
                  <p>
                    If you're still having trouble, contact our support team at{' '}
                    <a href="mailto:support@clothica.com" className="font-medium underline">
                      support@clothica.com
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Link
            to="/login"
            className="inline-flex items-center text-[#6C7A59] hover:text-[#5A6A4A] mb-4 transition-colors"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back to Login
          </Link>
          
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-br from-[#6C7A59] to-[#D6BFAF]">
            <span className="text-white font-bold text-2xl">C</span>
          </div>
          
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Forgot Your Password?
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Enter your email address and we'll send you a link to reset your password.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6C7A59] focus:border-[#6C7A59] transition-colors"
                  placeholder="Enter your email address"
                />
              </div>
            </div>

            {/* Error Display */}
            {authError && (
              <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <ExclamationTriangleIcon className="h-5 w-5 text-red-500 flex-shrink-0" />
                <p className="text-sm text-red-700">{authError}</p>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r from-[#6C7A59] to-[#D6BFAF] hover:from-[#5A6A4A] hover:to-[#C4B09F] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#6C7A59] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                {loading ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending...
                  </div>
                ) : (
                  'Send Reset Link'
                )}
              </button>
            </div>
          </form>
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            Remember your password?{' '}
            <Link
              to="/login"
              className="font-medium text-[#6C7A59] hover:text-[#5A6A4A] transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>

        {/* Security Info */}
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <CheckCircleIcon className="h-5 w-5 text-green-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">
                Security First
              </h3>
              <div className="mt-2 text-sm text-green-700">
                <p>
                  Your password reset link is secure and will expire in 1 hour. 
                  We never store your password and use industry-standard encryption.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
