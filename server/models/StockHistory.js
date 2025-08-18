const mongoose = require('mongoose');

const stockHistorySchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  type: {
    type: String,
    enum: ['restock', 'adjustment', 'sale', 'return', 'damage', 'transfer', 'correction'],
    required: true
  },
  reason: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  previousStock: {
    type: Number,
    required: true
  },
  newStock: {
    type: Number,
    required: true
  },
  reference: {
    type: String, // Order ID, transfer ID, etc.
    default: null
  },
  notes: {
    type: String,
    default: ''
  },
  performedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  warehouse: {
    type: String,
    default: 'main'
  },
  cost: {
    type: Number,
    default: 0
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for better query performance
stockHistorySchema.index({ product: 1, timestamp: -1 });
stockHistorySchema.index({ type: 1, timestamp: -1 });
stockHistorySchema.index({ performedBy: 1, timestamp: -1 });

// Static method to get stock history for a product
stockHistorySchema.statics.getProductHistory = async function(productId, limit = 50) {
  return this.find({ product: productId })
    .sort({ timestamp: -1 })
    .limit(limit)
    .populate('performedBy', 'name email')
    .lean();
};

// Static method to get stock history by type
stockHistorySchema.statics.getHistoryByType = async function(type, limit = 100) {
  return this.find({ type })
    .sort({ timestamp: -1 })
    .limit(limit)
    .populate('product', 'name sku')
    .populate('performedBy', 'name email')
    .lean();
};

// Static method to get low stock alerts
stockHistorySchema.statics.getLowStockAlerts = async function() {
  return this.aggregate([
    {
      $lookup: {
        from: 'products',
        localField: 'product',
        foreignField: '_id',
        as: 'productInfo'
      }
    },
    {
      $unwind: '$productInfo'
    },
    {
      $match: {
        'productInfo.inventory.totalStock': {
          $lte: '$productInfo.inventory.lowStockThreshold'
        }
      }
    },
    {
      $group: {
        _id: '$product',
        productName: { $first: '$productInfo.name' },
        currentStock: { $first: '$productInfo.inventory.totalStock' },
        threshold: { $first: '$productInfo.inventory.lowStockThreshold' },
        lastMovement: { $first: '$timestamp' }
      }
    }
  ]);
};

const StockHistory = mongoose.model('StockHistory', stockHistorySchema);

module.exports = StockHistory;




