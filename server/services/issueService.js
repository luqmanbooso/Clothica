const Issue = require('../models/Issue');
const Refund = require('../models/Refund');
const Order = require('../models/Order');
const User = require('../models/User');
const notificationService = require('./notificationService');
const paymentService = require('./paymentService');

class IssueService {
  /**
   * Create a new issue/refund request
   */
  async createIssue(userId, orderId, issueData) {
    try {
      // Validate order exists and belongs to user
      const order = await Order.findById(orderId);
      if (!order) {
        throw new Error('Order not found');
      }
      
      if (order.user.toString() !== userId.toString()) {
        throw new Error('Unauthorized to create issue for this order');
      }
      
      // Check if order is eligible for refund/return (within 30 days)
      const orderDate = new Date(order.createdAt);
      const daysSinceOrder = (Date.now() - orderDate.getTime()) / (1000 * 60 * 60 * 24);
      
      if (daysSinceOrder > 30) {
        throw new Error('Order is outside the 30-day return window');
      }
      
      // Check if issue already exists for this order item
      const existingIssue = await Issue.findOne({
        user: userId,
        order: orderId,
        orderItem: issueData.orderItemId
      });
      
      if (existingIssue) {
        throw new Error('Issue already exists for this order item');
      }
      
      // Create issue
      const issue = new Issue({
        user: userId,
        order: orderId,
        orderItem: issueData.orderItemId,
        type: issueData.type,
        reason: issueData.reason,
        description: issueData.description,
        images: issueData.images || [],
        priority: this.calculatePriority(issueData.type, issueData.reason),
        timeline: [{
          status: 'pending',
          description: 'Issue reported by customer',
          timestamp: new Date()
        }]
      });
      
      await issue.save();
      
      // Send notification to admin
      // Find admin users to notify
      const adminUsers = await User.find({ role: 'admin' }).select('_id');
      
      if (adminUsers.length > 0) {
        // Create notifications for all admin users
        for (const adminUser of adminUsers) {
          await notificationService.createNotification(adminUser._id, {
            title: 'New Issue Reported',
            message: `Customer reported issue: ${issueData.type} for order #${order._id.slice(-8)}`,
            type: 'info',
            category: 'system',
            actionUrl: `/admin/issues/${issue._id}`,
            actionText: 'Review Issue'
          });
        }
      }
      
      // Send acknowledgment to user
      await notificationService.createNotification(userId, {
        title: 'Issue Reported Successfully',
        message: 'Your issue has been reported and is under review. We will get back to you within 24-48 hours.',
        type: 'info',
        category: 'system',
        actionUrl: `/issues/${issue._id}`,
        actionText: 'View Issue'
      });
      
      return issue;
    } catch (error) {
      throw error;
    }
  }
  
  /**
   * Calculate issue priority based on type and reason
   */
  calculatePriority(type, reason) {
    if (type === 'damaged' || type === 'wrong_item') {
      return 'high';
    }
    if (type === 'refund' && reason.includes('urgent')) {
      return 'urgent';
    }
    if (type === 'exchange') {
      return 'medium';
    }
    return 'medium';
  }
  
  /**
   * Admin: Update issue status
   */
  async updateIssueStatus(issueId, status, adminId, notes = '') {
    try {
      const issue = await Issue.findById(issueId);
      if (!issue) {
        throw new Error('Issue not found');
      }
      
      const oldStatus = issue.status;
      await issue.updateStatus(status, notes, adminId);
      
      // Send notification to user
      await notificationService.createNotification(issue.user, {
        title: 'Issue Status Updated',
        message: `Your issue has been updated to: ${status}`,
        type: 'info',
        category: 'system',
        actionUrl: `/issues/${issue._id}`,
        actionText: 'View Issue'
      });
      
      // If approved, create refund record
      if (status === 'approved' && oldStatus !== 'approved') {
        await this.createRefundRecord(issue);
      }
      
      return issue;
    } catch (error) {
      throw error;
    }
  }
  
  /**
   * Create refund record when issue is approved
   */
  async createRefundRecord(issue) {
    try {
      const order = await Order.findById(issue.order);
      const orderItem = order.items.find(item => 
        item._id.toString() === issue.orderItem.toString()
      );
      
      if (!orderItem) {
        throw new Error('Order item not found');
      }
      
      // Calculate refund amount
      let refundAmount = orderItem.price * orderItem.quantity;
      
      // Apply partial refund logic if needed
      if (issue.type === 'partial_refund') {
        refundAmount = refundAmount * 0.5; // 50% refund example
      }
      
      const refund = new Refund({
        issue: issue._id,
        order: issue.order,
        user: issue.user,
        amount: refundAmount,
        currency: 'lkr',
        reason: issue.reason,
        refundType: issue.type === 'exchange' ? 'exchange' : 'full',
        paymentMethod: order.paymentMethod,
        paymentGateway: {
          provider: order.paymentMethod === 'stripe' ? 'stripe' : 'manual'
        },
        metadata: {
          originalPaymentIntent: order.paymentResult?.id,
          refundReason: issue.reason,
          customerNotes: issue.description
        }
      });
      
      await refund.save();
      
      // Update issue with resolution
      issue.resolution.action = issue.type === 'exchange' ? 'exchange' : 'refund';
      issue.resolution.amount = refundAmount;
      await issue.save();
      
      return refund;
    } catch (error) {
      console.error('Error creating refund record:', error);
      throw error;
    }
  }
  
  /**
   * Process refund through payment gateway
   */
  async processRefund(refundId, adminId) {
    try {
      const refund = await Refund.findById(refundId);
      if (!refund) {
        throw new Error('Refund not found');
      }
      
      if (refund.status !== 'pending') {
        throw new Error('Refund is not in pending status');
      }
      
      // Update status to processing
      await refund.updateStatus('processing', 'Processing refund through payment gateway', adminId);
      
      let gatewayResponse;
      
      // Process based on payment method
      if (refund.paymentGateway.provider === 'stripe') {
        gatewayResponse = await paymentService.processRefund(refund);
      } else {
        // Manual processing for COD or other methods
        gatewayResponse = { success: true, message: 'Manual refund processed' };
      }
      
      // Update refund with gateway response
      await refund.processGatewayRefund(gatewayResponse);
      
      // Update issue status
      if (gatewayResponse.success) {
        await Issue.findByIdAndUpdate(refund.issue, {
          status: 'completed',
          'resolution.processedAt': new Date()
        });
        
        // Send success notification to user
        await notificationService.createNotification(refund.user, {
          title: 'Refund Processed',
          message: `Your refund of Rs. ${refund.amount.toLocaleString()} has been processed successfully.`,
          type: 'refund',
          category: 'payment',
          actionUrl: `/refunds/${refund._id}`,
          actionText: 'View Refund'
        });
      }
      
      return refund;
    } catch (error) {
      throw error;
    }
  }
  
  /**
   * Get user's issues
   */
  async getUserIssues(userId, page = 1, limit = 10) {
    try {
      const skip = (page - 1) * limit;
      
      const issues = await Issue.find({ user: userId })
        .populate('order', 'orderNumber total')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
      
      const total = await Issue.countDocuments({ user: userId });
      
      return {
        issues,
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
   * Get issue details with refund information
   */
  async getIssueDetails(issueId, userId) {
    try {
      const issue = await Issue.findById(issueId)
        .populate('order', 'orderNumber total status')
        .populate('user', 'name email');
      
      if (!issue) {
        throw new Error('Issue not found');
      }
      
      if (issue.user._id.toString() !== userId.toString()) {
        throw new Error('Unauthorized to view this issue');
      }
      
      // Get refund information if exists
      const refund = await Refund.findOne({ issue: issueId });
      
      return {
        issue,
        refund
      };
    } catch (error) {
      throw error;
    }
  }
  
  /**
   * Get issue statistics for admin
   */
  async getIssueStats() {
    try {
      const stats = await Issue.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            avgResolutionTime: { $avg: '$estimatedResolutionTime' }
          }
        }
      ]);
      
      const priorityStats = await Issue.aggregate([
        {
          $group: {
            _id: '$priority',
            count: { $sum: 1 }
          }
        }
      ]);
      
      return {
        byStatus: stats.reduce((acc, stat) => {
          acc[stat._id] = {
            count: stat.count,
            avgResolutionTime: Math.round(stat.avgResolutionTime || 0)
          };
          return acc;
        }, {}),
        byPriority: priorityStats.reduce((acc, stat) => {
          acc[stat._id] = stat.count;
          return acc;
        }, {})
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new IssueService();
