import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext.jsx';
import AdminDashboardLayout from '../../layouts/AdminDashboardLayout.jsx';
import { adminOperations } from '../../utils/supabaseClient.js';
import { toast } from 'react-hot-toast';
import {
  Users,
  UserCheck,
  BookOpen,
  GraduationCap,
  AlertTriangle,
  TrendingUp,
  Activity,
  Clock,
  CheckCircle,
  XCircle,
  Mail,
  Shield,
  BarChart3
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch dashboard statistics
      const dashboardStats = await adminOperations.getDashboardStats();
      setStats(dashboardStats);
      
      // Fetch recent activity
      const activity = await adminOperations.getUserActivityLogs(10);
      setRecentActivity(activity);
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Active Students',
      value: stats?.active_students || 0,
      icon: Users,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700'
    },
    {
      title: 'Active Teachers',
      value: stats?.active_teachers || 0,
      icon: UserCheck,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      textColor: 'text-green-700'
    },
    {
      title: 'Pending Approvals',
      value: stats?.pending_approvals || 0,
      icon: AlertTriangle,
      color: 'from-yellow-500 to-yellow-600',
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-700'
    },
    {
      title: 'Active Courses',
      value: stats?.active_courses || 0,
      icon: BookOpen,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-700'
    },
    {
      title: 'Total Enrollments',
      value: stats?.total_enrollments || 0,
      icon: GraduationCap,
      color: 'from-indigo-500 to-indigo-600',
      bgColor: 'bg-indigo-50',
      textColor: 'text-indigo-700'
    },
    {
      title: 'Disabled Users',
      value: stats?.disabled_users || 0,
      icon: XCircle,
      color: 'from-red-500 to-red-600',
      bgColor: 'bg-red-50',
      textColor: 'text-red-700'
    }
  ];

  // Sample data for charts
  const userGrowthData = [
    { name: 'Jan', students: 45, teachers: 8 },
    { name: 'Feb', students: 52, teachers: 12 },
    { name: 'Mar', students: 68, teachers: 15 },
    { name: 'Apr', students: 78, teachers: 18 },
    { name: 'May', students: 89, teachers: 22 },
    { name: 'Jun', students: 95, teachers: 25 }
  ];

  const userDistributionData = [
    { name: 'Students', value: stats?.active_students || 0, color: '#3b82f6' },
    { name: 'Teachers', value: stats?.active_teachers || 0, color: '#10b981' },
    { name: 'Disabled', value: stats?.disabled_users || 0, color: '#ef4444' }
  ];

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getActivityIcon = (action) => {
    switch (action) {
      case 'user_enabled':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'user_disabled':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'teacher_approved':
        return <UserCheck className="w-4 h-4 text-blue-500" />;
      case 'teacher_rejected':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      default:
        return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const username = user?.fullName?.split(' ')[0] || 'Admin';

  return (
    <AdminDashboardLayout>
      <div className="p-6 space-y-6">
        {/* Welcome Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-red-500 to-red-600 p-6 text-white"
        >
          <div className="absolute inset-0 bg-white/10"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl md:text-3xl font-extrabold mb-2 tracking-tight">
                  Welcome back, {username}! 🛡️
                </h1>
                <p className="text-base text-white/90 mb-4 font-medium">
                  Monitor and manage the LearnSphere platform. Keep everything running smoothly!
                </p>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Users className="w-5 h-5" />
                    <span className="font-semibold">{(stats?.active_students || 0) + (stats?.active_teachers || 0)} Total Users</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="w-5 h-5" />
                    <span className="font-semibold">{stats?.pending_approvals || 0} Pending Approvals</span>
                  </div>
                </div>
              </div>
              <div className="hidden md:block">
                <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center">
                  <Shield className="w-12 h-12 text-white" />
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {statCards.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 ${stat.bgColor} rounded-xl group-hover:scale-110 transition-transform duration-300`}>
                  <stat.icon className={`w-6 h-6 ${stat.textColor}`} />
                </div>
                {stat.title === 'Pending Approvals' && stat.value > 0 && (
                  <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full">
                    Action Required
                  </span>
                )}
              </div>
              <h3 className="text-2xl font-extrabold text-gray-800 mb-1">{stat.value}</h3>
              <p className="text-sm text-gray-600 font-medium">{stat.title}</p>
            </motion.div>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* User Growth Chart */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-extrabold text-gray-800">User Growth</h2>
              <TrendingUp className="w-5 h-5 text-gray-400" />
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={userGrowthData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: 'none',
                      borderRadius: '12px',
                      boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="students"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    dot={{ fill: '#3b82f6', strokeWidth: 2, r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="teachers"
                    stroke="#10b981"
                    strokeWidth={3}
                    dot={{ fill: '#10b981', strokeWidth: 2, r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* User Distribution Chart */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-extrabold text-gray-800">User Distribution</h2>
              <BarChart3 className="w-5 h-5 text-gray-400" />
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={userDistributionData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {userDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-extrabold text-gray-800">Recent Activity</h2>
            <Activity className="w-5 h-5 text-gray-400" />
          </div>
          
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
            </div>
          ) : recentActivity.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Activity className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No recent activity</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <div className="flex-shrink-0">
                    {getActivityIcon(activity.action)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {activity.profiles?.full_name || 'Unknown User'}
                    </p>
                    <p className="text-sm text-gray-500 capitalize">
                      {activity.action.replace('_', ' ')} • {activity.profiles?.role}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <p className="text-xs text-gray-400">
                      {formatDate(activity.created_at)}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300"
        >
          <h2 className="text-xl font-extrabold text-gray-800 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <button
              onClick={() => window.location.href = '/admin/approvals'}
              className="p-4 bg-yellow-50 hover:bg-yellow-100 rounded-xl border border-yellow-200 transition-colors group"
            >
              <UserCheck className="w-8 h-8 text-yellow-600 mb-2 group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold text-yellow-800">Review Approvals</h3>
              <p className="text-sm text-yellow-600">{stats?.pending_approvals || 0} pending</p>
            </button>
            
            <button
              onClick={() => window.location.href = '/admin/users'}
              className="p-4 bg-blue-50 hover:bg-blue-100 rounded-xl border border-blue-200 transition-colors group"
            >
              <Users className="w-8 h-8 text-blue-600 mb-2 group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold text-blue-800">Manage Users</h3>
              <p className="text-sm text-blue-600">Enable/disable accounts</p>
            </button>
            
            <button
              onClick={() => window.location.href = '/admin/activity'}
              className="p-4 bg-green-50 hover:bg-green-100 rounded-xl border border-green-200 transition-colors group"
            >
              <Activity className="w-8 h-8 text-green-600 mb-2 group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold text-green-800">View Activity</h3>
              <p className="text-sm text-green-600">Monitor system logs</p>
            </button>
            
            <button
              onClick={() => window.location.href = '/admin/emails'}
              className="p-4 bg-purple-50 hover:bg-purple-100 rounded-xl border border-purple-200 transition-colors group"
            >
              <Mail className="w-8 h-8 text-purple-600 mb-2 group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold text-purple-800">Email Logs</h3>
              <p className="text-sm text-purple-600">Check notifications</p>
            </button>
          </div>
        </motion.div>
      </div>
    </AdminDashboardLayout>
  );
};

export default AdminDashboard;
