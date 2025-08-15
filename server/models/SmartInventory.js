const mongoose = require('mongoose');

const smartInventorySchema = new mongoose.Schema({
  // Product Reference
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  
  // Current Stock Status
  currentStock: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // Smart Thresholds
  thresholds: {
    lowStock: {
      type: Number,
      default: 10,
      min: 0
    },
    criticalStock: {
      type: Number,
      default: 5,
      min: 0
    },
    reorderPoint: {
      type: Number,
      default: 15,
      min: 0
    },
    optimalStock: {
      type: Number,
      default: 100,
      min: 0
    }
  },
  
  // Event-Driven Intelligence
  eventIntelligence: {
    seasonalDemand: {
      spring: { type: Number, default: 1.0 },
      summer: { type: Number, default: 1.0 },
      fall: { type: Number, default: 1.0 },
      winter: { type: Number, default: 1.0 }
    },
    eventMultipliers: [{
      eventId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event'
      },
      multiplier: {
        type: Number,
        default: 1.0
      },
      duration: Number // days
    }],
    campaignImpact: {
      active: {
        type: Boolean,
        default: false
      },
      demandIncrease: {
        type: Number,
        default: 0
      },
      duration: Number
    }
  },
  
  // Demand Forecasting
  demandForecast: {
    dailyAverage: {
      type: Number,
      default: 0
    },
    weeklyTrend: {
      type: Number,
      default: 0
    },
    seasonalAdjustment: {
      type: Number,
      default: 1.0
    },
    eventAdjustment: {
      type: Number,
      default: 1.0
    },
    predictedDemand: {
      type: Number,
      default: 0
    }
  },
  
  // Smart Restocking
  restockStrategy: {
    autoReorder: {
      type: Boolean,
      default: false
    },
    reorderQuantity: {
      type: Number,
      default: 50
    },
    reorderFrequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'on_demand'],
      default: 'on_demand'
    },
    supplierLeadTime: {
      type: Number,
      default: 7 // days
    },
    safetyStock: {
      type: Number,
      default: 10
    }
  },
  
  // Performance Analytics
  performance: {
    stockouts: {
      type: Number,
      default: 0
    },
    overstock: {
      type: Number,
      default: 0
    },
    turnoverRate: {
      type: Number,
      default: 0
    },
    carryingCost: {
      type: Number,
      default: 0
    },
    lostSales: {
      type: Number,
      default: 0
    }
  },
  
  // History & Trends
  stockHistory: [{
    date: {
      type: Date,
      default: Date.now
    },
    quantity: Number,
    action: {
      type: String,
      enum: ['restock', 'sale', 'adjustment', 'return', 'damage']
    },
    reason: String,
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event'
    }
  }],
  
  // Alerts & Notifications
  alerts: [{
    type: {
      type: String,
      enum: ['low_stock', 'critical_stock', 'overstock', 'restock_needed', 'demand_spike']
    },
    message: String,
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium'
    },
    isActive: {
      type: Boolean,
      default: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Status
  status: {
    type: String,
    enum: ['active', 'inactive', 'discontinued'],
    default: 'active'
  }
}, {
  timestamps: true
});

// Indexes
smartInventorySchema.index({ productId: 1 });
smartInventorySchema.index({ 'thresholds.lowStock': 1 });
smartInventorySchema.index({ 'thresholds.criticalStock': 1 });
smartInventorySchema.index({ 'eventIntelligence.campaignImpact.active': 1 });

// Virtual for stock status
smartInventorySchema.virtual('stockStatus').get(function() {
  if (this.currentStock === 0) return 'out_of_stock';
  if (this.currentStock <= this.thresholds.criticalStock) return 'critical';
  if (this.currentStock <= this.thresholds.lowStock) return 'low';
  if (this.currentStock <= this.thresholds.reorderPoint) return 'reorder_needed';
  if (this.currentStock > this.thresholds.optimalStock * 1.5) return 'overstock';
  return 'healthy';
});

// Virtual for urgency score
smartInventorySchema.virtual('urgencyScore').get(function() {
  const stockRatio = this.currentStock / this.thresholds.lowStock;
  const demandRatio = this.demandForecast.predictedDemand / this.currentStock;
  
  if (this.currentStock === 0) return 10; // Highest urgency
  if (stockRatio <= 0.5) return 9; // Critical
  if (stockRatio <= 1.0) return 7; // Low
  if (demandRatio > 2.0) return 6; // High demand
  if (stockRatio > 2.0) return 2; // Overstock
  return 5; // Normal
});

// Pre-save middleware
smartInventorySchema.pre('save', function(next) {
  // Update demand forecast
  this.updateDemandForecast();
  
  // Check for alerts
  this.checkAlerts();
  
  next();
});

// Instance methods
smartInventorySchema.methods.updateDemandForecast = function() {
  // Calculate daily average from stock history
  const recentHistory = this.stockHistory
    .filter(h => h.date >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)) // Last 30 days
    .filter(h => h.action === 'sale');
  
  if (recentHistory.length > 0) {
    const totalSales = recentHistory.reduce((sum, h) => sum + h.quantity, 0);
    this.demandForecast.dailyAverage = totalSales / 30;
  }
  
  // Apply seasonal adjustment
  const currentSeason = this.getCurrentSeason();
  this.demandForecast.seasonalAdjustment = this.eventIntelligence.seasonalDemand[currentSeason] || 1.0;
  
  // Apply event adjustment
  const activeEventMultiplier = this.getActiveEventMultiplier();
  this.demandForecast.eventAdjustment = activeEventMultiplier;
  
  // Calculate predicted demand
  this.demandForecast.predictedDemand = Math.round(
    this.demandForecast.dailyAverage * 
    this.demandForecast.seasonalAdjustment * 
    this.demandForecast.eventAdjustment * 7 // 7 days
  );
};

smartInventorySchema.methods.getCurrentSeason = function() {
  const month = new Date().getMonth();
  if (month >= 2 && month <= 4) return 'spring';
  if (month >= 5 && month <= 7) return 'summer';
  if (month >= 8 && month <= 10) return 'fall';
  return 'winter';
};

smartInventorySchema.methods.getActiveEventMultiplier = function() {
  const activeEvent = this.eventIntelligence.eventMultipliers.find(e => {
    // Check if event is currently active
    return e.duration && (Date.now() - e.date.getTime()) <= e.duration * 24 * 60 * 60 * 1000;
  });
  
  return activeEvent ? activeEvent.multiplier : 1.0;
};

smartInventorySchema.methods.checkAlerts = function() {
  // Clear old alerts
  this.alerts = this.alerts.filter(alert => alert.isActive);
  
  // Check for new alerts
  if (this.currentStock === 0) {
    this.alerts.push({
      type: 'critical_stock',
      message: 'Product is out of stock',
      severity: 'critical'
    });
  } else if (this.currentStock <= this.thresholds.criticalStock) {
    this.alerts.push({
      type: 'critical_stock',
      message: `Stock is critically low (${this.currentStock} remaining)`,
      severity: 'critical'
    });
  } else if (this.currentStock <= this.thresholds.lowStock) {
    this.alerts.push({
      type: 'low_stock',
      message: `Stock is low (${this.currentStock} remaining)`,
      severity: 'high'
    });
  }
  
  // Check if restock is needed
  if (this.currentStock <= this.thresholds.reorderPoint) {
    this.alerts.push({
      type: 'restock_needed',
      message: 'Reorder point reached',
      severity: 'medium'
    });
  }
  
  // Check for overstock
  if (this.currentStock > this.thresholds.optimalStock * 1.5) {
    this.alerts.push({
      type: 'overstock',
      message: 'Product is overstocked',
      severity: 'low'
    });
  }
};

smartInventorySchema.methods.adjustStock = function(quantity, action, reason, eventId = null) {
  const oldStock = this.currentStock;
  
  switch (action) {
    case 'restock':
      this.currentStock += quantity;
      break;
    case 'sale':
      this.currentStock = Math.max(0, this.currentStock - quantity);
      break;
    case 'adjustment':
      this.currentStock = Math.max(0, this.currentStock + quantity);
      break;
    case 'return':
      this.currentStock += quantity;
      break;
    case 'damage':
      this.currentStock = Math.max(0, this.currentStock - quantity);
      break;
  }
  
  // Record in history
  this.stockHistory.push({
    date: new Date(),
    quantity: Math.abs(quantity),
    action,
    reason,
    eventId
  });
  
  // Update performance metrics
  if (action === 'sale' && oldStock === 0) {
    this.performance.stockouts++;
  }
  
  if (action === 'sale' && this.currentStock < this.thresholds.lowStock) {
    this.performance.lostSales += quantity;
  }
  
  // Update demand forecast
  this.updateDemandForecast();
  
  // Check for new alerts
  this.checkAlerts();
  
  return this.save();
};

smartInventorySchema.methods.calculateReorderQuantity = function() {
  const predictedDemand = this.demandForecast.predictedDemand;
  const safetyStock = this.restockStrategy.safetyStock;
  const currentStock = this.currentStock;
  
  return Math.max(
    this.restockStrategy.reorderQuantity,
    predictedDemand + safetyStock - currentStock
  );
};

smartInventorySchema.methods.shouldReorder = function() {
  if (!this.restockStrategy.autoReorder) return false;
  
  const daysUntilStockout = this.currentStock / this.demandForecast.dailyAverage;
  const leadTime = this.restockStrategy.supplierLeadTime;
  
  return daysUntilStockout <= leadTime + 2; // 2 days buffer
};

// Static methods
smartInventorySchema.statics.getLowStockProducts = function() {
  return this.find({
    $or: [
      { currentStock: 0 },
      { $expr: { $lte: ['$currentStock', '$thresholds.lowStock'] } }
    ]
  }).populate('productId', 'name price category');
};

smartInventorySchema.statics.getCriticalStockProducts = function() {
  return this.find({
    $expr: { $lte: ['$currentStock', '$thresholds.criticalStock'] }
  }).populate('productId', 'name price category');
};

smartInventorySchema.statics.getProductsNeedingRestock = function() {
  return this.find({
    $expr: { $lte: ['$currentStock', '$thresholds.reorderPoint'] }
  }).populate('productId', 'name price category');
};

smartInventorySchema.statics.getEventImpactedProducts = function(eventId) {
  return this.find({
    'eventIntelligence.eventMultipliers.eventId': eventId
  }).populate('productId', 'name price category');
};

module.exports = mongoose.model('SmartInventory', smartInventorySchema);
