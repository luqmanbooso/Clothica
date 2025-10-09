import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  EyeIcon,
  UserIcon,
  CalendarIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  TagIcon,
  ChatBubbleLeftRightIcon,
  PaperClipIcon,
  ArrowPathIcon,
  XMarkIcon,
  DocumentTextIcon,
  PhoneIcon,
  EnvelopeIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';
import axios from 'axios';
import { useToast } from '../../contexts/ToastContext';

const Issues = () => {
  const { success: showSuccess, error: showError, info: showInfo } = useToast();
  const [loading, setLoading] = useState(true);
  const [issues, setIssues] = useState([]);
  const [filteredIssues, setFilteredIssues] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [responseText, setResponseText] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const [stats, setStats] = useState({
    total: 0,
    open: 0,
    inProgress: 0,
    resolved: 0,
    closed: 0,
    highPriority: 0
  });

  const issueCategories = [
    'Order Issues',
    'Payment Problems',
    'Product Defects',
    'Shipping Issues',
    'Account Issues',
    'Technical Support',
    'Refund Requests',
    'General Inquiry',
    'Other'
  ];

  const priorityLevels = ['low', 'medium', 'high', 'urgent'];
  const statusOptions = ['open', 'in-progress', 'resolved', 'closed'];

  useEffect(() => {
    fetchIssues();
    fetchStats();
  }, []);

  useEffect(() => {
    filterAndSortIssues();
  }, [issues, searchTerm, filterStatus, filterPriority, filterCategory, sortBy]);

  const fetchIssues = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/issues/admin/all', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIssues(response.data);
    } catch (error) {
      console.error('Error fetching issues:', error);
      showError('Failed to load issues');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/issues/admin/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const filterAndSortIssues = () => {
    let filtered = [...issues];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(issue => 
        issue.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        issue.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        issue.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        issue.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        issue.issueId?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(issue => issue.status === filterStatus);
    }

    // Apply priority filter
    if (filterPriority !== 'all') {
      filtered = filtered.filter(issue => issue.priority === filterPriority);
    }

    // Apply category filter
    if (filterCategory !== 'all') {
      filtered = filtered.filter(issue => issue.category === filterCategory);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'oldest':
          return new Date(a.createdAt) - new Date(b.createdAt);
        case 'priority':
          const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        case 'status':
          return a.status.localeCompare(b.status);
        case 'category':
          return a.category.localeCompare(b.category);
        default:
          return 0;
      }
    });

    setFilteredIssues(filtered);
  };

  const handleStatusChange = async (issueId, newStatus) => {
    try {
      setActionLoading(true);
      const token = localStorage.getItem('token');
      await axios.patch(`/api/issues/admin/${issueId}/status`, 
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setIssues(issues.map(issue => 
        issue._id === issueId ? { ...issue, status: newStatus, updatedAt: new Date().toISOString() } : issue
      ));
      
      showSuccess(`Issue status updated to ${newStatus}`);
      fetchStats(); // Refresh stats
    } catch (error) {
      console.error('Error updating issue status:', error);
      showError('Failed to update issue status');
    } finally {
      setActionLoading(false);
    }
  };

  const handlePriorityChange = async (issueId, newPriority) => {
    try {
      setActionLoading(true);
      const token = localStorage.getItem('token');
      await axios.patch(`/api/issues/admin/${issueId}/priority`, 
        { priority: newPriority },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setIssues(issues.map(issue => 
        issue._id === issueId ? { ...issue, priority: newPriority, updatedAt: new Date().toISOString() } : issue
      ));
      
      showSuccess(`Issue priority updated to ${newPriority}`);
      fetchStats(); // Refresh stats
    } catch (error) {
      console.error('Error updating issue priority:', error);
      showError('Failed to update issue priority');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddResponse = async () => {
    if (!selectedIssue || !responseText.trim()) return;

    try {
      setActionLoading(true);
      const token = localStorage.getItem('token');
      await axios.post(`/api/issues/admin/${selectedIssue._id}/response`, 
        { response: responseText.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Refresh the issue data
      fetchIssues();
      setShowResponseModal(false);
      setResponseText('');
      showSuccess('Response added successfully');
    } catch (error) {
      console.error('Error adding response:', error);
      showError('Failed to add response');
    } finally {
      setActionLoading(false);
    }
  };

  const getPriorityBadge = (priority) => {
    const priorityConfig = {
      low: { color: 'blue', text: 'Low' },
      medium: { color: 'yellow', text: 'Medium' },
      high: { color: 'orange', text: 'High' },
      urgent: { color: 'red', text: 'Urgent' }
    };

    const config = priorityConfig[priority] || priorityConfig.low;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${config.color}-100 text-${config.color}-800`}>
        {config.text}
      </span>
    );
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      open: { color: 'red', icon: ExclamationCircleIcon, text: 'Open' },
      'in-progress': { color: 'yellow', icon: ClockIcon, text: 'In Progress' },
      resolved: { color: 'green', icon: CheckCircleIcon, text: 'Resolved' },
      closed: { color: 'gray', icon: XCircleIcon, text: 'Closed' }
    };

    const config = statusConfig[status] || statusConfig.open;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${config.color}-100 text-${config.color}-800`}>
        <Icon className="h-3 w-3 mr-1" />
        {config.text}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#B35D5D]"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Issues Management</h1>
        <p className="text-gray-600">Manage customer support tickets and issues</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-blue-100">
              <DocumentTextIcon className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Issues</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-red-100">
              <ExclamationCircleIcon className="h-8 w-8 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Open</p>
              <p className="text-2xl font-bold text-gray-900">{stats.open}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-yellow-100">
              <ClockIcon className="h-8 w-8 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">In Progress</p>
              <p className="text-2xl font-bold text-gray-900">{stats.inProgress}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-green-100">
              <CheckCircleIcon className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Resolved</p>
              <p className="text-2xl font-bold text-gray-900">{stats.resolved}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-gray-100">
              <XCircleIcon className="h-8 w-8 text-gray-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Closed</p>
              <p className="text-2xl font-bold text-gray-900">{stats.closed}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-orange-100">
              <ExclamationTriangleIcon className="h-8 w-8 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">High Priority</p>
              <p className="text-2xl font-bold text-gray-900">{stats.highPriority}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          {/* Search */}
          <div className="relative">
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search issues..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#B35D5D] focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#B35D5D] focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="open">Open</option>
            <option value="in-progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>

          {/* Priority Filter */}
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#B35D5D] focus:border-transparent"
          >
            <option value="all">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          {/* Category Filter */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#B35D5D] focus:border-transparent"
          >
            <option value="all">All Categories</option>
            {issueCategories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#B35D5D] focus:border-transparent"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="priority">By Priority</option>
            <option value="status">By Status</option>
            <option value="category">By Category</option>
          </select>

          {/* Clear Filters */}
          <button
            onClick={() => {
              setSearchTerm('');
              setFilterStatus('all');
              setFilterPriority('all');
              setFilterCategory('all');
              setSortBy('newest');
            }}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Issues Table */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Issue ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Subject
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Priority
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredIssues.map((issue) => (
                <tr key={issue._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {issue.issueId || issue._id.slice(-8)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                        <UserIcon className="h-5 w-5 text-gray-600" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {issue.user?.name || issue.name || 'Anonymous'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {issue.user?.email || issue.email || 'No email'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900 max-w-xs truncate">
                      {issue.subject || 'No subject'}
                    </div>
                    <div className="text-sm text-gray-500 max-w-xs truncate">
                      {issue.description || 'No description'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {issue.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getPriorityBadge(issue.priority)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(issue.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(issue.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          setSelectedIssue(issue);
                          setShowDetailsModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-900"
                        title="View Details"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </button>
                      
                      <button
                        onClick={() => {
                          setSelectedIssue(issue);
                          setShowResponseModal(true);
                        }}
                        className="text-green-600 hover:text-green-900"
                        title="Add Response"
                      >
                        <ChatBubbleLeftRightIcon className="h-4 w-4" />
                      </button>
                      
                      {/* Quick Status Actions */}
                      {issue.status === 'open' && (
                        <button
                          onClick={() => handleStatusChange(issue._id, 'in-progress')}
                          className="text-yellow-600 hover:text-yellow-900"
                          title="Start Progress"
                          disabled={actionLoading}
                        >
                          <ArrowPathIcon className="h-4 w-4" />
                        </button>
                      )}
                      
                      {(issue.status === 'open' || issue.status === 'in-progress') && (
                        <button
                          onClick={() => handleStatusChange(issue._id, 'resolved')}
                          className="text-green-600 hover:text-green-900"
                          title="Mark Resolved"
                          disabled={actionLoading}
                        >
                          <CheckCircleIcon className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredIssues.length === 0 && (
          <div className="text-center py-12">
            <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No issues found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || filterStatus !== 'all' || filterPriority !== 'all' || filterCategory !== 'all'
                ? 'Try adjusting your filters'
                : 'No issues have been submitted yet'}
            </p>
          </div>
        )}
      </div>

      {/* Issue Details Modal */}
      <AnimatePresence>
        {showDetailsModal && selectedIssue && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-start justify-between mb-6">
                <h3 className="text-lg font-medium text-gray-900">Issue Details</h3>
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    setSelectedIssue(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Issue Information</h4>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                      <p className="text-sm"><span className="font-medium">Issue ID:</span> {selectedIssue.issueId || selectedIssue._id.slice(-8)}</p>
                      <p className="text-sm"><span className="font-medium">Category:</span> {selectedIssue.category}</p>
                      <p className="text-sm"><span className="font-medium">Priority:</span> {getPriorityBadge(selectedIssue.priority)}</p>
                      <p className="text-sm"><span className="font-medium">Status:</span> {getStatusBadge(selectedIssue.status)}</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Customer Information</h4>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                      <p className="text-sm"><span className="font-medium">Name:</span> {selectedIssue.user?.name || selectedIssue.name || 'Anonymous'}</p>
                      <p className="text-sm"><span className="font-medium">Email:</span> {selectedIssue.user?.email || selectedIssue.email || 'No email'}</p>
                      <p className="text-sm"><span className="font-medium">Phone:</span> {selectedIssue.phone || 'Not provided'}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Issue Description</h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h5 className="font-medium text-gray-900 mb-2">{selectedIssue.subject}</h5>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{selectedIssue.description}</p>
                  </div>
                </div>

                {selectedIssue.orderNumber && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Related Order</h4>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm"><span className="font-medium">Order Number:</span> {selectedIssue.orderNumber}</p>
                    </div>
                  </div>
                )}

                {selectedIssue.attachments && selectedIssue.attachments.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Attachments</h4>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="space-y-2">
                        {selectedIssue.attachments.map((attachment, index) => (
                          <div key={index} className="flex items-center">
                            <PaperClipIcon className="h-4 w-4 text-gray-400 mr-2" />
                            <a 
                              href={attachment.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-sm text-blue-600 hover:text-blue-800"
                            >
                              {attachment.name || `Attachment ${index + 1}`}
                            </a>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {selectedIssue.adminResponses && selectedIssue.adminResponses.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Admin Responses</h4>
                    <div className="space-y-3">
                      {selectedIssue.adminResponses.map((response, index) => (
                        <div key={index} className="bg-blue-50 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-blue-900">
                              {response.admin?.name || 'Admin'}
                            </span>
                            <span className="text-xs text-blue-600">
                              {new Date(response.createdAt).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-sm text-blue-800 whitespace-pre-wrap">{response.response}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Issue Timeline</h4>
                  <div className="bg-gray-50 rounded-lg p-4 grid grid-cols-2 gap-4">
                    <p className="text-sm"><span className="font-medium">Created:</span> {new Date(selectedIssue.createdAt).toLocaleString()}</p>
                    <p className="text-sm"><span className="font-medium">Last Updated:</span> {new Date(selectedIssue.updatedAt).toLocaleString()}</p>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t">
                  <div className="flex space-x-3">
                    <select
                      onChange={(e) => handleStatusChange(selectedIssue._id, e.target.value)}
                      value={selectedIssue.status}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#B35D5D] focus:border-transparent"
                    >
                      {statusOptions.map(status => (
                        <option key={status} value={status}>
                          {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
                        </option>
                      ))}
                    </select>

                    <select
                      onChange={(e) => handlePriorityChange(selectedIssue._id, e.target.value)}
                      value={selectedIssue.priority}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#B35D5D] focus:border-transparent"
                    >
                      {priorityLevels.map(priority => (
                        <option key={priority} value={priority}>
                          {priority.charAt(0).toUpperCase() + priority.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    onClick={() => {
                      setShowResponseModal(true);
                    }}
                    className="px-4 py-2 bg-[#B35D5D] text-white rounded-lg hover:bg-[#A54C4C] transition-colors"
                  >
                    Add Response
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Response Modal */}
      <AnimatePresence>
        {showResponseModal && selectedIssue && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl p-6 max-w-2xl w-full"
            >
              <div className="flex items-start justify-between mb-6">
                <h3 className="text-lg font-medium text-gray-900">Add Response</h3>
                <button
                  onClick={() => {
                    setShowResponseModal(false);
                    setResponseText('');
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Response to: {selectedIssue.subject}
                  </label>
                  <textarea
                    value={responseText}
                    onChange={(e) => setResponseText(e.target.value)}
                    placeholder="Enter your response to the customer..."
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#B35D5D] focus:border-transparent resize-none"
                  />
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => {
                      setShowResponseModal(false);
                      setResponseText('');
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddResponse}
                    disabled={actionLoading || !responseText.trim()}
                    className="px-4 py-2 bg-[#B35D5D] text-white rounded-lg hover:bg-[#A54C4C] transition-colors disabled:opacity-50"
                  >
                    {actionLoading ? 'Adding...' : 'Add Response'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Issues;
