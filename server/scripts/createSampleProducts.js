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
        name: "Ayubowan Cotton T-Shirt",
        description: "Premium cotton t-shirt with traditional Sri Lankan batik-inspired design. Perfect for everyday wear with a touch of local culture.",
        shortDescription: "Traditional batik-inspired cotton t-shirt",
        sku: "AYU-TSH-001",
        price: 2500,
        category: "men",
        subcategory: "t-shirts",
        brand: "Clothica Lanka",
        images: [
          {
            url: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500",
            alt: "Ayubowan Cotton T-Shirt Front View",
            isPrimary: true,
            order: 1
          },
          {
            url: "https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=500",
            alt: "Ayubowan Cotton T-Shirt Back View",
            isPrimary: false,
            order: 2
          }
        ],
        colors: [
          { name: "White", hex: "#FFFFFF", available: true },
          { name: "Navy Blue", hex: "#000080", available: true },
          { name: "Cream", hex: "#F5F5DC", available: true }
        ],
        sizes: [
          { name: "S", available: true, stock: 50 },
          { name: "M", available: true, stock: 75 },
          { name: "L", available: true, stock: 60 },
          { name: "XL", available: true, stock: 40 }
        ],
        tags: ["casual", "cotton", "batik", "sri-lanka", "comfortable"],
        rating: 4.5,
        numReviews: 12,
        isFeatured: true,
        material: "100% Sri Lankan Cotton",
        care: "Machine wash cold, tumble dry low"
      },
      {
        name: "Colombo Denim Jeans",
        description: "Premium denim jeans with modern slim fit, perfect for the urban Sri Lankan lifestyle. Comfortable stretch fabric for all-day wear.",
        sku: "COL-JEA-001",
        price: 8500,
        category: "men",
        subcategory: "jeans",
        brand: "Clothica Lanka",
        images: [
          {
            url: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=500",
            alt: "Colombo Denim Jeans Front View",
            isPrimary: true,
            order: 1
          },
          {
            url: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=500",
            alt: "Colombo Denim Jeans Back View",
            isPrimary: false,
            order: 2
          }
        ],
        colors: [
          { name: "Indigo Blue", hex: "#1E3A8A", available: true },
          { name: "Dark Denim", hex: "#1F2937", available: true },
          { name: "Light Blue", hex: "#3B82F6", available: true }
        ],
        sizes: [
          { name: "30", available: true, stock: 30 },
          { name: "32", available: true, stock: 45 },
          { name: "34", available: true, stock: 40 },
          { name: "36", available: true, stock: 35 }
        ],
        tags: ["denim", "slim-fit", "stretch", "urban", "colombo-style"],
        rating: 4.3,
        numReviews: 8,
        isFeatured: true,
        material: "98% Cotton, 2% Elastane",
        care: "Machine wash cold, do not bleach"
      },
      {
        name: "Kandy Floral Dress",
        description: "Elegant summer dress inspired by the beautiful gardens of Kandy. Perfect for warm weather and special occasions with traditional floral patterns.",
        sku: "KAN-DRE-001",
        price: 6500,
        category: "women",
        subcategory: "dresses",
        brand: "Clothica Lanka",
        images: [
          {
            url: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=500",
            alt: "Kandy Floral Dress Front View",
            isPrimary: true,
            order: 1
          },
          {
            url: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=500",
            alt: "Kandy Floral Dress Back View",
            isPrimary: false,
            order: 2
          }
        ],
        colors: [
          { name: "Tropical Floral", hex: "#FFB6C1", available: true },
          { name: "Ocean Blue", hex: "#4169E1", available: true },
          { name: "Pearl White", hex: "#FFFFFF", available: true }
        ],
        sizes: [
          { name: "XS", available: true, stock: 25 },
          { name: "S", available: true, stock: 40 },
          { name: "M", available: true, stock: 50 },
          { name: "L", available: true, stock: 35 }
        ],
        tags: ["summer", "dress", "elegant", "floral", "kandy-inspired"],
        rating: 4.7,
        numReviews: 15,
        isFeatured: true,
        material: "Premium Polyester Blend",
        care: "Hand wash cold, lay flat to dry"
      },
      {
        name: "Galle Fort Sneakers",
        description: "Comfortable and stylish sneakers inspired by the historic Galle Fort. Perfect for exploring Sri Lanka's beautiful coastal areas.",
        sku: "GAL-SNE-001",
        price: 4500,
        category: "shoes",
        subcategory: "sneakers",
        brand: "Clothica Lanka",
        images: [
          {
            url: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500",
            alt: "Galle Fort Sneakers Front View",
            isPrimary: true,
            order: 1
          },
          {
            url: "https://images.unsplash.com/photo-1552346154-21d32810aba3?w=500",
            alt: "Galle Fort Sneakers Side View",
            isPrimary: false,
            order: 2
          }
        ],
        colors: [
          { name: "Coconut White", hex: "#FFFFFF", available: true },
          { name: "Fort Black", hex: "#000000", available: true },
          { name: "Sand Gray", hex: "#808080", available: true }
        ],
        sizes: [
          { name: "7", available: true, stock: 20 },
          { name: "8", available: true, stock: 30 },
          { name: "9", available: true, stock: 35 },
          { name: "10", available: true, stock: 25 },
          { name: "11", available: true, stock: 15 }
        ],
        tags: ["sneakers", "casual", "comfortable", "galle-fort", "coastal-style"],
        rating: 4.4,
        numReviews: 22,
        isFeatured: true,
        material: "Premium Canvas and Rubber",
        care: "Wipe with damp cloth, air dry"
      },
      {
        name: "Sigiriya Leather Handbag",
        description: "Premium leather handbag inspired by the majestic Sigiriya rock fortress. Multiple compartments for organized storage with traditional craftsmanship.",
        sku: "SIG-HAN-001",
        price: 12000,
        category: "bags",
        subcategory: "handbags",
        brand: "Clothica Lanka",
        images: [
          {
            url: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500",
            alt: "Sigiriya Leather Handbag Front View",
            isPrimary: true,
            order: 1
          },
          {
            url: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=500",
            alt: "Sigiriya Leather Handbag Interior View",
            isPrimary: false,
            order: 2
          }
        ],
        colors: [
          { name: "Mahogany Brown", hex: "#8B4513", available: true },
          { name: "Midnight Black", hex: "#000000", available: true },
          { name: "Desert Tan", hex: "#D2B48C", available: true }
        ],
        sizes: [
          { name: "One Size", available: true, stock: 40 }
        ],
        tags: ["leather", "handbag", "premium", "sigiriya-inspired", "traditional-craft"],
        rating: 4.6,
        numReviews: 18,
        isFeatured: true,
        material: "Genuine Sri Lankan Leather",
        care: "Clean with leather conditioner, avoid water"
      },
      {
        name: "Tea Garden Sarong",
        description: "Authentic Sri Lankan sarong made from the finest cotton, perfect for beach days and casual wear. Features traditional tea garden patterns.",
        sku: "TEA-SAR-001",
        price: 1800,
        category: "men",
        subcategory: "sarongs",
        brand: "Clothica Lanka",
        images: [
          {
            url: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=500",
            alt: "Tea Garden Sarong Pattern View",
            isPrimary: true,
            order: 1
          },
          {
            url: "https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=500",
            alt: "Tea Garden Sarong Worn View",
            isPrimary: false,
            order: 2
          }
        ],
        colors: [
          { name: "Tea Green", hex: "#228B22", available: true },
          { name: "Sunset Orange", hex: "#FF8C00", available: true },
          { name: "Ocean Blue", hex: "#4169E1", available: true }
        ],
        sizes: [
          { name: "One Size", available: true, stock: 100 }
        ],
        tags: ["sarong", "traditional", "cotton", "tea-garden", "beach-wear"],
        rating: 4.8,
        numReviews: 25,
        isFeatured: true,
        material: "100% Pure Cotton",
        care: "Hand wash cold, air dry"
      },
      {
        name: "Jaffna Spice Kurta",
        description: "Elegant kurta inspired by the rich cultural heritage of Jaffna. Features traditional embroidery and comfortable fit for all occasions.",
        sku: "JAF-KUR-001",
        price: 4200,
        category: "men",
        subcategory: "kurtas",
        brand: "Clothica Lanka",
        images: [
          {
            url: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=500",
            alt: "Jaffna Spice Kurta Front View",
            isPrimary: true,
            order: 1
          },
          {
            url: "https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=500",
            alt: "Jaffna Spice Kurta Back View",
            isPrimary: false,
            order: 2
          }
        ],
        colors: [
          { name: "Spice Red", hex: "#DC143C", available: true },
          { name: "Royal Blue", hex: "#000080", available: true },
          { name: "Emerald Green", hex: "#228B22", available: true }
        ],
        sizes: [
          { name: "S", available: true, stock: 30 },
          { name: "M", available: true, stock: 45 },
          { name: "L", available: true, stock: 40 },
          { name: "XL", available: true, stock: 35 }
        ],
        tags: ["kurta", "traditional", "jaffna-inspired", "embroidery", "cultural"],
        rating: 4.6,
        numReviews: 18,
        isFeatured: true,
        material: "Premium Cotton Blend",
        care: "Hand wash cold, iron on low heat"
      }
    ];

    // Insert sample products
    await Product.insertMany(sampleProducts);

    console.log('✅ Sample products created successfully!');
    console.log(`📦 Created ${sampleProducts.length} products`);
    console.log('🛍️ You can now browse products in the store');
    console.log('🇱🇰 All products feature Sri Lanka themed names and realistic LKR pricing');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating sample products:', error);
    process.exit(1);
  }
};

createSampleProducts(); 