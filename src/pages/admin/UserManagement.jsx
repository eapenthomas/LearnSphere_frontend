import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext.jsx';
import AdminDashboardLayout from '../../layouts/AdminDashboardLayout.jsx';
import { adminOperations } from '../../utils/supabaseClient.js';
import { toast } from 'react-hot-toast';
import {
  Users,
  Search,
  Filter,
  MoreVertical,
  UserCheck,
  UserX,
  Mail,
  Calendar,
  Shield,
  GraduationCap,
  BookOpen,
  Loader,
  Eye,
  Settings,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react';

const UserManagement = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showActionModal, setShowActionModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [actionType, setActionType] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const allUsers = await adminOperations.getAllUsers();
      setUsers(allUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleUserStatus = async (userId, currentStatus) => {
    const newStatus = !currentStatus;
    const action = newStatus ? 'enable' : 'disable';
    
    try {
      setProcessing(true);
      await adminOperations.toggleUserStatus(userId, newStatus, user.id);
      
      // Update local state
      setUsers(prev => prev.map(u => 
        u.id === userId ? { ...u, is_active: newStatus } : u
      ));
      
      setShowActionModal(false);
      setSelectedUser(null);
      toast.success(`User ${action}d successfully!`);
    } catch (error) {
      console.error(`Error ${action}ing user:`, error);
      toast.error(`Failed to ${action} user`);
    } finally {
      setProcessing(false);
    }
  };

  const openActionModal = (user, action) => {
    setSelectedUser(user);
    setActionType(action);
    setShowActionModal(true);
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && user.is_active) ||
      (statusFilter === 'inactive' && !user.is_active);
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin':
        return <Shield className="w-4 h-4 text-red-500" />;
      case 'teacher':
        return <GraduationCap className="w-4 h-4 text-blue-500" />;
      case 'student':
        return <BookOpen className="w-4 h-4 text-green-500" />;
      default:
        return <Users className="w-4 h-4 text-gray-500" />;
    }
  };

  const getRoleBadge = (role) => {
    const colors = {
      admin: 'bg-red-100 text-red-700',
      teacher: 'bg-blue-100 text-blue-700',
      student: 'bg-green-100 text-green-700'
    };
    
    return `px-2 py-1 rounded-full text-xs font-semibold ${colors[role] || 'bg-gray-100 text-gray-700'}`;
  };

  const getStatusBadge = (isActive, approvalStatus) => {
    if (!isActive) {
      return 'px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700';
    }
    if (approvalStatus === 'pending') {
      return 'px-2 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700';
    }
    return 'px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700';
  };

  const getStatusText = (isActive, approvalStatus) => {
    if (!isActive) return 'Disabled';
    if (approvalStatus === 'pending') return 'Pending';
    return 'Active';
  };

  const UserCard = ({ user }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 border border-gray-100"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
            {getRoleIcon(user.role)}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">
              {user.full_name}
            </h3>
            <p className="text-sm text-gray-600 flex items-center space-x-1">
              <Mail className="w-4 h-4" />
              <span>{user.email}</span>
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className={getRoleBadge(user.role)}>
            {user.role}
          </span>
          <span className={getStatusBadge(user.is_active, user.approval_status)}>
            {getStatusText(user.is_active, user.approval_status)}
          </span>
        </div>
      </div>

      <div className="space-y-2 mb-6">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Calendar className="w-4 h-4" />
          <span>Joined: {formatDate(user.created_at)}</span>
        </div>
        {user.approved_at && (
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <CheckCircle className="w-4 h-4" />
            <span>Approved: {formatDate(user.approved_at)}</span>
          </div>
        )}
      </div>

      <div className="flex items-center space-x-3">
        {user.role !== 'admin' && (
          <>
            {user.is_active ? (
              <button
                onClick={() => openActionModal(user, 'disable')}
                className="flex-1 px-4 py-2 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-colors flex items-center justify-center space-x-2"
              >
                <UserX className="w-4 h-4" />
                <span>Disable</span>
              </button>
            ) : (
              <button
                onClick={() => openActionModal(user, 'enable')}
                className="flex-1 px-4 py-2 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
              >
                <UserCheck className="w-4 h-4" />
                <span>Enable</span>
              </button>
            )}
          </>
        )}
        
        <button
          onClick={() => console.log('View user details:', user)}
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
            <h1 className="text-3xl font-bold text-gray-800 mb-2">User Management</h1>
            <p className="text-gray-600">
              Manage user accounts and permissions. {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''} found.
            </p>
          </div>
          
          <button
            onClick={fetchUsers}
            disabled={loading}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200 flex items-center space-x-2"
          >
            <Loader className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-400 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500"
              />
            </div>

            {/* Role Filter */}
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-400 focus:border-transparent transition-all duration-200 text-gray-900"
            >
              <option value="all">All Roles</option>
              <option value="student">Students</option>
              <option value="teacher">Teachers</option>
              <option value="admin">Admins</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-400 focus:border-transparent transition-all duration-200 text-gray-900"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Disabled</option>
            </select>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader className="w-8 h-8 text-red-500 animate-spin" />
            <span className="ml-3 text-gray-600">Loading users...</span>
          </div>
        ) : filteredUsers.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              No users found
            </h3>
            <p className="text-gray-500">
              Try adjusting your search or filter criteria
            </p>
          </motion.div>
        ) : (
          <div className="grid gap-6 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
            {filteredUsers.map((user, index) => (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <UserCard user={user} />
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Action Confirmation Modal */}
      <AnimatePresence>
        {showActionModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6"
            >
              <div className={`flex items-center justify-center w-12 h-12 rounded-full mx-auto mb-4 ${
                actionType === 'enable' ? 'bg-green-100' : 'bg-red-100'
              }`}>
                {actionType === 'enable' ? (
                  <UserCheck className="w-6 h-6 text-green-600" />
                ) : (
                  <UserX className="w-6 h-6 text-red-600" />
                )}
              </div>
              
              <h3 className="text-lg font-semibold text-gray-800 text-center mb-2">
                {actionType === 'enable' ? 'Enable User' : 'Disable User'}
              </h3>
              
              <p className="text-gray-600 text-center mb-6">
                {actionType === 'enable' 
                  ? `Enable "${selectedUser?.full_name}"? They will be able to access their account and receive an email notification.`
                  : `Disable "${selectedUser?.full_name}"? They will not be able to access their account and will receive an email notification.`
                }
              </p>
              
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => {
                    setShowActionModal(false);
                    setSelectedUser(null);
                  }}
                  className="flex-1 px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleToggleUserStatus(selectedUser.id, selectedUser.is_active)}
                  disabled={processing}
                  className={`flex-1 px-4 py-2 text-white font-semibold rounded-xl transition-colors flex items-center justify-center space-x-2 ${
                    actionType === 'enable' 
                      ? 'bg-green-600 hover:bg-green-700' 
                      : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  {processing ? (
                    <Loader className="w-4 h-4 animate-spin" />
                  ) : actionType === 'enable' ? (
                    <UserCheck className="w-4 h-4" />
                  ) : (
                    <UserX className="w-4 h-4" />
                  )}
                  <span>{actionType === 'enable' ? 'Enable' : 'Disable'}</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AdminDashboardLayout>
  );
};

export default UserManagement;
