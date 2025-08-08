import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { EyeIcon, EyeSlashIcon, ExclamationCircleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showSuccess, setShowSuccess] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.firstName) {
      newErrors.firstName = 'First name is required';
    }
    
    if (!formData.lastName) {
      newErrors.lastName = 'Last name is required';
    }
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      await register(formData.firstName, formData.lastName, formData.email, formData.password);
      setShowSuccess(true);
      setTimeout(() => {
        navigate('/');
      }, 1000);
    } catch (error) {
      setErrors({ general: error.message || 'Registration failed. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F1EE] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div 
        className="max-w-md w-full space-y-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div className="text-center" variants={itemVariants}>
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-[#6C7A59] to-[#D6BFAF] rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-2xl">C</span>
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
            </div>
          </div>
          <h2 className="text-4xl font-display font-bold text-[#1E1E1E] mb-2">
            Create Account
          </h2>
          <p className="text-lg text-[#6C7A59]">
            Join our fashion community today
          </p>
        </motion.div>

        {/* Form */}
        <motion.div 
          className="bg-white rounded-2xl shadow-xl p-8"
          variants={itemVariants}
        >
          {errors.general && (
            <motion.div 
              className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center space-x-3"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <ExclamationCircleIcon className="h-5 w-5 text-red-500" />
              <p className="text-red-700 text-sm">{errors.general}</p>
            </motion.div>
          )}

          {showSuccess && (
            <motion.div 
              className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center space-x-3"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <CheckCircleIcon className="h-5 w-5 text-green-500" />
              <p className="text-green-700 text-sm">Account created successfully! Redirecting...</p>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Fields */}
            <motion.div className="grid grid-cols-2 gap-4" variants={itemVariants}>
              <div>
                <label htmlFor="firstName" className="block text-sm font-semibold text-[#1E1E1E] mb-2">
                  First Name
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6C7A59] focus:border-[#6C7A59] transition-all duration-200 ${
                    errors.firstName ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="First name"
                />
                {errors.firstName && (
                  <motion.p 
                    className="mt-1 text-sm text-red-600"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    {errors.firstName}
                  </motion.p>
                )}
              </div>
              
              <div>
                <label htmlFor="lastName" className="block text-sm font-semibold text-[#1E1E1E] mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6C7A59] focus:border-[#6C7A59] transition-all duration-200 ${
                    errors.lastName ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Last name"
                />
                {errors.lastName && (
                  <motion.p 
                    className="mt-1 text-sm text-red-600"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    {errors.lastName}
                  </motion.p>
                )}
              </div>
            </motion.div>

            {/* Email Field */}
            <motion.div variants={itemVariants}>
              <label htmlFor="email" className="block text-sm font-semibold text-[#1E1E1E] mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6C7A59] focus:border-[#6C7A59] transition-all duration-200 ${
                  errors.email ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter your email"
              />
              {errors.email && (
                <motion.p 
                  className="mt-1 text-sm text-red-600"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  {errors.email}
                </motion.p>
              )}
            </motion.div>

            {/* Password Field */}
            <motion.div variants={itemVariants}>
              <label htmlFor="password" className="block text-sm font-semibold text-[#1E1E1E] mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 pr-12 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6C7A59] focus:border-[#6C7A59] transition-all duration-200 ${
                    errors.password ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Create a password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
                {errors.password && (
                  <motion.p 
                    className="mt-1 text-sm text-red-600"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    {errors.password}
                  </motion.p>
                )}
              </div>
            </motion.div>

            {/* Confirm Password Field */}
            <motion.div variants={itemVariants}>
              <label htmlFor="confirmPassword" className="block text-sm font-semibold text-[#1E1E1E] mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 pr-12 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6C7A59] focus:border-[#6C7A59] transition-all duration-200 ${
                    errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showConfirmPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
                {errors.confirmPassword && (
                  <motion.p 
                    className="mt-1 text-sm text-red-600"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    {errors.confirmPassword}
                  </motion.p>
                )}
              </div>
            </motion.div>

            {/* Terms and Conditions */}
            <motion.div variants={itemVariants}>
              <label className="flex items-start">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-[#6C7A59] focus:ring-[#6C7A59] border-gray-300 rounded mt-1"
                />
                <span className="ml-2 text-sm text-[#1E1E1E]">
                  I agree to the{' '}
                  <Link to="/terms" className="text-[#6C7A59] hover:text-[#5A6A4A] font-medium">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link to="/privacy" className="text-[#6C7A59] hover:text-[#5A6A4A] font-medium">
                    Privacy Policy
                  </Link>
                </span>
              </label>
            </motion.div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={loading}
              className="w-full bg-[#6C7A59] text-white font-semibold py-3 px-6 rounded-xl hover:bg-[#5A6A4A] focus:outline-none focus:ring-2 focus:ring-[#6C7A59] focus:ring-offset-2 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </motion.button>
          </form>

          {/* Divider */}
          <motion.div className="my-6" variants={itemVariants}>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>
          </motion.div>

          {/* Social Login */}
          <motion.div className="space-y-3" variants={itemVariants}>
            <button className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-xl text-[#1E1E1E] font-medium hover:bg-gray-50 transition-all duration-200">
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>
          </motion.div>

          {/* Sign In Link */}
          <motion.div className="text-center mt-8" variants={itemVariants}>
            <p className="text-sm text-[#1E1E1E]">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-semibold text-[#6C7A59] hover:text-[#5A6A4A] transition-colors"
              >
                Sign in
              </Link>
            </p>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Register; 