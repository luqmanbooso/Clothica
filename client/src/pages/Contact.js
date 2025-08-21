import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  EnvelopeIcon, 
  PhoneIcon, 
  MapPinIcon, 
  ClockIcon,
  ChatBubbleLeftRightIcon,
  TruckIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showSuccess, setShowSuccess] = useState(false);

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
    
    if (!formData.name) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.subject) {
      newErrors.subject = 'Subject is required';
    }
    
    if (!formData.message) {
      newErrors.message = 'Message is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setShowSuccess(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
      setTimeout(() => setShowSuccess(false), 5000);
    } catch (error) {
      setErrors({ general: 'Failed to send message. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 }
    }
  };

  const contactInfo = [
    {
      icon: MapPinIcon,
      title: 'Visit Us',
      description: '123 Fashion Street, Style City, SC 12345',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: PhoneIcon,
      title: 'Call Us',
      description: '+1 (555) 123-4567',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: EnvelopeIcon,
      title: 'Email Us',
      description: 'hello@clothica.com',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: ClockIcon,
      title: 'Business Hours',
      description: 'Mon-Fri: 9AM-6PM, Sat: 10AM-4PM',
      color: 'from-orange-500 to-red-500'
    }
  ];

  const quickLinks = [
    {
      icon: TruckIcon,
      title: 'Shipping Info',
      description: 'Learn about our shipping options and delivery times',
      link: '/shipping',
      color: 'from-indigo-500 to-purple-500'
    },
    {
      icon: ArrowPathIcon,
      title: 'Returns & Exchanges',
      description: 'Learn about our return policy and process',
      link: '/orders',
      color: 'from-teal-500 to-cyan-500'
    }
  ];

  return (
    <div className="min-h-screen bg-[#F4F1EE]">
      {/* Enhanced Header */}
      <section className="py-24 px-6 bg-gradient-to-br from-[#0F0F0F] via-[#1A1A1A] to-[#2A2A2A] relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-r from-[#D4AF37]/20 to-[#E8B4B8]/20 rounded-full blur-3xl animate-pulse-soft"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-r from-[#6C7A59]/20 to-[#9CAF88]/20 rounded-full blur-3xl animate-pulse-soft" style={{animationDelay: '2s'}}></div>
        </div>
        
        <motion.div 
          className="max-w-6xl mx-auto text-center relative z-10"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.h1 
            className="text-6xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#F5F1E8] via-[#D4AF37] to-[#6C7A59] mb-8"
            variants={itemVariants}
          >
            GET IN TOUCH
          </motion.h1>
          <motion.p 
            className="text-2xl text-[#E6E6FA] max-w-3xl mx-auto leading-relaxed"
            variants={itemVariants}
          >
            We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </motion.p>
        </motion.div>
      </section>

      {/* Contact Information */}
      <section className="py-20 px-6">
        <motion.div 
          className="max-w-7xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16"
            variants={itemVariants}
          >
            {contactInfo.map((info, index) => (
              <motion.div
                key={index}
                className="text-center group"
                variants={itemVariants}
                whileHover={{ scale: 1.05, y: -5 }}
                transition={{ duration: 0.3 }}
              >
                <div className={`w-20 h-20 bg-gradient-to-br ${info.color} rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl group-hover:shadow-2xl transition-all duration-300`}>
                  <info.icon className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-2xl font-black text-[#1E1E1E] mb-3">
                  {info.title}
                </h3>
                <p className="text-[#6C7A59] text-lg font-medium">
                  {info.description}
                </p>
              </motion.div>
            ))}
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Contact Form */}
            <motion.div 
              className="lg:col-span-2"
              variants={itemVariants}
            >
              <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border border-[#6C7A59]/20 p-8">
                <h2 className="text-3xl font-black text-[#1E1E1E] mb-6 flex items-center">
                  <div className="w-8 h-8 bg-gradient-to-r from-[#6C7A59] to-[#9CAF88] rounded-xl flex items-center justify-center mr-3">
                    <ChatBubbleLeftRightIcon className="h-5 w-5 text-white" />
                  </div>
                  Send us a Message
                </h2>

                {showSuccess && (
                  <motion.div 
                    className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center space-x-3"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    <ChatBubbleLeftRightIcon className="h-5 w-5 text-green-500" />
                    <p className="text-green-700 text-sm">Message sent successfully! We'll get back to you soon.</p>
                  </motion.div>
                )}

                {errors.general && (
                  <motion.div 
                    className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center space-x-3"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    <ChatBubbleLeftRightIcon className="h-5 w-5 text-red-500" />
                    <p className="text-red-700 text-sm">{errors.general}</p>
                  </motion.div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-bold text-[#1E1E1E] mb-3 flex items-center">
                        <div className="w-4 h-4 bg-gradient-to-r from-[#6C7A59] to-[#9CAF88] rounded-full mr-2"></div>
                        Full Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className={`w-full px-6 py-4 border-2 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#6C7A59]/20 focus:border-[#6C7A59] transition-all duration-300 bg-white/80 backdrop-blur-sm ${
                          errors.name ? 'border-[#B35D5D]' : 'border-[#6C7A59]/30 hover:border-[#6C7A59]/50'
                        }`}
                        placeholder="Your full name"
                      />
                      {errors.name && (
                        <motion.p 
                          className="mt-1 text-sm text-red-600"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                        >
                          {errors.name}
                        </motion.p>
                      )}
                    </div>

                    <div>
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
                        placeholder="your@email.com"
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
                    </div>
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-sm font-semibold text-[#1E1E1E] mb-2">
                      Subject
                    </label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6C7A59] focus:border-[#6C7A59] transition-all duration-200 ${
                        errors.subject ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="What can we help you with?"
                    />
                    {errors.subject && (
                      <motion.p 
                        className="mt-1 text-sm text-red-600"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        {errors.subject}
                      </motion.p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-semibold text-[#1E1E1E] mb-2">
                      Message
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows={6}
                      value={formData.message}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6C7A59] focus:border-[#6C7A59] transition-all duration-200 resize-none ${
                        errors.message ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Tell us more about your inquiry..."
                    />
                    {errors.message && (
                      <motion.p 
                        className="mt-1 text-sm text-red-600"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        {errors.message}
                      </motion.p>
                    )}
                  </div>

                  <motion.button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-[#6C7A59] to-[#9CAF88] text-white font-bold py-4 px-8 rounded-2xl hover:from-[#9CAF88] hover:to-[#6C7A59] focus:outline-none focus:ring-4 focus:ring-[#6C7A59]/20 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {loading ? 'Sending Message...' : 'Send Message'}
                  </motion.button>
                </form>
              </div>
            </motion.div>

            {/* Quick Links */}
            <motion.div 
              className="space-y-6"
              variants={itemVariants}
            >
              <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border border-[#6C7A59]/20 p-8">
                <h3 className="text-2xl font-black text-[#1E1E1E] mb-6 flex items-center">
                  <div className="w-8 h-8 bg-gradient-to-r from-[#D4AF37] to-[#E8B4B8] rounded-xl flex items-center justify-center mr-3">
                    <ArrowPathIcon className="h-5 w-5 text-white" />
                  </div>
                  Quick Help
                </h3>
                <div className="space-y-4">
                  {quickLinks.map((link, index) => (
                    <Link
                      key={index}
                      to={link.link}
                      className="block p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all duration-200 group"
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 bg-gradient-to-br ${link.color} rounded-lg flex items-center justify-center`}>
                          <link.icon className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-[#1E1E1E] group-hover:text-[#6C7A59] transition-colors">
                            {link.title}
                          </h4>
                          <p className="text-sm text-[#6C7A59]">
                            {link.description}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Social Media */}
              <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border border-[#6C7A59]/20 p-8">
                <h3 className="text-2xl font-black text-[#1E1E1E] mb-6 flex items-center">
                  <div className="w-8 h-8 bg-gradient-to-r from-[#6C7A59] to-[#9CAF88] rounded-xl flex items-center justify-center mr-3">
                    <ChatBubbleLeftRightIcon className="h-5 w-5 text-white" />
                  </div>
                  Follow Us
                </h3>
                <div className="flex space-x-4">
                  <a href="#" className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white hover:scale-110 transition-transform duration-200">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </a>
                  <a href="#" className="w-10 h-10 bg-gradient-to-br from-pink-500 to-pink-600 rounded-lg flex items-center justify-center text-white hover:scale-110 transition-transform duration-200">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.746-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001 12.017.001z"/>
                    </svg>
                  </a>
                  <a href="#" className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-500 rounded-lg flex items-center justify-center text-white hover:scale-110 transition-transform duration-200">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                    </svg>
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </section>
    </div>
  );
};

export default Contact;
