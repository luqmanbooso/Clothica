const express = require('express');
const { body, validationResult } = require('express-validator');
const Order = require('../models/Order');
const Product = require('../models/Product');
const { auth } = require('../middleware/auth');
const { admin } = require('../middleware/admin');
const User = require('../models/User'); // Added for user details
const Coupon = require('../models/Coupon'); // Added for coupon details
const { sendOrderConfirmationEmail } = require('../utils/email'); // Added for email sending

const router = express.Router();

// Create new order
router.post('/', auth, async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod, couponCode } = req.body;

    // Validate required fields
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Order items are required' });
    }

    if (!shippingAddress) {
      return res.status(400).json({ message: 'Shipping address is required' });
    }

    if (!paymentMethod) {
      return res.status(400).json({ message: 'Payment method is required' });
    }

    // Get user
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Calculate order total
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(400).json({ message: `Product ${item.productId} not found` });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({ message: `Insufficient stock for ${product.name}` });
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

      // Update product stock
      product.stock -= item.quantity;
      await product.save();
    }

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
    const shippingCost = req.body.shippingCost || (subtotal >= 5000 ? 0 : 500); // Free shipping above LKR 5000
    const total = req.body.total || (subtotal + shippingCost - discount);

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
      status: paymentMethod === 'cash_on_delivery' ? 'pending' : 'processing'
    });

    await order.save();

    // Clear user's cart
    user.cart = [];
    await user.save();

    // Award loyalty points for the purchase (only for paid orders, not cash on delivery)
    if (paymentMethod !== 'cash_on_delivery') {
      try {
        await user.earnPoints(Math.floor(total), 'purchase');
        console.log(`Awarded ${Math.floor(total)} loyalty points to user ${user._id}`);
      } catch (loyaltyError) {
        console.error('Error awarding loyalty points:', loyaltyError);
        // Don't fail the order if loyalty points fail
      }
    } else {
      console.log(`Cash on delivery order - loyalty points will be awarded upon delivery`);
    }

    // Send confirmation email
    try {
      await sendOrderConfirmationEmail(user.email, order);
    } catch (emailError) {
      console.error('Error sending order confirmation email:', emailError);
      // Don't fail the order if email fails
    }

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
    console.error('Error creating order:', error);
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

module.exports = router; 