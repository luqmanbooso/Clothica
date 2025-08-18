const express = require('express');
const router = express.Router();
const issueService = require('../services/issueService');
const { auth, admin } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

// Validation middleware
const validateIssue = [
  body('orderId').isMongoId().withMessage('Valid order ID required'),
  body('orderItemId').isMongoId().withMessage('Valid order item ID required'),
  body('type').isIn(['refund', 'return', 'exchange', 'damaged', 'wrong_item', 'not_as_described', 'other']).withMessage('Valid issue type required'),
  body('reason').isLength({ min: 10, max: 1000 }).withMessage('Reason must be between 10-1000 characters'),
  body('description').optional().isLength({ max: 2000 }).withMessage('Description too long')
];

// Create a new issue (POST /api/issues)
router.post('/', auth, validateIssue, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const issue = await issueService.createIssue(
      req.user.id,
      req.body.orderId,
      req.body
    );

    res.status(201).json({
      success: true,
      message: 'Issue reported successfully',
      data: issue
    });
  } catch (error) {
    console.error('Error creating issue:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Get user's issues (GET /api/issues/my-issues)
router.get('/my-issues', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    const result = await issueService.getUserIssues(
      req.user.id,
      parseInt(page),
      parseInt(limit)
    );

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error fetching user issues:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch issues'
    });
  }
});

// Get issue details (GET /api/issues/:issueId)
router.get('/:issueId', auth, async (req, res) => {
  try {
    const { issueId } = req.params;
    
    const result = await issueService.getIssueDetails(issueId, req.user.id);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error fetching issue details:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Admin: Update issue status (PUT /api/issues/:issueId/status)
router.put('/:issueId/status', admin, async (req, res) => {
  try {
    const { issueId } = req.params;
    const { status, notes } = req.body;
    
    if (!['pending', 'under_review', 'approved', 'rejected', 'processing', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const issue = await issueService.updateIssueStatus(
      issueId,
      status,
      req.user.id,
      notes
    );

    res.json({
      success: true,
      message: `Issue status updated to ${status}`,
      data: issue
    });
  } catch (error) {
    console.error('Error updating issue status:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Admin: Process refund (POST /api/issues/:issueId/process-refund)
router.post('/:issueId/process-refund', admin, async (req, res) => {
  try {
    const { issueId } = req.params;
    
    // First get the issue to find the refund
    const issueDetails = await issueService.getIssueDetails(issueId, 'admin');
    
    if (!issueDetails.refund) {
      return res.status(400).json({
        success: false,
        message: 'No refund record found for this issue'
      });
    }

    const refund = await issueService.processRefund(
      issueDetails.refund._id,
      req.user.id
    );

    res.json({
      success: true,
      message: 'Refund processed successfully',
      data: refund
    });
  } catch (error) {
    console.error('Error processing refund:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Admin: Get issue statistics (GET /api/issues/stats)
router.get('/stats', admin, async (req, res) => {
  try {
    const stats = await issueService.getIssueStats();
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching issue stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch issue statistics'
    });
  }
});

// Admin: Get all issues (GET /api/issues)
router.get('/', admin, async (req, res) => {
  try {
    const { page = 1, limit = 20, status, priority } = req.query;
    
    // This would need to be implemented in the service
    // For now, return a placeholder
    res.json({
      success: true,
      message: 'Admin issues list endpoint - to be implemented',
      filters: { page, limit, status, priority }
    });
  } catch (error) {
    console.error('Error fetching issues:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch issues'
    });
  }
});

module.exports = router;
