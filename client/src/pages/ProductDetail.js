import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { StarIcon, ShoppingBagIcon, HeartIcon, EyeIcon, StarIcon as StarIconSolid, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import axios from 'axios';

const ProductDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { addToCart, getCartCount } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [showReviews, setShowReviews] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    loadProduct();
  }, [id]);

  useEffect(() => {
    if (product) {
      loadRelatedProducts();
    }
  }, [product, id]);

  const loadProduct = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/products/${id}`);
      const data = response.data;
      setProduct(data);
      
      // Set default selections if available
      if (data.colors && data.colors.length > 0) {
        setSelectedColor(data.colors[0].name || data.colors[0]);
      }
      if (data.sizes && data.sizes.length > 0) {
        setSelectedSize(data.sizes[0].name || data.sizes[0]);
      }
    } catch (error) {
      console.error('Error loading product:', error);
      // Don't set fallback data - let the user see the error
      setProduct(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const loadRelatedProducts = useCallback(async () => {
    try {
      // Fetch related products from the same category
      if (product?.category) {
        const response = await axios.get(`/api/products?category=${product.category}&limit=4`);
        setRelatedProducts(response.data.products.filter(p => p._id !== id));
      }
    } catch (error) {
      console.error('Error loading related products:', error);
      setRelatedProducts([]);
    }
  }, [product?.category, id]);

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<StarIconSolid key={i} className="h-5 w-5 text-yellow-400" />);
    }

    if (hasHalfStar) {
      stars.push(<StarIcon key={fullStars} className="h-5 w-5 text-yellow-400" />);
    }

    const remainingStars = 5 - Math.ceil(rating);
    for (let i = 0; i < remainingStars; i++) {
      stars.push(<StarIcon key={fullStars + hasHalfStar + i} className="h-5 w-5 text-gray-300" />);
    }

    return stars;
  };

  const handleAddToCart = () => {
    const errors = {};
    
    if (!selectedSize) {
      errors.size = 'Please select a size';
    }
    if (!selectedColor) {
      errors.color = 'Please select a color';
    }
    
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }
    
    // Clear validation errors
    setValidationErrors({});
    
    const cartItem = {
      ...product,
      selectedSize,
      selectedColor,
      quantity
    };
    
    addToCart(cartItem);
    setSuccessMessage('Added to cart successfully!');
    setShowSuccess(true);
    
    setTimeout(() => {
      setShowSuccess(false);
      setSuccessMessage('');
    }, 3000);
  };

  const handleWishlist = () => {
    if (isInWishlist(product._id)) {
      removeFromWishlist(product._id);
      setSuccessMessage('Removed from wishlist');
    } else {
      addToWishlist(product);
      setSuccessMessage('Added to wishlist!');
    }
    
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      setSuccessMessage('');
    }, 3000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Product not found</h2>
          <Link to="/shop" className="text-blue-600 hover:text-blue-700">
            Continue shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success Message */}
        {showSuccess && (
          <div className="fixed top-4 right-4 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center z-50 shadow-lg">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
            <span className="text-green-800 font-medium">{successMessage}</span>
          </div>
        )}

        {/* Breadcrumb */}
        <nav className="flex mb-8" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2">
            <li>
              <Link to="/" className="text-gray-500 hover:text-gray-700">
                Home
              </Link>
            </li>
            <li>
              <ChevronRightIcon className="h-4 w-4 text-gray-400" />
            </li>
            <li>
              <Link to="/shop" className="text-gray-500 hover:text-gray-700">
                Shop
              </Link>
            </li>
            <li>
              <ChevronRightIcon className="h-4 w-4 text-gray-400" />
            </li>
            <li className="text-gray-900 font-medium">{product.name}</li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative aspect-square overflow-hidden rounded-lg bg-white">
              <img
                src={product.images?.[selectedImage] || "https://via.placeholder.com/400x400"}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              
              {/* Navigation Arrows */}
              <button
                onClick={() => setSelectedImage((prev) => (prev - 1 + product.images.length) % product.images.length)}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-all duration-200"
              >
                <ChevronLeftIcon className="h-5 w-5" />
              </button>
              <button
                onClick={() => setSelectedImage((prev) => (prev + 1) % product.images.length)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-all duration-200"
              >
                <ChevronRightIcon className="h-5 w-5" />
              </button>
            </div>
            
            {/* Thumbnail Images */}
            <div className="grid grid-cols-4 gap-2">
              {product.images?.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`aspect-square overflow-hidden rounded-lg border-2 transition-all duration-200 ${
                    selectedImage === index ? 'border-blue-600' : 'border-gray-200 hover:border-gray-300'
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
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Product Header */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                {product.isNew && (
                  <span className="inline-block px-2 py-1 bg-blue-600 text-white text-xs font-semibold rounded">
                    NEW
                  </span>
                )}
                {product.discount && (
                  <span className="inline-block px-2 py-1 bg-red-600 text-white text-xs font-semibold rounded">
                    -{product.discount}% OFF
                  </span>
                )}
              </div>
              
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
              
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center">
                  {renderStars(product.rating || 0)}
                  <span className="ml-2 text-sm text-gray-600">
                    {product.rating || 0} ({product.numReviews || product.reviews?.length || 0} reviews)
                  </span>
                </div>
                <button
                  onClick={() => setShowReviews(true)}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  Write a review
                </button>
              </div>
              
              <div className="flex items-center gap-3">
                <span className="text-3xl font-bold text-gray-900">${product.price}</span>
                {product.originalPrice && (
                  <span className="text-xl text-gray-500 line-through">${product.originalPrice}</span>
                )}
              </div>
            </div>

            {/* Product Description */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
              <p className="text-gray-600 leading-relaxed">{product.description}</p>
            </div>

            {/* Features */}
            {product.features && product.features.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Features</h3>
                <ul className="space-y-1">
                  {product.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-gray-600">
                      <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mr-3"></div>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Material and Care */}
            {(product.material || product.care) && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Material & Care</h3>
                <div className="space-y-2">
                  {product.material && (
                    <div className="flex items-center text-gray-600">
                      <span className="font-medium mr-2">Material:</span>
                      <span>{product.material}</span>
                    </div>
                  )}
                  {product.care && (
                    <div className="flex items-center text-gray-600">
                      <span className="font-medium mr-2">Care:</span>
                      <span>{product.care}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Color Selection */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Color</h3>
              <div className="flex gap-3">
                {product.colors?.map((color) => (
                  <button
                    key={color.name || color}
                    onClick={() => setSelectedColor(color.name || color)}
                    className={`w-8 h-8 rounded-full border-2 transition-all duration-200 ${
                      selectedColor === (color.name || color)
                        ? 'border-blue-600 scale-110'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    style={{ backgroundColor: color.hex || color }}
                    title={color.name || color}
                  />
                ))}
              </div>
              {validationErrors.color && (
                <p className="mt-2 text-sm text-red-600">{validationErrors.color}</p>
              )}
            </div>

            {/* Size Selection */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Size</h3>
              <div className="grid grid-cols-3 gap-2">
                {product.sizes?.map((size) => (
                  <button
                    key={size.name || size}
                    onClick={() => setSelectedSize(size.name || size)}
                    className={`py-3 px-4 border-2 rounded-lg font-medium transition-all duration-200 ${
                      selectedSize === (size.name || size)
                        ? 'border-blue-600 bg-blue-50 text-blue-600'
                        : 'border-gray-300 text-gray-700 hover:border-gray-400'
                    }`}
                  >
                    {size.name || size}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Quantity</h3>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
                >
                  -
                </button>
                <span className="w-16 text-center font-medium">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
                >
                  +
                </button>
                <span className="text-sm text-gray-500">
                  {product.stock || 0} available
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={handleAddToCart}
                className="w-full flex items-center justify-center px-6 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
              >
                <ShoppingBagIcon className="h-5 w-5 mr-2" />
                Add to Cart
              </button>
              
              <div className="flex gap-3">
                <button
                  onClick={handleWishlist}
                  className={`flex-1 flex items-center justify-center px-6 py-3 border font-semibold rounded-lg transition-colors ${
                    isInWishlist(product._id)
                      ? 'border-red-300 bg-red-50 text-red-600 hover:bg-red-100'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <HeartIcon className={`h-5 w-5 mr-2 ${isInWishlist(product._id) ? 'fill-current' : ''}`} />
                  {isInWishlist(product._id) ? 'In Wishlist' : 'Add to Wishlist'}
                </button>
                <button className="flex-1 flex items-center justify-center px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors">
                  <EyeIcon className="h-5 w-5 mr-2" />
                  Quick View
                </button>
              </div>
            </div>

            {/* Product Info */}
            <div className="border-t border-gray-200 pt-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                {product.sku && (
                  <div>
                    <span className="text-gray-500">SKU:</span>
                    <span className="ml-2 font-medium">{product.sku}</span>
                  </div>
                )}
                {product.category && (
                  <div>
                    <span className="text-gray-500">Category:</span>
                    <span className="ml-2 font-medium capitalize">{product.category}</span>
                  </div>
                )}
                {product.brand && (
                  <div>
                    <span className="text-gray-500">Brand:</span>
                    <span className="ml-2 font-medium">{product.brand}</span>
                  </div>
                )}
                {product.subcategory && (
                  <div>
                    <span className="text-gray-500">Subcategory:</span>
                    <span className="ml-2 font-medium capitalize">{product.subcategory}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Customer Reviews</h2>
            <button
              onClick={() => setShowReviews(true)}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Write a review
            </button>
          </div>

          <div className="grid gap-6">
            {product.reviews && product.reviews.length > 0 ? (
              product.reviews.map((review) => (
                <div key={review._id} className="bg-white rounded-lg p-6 shadow-sm">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-gray-900">
                          {review.user?.name || 'Anonymous User'}
                        </span>
                        {review.verified && (
                          <span className="inline-block px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
                            Verified Purchase
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {renderStars(review.rating)}
                        <span className="text-sm text-gray-500">
                          {new Date(review.createdAt || review.date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  {review.title && (
                    <h4 className="font-semibold text-gray-900 mb-2">{review.title}</h4>
                  )}
                  <p className="text-gray-600">{review.comment || review.text}</p>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No reviews yet. Be the first to review this product!</p>
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">You might also like</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((product) => (
              <Link key={product._id} to={`/product/${product._id}`} className="group">
                <div className="relative overflow-hidden rounded-lg bg-white shadow-sm hover:shadow-lg transition-all duration-300">
                  <img
                    src={product.images?.[0] || "https://via.placeholder.com/300x300"}
                    alt={product.name}
                    className="w-full aspect-square object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3">
                    {product.isNew && (
                      <span className="inline-block px-2 py-1 bg-blue-600 text-white text-xs font-semibold rounded">
                        NEW
                      </span>
                    )}
                    {product.discount && (
                      <span className="inline-block px-2 py-1 bg-red-600 text-white text-xs font-semibold rounded">
                        -{product.discount}%
                      </span>
                    )}
                  </div>
                </div>
                <div className="mt-4">
                  <h3 className="font-semibold text-gray-900 mb-1">{product.name}</h3>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-900">${product.price}</span>
                      {product.originalPrice && product.originalPrice > product.price && (
                        <span className="text-sm text-gray-500 line-through">${product.originalPrice}</span>
                      )}
                    </div>
                    <div className="flex items-center">
                      {renderStars(product.rating || 0)}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail; 