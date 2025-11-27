const express = require('express');
const { body, validationResult } = require('express-validator');
const Order = require('../models/Order');
const Product = require('../models/Product');
const LoyaltyMember = require('../models/LoyaltyMember');
const { auth } = require('../middleware/auth');
const { admin } = require('../middleware/admin');
const User = require('../models/User'); // Added for user details
const Coupon = require('../models/Coupon'); // Added for coupon details
const { sendOrderConfirmationEmail } = require('../utils/email'); // Added for email sending
const notificationService = require('../services/notificationService'); // Added for notifications

const router = express.Router();

// Test route to verify orders endpoint is working
router.get('/test', (req, res) => {
  res.json({ 
    message: 'Orders endpoint is working',
    timestamp: new Date().toISOString(),
    pdfInvoicesEnabled: process.env.ENABLE_PDF_INVOICES === 'true'
  });
});

// Test email route removed - invoices are now available in user account


// Create new order
router.post('/', auth, async (req, res) => {
  try {
    console.log('🛒 Order creation request received:', {
      userId: req.user.id,
      itemsCount: req.body.items?.length || 0,
      total: req.body.total,
      paymentMethod: req.body.paymentMethod
    });

    const { items, shippingAddress, paymentMethod, couponCode } = req.body;

    // Validate required fields
    if (!items || !Array.isArray(items) || items.length === 0) {
      console.log('❌ Order validation failed: No items provided');
      return res.status(400).json({ message: 'Order items are required' });
    }

    if (!shippingAddress) {
      console.log('❌ Order validation failed: No shipping address provided');
      return res.status(400).json({ message: 'Shipping address is required' });
    }

    if (!paymentMethod) {
      console.log('❌ Order validation failed: No payment method provided');
      return res.status(400).json({ message: 'Payment method is required' });
    }

    // Get user
    const user = await User.findById(req.user.id);
    if (!user) {
      console.log('❌ User not found:', req.user.id);
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('✅ User found:', { id: user._id, email: user.email });

    // Calculate order total
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      console.log('📦 Processing order item:', {
        itemId: item._id,
        productId: item.productId,
        quantity: item.quantity,
        selectedSize: item.selectedSize,
        selectedColor: item.selectedColor
      });

      // Handle cart item structure - extract actual product ID
      let productId;
      if (item.productId) {
        // Check if productId is actually a cart item ID (contains underscores)
        if (item.productId.includes('_')) {
          // Cart item ID format: "productId_size_color" - extract just the product ID
          productId = item.productId.split('_')[0];
        } else {
          // Direct product ID
          productId = item.productId;
        }
      } else if (item._id && item._id.includes('_')) {
        // Cart item ID format: "productId_size_color" - extract just the product ID
        productId = item._id.split('_')[0];
      } else if (item.id) {
        // Fallback to id field
        productId = item.id;
      } else {
        console.log('❌ Invalid item structure:', item);
        return res.status(400).json({ message: 'Invalid item structure - missing product ID' });
      }

      console.log('🔍 Looking up product with ID:', productId);

      const product = await Product.findById(productId);
      if (!product) {
        console.log('❌ Product not found:', productId);
        return res.status(400).json({ message: `Product ${productId} not found` });
      }

      console.log('✅ Product found:', { id: product._id, name: product.name, price: product.price });

      // Check available stock using the new stock management methods
      const availableStock = product.getAvailableStock();
      if (availableStock < item.quantity) {
        console.log('❌ Insufficient stock:', { availableStock, requested: item.quantity });
        return res.status(400).json({ 
          message: `Insufficient stock for ${product.name}. Available: ${availableStock}, Requested: ${item.quantity}` 
        });
      }

      const itemTotal = product.price * item.quantity;
      subtotal += itemTotal;

      orderItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        selectedColor: item.selectedColor,
        selectedSize: item.selectedSize,
        image: product.images?.[0] || product.image,
        total: itemTotal
      });

      // Reserve stock for this order
      try {
        product.reserveStock(item.quantity);
        await product.save();
        console.log('✅ Stock reserved for product:', product.name);
      } catch (stockError) {
        console.log('❌ Stock reservation failed:', stockError.message);
        return res.status(400).json({ 
          message: `Stock reservation failed for ${product.name}: ${stockError.message}` 
        });
      }
    }

    console.log('✅ All items processed successfully. Subtotal:', subtotal);

    // Apply coupon if provided
    let discount = 0;
    let coupon = null;
    if (couponCode) {
      coupon = await Coupon.findOne({ code: couponCode, isActive: true });
      if (coupon && new Date() >= coupon.validFrom && new Date() <= coupon.validUntil) {
        if (coupon.type === 'percentage') {
          discount = (subtotal * coupon.discount) / 100;
        } else if (coupon.type === 'fixed') {
          discount = coupon.discount;
        }
        discount = Math.min(discount, coupon.maxDiscount || discount);
      }
    }

    // Use shipping cost from frontend or calculate default
    const shippingCost = req.body.shippingCost || (subtotal >= 10000 ? 0 : 500); // Free shipping above LKR 10,000
    const total = req.body.total || (subtotal + shippingCost - discount);

    // Calculate estimated delivery (3-5 business days for standard shipping)
    const estimatedDelivery = new Date();
    estimatedDelivery.setDate(estimatedDelivery.getDate() + 5); // 5 business days
    
    // Create order
    const order = new Order({
      user: user._id,
      items: orderItems,
      subtotal,
      discount,
      shippingCost,
      total,
      shippingAddress,
      paymentMethod,
      coupon: coupon?._id,
      status: paymentMethod === 'cash_on_delivery' ? 'pending' : 'processing',
      estimatedDelivery
    });

    await order.save();

    // Create notification for order creation
    try {
      await notificationService.createOrderNotification(user._id, {
        orderId: order._id,
        status: order.status,
        amount: order.total
      });
    } catch (notificationError) {
      console.error('Error creating order notification:', notificationError);
      // Don't fail the order if notification fails
    }

    // Confirm stock deduction for all items
    for (const item of orderItems) {
      const product = await Product.findById(item.product);
      if (product) {
        try {
          product.confirmStockDeduction(item.quantity);
          await product.save();
        } catch (stockError) {
          console.error(`Stock confirmation failed for product ${product.name}:`, stockError);
          // Don't fail the order if stock confirmation fails
        }
      }
    }

    // Clear user's cart
    user.cart = [];
    await user.save();

    // ========================================
    // LOYALTY SYSTEM INTEGRATION (Simplified)
    // ========================================
    
    try {
      // Initialize user stats if they don't exist
      if (!user.stats) {
        user.stats = {
          totalOrders: 0,
          totalSpent: 0,
          purchaseStreak: 0,
          lastPurchaseDate: null
        };
      }
      
      // Update user stats
      user.stats.totalOrders += 1;
      user.stats.totalSpent += total;
      user.stats.lastPurchaseDate = new Date();
      
      // Simple loyalty points calculation (1 point per LKR 100 spent)
      const pointsEarned = Math.floor(total / 100);
      
      // Update order with basic loyalty information
      order.loyaltyPoints = {
        earned: pointsEarned,
        multiplier: 1,
        applied: 0
      };
      
      // Check if user is eligible for spin token (every 1000 points)
      order.spinTokenEligible = pointsEarned >= 10;
      
      await user.save();
      
      console.log(`Loyalty system: Awarded ${pointsEarned} points to user ${user._id}`);
      
    } catch (loyaltyError) {
      console.error('Error in loyalty system integration:', loyaltyError);
      // Don't fail the order if loyalty system fails
    }



    // Send confirmation email with PDF invoice
    try {
      console.log('📧 Sending order confirmation email with PDF invoice to:', user.email);
      const emailService = require('../services/emailService');
      await emailService.sendOrderConfirmationWithInvoice(user.email, order);
      console.log('✅ Order confirmation email with PDF invoice sent successfully');
    } catch (emailError) {
      console.error('❌ Error sending order confirmation email with invoice:', emailError);
      // Fallback to regular email without invoice
      try {
        console.log('📧 Attempting fallback email without invoice');
        const emailService = require('../services/emailService');
        await emailService.sendOrderConfirmationEmail(user.email, order);
        console.log('✅ Fallback order confirmation email sent successfully');
      } catch (fallbackError) {
        console.error('❌ Error sending fallback order confirmation email:', fallbackError);
      }
      // Don't fail the order if email fails
    }

    console.log('✅ Order created successfully:', {
      orderId: order._id,
      total: order.total,
      status: order.status,
      itemsCount: orderItems.length
    });

    res.status(201).json({
      message: 'Order created successfully',
      order: {
        id: order._id,
        total: order.total,
        status: order.status,
        estimatedDelivery: order.estimatedDelivery
      }
    });

  } catch (error) {
    console.error('❌ Error creating order:', error);
    console.error('❌ Error stack:', error.stack);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user orders
router.get('/my-orders', auth, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('items.product', 'name images price')
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single order
router.get('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email')
      .populate('items.product', 'name images price brand');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if user owns this order or is admin
    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update order status (admin only)
router.put('/:id/status', [auth, admin], [
  body('status').isIn(['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded']).withMessage('Invalid status')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { status, trackingNumber } = req.body;
    const updateFields = { status };

    if (status === 'shipped' && trackingNumber) {
      updateFields.trackingNumber = trackingNumber;
    }

    if (status === 'delivered') {
      updateFields.isDelivered = true;
      updateFields.deliveredAt = new Date();
      
      // Award loyalty points for cash on delivery orders when delivered
      if (order.paymentMethod === 'cash_on_delivery') {
        try {
          const user = await User.findById(order.user);
          if (user) {
            await user.earnPoints(Math.floor(order.total), 'purchase');
            console.log(`Awarded ${Math.floor(order.total)} loyalty points to user ${user._id} for delivered COD order`);
          }
        } catch (loyaltyError) {
          console.error('Error awarding loyalty points for delivered COD order:', loyaltyError);
          // Don't fail the status update if loyalty points fail
        }
      }
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      updateFields,
      { new: true }
    ).populate('user', 'name email');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all orders (admin only)
router.get('/', [auth, admin], async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const query = {};

    if (status) query.status = status;

    const orders = await Order.find(query)
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Order.countDocuments(query);

    res.json({
      orders,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Cancel order
router.put('/:id/cancel', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if user owns this order
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Only allow cancellation if order is pending or processing
    if (!['pending', 'processing'].includes(order.status)) {
      return res.status(400).json({ message: 'Order cannot be cancelled at this stage' });
    }

    order.status = 'cancelled';
    await order.save();

    // Restore product stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { 'sizes.$[elem].stock': item.quantity }
      }, {
        arrayFilters: [{ 'elem.name': item.size }]
      });
    }

    res.json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Generate invoice for order
router.get('/:id/invoice', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email')
      .populate('items.product', 'name images');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if user owns this order or is admin
    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Generate HTML invoice
    const invoiceHTML = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Invoice - Order ${order._id}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; color: #333; }
          .header { text-align: center; border-bottom: 2px solid #6C7A59; padding-bottom: 20px; margin-bottom: 30px; }
          .company-name { font-size: 24px; font-weight: bold; color: #6C7A59; margin-bottom: 10px; }
          .invoice-details { display: flex; justify-content: space-between; margin-bottom: 30px; }
          .customer-info, .order-info { flex: 1; }
          .section-title { font-weight: bold; margin-bottom: 10px; color: #6C7A59; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
          th { background-color: #f8f9fa; font-weight: bold; }
          .total-row { font-weight: bold; font-size: 18px; }
          .footer { margin-top: 40px; text-align: center; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="company-name">Clothica Lanka</div>
          <div>Your Premium Fashion Destination</div>
          <div>Colombo, Sri Lanka</div>
        </div>
        
        <div class="invoice-details">
          <div class="customer-info">
            <div class="section-title">Bill To:</div>
            <div>${order.shippingAddress.firstName} ${order.shippingAddress.lastName}</div>
            <div>${order.shippingAddress.address}</div>
            <div>${order.shippingAddress.city}, ${order.shippingAddress.province}</div>
            <div>${order.shippingAddress.postalCode}, Sri Lanka</div>
            <div>Email: ${order.shippingAddress.email}</div>
            <div>Phone: ${order.shippingAddress.phone}</div>
          </div>
          
          <div class="order-info">
            <div class="section-title">Order Information:</div>
            <div><strong>Order ID:</strong> ${order._id}</div>
            <div><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</div>
            <div><strong>Payment Method:</strong> ${order.paymentMethod === 'credit_card' ? 'Credit/Debit Card' : 'Cash on Delivery'}</div>
            <div><strong>Status:</strong> ${order.status}</div>
          </div>
        </div>
        
        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th>Color</th>
              <th>Size</th>
              <th>Quantity</th>
              <th>Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${order.items.map(item => `
              <tr>
                <td>${item.name}</td>
                <td>${item.selectedColor || 'Default'}</td>
                <td>${item.selectedSize || 'Default'}</td>
                <td>${item.quantity}</td>
                <td>Rs. ${((item.price || 0) || 0).toLocaleString()}</td>
                <td>Rs. ${(((item.price || 0) || 0) * ((item.quantity || 1) || 1)).toLocaleString()}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div style="text-align: right; margin-top: 20px;">
          <div><strong>Subtotal:</strong> Rs. ${((order.subtotal || 0) || 0).toLocaleString()}</div>
          ${((order.discount || 0) || 0) > 0 ? `<div><strong>Discount:</strong> -Rs. ${((order.discount || 0) || 0).toLocaleString()}</div>` : ''}
          <div><strong>Shipping:</strong> ${((order.shippingCost || 0) || 0) === 0 ? 'Free' : `Rs. ${((order.shippingCost || 0) || 0).toLocaleString()}`}</div>
          <div class="total-row"><strong>Total:</strong> Rs. ${((order.total || 0) || 0).toLocaleString()}</div>
        </div>
        
        <div class="footer">
          <p>Thank you for shopping with Clothica Lanka!</p>
          <p>For support, contact us at support@clothicalanka.com or call +94 11 234 5678</p>
          <p>This is a computer-generated invoice. No signature required.</p>
        </div>
      </body>
      </html>
    `;

    // Set response headers for HTML
    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Content-Disposition', `inline; filename="invoice-${order._id}.html"`);
    res.send(invoiceHTML);

  } catch (error) {
    console.error('Invoice generation error:', error);
    res.status(500).json({ message: 'Failed to generate invoice' });
  }
});

// Get product sales analytics (admin only)
router.get('/analytics/product-sales', auth, admin, async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    // Aggregate sales data by product
    const salesData = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          status: { $nin: ['cancelled'] } // Exclude cancelled orders
        }
      },
      {
        $unwind: '$items'
      },
      {
        $group: {
          _id: '$items.product',
          totalQuantity: { $sum: '$items.quantity' },
          totalRevenue: { $sum: '$items.total' },
          orderCount: { $sum: 1 },
          averagePrice: { $avg: '$items.price' }
        }
      }
    ]);

    // Convert to object format for easier frontend consumption
    const salesMap = {};
    salesData.forEach(item => {
      salesMap[item._id] = {
        quantity: item.totalQuantity,
        total: item.totalRevenue,
        orders: item.orderCount,
        avgPrice: item.averagePrice
      };
    });

    res.json(salesMap);
  } catch (error) {
    console.error('Error fetching product sales analytics:', error);
    res.status(500).json({ message: 'Failed to fetch sales analytics' });
  }
});

// Get inventory overview analytics (admin only)
router.get('/analytics/inventory-overview', auth, admin, async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    // Get total orders and revenue
    const orderStats = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          status: { $nin: ['cancelled'] }
        }
      },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: '$total' },
          totalItems: { $sum: { $size: '$items' } }
        }
      }
    ]);

    // Get top selling products
    const topProducts = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          status: { $nin: ['cancelled'] }
        }
      },
      {
        $unwind: '$items'
      },
      {
        $group: {
          _id: '$items.product',
          totalQuantity: { $sum: '$items.quantity' },
          totalRevenue: { $sum: '$items.total' },
          productName: { $first: '$items.name' }
        }
      },
      {
        $sort: { totalQuantity: -1 }
      },
      {
        $limit: 10
      }
    ]);

    // Get products count from Product collection
    const totalProducts = await Product.countDocuments({ isActive: true });
    const lowStockProducts = await Product.countDocuments({
      isActive: true,
      $expr: { $lte: ['$inventory.totalStock', '$inventory.lowStockThreshold'] }
    });
    const outOfStockProducts = await Product.countDocuments({
      isActive: true,
      'inventory.totalStock': 0
    });

    const overview = {
      period: `${days} days`,
      orders: orderStats[0] || { totalOrders: 0, totalRevenue: 0, totalItems: 0 },
      inventory: {
        totalProducts,
        lowStockProducts,
        outOfStockProducts
      },
      topProducts
    };

    res.json(overview);
  } catch (error) {
    console.error('Error fetching inventory overview:', error);
    res.status(500).json({ message: 'Failed to fetch inventory overview' });
  }
});

// Enhanced Order Management Endpoints

// Check inventory for order items before shipping
router.post('/:id/check-inventory', [auth, admin], async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('items.product', 'name inventory stock');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const inventoryIssues = [];
    const inventoryChecks = [];

    for (const item of order.items) {
      const product = await Product.findById(item.product._id || item.product);
      if (!product) {
        inventoryIssues.push({
          itemId: item._id,
          productId: item.product._id || item.product,
          name: item.name,
          issue: 'Product not found',
          requested: item.quantity,
          available: 0
        });
        continue;
      }

      // Get available stock
      const availableStock = product.getAvailableStock ? product.getAvailableStock() : (product.stock || 0);
      
      inventoryChecks.push({
        itemId: item._id,
        productId: product._id,
        name: product.name,
        requested: item.quantity,
        available: availableStock,
        sufficient: availableStock >= item.quantity
      });

      if (availableStock < item.quantity) {
        inventoryIssues.push({
          itemId: item._id,
          productId: product._id,
          name: product.name,
          issue: 'Insufficient stock',
          requested: item.quantity,
          available: availableStock
        });
      }
    }

    res.json({
      orderId: order._id,
      canShip: inventoryIssues.length === 0,
      inventoryChecks,
      issues: inventoryIssues
    });

  } catch (error) {
    console.error('Error checking inventory:', error);
    res.status(500).json({ message: 'Failed to check inventory' });
  }
});

// Ship Complete - Enhanced with inventory validation
router.post('/:id/ship-complete', [auth, admin], async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('items.product', 'name inventory stock')
      .populate('user', 'name email');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Only allow shipping for processing orders
    if (order.status !== 'processing') {
      return res.status(400).json({ 
        message: `Cannot ship order with status: ${order.status}. Order must be in 'processing' status.` 
      });
    }

    // Check inventory for all items
    const inventoryIssues = [];
    for (const item of order.items) {
      const product = await Product.findById(item.product._id || item.product);
      if (!product) {
        inventoryIssues.push({
          itemId: item._id,
          productId: item.product._id || item.product,
          name: item.name,
          issue: 'Product not found',
          requested: item.quantity,
          available: 0
        });
        continue;
      }

      const availableStock = product.getAvailableStock ? product.getAvailableStock() : (product.stock || 0);
      if (availableStock < item.quantity) {
        inventoryIssues.push({
          itemId: item._id,
          productId: product._id,
          name: product.name,
          issue: 'Insufficient stock',
          requested: item.quantity,
          available: availableStock
        });
      }
    }

    // If there are inventory issues, return them
    if (inventoryIssues.length > 0) {
      return res.status(400).json({
        message: 'Cannot ship due to inventory issues',
        canShip: false,
        issues: inventoryIssues
      });
    }

    // Deduct stock from inventory
    for (const item of order.items) {
      const product = await Product.findById(item.product._id || item.product);
      if (product) {
        try {
          if (product.confirmStockDeduction) {
            product.confirmStockDeduction(item.quantity);
          } else {
            // Fallback stock deduction
            product.stock = Math.max(0, (product.stock || 0) - item.quantity);
          }
          await product.save();
        } catch (stockError) {
          console.error(`Stock deduction failed for ${product.name}:`, stockError);
          // Continue with other items even if one fails
        }
      }
    }

    // Update order status to shipped then completed
    order.status = 'shipped';
    order.shippedAt = new Date();
    
    // Auto-complete after shipping (as per PRD)
    setTimeout(async () => {
      try {
        order.status = 'completed';
        order.completedAt = new Date();
        await order.save();
        
        // Award loyalty points when order is completed
        if (order.user) {
          try {
            await awardLoyaltyPoints(order.user._id || order.user, order.total, order._id);
          } catch (loyaltyError) {
            console.error('Error awarding loyalty points:', loyaltyError);
            // Don't fail the order completion if loyalty fails
          }
        }
      } catch (error) {
        console.error('Error auto-completing order:', error);
      }
    }, 1000); // Small delay to ensure shipped status is saved first

    await order.save();

    // Create audit log
    const auditLog = {
      orderId: order._id,
      action: 'ship_complete',
      adminId: req.user._id,
      timestamp: new Date(),
      details: {
        previousStatus: 'processing',
        newStatus: 'shipped',
        itemsShipped: order.items.length
      }
    };

    console.log('Order shipped successfully:', auditLog);

    res.json({
      message: 'Order shipped successfully',
      order: {
        id: order._id,
        status: order.status,
        shippedAt: order.shippedAt
      },
      auditLog
    });

  } catch (error) {
    console.error('Error shipping order:', error);
    res.status(500).json({ message: 'Failed to ship order' });
  }
});

// Process Refund - Full or Partial
router.post('/:id/refund', [auth, admin], [
  body('type').isIn(['full', 'partial']).withMessage('Refund type must be full or partial'),
  body('reason').notEmpty().withMessage('Refund reason is required'),
  body('amount').optional().isNumeric().withMessage('Refund amount must be numeric'),
  body('items').optional().isArray().withMessage('Items must be an array for partial refunds')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { type, reason, amount, items: refundItems } = req.body;
    const order = await Order.findById(req.params.id)
      .populate('items.product', 'name inventory stock')
      .populate('user', 'name email');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if order can be refunded
    const refundableStatuses = ['processing', 'shipped', 'completed'];
    if (!refundableStatuses.includes(order.status)) {
      return res.status(400).json({ 
        message: `Cannot refund order with status: ${order.status}` 
      });
    }

    let refundAmount = 0;
    let refundedItems = [];

    if (type === 'full') {
      refundAmount = order.total;
      refundedItems = order.items.map(item => ({
        itemId: item._id,
        productId: item.product._id || item.product,
        name: item.name,
        quantity: item.quantity,
        refundAmount: item.total
      }));

      // Restore inventory for unshipped items
      if (order.status !== 'shipped' && order.status !== 'completed') {
        for (const item of order.items) {
          const product = await Product.findById(item.product._id || item.product);
          if (product) {
            try {
              if (product.restoreStock) {
                product.restoreStock(item.quantity);
              } else {
                product.stock = (product.stock || 0) + item.quantity;
              }
              await product.save();
            } catch (stockError) {
              console.error(`Stock restoration failed for ${product.name}:`, stockError);
            }
          }
        }
      }

      order.status = 'refunded';
    } else if (type === 'partial') {
      if (!refundItems || refundItems.length === 0) {
        return res.status(400).json({ message: 'Items are required for partial refund' });
      }

      for (const refundItem of refundItems) {
        const orderItem = order.items.find(item => 
          item._id.toString() === refundItem.itemId
        );
        
        if (!orderItem) {
          return res.status(400).json({ 
            message: `Item ${refundItem.itemId} not found in order` 
          });
        }

        const itemRefundAmount = (orderItem.price * refundItem.quantity);
        refundAmount += itemRefundAmount;
        
        refundedItems.push({
          itemId: orderItem._id,
          productId: orderItem.product._id || orderItem.product,
          name: orderItem.name,
          quantity: refundItem.quantity,
          refundAmount: itemRefundAmount
        });

        // Restore inventory for unshipped items
        if (order.status !== 'shipped' && order.status !== 'completed') {
          const product = await Product.findById(orderItem.product._id || orderItem.product);
          if (product) {
            try {
              if (product.restoreStock) {
                product.restoreStock(refundItem.quantity);
              } else {
                product.stock = (product.stock || 0) + refundItem.quantity;
              }
              await product.save();
            } catch (stockError) {
              console.error(`Stock restoration failed for ${product.name}:`, stockError);
            }
          }
        }
      }

      // Update order status
      const totalRefunded = (order.refundAmount || 0) + refundAmount;
      if (totalRefunded >= order.total) {
        order.status = 'refunded';
      } else {
        order.status = 'partially_refunded';
      }
    }

    // Update order with refund information
    order.refundAmount = (order.refundAmount || 0) + refundAmount;
    order.refundReason = reason;
    order.refundedAt = new Date();
    order.refundedBy = req.user._id;
    
    if (!order.refunds) {
      order.refunds = [];
    }
    
    order.refunds.push({
      type,
      amount: refundAmount,
      reason,
      items: refundedItems,
      processedAt: new Date(),
      processedBy: req.user._id,
      transactionId: `REF-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    });

    await order.save();

    // Create audit log
    const auditLog = {
      orderId: order._id,
      action: 'refund_processed',
      adminId: req.user._id,
      timestamp: new Date(),
      details: {
        type,
        amount: refundAmount,
        reason,
        itemsRefunded: refundedItems.length,
        newStatus: order.status
      }
    };

    console.log('Refund processed successfully:', auditLog);

    res.json({
      message: `${type.charAt(0).toUpperCase() + type.slice(1)} refund processed successfully`,
      refund: {
        transactionId: order.refunds[order.refunds.length - 1].transactionId,
        amount: refundAmount,
        type,
        status: 'processed'
      },
      order: {
        id: order._id,
        status: order.status,
        totalRefunded: order.refundAmount
      },
      auditLog
    });

  } catch (error) {
    console.error('Error processing refund:', error);
    res.status(500).json({ message: 'Failed to process refund' });
  }
});

// Get inventory status for products
router.get('/inventory/check', [auth, admin], async (req, res) => {
  try {
    const { skus, productIds } = req.query;
    let query = { isActive: true };
    
    if (skus) {
      const skuArray = Array.isArray(skus) ? skus : skus.split(',');
      query.sku = { $in: skuArray };
    }
    
    if (productIds) {
      const idArray = Array.isArray(productIds) ? productIds : productIds.split(',');
      query._id = { $in: idArray };
    }

    const products = await Product.find(query).select('name sku stock inventory lowStockThreshold');
    
    const inventoryStatus = products.map(product => {
      const availableStock = product.getAvailableStock ? product.getAvailableStock() : (product.stock || 0);
      const lowStockThreshold = product.lowStockThreshold || product.inventory?.lowStockThreshold || 5;
      
      return {
        productId: product._id,
        name: product.name,
        sku: product.sku,
        availableStock,
        lowStockThreshold,
        isLowStock: availableStock <= lowStockThreshold,
        isOutOfStock: availableStock === 0
      };
    });

    res.json({
      products: inventoryStatus,
      summary: {
        total: inventoryStatus.length,
        lowStock: inventoryStatus.filter(p => p.isLowStock).length,
        outOfStock: inventoryStatus.filter(p => p.isOutOfStock).length
      }
    });

  } catch (error) {
    console.error('Error checking inventory status:', error);
    res.status(500).json({ message: 'Failed to check inventory status' });
  }
});

// Helper function to award loyalty points
async function awardLoyaltyPoints(userId, orderTotal, orderId) {
  try {
    // Find or create loyalty member
    let loyaltyMember = await LoyaltyMember.findOne({ userId });
    if (!loyaltyMember) {
      loyaltyMember = new LoyaltyMember({
        userId,
        points: 0,
        tier: 'Bronze',
        totalSpent: 0
      });
    }

    // Calculate points (1 point per $1 spent)
    const benefits = loyaltyMember.getTierBenefits();
    const basePoints = Math.floor(orderTotal);
    const pointsToAdd = Math.floor(basePoints * benefits.pointsMultiplier);

    // Add points and update total spent
    const tierUpdated = loyaltyMember.addPoints(
      pointsToAdd, 
      'earned', 
      `Order #${orderId}`, 
      orderId
    );
    
    loyaltyMember.totalSpent += orderTotal;
    
    // Check for tier update again after spending update
    const finalTierUpdate = loyaltyMember.updateTier();
    
    await loyaltyMember.save();

    console.log(`Awarded ${pointsToAdd} loyalty points to user ${userId} for order ${orderId}`);
    
    return {
      pointsEarned: pointsToAdd,
      totalPoints: loyaltyMember.points,
      tier: loyaltyMember.tier,
      tierUpdated: tierUpdated || finalTierUpdate,
      totalSpent: loyaltyMember.totalSpent
    };
  } catch (error) {
    console.error('Error awarding loyalty points:', error);
    throw error;
  }
}

module.exports = router; 