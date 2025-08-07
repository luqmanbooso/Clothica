import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiStar, FiShoppingCart, FiHeart, FiTruck, FiShield, FiRefreshCw, FiShare2, FiMinus, FiPlus } from 'react-icons/fi';
import axios from 'axios';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import toast from 'react-hot-toast';

const ProductDetail = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const { addToWishlist, isInWishlist } = useWishlist();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [relatedProducts, setRelatedProducts] = useState([]);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/products/${id}`);
      setProduct(response.data);
      
      // Set default color if available
      if (response.data.colors && response.data.colors.length > 0) {
        setSelectedColor(response.data.colors[0].name);
      }
      
      // Fetch related products
      fetchRelatedProducts(response.data.category, response.data._id);
    } catch (error) {
      console.error('Error fetching product:', error);
      toast.error('Failed to load product details');
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedProducts = async (category, excludeId) => {
    try {
      const response = await axios.get(`/api/products?category=${category}&limit=4`);
      setRelatedProducts(response.data.products.filter(p => p._id !== excludeId));
    } catch (error) {
      console.error('Error fetching related products:', error);
    }
  };

  const handleAddToCart = () => {
    if (!selectedSize) {
      toast.error('Please select a size');
      return;
    }
    if (!selectedColor) {
      toast.error('Please select a color');
      return;
    }
    
    addToCart(product, quantity, selectedSize, selectedColor);
    toast.success('Added to cart!');
  };

  const handleWishlistToggle = () => {
    addToWishlist(product);
  };

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity >= 1 && newQuantity <= 10) {
      setQuantity(newQuantity);
    }
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <FiStar
        key={i}
        className={`h-4 w-4 ${
          i < Math.floor(rating)
            ? 'text-yellow-400 fill-current'
            : i < rating
            ? 'text-yellow-400 fill-current opacity-50'
            : 'text-gray-300'
        }`}
      />
    ));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-secondary-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-secondary-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-display font-semibold text-secondary-900 mb-2">
            Product not found
          </h2>
          <p className="text-secondary-600 mb-4">
            The product you're looking for doesn't exist or has been removed.
          </p>
          <Link to="/shop" className="btn-primary">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <ol className="flex items-center space-x-2 text-sm text-secondary-600">
            <li>
              <Link to="/" className="hover:text-primary-600 transition-colors">
                Home
              </Link>
            </li>
            <li>/</li>
            <li>
              <Link to="/shop" className="hover:text-primary-600 transition-colors">
                Shop
              </Link>
            </li>
            <li>/</li>
            <li>
              <Link to={`/shop?category=${product.category}`} className="hover:text-primary-600 transition-colors">
                {product.category}
              </Link>
            </li>
            <li>/</li>
            <li className="text-secondary-900 font-medium">{product.name}</li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="aspect-w-1 aspect-h-1 bg-white rounded-xl shadow-soft overflow-hidden">
              <img
                src={product.images[currentImageIndex]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Thumbnail Images */}
            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`aspect-w-1 aspect-h-1 bg-white rounded-lg overflow-hidden border-2 transition-colors ${
                      currentImageIndex === index
                        ? 'border-primary-500'
                        : 'border-transparent hover:border-secondary-300'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Information */}
          <div className="space-y-6">
            {/* Product Header */}
            <div>
              <h1 className="text-3xl font-display font-bold text-secondary-900 mb-2">
                {product.name}
              </h1>
              <p className="text-lg text-secondary-600 mb-4">
                by {product.brand}
              </p>
              
              {/* Rating */}
              <div className="flex items-center space-x-2 mb-4">
                <div className="flex items-center space-x-1">
                  {renderStars(product.rating)}
                </div>
                <span className="text-sm text-secondary-600">
                  ({product.numReviews} reviews)
                </span>
              </div>
              
              {/* Price */}
              <div className="flex items-center space-x-3 mb-6">
                <span className="text-3xl font-bold text-primary-600">
                  ${product.discountedPrice || product.price}
                </span>
                {product.discount > 0 && (
                  <>
                    <span className="text-xl text-secondary-500 line-through">
                      ${product.price}
                    </span>
                    <span className="bg-error-100 text-error-700 px-2 py-1 rounded-full text-sm font-medium">
                      {product.discount}% OFF
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Color Selection */}
            {product.colors && product.colors.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-secondary-700 mb-3">
                  Color: {selectedColor}
                </h3>
                <div className="flex space-x-2">
                  {product.colors.map((color) => (
                    <button
                      key={color.name}
                      onClick={() => setSelectedColor(color.name)}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${
                        selectedColor === color.name
                          ? 'border-primary-500 scale-110'
                          : 'border-secondary-300 hover:border-secondary-400'
                      }`}
                      style={{ backgroundColor: color.hex }}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Size Selection */}
            {product.sizes && product.sizes.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-secondary-700 mb-3">
                  Size
                </h3>
                <div className="grid grid-cols-4 gap-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size.name}
                      onClick={() => setSelectedSize(size.name)}
                      disabled={!size.available}
                      className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                        selectedSize === size.name
                          ? 'border-primary-500 bg-primary-50 text-primary-700'
                          : size.available
                          ? 'border-secondary-300 hover:border-secondary-400 text-secondary-700'
                          : 'border-secondary-200 text-secondary-400 cursor-not-allowed'
                      }`}
                    >
                      {size.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div>
              <h3 className="text-sm font-medium text-secondary-700 mb-3">
                Quantity
              </h3>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => handleQuantityChange(quantity - 1)}
                  disabled={quantity <= 1}
                  className="w-8 h-8 rounded-full border border-secondary-300 flex items-center justify-center text-secondary-600 hover:bg-secondary-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FiMinus className="h-3 w-3" />
                </button>
                <span className="w-12 text-center text-secondary-900 font-medium">
                  {quantity}
                </span>
                <button
                  onClick={() => handleQuantityChange(quantity + 1)}
                  disabled={quantity >= 10}
                  className="w-8 h-8 rounded-full border border-secondary-300 flex items-center justify-center text-secondary-600 hover:bg-secondary-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FiPlus className="h-3 w-3" />
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <button
                onClick={handleAddToCart}
                className="btn-primary flex-1 flex items-center justify-center space-x-2"
              >
                <FiShoppingCart className="h-4 w-4" />
                <span>Add to Cart</span>
              </button>
              <button
                onClick={handleWishlistToggle}
                className={`p-3 rounded-lg border-2 transition-colors ${
                  isInWishlist(product._id)
                    ? 'border-primary-500 bg-primary-50 text-primary-600'
                    : 'border-secondary-300 text-secondary-600 hover:border-secondary-400'
                }`}
              >
                <FiHeart className="h-5 w-5" />
              </button>
            </div>

            {/* Product Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t border-secondary-200">
              <div className="flex items-center space-x-2">
                <FiTruck className="h-5 w-5 text-primary-600" />
                <span className="text-sm text-secondary-700">Free Shipping</span>
              </div>
              <div className="flex items-center space-x-2">
                <FiShield className="h-5 w-5 text-primary-600" />
                <span className="text-sm text-secondary-700">Secure Payment</span>
              </div>
              <div className="flex items-center space-x-2">
                <FiRefreshCw className="h-5 w-5 text-primary-600" />
                <span className="text-sm text-secondary-700">Easy Returns</span>
              </div>
            </div>

            {/* Description */}
            <div className="pt-6 border-t border-secondary-200">
              <h3 className="text-lg font-semibold text-secondary-900 mb-3">
                Description
              </h3>
              <p className="text-secondary-700 leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Product Details */}
            {(product.material || product.care) && (
              <div className="pt-6 border-t border-secondary-200">
                <h3 className="text-lg font-semibold text-secondary-900 mb-3">
                  Product Details
                </h3>
                <div className="space-y-2">
                  {product.material && (
                    <div className="flex justify-between">
                      <span className="text-secondary-600">Material:</span>
                      <span className="text-secondary-900">{product.material}</span>
                    </div>
                  )}
                  {product.care && (
                    <div className="flex justify-between">
                      <span className="text-secondary-600">Care:</span>
                      <span className="text-secondary-900">{product.care}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Reviews Section */}
        {product.reviews && product.reviews.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-display font-bold text-secondary-900 mb-8">
              Customer Reviews
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {product.reviews.slice(0, 4).map((review, index) => (
                <div key={index} className="bg-white rounded-xl shadow-soft p-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-primary-700">
                          {review.user.name?.charAt(0) || 'U'}
                        </span>
                      </div>
                      <span className="font-medium text-secondary-900">
                        {review.user.name}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      {renderStars(review.rating)}
                    </div>
                  </div>
                  <p className="text-secondary-700">{review.comment}</p>
                  <p className="text-xs text-secondary-500 mt-2">
                    {new Date(review.date).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-display font-bold text-secondary-900 mb-8">
              Related Products
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <Link
                  key={relatedProduct._id}
                  to={`/product/${relatedProduct._id}`}
                  className="product-card group"
                >
                  <div className="aspect-w-1 aspect-h-1 bg-white rounded-lg overflow-hidden mb-4">
                    <img
                      src={relatedProduct.images[0]}
                      alt={relatedProduct.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <h3 className="font-semibold text-secondary-900 mb-2 group-hover:text-primary-600 transition-colors">
                    {relatedProduct.name}
                  </h3>
                  <p className="text-sm text-secondary-600 mb-2">
                    {relatedProduct.brand}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-primary-600">
                      ${relatedProduct.discountedPrice || relatedProduct.price}
                    </span>
                    {relatedProduct.discount > 0 && (
                      <span className="text-xs text-error-600 font-medium">
                        {relatedProduct.discount}% OFF
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail; 