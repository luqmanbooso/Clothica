import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import { 
  EyeIcon, 
  EyeSlashIcon, 
  EnvelopeIcon, 
  LockClosedIcon,
  UserIcon,
  PhoneIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import axios from 'axios';

const Register = () => {
  const navigate = useNavigate();
  const { register, googleSignup, authError, clearError } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: ''
  });
  const [isGoogleSignup, setIsGoogleSignup] = useState(false);
  const [googleUserData, setGoogleUserData] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [showOTPForm, setShowOTPForm] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpTimer, setOtpTimer] = useState(600); // 10 minutes in seconds

  // Clear auth errors when component mounts
  useEffect(() => {
    clearError();
  }, [clearError]);

  // OTP Timer effect
  useEffect(() => {
    let interval;
    if (registrationSuccess && otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer(prev => prev - 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [registrationSuccess, otpTimer]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast.error('Name is required');
      return false;
    }
    
    if (!formData.email.trim()) {
      toast.error('Email is required');
      return false;
    }
    
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      toast.error('Please enter a valid email address');
      return false;
    }
    
    // For Google signup, password validation is not required
    if (!isGoogleSignup) {
      if (!formData.password) {
        toast.error('Password is required');
        return false;
      }
      
      if (formData.password.length < 6) {
        toast.error('Password must be at least 6 characters long');
        return false;
      }
      
      if (formData.password !== formData.confirmPassword) {
        toast.error('Passwords do not match');
        return false;
      }
    }
    
    if (!agreedToTerms) {
      toast.error('Please agree to the Terms of Service and Privacy Policy');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);

    try {
      if (isGoogleSignup) {
        // For Google signup, we need to get the ID token and use googleSignup
        // Since we don't have the ID token anymore, we'll need to handle this differently
        // For now, let's use regular registration with Google data
        const result = await register({
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
          phone: formData.phone.trim() || undefined,
          isGoogleAccount: true
        });
        
        if (result.success) {
          toast.success('Google account created successfully!');
          navigate('/');
        } else {
          toast.error(result.message);
        }
      } else {
        // Regular registration
        const result = await register({
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
          phone: formData.phone.trim() || undefined
        });
        
        if (result.success) {
          if (result.requiresOTPVerification) {
            setRegistrationSuccess(true);
            setUserEmail(formData.email.trim().toLowerCase());
            setOtpTimer(600); // Reset timer to 10 minutes
            toast.success('Registration successful! Please check your email for OTP verification.');
          } else {
            toast.success(result.message);
            navigate('/');
          }
        } else {
          toast.error(result.message);
        }
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      // Decode the Google credential to get user info
      const decoded = jwtDecode(credentialResponse.credential);
      
      // Set Google user data and switch to Google signup mode
      setGoogleUserData({
        name: decoded.name,
        email: decoded.email,
        picture: decoded.picture
      });
      setIsGoogleSignup(true);
      
      // Pre-fill the form with Google data
      setFormData(prev => ({
        ...prev,
        name: decoded.name,
        email: decoded.email
      }));
      
      toast.success('Google account verified! Please complete your profile details.');
    } catch (error) {
      toast.error('Google verification failed');
    }
  };

  const handleGoogleError = () => {
    toast.error('Google registration failed');
  };

  const handleVerifyOTP = async () => {
    if (!otp) {
      toast.error('Please enter the OTP');
      return;
    }

    setOtpLoading(true);
    try {
      const response = await axios.post('/api/auth/verify-email-otp', {
        email: userEmail,
        otp: otp
      });
      
      toast.success('Email verified successfully! Welcome to Clothica!');
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.message || 'OTP verification failed');
    } finally {
      setOtpLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-br from-[#6C7A59] to-[#D6BFAF]">
            <span className="text-white font-bold text-2xl">C</span>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            {isGoogleSignup ? 'Complete Google Signup' : 'Create your account'}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {isGoogleSignup 
              ? 'Add your details to complete your Clothica account' 
              : 'Join Clothica and start your fashion journey'
            }
          </p>
        </div>

        {/* Registration Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Name Field */}
            {isGoogleSignup ? (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium text-green-800">Account Verified</span>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Google
                  </span>
                </div>
                <p className="text-sm text-green-700 mt-1">
                  <strong>{formData.name}</strong> • {formData.email}
                </p>
              </div>
            ) : (
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <UserIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    className="appearance-none block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6C7A59] focus:border-[#6C7A59] transition-colors"
                    placeholder="Enter your full name"
                  />
                </div>
              </div>
            )}

            {/* Email Field */}
            {isGoogleSignup ? null : (
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
                    value={formData.email}
                    onChange={handleInputChange}
                    className="appearance-none block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6C7A59] focus:border-[#6C7A59] transition-colors"
                    placeholder="Enter your email address"
                  />
                </div>
              </div>
            )}

            {/* Phone Field (Optional) */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number <span className="text-gray-500">(Optional)</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <PhoneIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="appearance-none block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6C7A59] focus:border-[#6C7A59] transition-colors"
                  placeholder="Enter your phone number"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LockClosedIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="appearance-none block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6C7A59] focus:border-[#6C7A59] transition-colors"
                  placeholder="Create a password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Must be at least 6 characters long
              </p>
            </div>

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LockClosedIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="appearance-none block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6C7A59] focus:border-[#6C7A59] transition-colors"
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
            </div>

            {/* Error Display */}
            {authError && (
              <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <ExclamationTriangleIcon className="h-5 w-5 text-red-500 flex-shrink-0" />
                <p className="text-sm text-red-700">{authError}</p>
              </div>
            )}

            {/* Terms Agreement */}
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="terms"
                  name="terms"
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="h-4 w-4 text-[#6C7A59] focus:ring-[#6C7A59] border-gray-300 rounded"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="terms" className="text-gray-700">
                  I agree to the{' '}
                  <Link
                    to="/terms"
                    className="text-[#6C7A59] hover:text-[#5A6A4A] transition-colors"
                  >
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link
                    to="/privacy"
                    className="text-[#6C7A59] hover:text-[#5A6A4A] transition-colors"
                  >
                    Privacy Policy
                  </Link>
                </label>
              </div>
            </div>

            {/* Register Button */}
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
                  {isGoogleSignup ? 'Creating Google account...' : 'Creating account...'}
                </div>
              ) : (
                isGoogleSignup ? 'Complete Google Signup' : 'Create Account'
              )}
            </button>
            
            {/* Reset Google Signup Button */}
            {isGoogleSignup && (
              <button
                type="button"
                onClick={() => {
                  setIsGoogleSignup(false);
                  setGoogleUserData(null);
                  setFormData({
                    name: '',
                    email: '',
                    password: '',
                    confirmPassword: '',
                    phone: ''
                  });
                }}
                className="w-full mt-3 py-2 px-4 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#6C7A59] transition-colors"
              >
                Use Regular Registration Instead
              </button>
            )}
          </form>

          {/* OTP Verification Form */}
          {registrationSuccess && (
            <div className="mt-6 p-6 bg-blue-50 border border-blue-200 rounded-xl">
              <div className="text-center mb-4">
                <h3 className="text-lg font-medium text-blue-900 mb-2">
                  Email Verification Required
                </h3>
                <p className="text-sm text-blue-700">
                  We've sent a 6-digit OTP to <strong>{userEmail}</strong>
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  Please check your email and enter the OTP below
                </p>
                <div className="text-xs text-blue-500 mt-2">
                  OTP expires in: {Math.floor(otpTimer / 60)}:{(otpTimer % 60).toString().padStart(2, '0')}
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="otp" className="block text-sm font-medium text-blue-800 mb-2">
                    Enter OTP
                  </label>
                  <input
                    type="text"
                    id="otp"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="Enter 6-digit OTP"
                    maxLength={6}
                    className="w-full px-4 py-3 border border-blue-300 rounded-lg text-center text-lg font-mono tracking-widest focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <button
                  type="button"
                  onClick={handleVerifyOTP}
                  disabled={otpLoading || !otp || otp.length !== 6}
                  className="w-full py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {otpLoading ? 'Verifying...' : 'Verify OTP & Complete Registration'}
                </button>
                
                <div className="text-center space-y-2">
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        const response = await axios.post('/api/auth/resend-email-otp', {
                          email: userEmail
                        });
                        toast.success('New OTP sent! Please check your email.');
                      } catch (error) {
                        toast.error(error.response?.data?.message || 'Failed to resend OTP');
                      }
                    }}
                    className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    ↻ Resend OTP
                  </button>
                  
                  <div className="block">
                    <button
                      type="button"
                      onClick={() => {
                        setRegistrationSuccess(false);
                        setOtp('');
                        setUserEmail('');
                      }}
                      className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      ← Back to Registration
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Divider */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>
          </div>

          {/* Google Sign-Up */}
          <div className="mt-6">
            {!isGoogleSignup ? (
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                useOneTap
                theme="outline"
                size="large"
                text="signup_with"
                shape="rectangular"
                width="100%"
              />
            ) : (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-center">
                <p className="text-sm text-blue-700">
                  ✓ Google account verified • Complete your profile below
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Sign In Link */}
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-medium text-[#6C7A59] hover:text-[#5A6A4A] transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>


      </div>
    </div>
  );
};

export default Register; 