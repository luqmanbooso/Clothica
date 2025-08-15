const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  // Basic Information
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  shortDescription: {
    type: String,
    trim: true
  },
  
  // SKU & Identification
  sku: {
    type: String,
    unique: true,
    required: true,
    trim: true
  },
  barcode: {
    type: String,
    unique: true,
    sparse: true
  },
  qrCode: String,
  
  // Pricing
  price: {
    type: Number,
    required: true,
    min: 0
  },
  originalPrice: {
    type: Number,
    min: 0
  },
  costPrice: {
    type: Number,
    min: 0
  },
  wholesalePrice: {
    type: Number,
    min: 0
  },
  
  // Categorization
  category: {
    type: String,
    required: true,
    enum: ['men', 'women', 'kids', 'accessories', 'shoes', 'bags']
  },
  subcategory: {
    type: String,
    required: true
  },
  brand: {
    type: String,
    required: true,
    trim: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  
  // Variants & Attributes
  variants: [{
    sku: {
      type: String,
      required: true,
      unique: true
    },
    color: {
      name: String,
      hex: String,
      available: Boolean
    },
    size: {
      name: String,
      available: Boolean
    },
    stock: {
      type: Number,
      default: 0,
      min: 0
    },
    price: Number, // Override base price if different
    images: [String],
    weight: Number,
    dimensions: {
      length: Number,
      width: Number,
      height: Number
    }
  }],
  
  // Inventory Management
  inventory: {
    totalStock: {
      type: Number,
      default: 0,
      min: 0
    },
    lowStockThreshold: {
      type: Number,
      default: 10,
      min: 0
    },
    criticalStockThreshold: {
      type: Number,
      default: 5,
      min: 0
    },
    reorderPoint: {
      type: Number,
      default: 20,
      min: 0
    },
    reorderQuantity: {
      type: Number,
      default: 50,
      min: 0
    },
    maxStock: {
      type: Number,
      min: 0
    },
    allowBackorder: {
      type: Boolean,
      default: false
    },
    allowPreorder: {
      type: Boolean,
      default: false
    }
  },
  
  // Warehouse & Location Management
  locations: [{
    warehouse: {
      type: String,
      required: true
    },
    location: String, // Aisle, shelf, bin
    stock: {
      type: Number,
      default: 0,
      min: 0
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Supplier Information
  supplier: {
    name: String,
    contact: String,
    email: String,
    phone: String,
    leadTime: Number, // Days
    minimumOrder: Number,
    cost: Number
  },
  
  // Purchase Orders
  purchaseOrders: [{
    poNumber: String,
    supplier: String,
    quantity: Number,
    cost: Number,
    expectedDelivery: Date,
    status: {
      type: String,
      enum: ['pending', 'ordered', 'partial', 'received', 'cancelled'],
      default: 'pending'
    },
    receivedQuantity: {
      type: Number,
      default: 0
    },
    receivedDate: Date,
    notes: String
  }],
  
  // Stock History & Adjustments
  stockHistory: [{
    date: {
      type: Date,
      default: Date.now
    },
    type: {
      type: String,
      enum: ['sale', 'return', 'adjustment', 'purchase', 'transfer', 'damage'],
      required: true
    },
    quantity: {
      type: Number,
      required: true
    },
    previousStock: Number,
    newStock: Number,
    reason: String,
    reference: String, // Order ID, PO ID, etc.
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    notes: String
  }],
  
  // Media & Images
  images: [{
    url: String,
    alt: String,
    isPrimary: {
      type: Boolean,
      default: false
    },
    order: Number
  }],
  
  // SEO & Marketing
  seo: {
    metaTitle: String,
    metaDescription: String,
    keywords: [String],
    urlSlug: String
  },
  
  // Product Status
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  isNew: {
    type: Boolean,
    default: false
  },
  isOnSale: {
    type: Boolean,
    default: false
  },
  
  // Discounts & Promotions
  discount: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  discountStartDate: Date,
  discountEndDate: Date,
  
  // Product Specifications
  specifications: {
    material: String,
    care: String,
    weight: Number,
    dimensions: {
      length: Number,
      width: Number,
      height: Number
    },
    countryOfOrigin: String,
    warranty: String
  },
  
  // Analytics & Performance
  analytics: {
    views: {
      type: Number,
      default: 0
    },
    clicks: {
      type: Number,
      default: 0
    },
    conversions: {
      type: Number,
      default: 0
    },
    revenue: {
      type: Number,
      default: 0
    },
    lastViewed: Date,
    popularTimes: [{
      hour: Number,
      views: Number
    }]
  },
  
  // Reviews & Ratings
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  numReviews: {
    type: Number,
    default: 0
  },
  reviews: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      required: true
    },
    date: {
      type: Date,
      default: Date.now
    },
    helpful: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      helpful: Boolean
    }]
  }]
}, {
  timestamps: true
});

// Indexes for performance
productSchema.index({ sku: 1 });
productSchema.index({ barcode: 1 });
productSchema.index({ category: 1, subcategory: 1 });
productSchema.index({ brand: 1 });
productSchema.index({ tags: 1 });
productSchema.index({ 'inventory.totalStock': 1 });
productSchema.index({ isActive: 1, isFeatured: 1 });
productSchema.index({ price: 1 });
productSchema.index({ rating: 1 });

// Virtual for stock status
productSchema.virtual('stockStatus').get(function() {
  if (this.inventory.totalStock === 0) return 'out-of-stock';
  if (this.inventory.totalStock <= this.inventory.criticalStockThreshold) return 'critical';
  if (this.inventory.totalStock <= this.inventory.lowStockThreshold) return 'low';
  return 'in-stock';
});

// Virtual for discount percentage
productSchema.virtual('discountPercentage').get(function() {
  if (!this.originalPrice || this.originalPrice <= this.price) return 0;
  return Math.round(((this.originalPrice - this.price) / this.originalPrice) * 100);
});

// Pre-save middleware to generate SKU if not provided
productSchema.pre('save', async function(next) {
  if (!this.sku) {
    this.sku = await this.generateSKU();
  }
  next();
});

// Static method to generate unique SKU
productSchema.statics.generateSKU = async function() {
  const prefix = 'CL';
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.random().toString(36).substr(2, 4).toUpperCase();
  const sku = `${prefix}${timestamp}${random}`;
  
  // Check if SKU exists
  const exists = await this.findOne({ sku });
  if (exists) {
    return this.generateSKU(); // Recursive call if duplicate
  }
  
  return sku;
};

// Method to update stock
productSchema.methods.updateStock = function(quantity, type, reason, reference, userId) {
  const previousStock = this.inventory.totalStock;
  this.inventory.totalStock += quantity;
  
  // Ensure stock doesn't go below 0 unless backorder is allowed
  if (this.inventory.totalStock < 0 && !this.inventory.allowBackorder) {
    this.inventory.totalStock = 0;
  }
  
  // Add to stock history
  this.stockHistory.push({
    type,
    quantity,
    previousStock,
    newStock: this.inventory.totalStock,
    reason,
    reference,
    performedBy: userId,
    date: new Date()
  });
  
  return this.save();
};

// Method to check if stock is low
productSchema.methods.isLowStock = function() {
  return this.inventory.totalStock <= this.inventory.lowStockThreshold;
};

// Method to check if stock is critical
productSchema.methods.isCriticalStock = function() {
  return this.inventory.totalStock <= this.inventory.criticalStockThreshold;
};

// Method to check if reorder is needed
productSchema.methods.needsReorder = function() {
  return this.inventory.totalStock <= this.inventory.reorderPoint;
};

// Static method to get low stock products
productSchema.statics.getLowStockProducts = function() {
  return this.find({
    $or: [
      { 'inventory.totalStock': { $lte: '$inventory.lowStockThreshold' } },
      { 'inventory.totalStock': { $lte: '$inventory.criticalStockThreshold' } }
    ]
  });
};

// Static method to get out of stock products
productSchema.statics.getOutOfStockProducts = function() {
  return this.find({ 'inventory.totalStock': 0 });
};

// Static method to get products needing reorder
productSchema.statics.getProductsNeedingReorder = function() {
  return this.find({
    $expr: {
      $lte: ['$inventory.totalStock', '$inventory.reorderPoint']
    }
  });
};

module.exports = mongoose.model('Product', productSchema); 