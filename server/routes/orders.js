const express = require('express');
const { body, validationResult } = require('express-validator');
const Order = require('../models/Order');
const Product = require('../models/Product');
const { auth, admin } = require('../middleware/auth');
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

    // Calculate shipping cost
    const shippingCost = subtotal >= 5000 ? 0 : 500; // Free shipping above LKR 5000
    const total = subtotal + shippingCost - discount;

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

module.exports = router; 