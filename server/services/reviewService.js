const Review = require('../models/Review');
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const notificationService = require('./notificationService');

class ReviewService {
  /**
   * Create a new review for a completed order
   */
  async createReview(userId, orderId, productId, reviewData) {
    try {
      // Validate order exists and is delivered
      const order = await Order.findById(orderId);
      if (!order) {
        throw new Error('Order not found');
      }
      
      if (order.user.toString() !== userId.toString()) {
        throw new Error('Unauthorized to review this order');
      }
      
      if (order.status !== 'delivered' && order.status !== 'completed') {
        throw new Error('Can only review delivered or completed orders');
      }
      
      // Check if review already exists
      const existingReview = await Review.findOne({
        user: userId,
        order: orderId,
        product: productId
      });
      
      if (existingReview) {
        throw new Error('Review already exists for this product in this order');
      }
      
      // Validate product exists in order
      const orderItem = order.items.find(item => 
        item.product.toString() === productId.toString()
      );
      
      if (!orderItem) {
        throw new Error('Product not found in this order');
      }
      
      // Create review
      const review = new Review({
        user: userId,
        order: orderId,
        product: productId,
        rating: {
          product: reviewData.productRating,
          delivery: reviewData.deliveryRating,
          customerService: reviewData.customerServiceRating
        },
        review: {
          product: reviewData.productReview,
          delivery: reviewData.deliveryReview,
          customerService: reviewData.customerServiceReview
        },
        images: reviewData.images || [],
        status: 'pending'
      });
      
      await review.save();
      
      // Update product average rating
      await this.updateProductRating(productId);
      
      // Send notification to admin for review approval
      // Find admin users to notify
      const adminUsers = await User.find({ role: 'admin' }).select('_id');
      
      if (adminUsers.length > 0) {
        // Create notifications for all admin users
        for (const adminUser of adminUsers) {
          await notificationService.createNotification(adminUser._id, {
            title: 'New Review Submitted',
            message: `A new review has been submitted for product ${orderItem.name}`,
            type: 'info',
            category: 'system',
            actionUrl: `/admin/reviews/${review._id}`,
            actionText: 'Review'
          });
        }
      }
      
      return review;
    } catch (error) {
      throw error;
    }
  }
  
  /**
   * Get reviews for a product
   */
  async getProductReviews(productId, page = 1, limit = 10) {
    try {
      const skip = (page - 1) * limit;
      
      const reviews = await Review.find({
        product: productId,
        status: 'approved'
      })
      .populate('user', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
      
      const total = await Review.countDocuments({
        product: productId,
        status: 'approved'
      });
      
      return {
        reviews,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      throw error;
    }
  }
  
  /**
   * Get user's reviews
   */
  async getUserReviews(userId, page = 1, limit = 10) {
    try {
      const skip = (page - 1) * limit;
      
      const reviews = await Review.find({ user: userId })
        .populate('product', 'name images')
        .populate('order', 'orderNumber')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
      
      const total = await Review.countDocuments({ user: userId });
      
      return {
        reviews,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      throw error;
    }
  }
  
  /**
   * Update product average rating
   */
  async updateProductRating(productId) {
    try {
      const result = await Review.aggregate([
        { $match: { product: productId, status: 'approved' } },
        {
          $group: {
            _id: null,
            avgProductRating: { $avg: '$rating.product' },
            avgDeliveryRating: { $avg: '$rating.delivery' },
            avgCustomerServiceRating: { $avg: '$rating.customerService' },
            totalReviews: { $sum: 1 }
          }
        }
      ]);
      
      if (result.length > 0) {
        const stats = result[0];
        await Product.findByIdAndUpdate(productId, {
          'rating.average': Math.round(stats.avgProductRating * 10) / 10,
          'rating.delivery': Math.round(stats.avgDeliveryRating * 10) / 10,
          'rating.customerService': Math.round(stats.avgCustomerServiceRating * 10) / 10,
          'rating.count': stats.totalReviews
        });
      }
    } catch (error) {
      console.error('Error updating product rating:', error);
    }
  }
  
  /**
   * Admin: Approve/reject review
   */
  async updateReviewStatus(reviewId, status, adminId, notes = '') {
    try {
      const review = await Review.findById(reviewId);
      if (!review) {
        throw new Error('Review not found');
      }
      
      review.status = status;
      if (notes) {
        review.adminNotes = notes;
      }
      
      await review.save();
      
      // Update product rating if review status changed
      if (status === 'approved' || status === 'rejected') {
        await this.updateProductRating(review.product);
      }
      
      // Notify user about review status
      await notificationService.createNotification(review.user, {
        title: 'Review Status Updated',
        message: `Your review has been ${status}`,
        type: 'review',
        category: 'review',
        actionUrl: `/reviews/${review._id}`,
        actionText: 'View Review'
      });
      
      return review;
    } catch (error) {
      throw error;
    }
  }
  
  /**
   * Get review statistics
   */
  async getReviewStats() {
    try {
      const stats = await Review.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            avgProductRating: { $avg: '$rating.product' },
            avgDeliveryRating: { $avg: '$rating.delivery' },
            avgCustomerServiceRating: { $avg: '$rating.customerService' }
          }
        }
      ]);
      
      return stats.reduce((acc, stat) => {
        acc[stat._id] = {
          count: stat.count,
          avgProductRating: Math.round(stat.avgProductRating * 10) / 10,
          avgDeliveryRating: Math.round(stat.avgDeliveryRating * 10) / 10,
          avgCustomerServiceRating: Math.round(stat.avgCustomerServiceRating * 10) / 10
        };
        return acc;
      }, {});
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get all reviews for admin panel
   */
  async getAllReviewsForAdmin() {
    try {
      const reviews = await Review.find({})
        .populate('user', 'name email')
        .populate('product', 'name _id')
        .populate('order', 'orderNumber')
        .sort({ createdAt: -1 });

      return reviews.map(review => ({
        _id: review._id,
        user: review.user,
        product: review.product,
        order: review.order,
        rating: review.rating.product || review.rating,
        comment: review.review.product || review.comment,
        status: review.status === 'rejected' ? 'flagged' : review.status || 'approved',
        verified: review.isVerified || false,
        createdAt: review.createdAt,
        updatedAt: review.updatedAt
      }));
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get review statistics for admin
   */
  async getReviewStats() {
    try {
      const [totalStats, statusStats] = await Promise.all([
        Review.aggregate([
          {
            $group: {
              _id: null,
              total: { $sum: 1 },
              averageRating: { $avg: '$rating.product' },
              totalRatings: { $sum: 1 }
            }
          }
        ]),
        Review.aggregate([
          {
            $group: {
              _id: '$status',
              count: { $sum: 1 }
            }
          }
        ])
      ]);

      const stats = {
        total: totalStats[0]?.total || 0,
        approved: 0,
        pending: 0,
        flagged: 0,
        averageRating: totalStats[0]?.averageRating || 0,
        totalRatings: totalStats[0]?.totalRatings || 0
      };

      statusStats.forEach(stat => {
        switch(stat._id) {
          case 'approved':
            stats.approved = stat.count;
            break;
          case 'pending':
            stats.pending = stat.count;
            break;
          case 'rejected':
            stats.flagged = stat.count;
            break;
        }
      });

      return stats;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update review status
   */
  async updateReviewStatus(reviewId, status) {
    try {
      const review = await Review.findByIdAndUpdate(
        reviewId,
        { status, updatedAt: new Date() },
        { new: true }
      ).populate('user', 'name email').populate('product', 'name');

      if (!review) {
        throw new Error('Review not found');
      }

      return review;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delete review
   */
  async deleteReview(reviewId) {
    try {
      const review = await Review.findById(reviewId);
      if (!review) {
        throw new Error('Review not found');
      }

      await Review.findByIdAndDelete(reviewId);
      return { message: 'Review deleted successfully' };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new ReviewService();
