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

  /**
   * Map database status to admin interface status
   */
  mapStatusForAdmin(dbStatus) {
    const statusMap = {
      'pending': 'open',
      'under_review': 'in-progress',
      'processing': 'in-progress',
      'approved': 'resolved',
      'completed': 'closed',
      'rejected': 'closed',
      'cancelled': 'closed'
    };
    return statusMap[dbStatus] || dbStatus;
  }

  /**
   * Map admin interface status to database status
   */
  mapStatusForDB(adminStatus) {
    const statusMap = {
      'open': 'pending',
      'in-progress': 'under_review',
      'resolved': 'approved',
      'closed': 'completed'
    };
    return statusMap[adminStatus] || adminStatus;
  }

  /**
   * Get all issues for admin panel
   */
  async getAllIssuesForAdmin() {
    try {
      const issues = await Issue.find({})
        .populate('user', 'name email')
        .populate('order', 'orderNumber')
        .sort({ createdAt: -1 });

      return issues.map(issue => ({
        _id: issue._id,
        issueId: issue.issueId || issue._id.toString().slice(-8),
        user: issue.user,
        order: issue.order,
        subject: issue.subject || issue.reason || 'No subject',
        description: issue.description,
        category: issue.category || issue.type || 'General Inquiry',
        priority: issue.priority || 'medium',
        status: this.mapStatusForAdmin(issue.status) || 'open',
        phone: issue.phone,
        email: issue.email || issue.user?.email,
        name: issue.name || issue.user?.name,
        orderNumber: issue.orderNumber,
        attachments: issue.images || [],
        adminResponses: issue.adminNotes?.map(note => ({
          admin: note.admin,
          response: note.note,
          createdAt: note.createdAt
        })) || [],
        createdAt: issue.createdAt,
        updatedAt: issue.updatedAt
      }));
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get issue statistics for admin
   */
  async getIssueStats() {
    try {
      const [totalStats, statusStats, priorityStats] = await Promise.all([
        Issue.aggregate([
          {
            $group: {
              _id: null,
              total: { $sum: 1 }
            }
          }
        ]),
        Issue.aggregate([
          {
            $group: {
              _id: '$status',
              count: { $sum: 1 }
            }
          }
        ]),
        Issue.aggregate([
          {
            $match: { priority: { $in: ['high', 'urgent'] } }
          },
          {
            $group: {
              _id: null,
              count: { $sum: 1 }
            }
          }
        ])
      ]);

      const stats = {
        total: totalStats[0]?.total || 0,
        open: 0,
        inProgress: 0,
        resolved: 0,
        closed: 0,
        highPriority: priorityStats[0]?.count || 0
      };

      statusStats.forEach(stat => {
        const adminStatus = this.mapStatusForAdmin(stat._id);
        switch(adminStatus) {
          case 'open':
            stats.open += stat.count;
            break;
          case 'in-progress':
            stats.inProgress += stat.count;
            break;
          case 'resolved':
            stats.resolved += stat.count;
            break;
          case 'closed':
            stats.closed += stat.count;
            break;
        }
      });

      return stats;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update issue status
   */
  async updateIssueStatus(issueId, status) {
    try {
      const dbStatus = this.mapStatusForDB(status);
      const issue = await Issue.findByIdAndUpdate(
        issueId,
        { status: dbStatus, updatedAt: new Date() },
        { new: true }
      ).populate('user', 'name email');

      if (!issue) {
        throw new Error('Issue not found');
      }

      return issue;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update issue priority
   */
  async updateIssuePriority(issueId, priority) {
    try {
      const issue = await Issue.findByIdAndUpdate(
        issueId,
        { priority, updatedAt: new Date() },
        { new: true }
      ).populate('user', 'name email');

      if (!issue) {
        throw new Error('Issue not found');
      }

      return issue;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Add admin response to issue
   */
  async addAdminResponse(issueId, adminId, response) {
    try {
      const issue = await Issue.findById(issueId);
      if (!issue) {
        throw new Error('Issue not found');
      }

      // Use the model's method to add admin note
      await issue.addAdminNote(response, adminId);
      
      return await Issue.findById(issueId)
        .populate('user', 'name email')
        .populate('adminNotes.admin', 'name email');
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new IssueService();
