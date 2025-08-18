import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { 
  StarIcon, 
  ShoppingBagIcon, 
  HeartIcon, 
  EyeIcon, 
  ArrowRightIcon, 
  ChevronLeftIcon, 
  ChevronRightIcon,
  SparklesIcon,
  FireIcon,
  StarIcon as StarIconSolid
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import WelcomeModal from '../components/WelcomeModal';
import Banner from '../components/Banner';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const Home = () => {
  const { user, isAuthenticated } = useAuth();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setIsVisible(true);
    if (isAuthenticated) {
      loadFeaturedProducts();
    }
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const loadFeaturedProducts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/products/featured');
      setFeaturedProducts(response.data);
    } catch (error) {
      console.error('Error loading featured products:', error);
      // Fallback to empty array if API fails
      setFeaturedProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Show welcome modal for new users (only on first login, not page refresh)
  useEffect(() => {
    if (isAuthenticated && user) {
      // Check if this is a new user session (not just page refresh)
      const hasSeenWelcome = sessionStorage.getItem('welcomeModalShown');
      const isNewUser = !hasSeenWelcome;
      
      if (isNewUser) {
        setShowWelcomeModal(true);
        sessionStorage.setItem('welcomeModalShown', 'true');
      }
    }
  }, [isAuthenticated, user]);

  const heroSlides = [
    {
      id: 1,
      title: "New Season Collection",
      subtitle: "Discover the latest trends in fashion",
      description: "Elevate your style with our curated collection of premium clothing and accessories.",
      image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80",
      cta: "Shop Now",
      color: "from-amber-500 to-orange-500"
    },
    {
      id: 2,
      title: "Premium Quality",
      subtitle: "Crafted with excellence",
      description: "Experience the finest materials and craftsmanship in every piece we create.",
      image: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80",
      cta: "Explore",
      color: "from-emerald-500 to-teal-500"
    },
    {
      id: 3,
      title: "Sustainable Fashion",
      subtitle: "Eco-friendly choices",
      description: "Join us in making conscious fashion choices that benefit both you and the planet.",
      image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80",
      cta: "Learn More",
      color: "from-purple-500 to-pink-500"
    }
  ];

  const categories = [
    {
      id: 'mens',
      name: "Men's Fashion",
      image: "https://images.unsplash.com/photo-1516257984-b1b4d707412e?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
      count: 3,
      color: "from-blue-500 to-cyan-500"
    },
    {
      id: 'womens',
      name: "Women's Fashion",
      image: "https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
      count: 1,
      color: "from-pink-500 to-rose-500"
    },
    {
      id: 'accessories',
      name: "Accessories",
      image: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
      count: 2,
      color: "from-yellow-500 to-orange-500"
    }
  ];

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<StarIconSolid key={i} className="h-4 w-4 text-yellow-400" />);
    }

    if (hasHalfStar) {
      stars.push(<StarIcon key={fullStars} className="h-4 w-4 text-yellow-400" />);
    }

    const remainingStars = 5 - Math.ceil(rating);
    for (let i = 0; i < remainingStars; i++) {
      stars.push(<StarIcon key={fullStars + hasHalfStar + i} className="h-4 w-4 text-gray-300" />);
    }

    return stars;
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
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  const slideVariants = {
    enter: (direction) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0
    })
  };

  return (
    <div className="min-h-screen bg-[#F4F1EE]">
      {/* Hero Section */}
      <section className="relative h-screen overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            custom={1}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 }
            }}
            className="absolute inset-0"
          >
            <div className="relative h-full">
              <img
                src={heroSlides[currentSlide].image}
                alt={heroSlides[currentSlide].title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40"></div>
              
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div 
                  className="text-center text-white max-w-4xl mx-auto px-6"
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                >
                  <motion.h1 
                    className="text-6xl md:text-8xl font-display font-bold mb-4"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.5 }}
                  >
                    {heroSlides[currentSlide].title}
                  </motion.h1>
                  <motion.p 
                    className="text-xl md:text-2xl mb-6 text-gray-200"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.7 }}
                  >
                    {heroSlides[currentSlide].subtitle}
                  </motion.p>
                  <motion.p 
                    className="text-lg mb-8 text-gray-300 max-w-2xl mx-auto"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.9 }}
                  >
                    {heroSlides[currentSlide].description}
                  </motion.p>
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 1.1 }}
                  >
                    <Link
                      to="/shop"
                      className="inline-flex items-center px-8 py-4 bg-[#6C7A59] text-white font-semibold rounded-full hover:bg-[#5A6A4A] transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                    >
                      {heroSlides[currentSlide].cta}
                      <ArrowRightIcon className="ml-2 h-5 w-5" />
                    </Link>
                  </motion.div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Hero Navigation */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-4">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                currentSlide === index ? 'bg-white scale-125' : 'bg-white/50 hover:bg-white/75'
              }`}
            />
          ))}
        </div>

        {/* Hero Arrows */}
        <button
          onClick={() => setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length)}
          className="absolute left-8 top-1/2 transform -translate-y-1/2 p-3 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-all duration-300"
        >
          <ChevronLeftIcon className="h-6 w-6 text-white" />
        </button>
        <button
          onClick={() => setCurrentSlide((prev) => (prev + 1) % heroSlides.length)}
          className="absolute right-8 top-1/2 transform -translate-y-1/2 p-3 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-all duration-300"
        >
          <ChevronRightIcon className="h-6 w-6 text-white" />
        </button>
      </section>

      {/* Banner Section */}
      <section className="py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <Banner />
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 px-6">
        <motion.div 
          className="max-w-7xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          animate={isVisible ? "visible" : "hidden"}
        >
          <motion.div className="text-center mb-16" variants={itemVariants}>
            <h2 className="text-4xl md:text-5xl font-display font-bold text-[#1E1E1E] mb-4">
              Shop by Category
            </h2>
            <p className="text-lg text-[#6C7A59] max-w-2xl mx-auto">
              Discover our curated collections designed for every style and occasion
            </p>
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            variants={itemVariants}
          >
            {categories.map((category, index) => (
              <motion.div
                key={category.id}
                variants={itemVariants}
                whileHover={{ scale: 1.05, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <Link to={`/shop?category=${category.id}`}>
                  <div className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500">
                    <img
                      src={category.image}
                      alt={category.name}
                      className="w-full h-80 object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                    <div className="absolute bottom-6 left-6 right-6">
                      <h3 className="text-2xl font-display font-bold text-white mb-2">
                        {category.name}
                      </h3>
                      <p className="text-white/80">
                        {category.count} products
                      </p>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* Featured Products Section */}
      <section className="py-20 px-6 bg-white">
        <motion.div 
          className="max-w-7xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          animate={isVisible ? "visible" : "hidden"}
        >
          <motion.div className="text-center mb-16" variants={itemVariants}>
            <h2 className="text-4xl md:text-5xl font-display font-bold text-[#1E1E1E] mb-4">
              Featured Products
            </h2>
            <p className="text-lg text-[#6C7A59] max-w-2xl mx-auto">
              Handpicked items that define style and quality
            </p>
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
            variants={itemVariants}
          >
            {loading ? (
              <p className="col-span-full text-center py-10">Loading products...</p>
            ) : featuredProducts.length === 0 ? (
              <p className="col-span-full text-center py-10">No featured products found.</p>
            ) : (
              featuredProducts.map((product, index) => (
                <motion.div
                  key={product._id}
                  variants={itemVariants}
                  whileHover={{ scale: 1.05, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="group"
                >
                  <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden">
                    <div className="relative overflow-hidden">
                      <img
                        src={product.images?.[0] || "https://via.placeholder.com/400x400"}
                        alt={product.name}
                        className="w-full h-80 object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      
                      {/* Badges */}
                      <div className="absolute top-4 left-4 flex flex-col gap-2">
                        {product.isNew && (
                          <span className="inline-block px-3 py-1 bg-[#6C7A59] text-white text-xs font-semibold rounded-full">
                            NEW
                          </span>
                        )}
                        {product.discount && (
                          <span className="inline-block px-3 py-1 bg-[#B35D5D] text-white text-xs font-semibold rounded-full">
                            -{product.discount}%
                          </span>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                        <button className="p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors">
                          <HeartIcon className="h-5 w-5 text-[#1E1E1E]" />
                        </button>
                        <Link to={`/product/${product._id}`}>
                          <button className="p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors">
                            <EyeIcon className="h-5 w-5 text-[#1E1E1E]" />
                          </button>
                        </Link>
                      </div>
                    </div>

                    <div className="p-6">
                      <Link to={`/product/${product._id}`}>
                        <h3 className="font-display font-semibold text-[#1E1E1E] mb-2 group-hover:text-[#6C7A59] transition-colors">
                          {product.name}
                        </h3>
                      </Link>
                      
                      <div className="flex items-center mb-3">
                        {renderStars(product.rating || 0)}
                        <span className="ml-2 text-sm text-[#6C7A59]">
                          ({product.numReviews || product.reviews?.length || 0})
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-xl font-bold text-[#1E1E1E]">
                            ${product.price}
                          </span>
                          {product.originalPrice && product.originalPrice > product.price && (
                            <span className="text-sm text-[#B35D5D] line-through">
                              ${product.originalPrice}
                            </span>
                          )}
                        </div>

                        <button className="flex items-center px-4 py-2 bg-[#6C7A59] text-white font-semibold rounded-full hover:bg-[#5A6A4A] transition-all duration-300 transform hover:scale-105">
                          <ShoppingBagIcon className="h-4 w-4 mr-2" />
                          Add
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </motion.div>
        </motion.div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-[#1E1E1E]">
        <motion.div 
          className="max-w-4xl mx-auto text-center"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-6">
            Ready to Elevate Your Style?
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Join thousands of fashion enthusiasts who trust Clothica for their style needs
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/shop"
              className="inline-flex items-center px-8 py-4 bg-[#6C7A59] text-white font-semibold rounded-full hover:bg-[#5A6A4A] transition-all duration-300 transform hover:scale-105"
            >
              Start Shopping
              <ArrowRightIcon className="ml-2 h-5 w-5" />
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center px-8 py-4 border-2 border-white text-white font-semibold rounded-full hover:bg-white hover:text-[#1E1E1E] transition-all duration-300"
            >
              Get in Touch
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Welcome Modal */}
      <WelcomeModal 
        isOpen={showWelcomeModal}
        onClose={() => setShowWelcomeModal(false)}
        userName={user?.name}
      />
    </div>
  );
};

export default Home; 