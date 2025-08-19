const Issue = require('../models/Issue');
const Order = require('../models/Order');

class IssueService {
  // Create a new issue
  async createIssue(userId, orderId, issueData) {
    try {
      // Verify the order exists and belongs to the user
      const order = await Order.findOne({ _id: orderId, userId });
      if (!order) {
        throw new Error('Order not found or does not belong to user');
      }

      // Create the issue
      const issue = new Issue({
        userId,
        orderId,
        type: issueData.type,
        reason: issueData.reason,
        description: issueData.description || '',
        status: 'pending'
      });

      await issue.save();
      return issue;
    } catch (error) {
      throw error;
    }
  }

  // Get user's issues
  async getUserIssues(userId, page = 1, limit = 10) {
    try {
      const skip = (page - 1) * limit;
      
      const issues = await Issue.find({ userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('orderId', 'orderNumber total status');

      const total = await Issue.countDocuments({ userId });

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

  // Get issue details
  async getIssueDetails(issueId, userId) {
    try {
      const issue = await Issue.findOne({ _id: issueId, userId })
        .populate('orderId', 'orderNumber total status items');

      if (!issue) {
        throw new Error('Issue not found or does not belong to user');
      }

      return issue;
    } catch (error) {
      throw error;
    }
  }

  // Update issue status (admin only)
  async updateIssueStatus(issueId, status, notes) {
    try {
      const issue = await Issue.findById(issueId);
      if (!issue) {
        throw new Error('Issue not found');
      }

      issue.status = status;
      if (notes) {
        issue.adminNotes = notes;
      }
      issue.updatedAt = new Date();

      await issue.save();
      return issue;
    } catch (error) {
      throw error;
    }
  }

  // Get all issues (admin only)
  async getAllIssues(page = 1, limit = 20, status = null) {
    try {
      const skip = (page - 1) * limit;
      
      let query = {};
      if (status) {
        query.status = status;
      }

      const issues = await Issue.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('userId', 'name email')
        .populate('orderId', 'orderNumber total status');

      const total = await Issue.countDocuments(query);

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
}

module.exports = new IssueService();
