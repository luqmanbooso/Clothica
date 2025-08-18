const express = require('express');
const router = express.Router();
const reviewService = require('../services/reviewService');
const { auth, admin } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

// Validation middleware
const validateReview = [
  body('productRating').isInt({ min: 1, max: 5 }).withMessage('Product rating must be between 1-5'),
  body('deliveryRating').isInt({ min: 1, max: 5 }).withMessage('Delivery rating must be between 1-5'),
  body('customerServiceRating').isInt({ min: 1, max: 5 }).withMessage('Customer service rating must be between 1-5'),
  body('productReview').optional().isLength({ max: 1000 }).withMessage('Product review too long'),
  body('deliveryReview').optional().isLength({ max: 500 }).withMessage('Delivery review too long'),
  body('customerServiceReview').optional().isLength({ max: 500 }).withMessage('Customer service review too long')
];

// Create a new review (POST /api/reviews)
router.post('/', auth, validateReview, async (req, res) => {
  try {
    console.log('Review submission data:', req.body);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { orderId, productId, ...reviewData } = req.body;
    
    const review = await reviewService.createReview(
      req.user.id,
      orderId,
      productId,
      reviewData
    );

    console.log('Review created successfully:', review._id);
    res.status(201).json({
      success: true,
      message: 'Review submitted successfully',
      data: review
    });
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Get reviews for a product (GET /api/reviews/product/:productId)
router.get('/product/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    
    const result = await reviewService.getProductReviews(
      productId,
      parseInt(page),
      parseInt(limit)
    );

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error fetching product reviews:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reviews'
    });
  }
});

// Get user's reviews (GET /api/reviews/my-reviews)
router.get('/my-reviews', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    const result = await reviewService.getUserReviews(
      req.user.id,
      parseInt(page),
      parseInt(limit)
    );

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error fetching user reviews:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reviews'
    });
  }
});

// Admin: Update review status (PUT /api/reviews/:reviewId/status)
router.put('/:reviewId/status', admin, async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { status, notes } = req.body;
    
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be approved or rejected'
      });
    }

    const review = await reviewService.updateReviewStatus(
      reviewId,
      status,
      req.user.id,
      notes
    );

    res.json({
      success: true,
      message: `Review ${status} successfully`,
      data: review
    });
  } catch (error) {
    console.error('Error updating review status:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Admin: Get review statistics (GET /api/reviews/stats)
router.get('/stats', admin, async (req, res) => {
  try {
    const stats = await reviewService.getReviewStats();
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching review stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch review statistics'
    });
  }
});

// Get review by ID (GET /api/reviews/:reviewId)
router.get('/:reviewId', async (req, res) => {
  try {
    const { reviewId } = req.params;
    
    // This would need to be implemented in the service
    // For now, return a placeholder
    res.json({
      success: true,
      message: 'Review details endpoint - to be implemented',
      reviewId
    });
  } catch (error) {
    console.error('Error fetching review:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch review'
    });
  }
});

module.exports = router;
