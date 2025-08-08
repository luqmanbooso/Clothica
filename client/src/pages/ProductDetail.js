import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { StarIcon, ShoppingBagIcon, HeartIcon, EyeIcon, StarIcon as StarIconSolid, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';

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

  const productImages = [
    "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1503341504253-dff4815485f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1562157873-818bc0726f68?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1576566588028-4147f3842f27?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
  ];

  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
  const colors = [
    { name: 'Black', hex: '#000000' },
    { name: 'White', hex: '#FFFFFF' },
    { name: 'Navy', hex: '#1e3a8a' },
    { name: 'Gray', hex: '#6b7280' }
  ];

  const reviews = [
    {
      id: 1,
      user: 'Sarah M.',
      rating: 5,
      date: '2024-01-15',
      title: 'Perfect fit and quality!',
      comment: 'This shirt exceeded my expectations. The fabric is soft and the fit is perfect. Highly recommend!',
      verified: true
    },
    {
      id: 2,
      user: 'Mike R.',
      rating: 4,
      date: '2024-01-10',
      title: 'Great quality, runs slightly large',
      comment: 'The quality is excellent and the material feels premium. I would suggest sizing down if you prefer a more fitted look.',
      verified: true
    },
    {
      id: 3,
      user: 'Emma L.',
      rating: 5,
      date: '2024-01-05',
      title: 'Love this shirt!',
      comment: 'Perfect for everyday wear. The color is exactly as shown and it washes well.',
      verified: false
    }
  ];

  // Mock related products
  const mockRelatedProducts = [
    {
      id: 2,
      name: "Classic Denim Jeans",
      price: 79.99,
      originalPrice: 99.99,
      image: "https://images.unsplash.com/photo-1542272604-787c3835535d?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
      rating: 4.8,
      reviews: 256,
      isNew: false,
      discount: 20
    },
    {
      id: 3,
      name: "Summer Dress Collection",
      price: 59.99,
      originalPrice: 79.99,
      image: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
      rating: 4.6,
      reviews: 189,
      isNew: true,
      discount: 25
    },
    {
      id: 4,
      name: "Casual Sneakers",
      price: 89.99,
      originalPrice: 119.99,
      image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
      rating: 4.7,
      reviews: 342,
      isNew: false,
      discount: 25
    },
    {
      id: 5,
      name: "Premium Hoodie",
      price: 69.99,
      originalPrice: 89.99,
      image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
      rating: 4.4,
      reviews: 156,
      isNew: true,
      discount: 22
    }
  ];

  useEffect(() => {
    loadProduct();
    setRelatedProducts(mockRelatedProducts);
  }, [id]);

  const loadProduct = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/products/${id}`);
      const data = await response.json();
      setProduct(data);
      setSelectedColor(data.colors?.[0] || '');
    } catch (error) {
      // Fallback data
      setProduct({
        id: parseInt(id),
        name: "Premium Cotton T-Shirt",
        price: 29.99,
        originalPrice: 39.99,
        description: "Experience ultimate comfort with our premium cotton t-shirt. Made from 100% organic cotton, this shirt features a modern fit and soft, breathable fabric that keeps you cool and comfortable all day long. Perfect for everyday wear, casual outings, or layering under jackets and sweaters.",
        features: [
          "100% organic cotton",
          "Modern, comfortable fit",
          "Breathable and soft fabric",
          "Machine washable",
          "Available in multiple colors"
        ],
        rating: 4.5,
        reviews: 128,
        category: "mens",
        isNew: true,
        discount: 25,
        colors: ['Black', 'White', 'Navy', 'Gray'],
        sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
        stock: 45,
        sku: "TS-001"
      });
    } finally {
      setLoading(false);
    }
  };

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
    if (!selectedSize) {
      alert('Please select a size');
      return;
    }
    if (!selectedColor) {
      alert('Please select a color');
      return;
    }
    
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
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
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
                src={productImages[selectedImage]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              
              {/* Navigation Arrows */}
              <button
                onClick={() => setSelectedImage((prev) => (prev - 1 + productImages.length) % productImages.length)}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-all duration-200"
              >
                <ChevronLeftIcon className="h-5 w-5" />
              </button>
              <button
                onClick={() => setSelectedImage((prev) => (prev + 1) % productImages.length)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-all duration-200"
              >
                <ChevronRightIcon className="h-5 w-5" />
              </button>
            </div>
            
            {/* Thumbnail Images */}
            <div className="grid grid-cols-4 gap-2">
              {productImages.map((image, index) => (
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
                  {renderStars(product.rating)}
                  <span className="ml-2 text-sm text-gray-600">
                    {product.rating} ({product.reviews} reviews)
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
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Features</h3>
              <ul className="space-y-1">
                {product.features?.map((feature, index) => (
                  <li key={index} className="flex items-center text-gray-600">
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mr-3"></div>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            {/* Color Selection */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Color</h3>
              <div className="flex gap-3">
                {colors.map((color) => (
                  <button
                    key={color.name}
                    onClick={() => setSelectedColor(color.name)}
                    className={`relative p-1 rounded-full border-2 transition-all duration-200 ${
                      selectedColor === color.name ? 'border-blue-600' : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <div
                      className="w-8 h-8 rounded-full border border-gray-200"
                      style={{ backgroundColor: color.hex }}
                    ></div>
                    {selectedColor === color.name && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Size Selection */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-900">Size</h3>
                <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                  Size guide
                </button>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`py-3 px-4 border-2 rounded-lg font-medium transition-all duration-200 ${
                      selectedSize === size
                        ? 'border-blue-600 bg-blue-50 text-blue-600'
                        : 'border-gray-300 text-gray-700 hover:border-gray-400'
                    }`}
                  >
                    {size}
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
                  {product.stock} available
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
                    isInWishlist(product.id)
                      ? 'border-red-300 bg-red-50 text-red-600 hover:bg-red-100'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <HeartIcon className={`h-5 w-5 mr-2 ${isInWishlist(product.id) ? 'fill-current' : ''}`} />
                  {isInWishlist(product.id) ? 'In Wishlist' : 'Add to Wishlist'}
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
                <div>
                  <span className="text-gray-500">SKU:</span>
                  <span className="ml-2 font-medium">{product.sku}</span>
                </div>
                <div>
                  <span className="text-gray-500">Category:</span>
                  <span className="ml-2 font-medium capitalize">{product.category}</span>
                </div>
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
            {reviews.map((review) => (
              <div key={review.id} className="bg-white rounded-lg p-6 shadow-sm">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-gray-900">{review.user}</span>
                      {review.verified && (
                        <span className="inline-block px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
                          Verified Purchase
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {renderStars(review.rating)}
                      <span className="text-sm text-gray-500">{review.date}</span>
                    </div>
                  </div>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">{review.title}</h4>
                <p className="text-gray-600">{review.comment}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Related Products */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">You might also like</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((product) => (
              <div key={product.id} className="group">
                <div className="relative overflow-hidden rounded-lg bg-white shadow-sm hover:shadow-lg transition-all duration-300">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full aspect-square object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3">
                    {product.isNew && (
                      <span className="inline-block px-2 py-1 bg-blue-600 text-white text-xs font-semibold rounded">
                        NEW
                      </span>
                    )}
                  </div>
                </div>
                <div className="mt-4">
                  <h3 className="font-semibold text-gray-900 mb-1">{product.name}</h3>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-gray-900">${product.price}</span>
                    <div className="flex items-center">
                      {renderStars(product.rating)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail; 