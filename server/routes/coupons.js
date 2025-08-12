const express = require('express');
const { body, validationResult } = require('express-validator');
const Coupon = require('../models/Coupon');
const router = express.Router();

// @route   POST /api/coupons/validate
// @desc    Validate a coupon code
// @access  Public
router.post('/validate', [
  body('code').trim().notEmpty().withMessage('Coupon code is required'),
  body('subtotal').isFloat({ min: 0 }).withMessage('Valid subtotal is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { code, subtotal } = req.body;

    // Find coupon by code
    const coupon = await Coupon.findOne({ code: code.toUpperCase() });
    
    if (!coupon) {
      return res.json({ 
        valid: false, 
        message: 'Invalid coupon code' 
      });
    }

    // Check if coupon is active
    if (!coupon.isActive) {
      return res.json({ 
        valid: false, 
        message: 'This coupon is no longer active' 
      });
    }

    // Check if coupon has expired
    if (coupon.endDate < new Date()) {
      return res.json({ 
        valid: false, 
        message: 'This coupon has expired' 
      });
    }

    // Check if coupon has started
    if (coupon.startDate > new Date()) {
      return res.json({ 
        valid: false, 
        message: 'This coupon is not yet active' 
      });
    }

    // Check minimum order amount
    if (coupon.minOrderAmount && subtotal < coupon.minOrderAmount) {
      return res.json({ 
        valid: false, 
        message: `Minimum order amount of Rs. ${coupon.minOrderAmount} required` 
      });
    }

    // Check maximum discount amount
    let discountAmount = 0;
    if (coupon.type === 'percentage') {
      discountAmount = (subtotal * coupon.value) / 100;
      if (coupon.maxDiscountAmount) {
        discountAmount = Math.min(discountAmount, coupon.maxDiscountAmount);
      }
    } else if (coupon.type === 'fixed') {
      discountAmount = Math.min(coupon.value, subtotal);
    }

    // Return valid coupon with discount details
    res.json({
      valid: true,
      coupon: {
        id: coupon._id,
        code: coupon.code,
        name: coupon.name,
        type: coupon.type,
        value: coupon.value,
        description: coupon.description,
        minOrderAmount: coupon.minOrderAmount,
        maxDiscountAmount: coupon.maxDiscountAmount
      },
      discountAmount,
      message: `Coupon applied! ${coupon.type === 'percentage' ? `${coupon.value}% off` : `Rs. ${coupon.value} off`}`
    });

  } catch (error) {
    console.error('Coupon validation error:', error);
    res.status(500).json({ message: 'Server error during coupon validation' });
  }
});

// @route   GET /api/coupons/available
// @desc    Get all available coupons
// @access  Public
router.get('/available', async (req, res) => {
  try {
    const currentDate = new Date();
    
    const coupons = await Coupon.find({
      isActive: true,
      startDate: { $lte: currentDate },
      endDate: { $gte: currentDate }
    }).select('code name description type value minOrderAmount');

    res.json(coupons);
  } catch (error) {
    console.error('Get available coupons error:', error);
    res.status(500).json({ message: 'Server error while fetching coupons' });
  }
});

module.exports = router;

