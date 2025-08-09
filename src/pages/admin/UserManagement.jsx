import { useState, useEffect } from 'react';
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
  XCircle,
  User,
  Crown,
  ToggleLeft,
  ToggleRight
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

    // Set up real-time subscription for user updates
    const subscription = adminOperations.subscribeToAdminUpdates((payload) => {
      console.log('Real-time user update:', payload);
      if (payload.table === 'profiles') {
        // Update the specific user in the list
        if (payload.eventType === 'UPDATE') {
          setUsers(prev => prev.map(u =>
            u.id === payload.new.id ? { ...u, ...payload.new } : u
          ));
        } else if (payload.eventType === 'INSERT') {
          // New user added, refresh the list
          fetchUsers();
        } else if (payload.eventType === 'DELETE') {
          // User deleted, remove from list
          setUsers(prev => prev.filter(u => u.id !== payload.old.id));
        }
      }
    });

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
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

    return `px-3 py-1.5 rounded-full text-xs font-semibold ${colors[role] || 'bg-gray-100 text-gray-700'}`;
  };

  const getStatusBadge = (isActive, approvalStatus) => {
    if (!isActive) {
      return 'px-3 py-1.5 rounded-full text-xs font-semibold bg-red-100 text-red-700';
    }
    if (approvalStatus === 'pending') {
      return 'px-3 py-1.5 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700';
    }
    return 'px-3 py-1.5 rounded-full text-xs font-semibold bg-green-100 text-green-700';
  };

  const getStatusText = (isActive, approvalStatus) => {
    if (!isActive) return 'Disabled';
    if (approvalStatus === 'pending') return 'Pending';
    return 'Active';
  };

  const UserCard = ({ user }) => (
    <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 group">
      <div className="flex items-start justify-between mb-6 gap-4">
        <div className="flex items-center space-x-4 flex-1 min-w-0">
          <div className="w-14 h-14 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full flex items-center justify-center shadow-lg flex-shrink-0">
            {getRoleIcon(user.role)}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-xl font-bold text-gray-800 mb-1 truncate">
              {user.full_name}
            </h3>
            <p className="text-sm text-gray-600 flex items-center space-x-2 truncate">
              <Mail className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">{user.email}</span>
            </p>
          </div>
        </div>

        <div className="flex flex-col items-end space-y-3 min-w-0 flex-shrink-0">
          <span className={`${getRoleBadge(user.role)} whitespace-nowrap`}>
            {user.role}
          </span>
          <span className={`${getStatusBadge(user.is_active, user.approval_status)} whitespace-nowrap`}>
            {user.is_active ? (
              <div className="flex items-center space-x-1">
                <ToggleRight className="w-3 h-3 flex-shrink-0" />
                <span>{getStatusText(user.is_active, user.approval_status)}</span>
              </div>
            ) : (
              <div className="flex items-center space-x-1">
                <ToggleLeft className="w-3 h-3 flex-shrink-0" />
                <span>{getStatusText(user.is_active, user.approval_status)}</span>
              </div>
            )}
          </span>
        </div>
      </div>

      <div className="space-y-3 mb-6 bg-gray-50 rounded-lg p-4">
        <div className="flex items-center space-x-3 text-sm text-gray-700">
          <div className="p-1 bg-blue-100 rounded">
            <Calendar className="w-4 h-4 text-blue-600" />
          </div>
          <span className="font-medium">Joined: {formatDate(user.created_at)}</span>
        </div>
        {user.approved_at && (
          <div className="flex items-center space-x-3 text-sm text-gray-700">
            <div className="p-1 bg-green-100 rounded">
              <CheckCircle className="w-4 h-4 text-green-600" />
            </div>
            <span className="font-medium">Approved: {formatDate(user.approved_at)}</span>
          </div>
        )}
      </div>

      <div className="flex items-center space-x-3">
        {user.role !== 'admin' && (
          <>
            {user.is_active ? (
              <button
                onClick={() => openActionModal(user, 'disable')}
                className="flex-1 bg-gradient-to-r from-rose-500 to-red-500 text-white font-semibold rounded-xl shadow-md hover:shadow-lg px-4 py-3 transition-all duration-300 hover:scale-105 flex items-center justify-center space-x-2"
              >
                <UserX className="w-4 h-4" />
                <span>Disable</span>
              </button>
            ) : (
              <button
                onClick={() => openActionModal(user, 'enable')}
                className="flex-1 bg-gradient-to-r from-emerald-500 to-green-500 text-white font-semibold rounded-xl shadow-md hover:shadow-lg px-4 py-3 transition-all duration-300 hover:scale-105 flex items-center justify-center space-x-2"
              >
                <UserCheck className="w-4 h-4" />
                <span>Enable</span>
              </button>
            )}
          </>
        )}

        <button
          onClick={() => console.log('View user details:', user)}
          className="px-4 py-3 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all duration-300 hover:scale-105"
        >
          <Eye className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  return (
    <AdminDashboardLayout>
      <div className="p-6 space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex items-center space-x-4 mb-4">
                <div className="p-3 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-xl">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">User Management</h1>
                  <p className="text-lg text-gray-600 font-medium">
                    Manage user accounts and permissions
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2 bg-blue-50 px-4 py-2 rounded-lg">
                  <Users className="w-5 h-5 text-blue-600" />
                  <span className="font-semibold text-blue-700">
                    {filteredUsers.length} User{filteredUsers.length !== 1 ? 's' : ''} Found
                  </span>
                </div>
                <div className="flex items-center space-x-2 bg-green-50 px-4 py-2 rounded-lg">
                  <UserCheck className="w-5 h-5 text-green-600" />
                  <span className="font-semibold text-green-700">
                    {filteredUsers.filter(u => u.is_active).length} Active
                  </span>
                </div>
                <div className="flex items-center space-x-2 bg-red-50 px-4 py-2 rounded-lg">
                  <UserX className="w-5 h-5 text-red-600" />
                  <span className="font-semibold text-red-700">
                    {filteredUsers.filter(u => !u.is_active).length} Disabled
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={fetchUsers}
              disabled={loading}
              className="mt-4 lg:mt-0 bg-gradient-to-r from-indigo-500 to-blue-500 text-white font-semibold rounded-xl shadow-md hover:shadow-lg px-6 py-3 transition-all duration-300 hover:scale-105 flex items-center space-x-2 disabled:opacity-50"
            >
              <Loader className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500"
              />
            </div>

            {/* Role Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all duration-200 text-gray-900 appearance-none bg-white"
              >
                <option value="all">All Roles</option>
                <option value="student">Students</option>
                <option value="teacher">Teachers</option>
                <option value="admin">Admins</option>
              </select>
            </div>

            {/* Status Filter */}
            <div className="relative">
              <Settings className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all duration-200 text-gray-900 appearance-none bg-white"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Disabled</option>
              </select>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
            <span>
              Showing {filteredUsers.length} of {users.length} users
            </span>
            <div className="flex items-center space-x-4">
              <span className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Active</span>
              </span>
              <span className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span>Disabled</span>
              </span>
            </div>
          </div>
        </motion.div>

        {/* Content */}
        {loading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-2xl shadow-lg p-12 text-center"
          >
            <Loader className="w-8 h-8 text-indigo-500 animate-spin mx-auto mb-4" />
            <span className="text-gray-600 font-medium">Loading users...</span>
          </motion.div>
        ) : filteredUsers.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-12 text-center"
          >
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Users className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">
              No users found
            </h3>
            <p className="text-gray-600 text-lg">
              Try adjusting your search or filter criteria
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setRoleFilter('all');
                setStatusFilter('all');
              }}
              className="mt-4 text-indigo-600 hover:text-indigo-700 font-medium"
            >
              Clear all filters
            </button>
          </motion.div>
        ) : (
          <div className="grid gap-6 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
            {filteredUsers.map((user, index) => (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
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
