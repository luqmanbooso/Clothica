// Utility function to get the proper image URL
export const getImageUrl = (imageData) => {
  if (!imageData) return null;
  
  // Handle different image data formats
  let imageUrl;
  if (typeof imageData === 'string') {
    imageUrl = imageData;
  } else if (imageData.url) {
    imageUrl = imageData.url;
  } else {
    return null;
  }
  
  // If the URL is already absolute, return as is
  if (imageUrl.startsWith('http')) {
    return imageUrl;
  }
  
  // Construct full URL with server base
  const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  return `${baseURL}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
};

// Get the first available image URL from a product's images array
export const getProductImageUrl = (product) => {
  if (!product || !product.images || product.images.length === 0) {
    return null;
  }
  
  return getImageUrl(product.images[0]);
};

// Get all image URLs from a product's images array
export const getProductImageUrls = (product) => {
  if (!product || !product.images || product.images.length === 0) {
    return [];
  }
  
  return product.images.map(img => getImageUrl(img)).filter(Boolean);
};

// Create a placeholder image data URL
export const getPlaceholderImageUrl = () => {
  return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2YzZjRmNiIvPjx0ZXh0IHg9IjE1MCIgeT0iMTUwIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IiM2YjcyODAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiPlByb2R1Y3QgSW1hZ2U8L3RleHQ+PHRleHQgeD0iMTUwIiB5PSIxNzAiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxMiIgZmlsbD0iIzljYTNhZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSI+Tm8gSW1hZ2UgQXZhaWxhYmxlPC90ZXh0Pjwvc3ZnPg==';
};
