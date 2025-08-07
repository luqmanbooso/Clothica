const mongoose = require('mongoose');
const Product = require('../models/Product');
require('dotenv').config();

const createSampleProducts = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/clothica', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Check if products already exist
    const existingProducts = await Product.countDocuments();
    if (existingProducts > 0) {
      console.log(`✅ ${existingProducts} products already exist in the database`);
      process.exit(0);
    }

    const sampleProducts = [
      {
        name: "Classic White T-Shirt",
        description: "Premium cotton classic white t-shirt with a comfortable fit. Perfect for everyday wear.",
        price: 29.99,
        originalPrice: 39.99,
        category: "men",
        subcategory: "t-shirts",
        brand: "Clothica",
        images: [
          "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500",
          "https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=500"
        ],
        colors: [
          { name: "White", hex: "#FFFFFF", available: true },
          { name: "Black", hex: "#000000", available: true },
          { name: "Gray", hex: "#808080", available: true }
        ],
        sizes: [
          { name: "S", available: true, stock: 50 },
          { name: "M", available: true, stock: 75 },
          { name: "L", available: true, stock: 60 },
          { name: "XL", available: true, stock: 40 }
        ],
        tags: ["casual", "cotton", "basic", "comfortable"],
        rating: 4.5,
        numReviews: 12,
        isFeatured: true,
        discount: 25,
        material: "100% Cotton",
        care: "Machine wash cold, tumble dry low"
      },
      {
        name: "Slim Fit Jeans",
        description: "Modern slim fit jeans with stretch denim for maximum comfort and style.",
        price: 79.99,
        originalPrice: 99.99,
        category: "men",
        subcategory: "jeans",
        brand: "Clothica",
        images: [
          "https://images.unsplash.com/photo-1542272604-787c3835535d?w=500",
          "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=500"
        ],
        colors: [
          { name: "Blue", hex: "#000080", available: true },
          { name: "Black", hex: "#000000", available: true },
          { name: "Gray", hex: "#808080", available: true }
        ],
        sizes: [
          { name: "30", available: true, stock: 30 },
          { name: "32", available: true, stock: 45 },
          { name: "34", available: true, stock: 40 },
          { name: "36", available: true, stock: 35 }
        ],
        tags: ["denim", "slim-fit", "stretch", "casual"],
        rating: 4.3,
        numReviews: 8,
        isFeatured: true,
        discount: 20,
        material: "98% Cotton, 2% Elastane",
        care: "Machine wash cold, do not bleach"
      },
      {
        name: "Summer Dress",
        description: "Elegant summer dress perfect for warm weather and special occasions.",
        price: 89.99,
        originalPrice: 119.99,
        category: "women",
        subcategory: "dresses",
        brand: "Clothica",
        images: [
          "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=500",
          "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=500"
        ],
        colors: [
          { name: "Floral", hex: "#FFB6C1", available: true },
          { name: "Blue", hex: "#4169E1", available: true },
          { name: "White", hex: "#FFFFFF", available: true }
        ],
        sizes: [
          { name: "XS", available: true, stock: 25 },
          { name: "S", available: true, stock: 40 },
          { name: "M", available: true, stock: 50 },
          { name: "L", available: true, stock: 35 }
        ],
        tags: ["summer", "dress", "elegant", "floral"],
        rating: 4.7,
        numReviews: 15,
        isFeatured: true,
        discount: 25,
        material: "Polyester Blend",
        care: "Hand wash cold, lay flat to dry"
      },
      {
        name: "Casual Sneakers",
        description: "Comfortable and stylish sneakers for everyday wear and casual outings.",
        price: 69.99,
        originalPrice: 89.99,
        category: "shoes",
        subcategory: "sneakers",
        brand: "Clothica",
        images: [
          "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500",
          "https://images.unsplash.com/photo-1552346154-21d32810aba3?w=500"
        ],
        colors: [
          { name: "White", hex: "#FFFFFF", available: true },
          { name: "Black", hex: "#000000", available: true },
          { name: "Gray", hex: "#808080", available: true }
        ],
        sizes: [
          { name: "7", available: true, stock: 20 },
          { name: "8", available: true, stock: 30 },
          { name: "9", available: true, stock: 35 },
          { name: "10", available: true, stock: 25 },
          { name: "11", available: true, stock: 15 }
        ],
        tags: ["sneakers", "casual", "comfortable", "stylish"],
        rating: 4.4,
        numReviews: 22,
        isFeatured: true,
        discount: 22,
        material: "Canvas and Rubber",
        care: "Wipe with damp cloth, air dry"
      },
      {
        name: "Leather Handbag",
        description: "Premium leather handbag with multiple compartments for organized storage.",
        price: 129.99,
        originalPrice: 159.99,
        category: "bags",
        subcategory: "handbags",
        brand: "Clothica",
        images: [
          "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500",
          "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=500"
        ],
        colors: [
          { name: "Brown", hex: "#8B4513", available: true },
          { name: "Black", hex: "#000000", available: true },
          { name: "Tan", hex: "#D2B48C", available: true }
        ],
        sizes: [
          { name: "One Size", available: true, stock: 40 }
        ],
        tags: ["leather", "handbag", "premium", "organized"],
        rating: 4.6,
        numReviews: 18,
        isFeatured: true,
        discount: 19,
        material: "Genuine Leather",
        care: "Clean with leather conditioner, avoid water"
      }
    ];

    // Insert sample products
    await Product.insertMany(sampleProducts);

    console.log('✅ Sample products created successfully!');
    console.log(`📦 Created ${sampleProducts.length} products`);
    console.log('🛍️ You can now browse products in the store');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating sample products:', error);
    process.exit(1);
  }
};

createSampleProducts(); 