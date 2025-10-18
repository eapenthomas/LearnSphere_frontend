import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';
import TeacherDashboardLayout from '../../layouts/TeacherDashboardLayout.jsx';
import { toast } from 'react-hot-toast';
import {
  BookOpen,
  Users,
  FileText,
  ClipboardList,
  TrendingUp,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle,
  Star,
  BarChart3,
  Plus,
  Eye,
  Activity,
  RefreshCw,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  Target,
  Award,
  Clock3,
  UserCheck
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [realTimeMode, setRealTimeMode] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState('connected');

  useEffect(() => {
    if (user?.id) {
      fetchDashboardData();
      
      // Set up auto-refresh every 15 seconds for real-time updates
      const interval = setInterval(() => {
        if (realTimeMode) {
          fetchDashboardData(true);
        }
      }, 15000);

      return () => clearInterval(interval);
    }
  }, [user, realTimeMode]);

  const fetchDashboardData = async (silent = false) => {
    try {
      if (!silent) {
        setLoading(true);
        setIsRefreshing(true);
      }
      
      console.log('🔄 Fetching real-time teacher dashboard data...');
      setConnectionStatus('connecting');
      
      // Get teacher ID from auth context or localStorage
      const teacherId = user?.id || localStorage.getItem('userId') || 'default-teacher-id';
      
      // Fetch data from the optimized dashboard API
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/api/teacher/dashboard/stats/${teacherId}`,
        {
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Real-time dashboard data loaded:', data);
        
        // Transform the API response to match expected format
        const transformedData = {
          stats: data.data?.stats || {
            total_courses: 0,
            total_students: 0,
            active_assignments: 0,
            pending_quizzes: 0,
          },
          courses: data.data?.courses || [],
          recent_activity: data.data?.recent_activity || [],
          enrollment_trends: data.data?.enrollment_trends || [],
          course_performance: data.data?.course_performance || []
        };
        
        setDashboardData(transformedData);
        setLastUpdated(new Date());
        setConnectionStatus('connected');
        
        if (!silent) {
          toast.success('Dashboard updated with latest data', {
            icon: '🔄',
            duration: 2000
          });
        }
      } else {
        throw new Error(`API error: ${response.status}`);
      }
      
    } catch (error) {
      console.error('❌ Error fetching real-time dashboard data:', error);
      setConnectionStatus('error');
      
      if (!silent) {
        toast.error('Failed to load dashboard data', {
          icon: '⚠️',
          duration: 3000
        });
      }
      
      // Set minimal fallback data even on error
      setDashboardData({
        stats: {
          total_courses: 0,
          total_students: 0,
          active_assignments: 0,
          pending_quizzes: 0,
        },
        courses: [],
        recent_activity: [],
        enrollment_trends: [],
        course_performance: []
      });
    } finally {
      if (!silent) {
        setLoading(false);
        setIsRefreshing(false);
      }
    }
  };

  if (loading) {
    return (
      <TeacherDashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="relative">
              <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading Dashboard</h3>
            <p className="text-gray-600">Fetching your latest teaching data...</p>
          </motion.div>
        </div>
      </TeacherDashboardLayout>
    );
  }

  const stats = dashboardData?.stats || {};
  const courses = dashboardData?.courses || [];
  const recentActivity = dashboardData?.recent_activity || [];

  return (
    <TeacherDashboardLayout>
      <div className="space-y-6">
        {/* Professional Header with Real-time Controls */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-lg p-6 text-white"
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <BarChart3 className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Teacher Dashboard</h1>
                <p className="text-blue-100">Welcome back, {user?.name || 'Teacher'}!</p>
                {lastUpdated && (
                  <p className="text-sm text-blue-200 mt-1">
                    Last updated: {lastUpdated.toLocaleTimeString()}
                  </p>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {/* Connection Status */}
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${
                  connectionStatus === 'connected' ? 'bg-green-400' :
                  connectionStatus === 'connecting' ? 'bg-yellow-400 animate-pulse' :
                  'bg-red-400'
                }`}></div>
                <span className="text-sm font-medium">
                  {connectionStatus === 'connected' ? 'Live' :
                   connectionStatus === 'connecting' ? 'Connecting...' :
                   'Offline'}
                </span>
              </div>
              
              {/* Real-time Toggle */}
              <button
                onClick={() => setRealTimeMode(!realTimeMode)}
                className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                  realTimeMode
                    ? 'bg-green-500 hover:bg-green-600 text-white'
                    : 'bg-white/20 hover:bg-white/30 text-white'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Zap className={`w-4 h-4 ${realTimeMode ? 'animate-pulse' : ''}`} />
                  <span className="text-sm font-medium">
                    {realTimeMode ? 'Live' : 'Manual'}
                  </span>
                </div>
              </button>
              
              {/* Refresh Button */}
              <button
                onClick={() => fetchDashboardData()}
                disabled={isRefreshing}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-all duration-200 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -2, scale: 1.02 }}
            className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium mb-1">Total Courses</p>
                <p className="text-3xl font-bold">{stats.total_courses || 0}</p>
                <div className="flex items-center mt-2">
                  <TrendingUp className="w-4 h-4 text-blue-200 mr-1" />
                  <span className="text-xs text-blue-200">Active</span>
                </div>
              </div>
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <BookOpen className="w-8 h-8 text-blue-200" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            whileHover={{ y: -2, scale: 1.02 }}
            className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium mb-1">Total Students</p>
                <p className="text-3xl font-bold">{stats.total_students || 0}</p>
                <div className="flex items-center mt-2">
                  <UserCheck className="w-4 h-4 text-green-200 mr-1" />
                  <span className="text-xs text-green-200">Enrolled</span>
                </div>
              </div>
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <Users className="w-8 h-8 text-green-200" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            whileHover={{ y: -2, scale: 1.02 }}
            className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium mb-1">Assignments</p>
                <p className="text-3xl font-bold">{stats.active_assignments || 0}</p>
                <div className="flex items-center mt-2">
                  <Target className="w-4 h-4 text-purple-200 mr-1" />
                  <span className="text-xs text-purple-200">Active</span>
                </div>
              </div>
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <ClipboardList className="w-8 h-8 text-purple-200" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            whileHover={{ y: -2, scale: 1.02 }}
            className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium mb-1">Pending Quizzes</p>
                <p className="text-3xl font-bold">{stats.pending_quizzes || 0}</p>
                <div className="flex items-center mt-2">
                  <Clock3 className="w-4 h-4 text-orange-200 mr-1" />
                  <span className="text-xs text-orange-200">Awaiting</span>
                </div>
              </div>
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <FileText className="w-8 h-8 text-orange-200" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -2 }}
              className="group"
            >
              <Link
                to="/teacher/courses/create"
                className="block p-4 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg text-white hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <div className="flex items-center space-x-3">
                  <BookOpen className="w-6 h-6" />
                  <div>
                    <h3 className="font-semibold">Create Course</h3>
                    <p className="text-blue-100 text-sm">Add new course</p>
                  </div>
                </div>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              whileHover={{ y: -2 }}
              className="group"
            >
              <Link
                to="/teacher/assignments"
                className="block p-4 bg-gradient-to-r from-green-500 to-green-600 rounded-lg text-white hover:from-green-600 hover:to-green-700 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <div className="flex items-center space-x-3">
                  <ClipboardList className="w-6 h-6" />
                  <div>
                    <h3 className="font-semibold">Create Assignment</h3>
                    <p className="text-green-100 text-sm">Add new assignment</p>
                  </div>
                </div>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              whileHover={{ y: -2 }}
              className="group"
            >
              <Link
                to="/teacher/quizzes"
                className="block p-4 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg text-white hover:from-purple-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <div className="flex items-center space-x-3">
                  <FileText className="w-6 h-6" />
                  <div>
                    <h3 className="font-semibold">Create Quiz</h3>
                    <p className="text-purple-100 text-sm">Add new quiz</p>
                  </div>
                </div>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              whileHover={{ y: -2 }}
              className="group"
            >
              <Link
                to="/teacher/reports"
                className="block p-4 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg text-white hover:from-orange-600 hover:to-orange-700 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <div className="flex items-center space-x-3">
                  <BarChart3 className="w-6 h-6" />
                  <div>
                    <h3 className="font-semibold">View Reports</h3>
                    <p className="text-orange-100 text-sm">Analytics & insights</p>
                  </div>
                </div>
              </Link>
            </motion.div>
          </div>
        </div>

        {/* Recent Courses */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Recent Courses</h2>
            <Link
              to="/teacher/courses"
              className="text-blue-600 hover:text-blue-700 font-medium flex items-center space-x-1"
            >
              <span>View All</span>
              <Eye className="w-4 h-4" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {courses.slice(0, 6).map((course, index) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-900 truncate">{course.title}</h3>
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                    {course.students_enrolled} students
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{course.description}</p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Created {new Date(course.created_at).toLocaleDateString()}</span>
                  <Link
                    to={`/teacher/courses/${course.id}`}
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    View Details
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
          
          <div className="space-y-3">
            {recentActivity.slice(0, 5).map((activity, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
              >
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Activity className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </TeacherDashboardLayout>
  );
};

export default Dashboard;
