import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext.jsx';
import AdminDashboardLayout from '../../layouts/AdminDashboardLayout.jsx';
import { adminOperations } from '../../utils/supabaseClient.js';
import { toast } from 'react-hot-toast';
import {
  UserCheck,
  Clock,
  CheckCircle,
  XCircle,
  Mail,
  Calendar,
  User,
  AlertTriangle,
  MessageSquare,
  Search,
  Filter,
  Loader,
  Eye,
  FileText
} from 'lucide-react';

const TeacherApprovals = () => {
  const { user } = useAuth();
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [approvalNotes, setApprovalNotes] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchPendingRequests();
    setupRealTimeSubscription();
  }, []);

  const fetchPendingRequests = async () => {
    try {
      setLoading(true);
      const requests = await adminOperations.getPendingApprovals();
      setPendingRequests(requests);
    } catch (error) {
      console.error('Error fetching pending requests:', error);
      toast.error('Failed to load pending requests');
    } finally {
      setLoading(false);
    }
  };

  const setupRealTimeSubscription = () => {
    const subscription = adminOperations.subscribeToAdminUpdates((payload) => {
      console.log('Real-time admin update:', payload);
      if (payload.table === 'teacher_approval_requests') {
        fetchPendingRequests();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  };

  const handleApprove = async () => {
    try {
      setProcessing(true);
      await adminOperations.approveTeacher(
        selectedRequest.id,
        selectedRequest.teacher_id,
        user.id,
        approvalNotes
      );
      
      // Remove from pending list
      setPendingRequests(prev => 
        prev.filter(req => req.id !== selectedRequest.id)
      );
      
      setShowApprovalModal(false);
      setSelectedRequest(null);
      setApprovalNotes('');
      toast.success('Teacher approved successfully!');
    } catch (error) {
      console.error('Error approving teacher:', error);
      toast.error('Failed to approve teacher');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }

    try {
      setProcessing(true);
      await adminOperations.rejectTeacher(
        selectedRequest.id,
        selectedRequest.teacher_id,
        user.id,
        rejectionReason
      );
      
      // Remove from pending list
      setPendingRequests(prev => 
        prev.filter(req => req.id !== selectedRequest.id)
      );
      
      setShowRejectionModal(false);
      setSelectedRequest(null);
      setRejectionReason('');
      toast.success('Teacher application rejected');
    } catch (error) {
      console.error('Error rejecting teacher:', error);
      toast.error('Failed to reject teacher');
    } finally {
      setProcessing(false);
    }
  };

  const filteredRequests = pendingRequests.filter(request =>
    request.profiles?.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.profiles?.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const RequestCard = ({ request }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 border border-gray-100"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-full flex items-center justify-center">
            <User className="w-6 h-6 text-yellow-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">
              {request.profiles?.full_name}
            </h3>
            <p className="text-sm text-gray-600 flex items-center space-x-1">
              <Mail className="w-4 h-4" />
              <span>{request.profiles?.email}</span>
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-xs font-semibold rounded-full flex items-center space-x-1">
            <Clock className="w-3 h-3" />
            <span>Pending</span>
          </span>
        </div>
      </div>

      <div className="space-y-3 mb-6">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Calendar className="w-4 h-4" />
          <span>Registered: {formatDate(request.profiles?.created_at)}</span>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Clock className="w-4 h-4" />
          <span>Request Date: {formatDate(request.request_date)}</span>
        </div>
      </div>

      <div className="flex items-center space-x-3">
        <button
          onClick={() => {
            setSelectedRequest(request);
            setShowApprovalModal(true);
          }}
          className="flex-1 px-4 py-2 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
        >
          <CheckCircle className="w-4 h-4" />
          <span>Approve</span>
        </button>
        
        <button
          onClick={() => {
            setSelectedRequest(request);
            setShowRejectionModal(true);
          }}
          className="flex-1 px-4 py-2 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-colors flex items-center justify-center space-x-2"
        >
          <XCircle className="w-4 h-4" />
          <span>Reject</span>
        </button>
        
        <button
          onClick={() => console.log('View details:', request)}
          className="px-4 py-2 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors"
        >
          <Eye className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );

  return (
    <AdminDashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Teacher Approvals</h1>
            <p className="text-gray-600">
              Review and approve teacher registration requests. {filteredRequests.length} pending approval{filteredRequests.length !== 1 ? 's' : ''}.
            </p>
          </div>
          
          <button
            onClick={fetchPendingRequests}
            disabled={loading}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200 flex items-center space-x-2"
          >
            <Loader className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Search */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-400 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500"
            />
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader className="w-8 h-8 text-red-500 animate-spin" />
            <span className="ml-3 text-gray-600">Loading pending requests...</span>
          </div>
        ) : filteredRequests.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <UserCheck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              {searchTerm ? 'No requests found' : 'No pending approvals'}
            </h3>
            <p className="text-gray-500">
              {searchTerm 
                ? 'Try adjusting your search criteria'
                : 'All teacher requests have been processed'
              }
            </p>
          </motion.div>
        ) : (
          <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
            {filteredRequests.map((request, index) => (
              <motion.div
                key={request.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <RequestCard request={request} />
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Approval Modal */}
      <AnimatePresence>
        {showApprovalModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6"
            >
              <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mx-auto mb-4">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              
              <h3 className="text-lg font-semibold text-gray-800 text-center mb-2">
                Approve Teacher
              </h3>
              
              <p className="text-gray-600 text-center mb-6">
                Approve "{selectedRequest?.profiles?.full_name}" as a teacher? They will receive an email notification.
              </p>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Approval Notes (Optional)
                </label>
                <textarea
                  value={approvalNotes}
                  onChange={(e) => setApprovalNotes(e.target.value)}
                  placeholder="Add any notes for the approval..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-400 focus:border-transparent resize-none"
                  rows={3}
                />
              </div>
              
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => {
                    setShowApprovalModal(false);
                    setSelectedRequest(null);
                    setApprovalNotes('');
                  }}
                  className="flex-1 px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleApprove}
                  disabled={processing}
                  className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition-colors flex items-center justify-center space-x-2"
                >
                  {processing ? (
                    <Loader className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle className="w-4 h-4" />
                  )}
                  <span>Approve</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Rejection Modal */}
      <AnimatePresence>
        {showRejectionModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6"
            >
              <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mx-auto mb-4">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
              
              <h3 className="text-lg font-semibold text-gray-800 text-center mb-2">
                Reject Application
              </h3>
              
              <p className="text-gray-600 text-center mb-6">
                Reject "{selectedRequest?.profiles?.full_name}"'s teacher application? They will receive an email with the reason.
              </p>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for Rejection *
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Please provide a clear reason for rejection..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-400 focus:border-transparent resize-none"
                  rows={4}
                  required
                />
              </div>
              
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => {
                    setShowRejectionModal(false);
                    setSelectedRequest(null);
                    setRejectionReason('');
                  }}
                  className="flex-1 px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReject}
                  disabled={processing || !rejectionReason.trim()}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {processing ? (
                    <Loader className="w-4 h-4 animate-spin" />
                  ) : (
                    <XCircle className="w-4 h-4" />
                  )}
                  <span>Reject</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AdminDashboardLayout>
  );
};

export default TeacherApprovals;
