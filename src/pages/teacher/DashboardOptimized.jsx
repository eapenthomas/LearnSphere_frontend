import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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
  Activity
} from 'lucide-react';

const DashboardOptimized = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    if (user?.id) {
      fetchDashboardData();
      
      // Set up auto-refresh every 30 seconds (less aggressive)
      const interval = setInterval(() => {
        fetchDashboardData(true); // Silent refresh
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchDashboardData = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      
      console.log('🚀 Fetching optimized dashboard data...');
      const startTime = Date.now();
      
      // Single API call to get all dashboard data
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/api/teacher/dashboard/stats/${user.id}`);
      
      if (response.ok) {
        const data = await response.json();
        setDashboardData(data.data);
        setLastUpdated(new Date());
        
        const loadTime = Date.now() - startTime;
        console.log(`✅ Dashboard loaded in ${loadTime}ms`);
      } else {
        throw new Error('Failed to fetch dashboard data');
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      if (!silent) {
        toast.error('Failed to load dashboard data');
      }
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const quickActions = [
    {
      title: 'Create Course',
      description: 'Add a new course',
      icon: BookOpen,
      color: 'from-blue-500 to-blue-600',
      link: '/teacher/courses/create'
    },
    {
      title: 'Create Assignment',
      description: 'Add new assignment',
      icon: ClipboardList,
      color: 'from-green-500 to-green-600',
      link: '/teacher/assignments'
    },
    {
      title: 'Create Quiz',
      description: 'Add new quiz',
      icon: FileText,
      color: 'from-purple-500 to-purple-600',
      link: '/teacher/quizzes'
    },
    {
      title: 'View Reports',
      description: 'Analytics & insights',
      icon: BarChart3,
      color: 'from-orange-500 to-orange-600',
      link: '/teacher/reports'
    }
  ];

  if (loading) {
    return (
      <TeacherDashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </TeacherDashboardLayout>
    );
  }

  const stats = dashboardData?.stats || {};
  const courses = dashboardData?.courses || [];
  const recentActivity = dashboardData?.recent_activity || [];

  return (
    <TeacherDashboardLayout>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Teacher Dashboard</h1>
            <p className="text-gray-600 mt-1">Welcome back, {user?.fullName}</p>
            {lastUpdated && (
              <p className="text-sm text-gray-500 mt-1">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </p>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-4 text-white shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Total Courses</p>
                <p className="text-3xl font-bold">{stats.total_courses || 0}</p>
              </div>
              <BookOpen className="w-8 h-8 text-blue-200" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Total Students</p>
                <p className="text-3xl font-bold">{stats.total_students || 0}</p>
              </div>
              <Users className="w-8 h-8 text-green-200" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Assignments</p>
                <p className="text-3xl font-bold">{stats.total_assignments || 0}</p>
              </div>
              <ClipboardList className="w-8 h-8 text-purple-200" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-6 text-white shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium">Pending Reviews</p>
                <p className="text-3xl font-bold">{stats.pending_submissions || 0}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-orange-200" />
            </div>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl shadow-lg p-6"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <Link
                key={action.title}
                to={action.link}
                className={`p-4 rounded-xl bg-gradient-to-r ${action.color} text-white hover:shadow-lg transition-all duration-300 hover:scale-105`}
              >
                <action.icon className="w-6 h-6 mb-2" />
                <h3 className="font-semibold">{action.title}</h3>
                <p className="text-sm opacity-90">{action.description}</p>
              </Link>
            ))}
          </div>
        </motion.div>

        {/* Recent Courses */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl shadow-lg p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Recent Courses</h2>
            <Link
              to="/teacher/courses"
              className="text-blue-600 hover:text-blue-700 font-medium flex items-center space-x-1"
            >
              <span>View All</span>
              <Eye className="w-4 h-4" />
            </Link>
          </div>
          
          <div className="space-y-4">
            {courses.length > 0 ? (
              courses.map((course, index) => (
                <div key={course.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{course.title}</h3>
                      <p className="text-sm text-gray-600">{course.enrollment_count || 0} students enrolled</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm text-gray-500">
                      {new Date(course.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <BookOpen className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No courses yet</p>
                <Link to="/teacher/courses/create" className="text-blue-600 hover:text-blue-700 font-medium">
                  Create your first course
                </Link>
              </div>
            )}
          </div>
        </motion.div>

        {/* Performance Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-2xl shadow-lg p-6"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-6">Performance Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-green-600">{stats.avg_quiz_score || 0}%</p>
              <p className="text-sm text-gray-600">Average Quiz Score</p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-blue-600">{stats.total_students || 0}</p>
              <p className="text-sm text-gray-600">Active Students</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <FileText className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-purple-600">{stats.total_quizzes || 0}</p>
              <p className="text-sm text-gray-600">Total Quizzes</p>
            </div>
          </div>
        </motion.div>
      </div>
    </TeacherDashboardLayout>
  );
};

export default DashboardOptimized;
