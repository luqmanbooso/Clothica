import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiStar, FiShoppingCart, FiHeart } from 'react-icons/fi';
import axios from 'axios';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const { addToWishlist, isInWishlist } = useWishlist();

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const response = await axios.get('/api/products?featured=true&limit=8');
        setFeaturedProducts(response.data.products);
      } catch (error) {
        console.error('Error fetching featured products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  const categories = [
    { name: "Men's Clothing", image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400", link: "/shop?category=men" },
    { name: "Women's Clothing", image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400", link: "/shop?category=women" },
    { name: "Kids' Clothing", image: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=400", link: "/shop?category=kids" },
    { name: "Accessories", image: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=400", link: "/shop?category=accessories" },
    { name: "Shoes", image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400", link: "/shop?category=shoes" },
  ];

  const handleAddToCart = (product) => {
    addToCart(product, 1, product.sizes[0]?.name || 'M', product.colors[0]?.name || 'Default');
  };

  const handleWishlistToggle = (product) => {
    addToWishlist(product);
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-50 via-white to-accent-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <h1 className="text-4xl md:text-6xl font-display font-bold text-secondary-900 leading-tight">
                Discover Your
                <span className="text-gradient block">Perfect Style</span>
              </h1>
              <p className="text-xl text-secondary-600 leading-relaxed">
                Explore our curated collection of premium clothing and accessories. 
                From casual wear to formal attire, find your unique style with Clothica.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/shop" className="btn-primary text-lg px-8 py-4 inline-flex items-center">
                  Shop Now
                  <FiArrowRight className="ml-2" />
                </Link>
                <Link to="/shop?featured=true" className="btn-outline text-lg px-8 py-4">
                  Featured Items
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="relative z-10">
                <img
                  src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600"
                  alt="Fashion Collection"
                  className="rounded-2xl shadow-large"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 w-72 h-72 bg-gradient-to-br from-primary-200 to-accent-200 rounded-full opacity-20"></div>
              <div className="absolute -top-6 -right-6 w-48 h-48 bg-gradient-to-br from-accent-200 to-primary-200 rounded-full opacity-20"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-secondary-900 mb-4">
              Shop by Category
            </h2>
            <p className="text-lg text-secondary-600">
              Explore our diverse range of clothing and accessories
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {categories.map((category, index) => (
              <Link
                key={index}
                to={category.link}
                className="group block"
              >
                <div className="relative overflow-hidden rounded-xl shadow-soft group-hover:shadow-medium transition-shadow duration-300">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-white font-semibold text-lg">{category.name}</h3>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-16 bg-secondary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-secondary-900 mb-4">
              Featured Products
            </h2>
            <p className="text-lg text-secondary-600">
              Discover our most popular and trending items
            </p>
          </div>
          
          {loading ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <div key={product._id} className="product-card group">
                  <div className="relative overflow-hidden rounded-t-xl">
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-4 right-4 space-y-2">
                      <button
                        onClick={() => handleWishlistToggle(product)}
                        className={`p-2 rounded-full shadow-soft transition-colors ${
                          isInWishlist(product._id)
                            ? 'bg-accent-500 text-white'
                            : 'bg-white text-secondary-600 hover:text-accent-500'
                        }`}
                      >
                        <FiHeart className="w-4 h-4" />
                      </button>
                    </div>
                    {product.discount > 0 && (
                      <div className="absolute top-4 left-4 bg-error-500 text-white px-2 py-1 rounded-full text-sm font-medium">
                        -{product.discount}%
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-secondary-500 font-medium">{product.brand}</span>
                      <div className="flex items-center space-x-1">
                        <FiStar className="w-4 h-4 text-warning-400 fill-current" />
                        <span className="text-sm text-secondary-600">{product.rating}</span>
                      </div>
                    </div>
                    <h3 className="font-semibold text-secondary-900 mb-2 line-clamp-2">
                      {product.name}
                    </h3>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {product.discount > 0 ? (
                          <>
                            <span className="text-lg font-bold text-primary-600">
                              ${(product.price * (1 - product.discount / 100)).toFixed(2)}
                            </span>
                            <span className="text-sm text-secondary-500 line-through">
                              ${product.price}
                            </span>
                          </>
                        ) : (
                          <span className="text-lg font-bold text-primary-600">
                            ${product.price}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => handleAddToCart(product)}
                        className="p-2 bg-primary-500 text-white rounded-full hover:bg-primary-600 transition-colors"
                      >
                        <FiShoppingCart className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <div className="text-center mt-8">
            <Link to="/shop" className="btn-primary text-lg px-8 py-3">
              View All Products
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-secondary-900 mb-2">Free Shipping</h3>
              <p className="text-secondary-600">Free shipping on orders over $100</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-secondary-900 mb-2">Quality Guarantee</h3>
              <p className="text-secondary-600">30-day return policy on all items</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-accent-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-accent-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-secondary-900 mb-2">Secure Payment</h3>
              <p className="text-secondary-600">Safe and secure payment processing</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home; 