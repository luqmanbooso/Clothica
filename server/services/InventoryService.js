const Product = require('../models/Product');
const StockHistory = require('../models/StockHistory');
const SmartInventory = require('../models/SmartInventory');

class InventoryService {
  // Get inventory dashboard statistics
  static async getDashboardStats() {
    try {
      const stats = await Product.aggregate([
        {
          $group: {
            _id: null,
            totalProducts: { $sum: 1 },
            totalStock: { $sum: '$inventory.totalStock' },
            totalValue: {
              $sum: {
                $multiply: ['$inventory.totalStock', '$price']
              }
            },
            outOfStock: {
              $sum: {
                $cond: [{ $eq: ['$inventory.totalStock', 0] }, 1, 0]
              }
            },
            lowStock: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      { $gt: ['$inventory.totalStock', 0] },
                      { $lte: ['$inventory.totalStock', '$inventory.lowStockThreshold'] }
                    ]
                  },
                  1,
                  0
                ]
              }
            },
            criticalStock: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      { $gt: ['$inventory.totalStock', 0] },
                      { $lte: ['$inventory.totalStock', '$inventory.criticalStockThreshold'] }
                    ]
                  },
                  1,
                  0
                ]
              }
            }
          }
        }
      ]);

      const categoryStats = await Product.aggregate([
        {
          $group: {
            _id: '$category',
            count: { $sum: 1 },
            totalStock: { $sum: '$inventory.totalStock' },
            totalValue: {
              $sum: {
                $multiply: ['$inventory.totalStock', '$price']
              }
            }
          }
        },
        { $sort: { totalValue: -1 } }
      ]);

      return {
        overview: stats[0] || {
          totalProducts: 0,
          totalStock: 0,
          totalValue: 0,
          outOfStock: 0,
          lowStock: 0,
          criticalStock: 0
        },
        categoryBreakdown: categoryStats
      };
    } catch (error) {
      throw new Error(`Error getting dashboard stats: ${error.message}`);
    }
  }

  // Get low stock alerts
  static async getLowStockAlerts(limit = 50) {
    try {
      const alerts = await Product.find({
        $or: [
          { 'inventory.totalStock': 0 },
          {
            $and: [
              { 'inventory.totalStock': { $gt: 0 } },
              { $expr: { $lte: ['$inventory.totalStock', '$inventory.lowStockThreshold'] } }
            ]
          }
        ]
      })
      .select('name sku category inventory images')
      .sort({ 'inventory.totalStock': 1 })
      .limit(limit);

      return alerts.map(product => ({
        ...product.toObject(),
        alertType: product.inventory.totalStock === 0 ? 'out-of-stock' : 
                  product.inventory.totalStock <= product.inventory.criticalStockThreshold ? 'critical' : 'low',
        daysUntilOutOfStock: this.estimateDaysUntilOutOfStock(product)
      }));
    } catch (error) {
      throw new Error(`Error getting low stock alerts: ${error.message}`);
    }
  }

  // Estimate days until out of stock based on sales velocity
  static estimateDaysUntilOutOfStock(product) {
    // This is a simplified calculation
    // In a real system, you'd use actual sales data
    const averageDailySales = 1; // Placeholder
    const currentStock = product.inventory.totalStock;
    
    if (averageDailySales === 0) return Infinity;
    return Math.floor(currentStock / averageDailySales);
  }

  // Bulk stock adjustment
  static async bulkStockAdjustment(adjustments, performedBy, reason) {
    try {
      const results = [];
      const errors = [];

      for (const adjustment of adjustments) {
        try {
          const { productId, action, quantity, notes } = adjustment;
          
          const product = await Product.findById(productId);
          if (!product) {
            errors.push({ productId, error: 'Product not found' });
            continue;
          }

          const oldStock = product.inventory?.totalStock || 0;
          let newStock = oldStock;

          switch (action) {
            case 'increase':
              newStock = oldStock + Math.abs(quantity);
              break;
            case 'decrease':
              newStock = Math.max(0, oldStock - Math.abs(quantity));
              break;
            case 'set':
              newStock = Math.abs(quantity);
              break;
          }

          // Create stock history entry
          const stockHistoryEntry = {
            date: new Date(),
            type: action,
            quantity: action === 'decrease' ? -Math.abs(quantity) : Math.abs(quantity),
            previousStock: oldStock,
            newStock: newStock,
            reason: reason,
            notes: notes || 'Bulk adjustment',
            performedBy: performedBy
          };

          // Update product
          await Product.findByIdAndUpdate(
            productId,
            {
              $set: {
                'inventory.totalStock': newStock,
                'inventory.availableStock': newStock - (product.inventory?.reservedStock || 0)
              },
              $push: {
                stockHistory: stockHistoryEntry
              }
            }
          );

          results.push({
            productId,
            name: product.name,
            sku: product.sku,
            previousStock: oldStock,
            newStock: newStock,
            change: newStock - oldStock
          });

        } catch (error) {
          errors.push({ 
            productId: adjustment.productId, 
            error: error.message 
          });
        }
      }

      return { results, errors };
    } catch (error) {
      throw new Error(`Error in bulk stock adjustment: ${error.message}`);
    }
  }

  // Reserve stock for orders
  static async reserveStock(productId, quantity, orderId) {
    try {
      const product = await Product.findById(productId);
      if (!product) {
        throw new Error('Product not found');
      }

      const availableStock = product.inventory?.availableStock || 0;
      if (availableStock < quantity) {
        throw new Error('Insufficient stock available');
      }

      // Update reserved stock
      await Product.findByIdAndUpdate(
        productId,
        {
          $inc: {
            'inventory.reservedStock': quantity,
            'inventory.availableStock': -quantity
          },
          $push: {
            stockHistory: {
              date: new Date(),
              type: 'reserve',
              quantity: -quantity,
              previousStock: product.inventory.totalStock,
              newStock: product.inventory.totalStock,
              reason: 'Stock reserved for order',
              reference: orderId,
              notes: `Reserved ${quantity} units for order ${orderId}`
            }
          }
        }
      );

      return {
        success: true,
        reservedQuantity: quantity,
        availableStock: availableStock - quantity
      };

    } catch (error) {
      throw new Error(`Error reserving stock: ${error.message}`);
    }
  }

  // Release reserved stock (when order is cancelled)
  static async releaseReservedStock(productId, quantity, orderId) {
    try {
      const product = await Product.findById(productId);
      if (!product) {
        throw new Error('Product not found');
      }

      await Product.findByIdAndUpdate(
        productId,
        {
          $inc: {
            'inventory.reservedStock': -quantity,
            'inventory.availableStock': quantity
          },
          $push: {
            stockHistory: {
              date: new Date(),
              type: 'release',
              quantity: quantity,
              previousStock: product.inventory.totalStock,
              newStock: product.inventory.totalStock,
              reason: 'Stock released from cancelled order',
              reference: orderId,
              notes: `Released ${quantity} units from order ${orderId}`
            }
          }
        }
      );

      return {
        success: true,
        releasedQuantity: quantity
      };

    } catch (error) {
      throw new Error(`Error releasing reserved stock: ${error.message}`);
    }
  }

  // Fulfill order (convert reserved stock to sold)
  static async fulfillOrder(productId, quantity, orderId) {
    try {
      const product = await Product.findById(productId);
      if (!product) {
        throw new Error('Product not found');
      }

      await Product.findByIdAndUpdate(
        productId,
        {
          $inc: {
            'inventory.totalStock': -quantity,
            'inventory.reservedStock': -quantity
          },
          $push: {
            stockHistory: {
              date: new Date(),
              type: 'sale',
              quantity: -quantity,
              previousStock: product.inventory.totalStock,
              newStock: product.inventory.totalStock - quantity,
              reason: 'Product sold',
              reference: orderId,
              notes: `Sold ${quantity} units in order ${orderId}`
            }
          }
        }
      );

      return {
        success: true,
        soldQuantity: quantity,
        remainingStock: product.inventory.totalStock - quantity
      };

    } catch (error) {
      throw new Error(`Error fulfilling order: ${error.message}`);
    }
  }

  // Generate reorder suggestions
  static async getReorderSuggestions() {
    try {
      const suggestions = await Product.find({
        $expr: {
          $lte: ['$inventory.totalStock', '$inventory.reorderPoint']
        }
      })
      .select('name sku category inventory price')
      .sort({ 'inventory.totalStock': 1 });

      return suggestions.map(product => ({
        ...product.toObject(),
        suggestedOrderQuantity: product.inventory.reorderQuantity || 50,
        urgency: product.inventory.totalStock <= product.inventory.criticalStockThreshold ? 'high' : 'medium',
        estimatedCost: (product.inventory.reorderQuantity || 50) * product.price
      }));

    } catch (error) {
      throw new Error(`Error getting reorder suggestions: ${error.message}`);
    }
  }

  // Get inventory valuation
  static async getInventoryValuation(category = null) {
    try {
      const matchQuery = {};
      if (category && category !== 'all') {
        matchQuery.category = category;
      }

      const valuation = await Product.aggregate([
        { $match: matchQuery },
        {
          $project: {
            name: 1,
            sku: 1,
            category: 1,
            price: 1,
            totalStock: '$inventory.totalStock',
            totalValue: {
              $multiply: ['$inventory.totalStock', '$price']
            }
          }
        },
        {
          $group: {
            _id: '$category',
            totalProducts: { $sum: 1 },
            totalStock: { $sum: '$totalStock' },
            totalValue: { $sum: '$totalValue' },
            averagePrice: { $avg: '$price' },
            products: {
              $push: {
                name: '$name',
                sku: '$sku',
                stock: '$totalStock',
                value: '$totalValue'
              }
            }
          }
        },
        { $sort: { totalValue: -1 } }
      ]);

      const overallTotal = await Product.aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id: null,
            totalValue: {
              $sum: {
                $multiply: ['$inventory.totalStock', '$price']
              }
            },
            totalStock: { $sum: '$inventory.totalStock' }
          }
        }
      ]);

      return {
        categories: valuation,
        overall: overallTotal[0] || { totalValue: 0, totalStock: 0 }
      };

    } catch (error) {
      throw new Error(`Error getting inventory valuation: ${error.message}`);
    }
  }
}

module.exports = InventoryService;
