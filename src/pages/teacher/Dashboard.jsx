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

const Dashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    if (user?.id) {
      fetchDashboardData();
      
      // Set up auto-refresh every 30 seconds
      const interval = setInterval(() => {
        fetchDashboardData(true);
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchDashboardData = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      
      console.log('Fetching dashboard data...');
      const startTime = Date.now();
      
      // Fetch data directly from Supabase
      const supabaseUrl = 'https://ffspaottcgyalpagbxvx.supabase.co';
      const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZmc3Bhb3R0Y2d5YWxwYWdieHZ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQyMDAyNzQsImV4cCI6MjA2OTc3NjI3NH0.eFhKNCnQtQz3WX4Rtz3Z0-51HFXL50b8iDFtszitVVE';
      
      // Fetch courses for this teacher
      const coursesResponse = await fetch(`${supabaseUrl}/rest/v1/courses?teacher_id=eq.${user.id}&select=*`, {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
        },
      });
      
      const courses = await coursesResponse.json();
      
      // Fetch enrollments for teacher's courses
      const courseIds = courses.map(course => course.id);
      const enrollmentsResponse = await fetch(`${supabaseUrl}/rest/v1/enrollments?course_id=in.(${courseIds.join(',')})&select=*`, {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
        },
      });
      
      const enrollments = await enrollmentsResponse.json();
      
      // Fetch assignments
      const assignmentsResponse = await fetch(`${supabaseUrl}/rest/v1/assignments?teacher_id=eq.${user.id}&select=*`, {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
        },
      });
      
      const assignments = await assignmentsResponse.json();
      
      // Fetch quizzes
      const quizzesResponse = await fetch(`${supabaseUrl}/rest/v1/quizzes?teacher_id=eq.${user.id}&select=*`, {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
        },
      });
      
      const quizzes = await quizzesResponse.json();
      
      // Calculate stats
      const totalStudents = enrollments.length;
      const activeAssignments = assignments.filter(a => a.status === 'active').length;
      const pendingQuizzes = quizzes.filter(q => q.status === 'draft').length;
      
      const data = {
        stats: {
          total_courses: courses.length,
          total_students: totalStudents,
          active_assignments: activeAssignments,
          pending_quizzes: pendingQuizzes,
        },
        courses: courses.slice(0, 6),
        recent_activity: [
          {
            message: `Created ${courses.length} courses`,
            time: 'Recently'
          },
          {
            message: `${totalStudents} students enrolled`,
            time: 'Recently'
          }
        ]
      };
      
      console.log('Dashboard data received:', data);
      
      setDashboardData(data);
      setLastUpdated(new Date());
      
      const endTime = Date.now();
      console.log(`Dashboard data fetched in ${endTime - startTime}ms`);
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      if (!silent) {
        toast.error('Failed to load dashboard data');
      }
    } finally {
      if (!silent) setLoading(false);
    }
  };

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
      <div className="space-y-3">
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-3 text-white shadow-lg"
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
            className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-3 text-white shadow-lg"
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
            className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl p-3 text-white shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Active Assignments</p>
                <p className="text-3xl font-bold">{stats.active_assignments || 0}</p>
              </div>
              <ClipboardList className="w-8 h-8 text-purple-200" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-3 text-white shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium">Pending Quizzes</p>
                <p className="text-3xl font-bold">{stats.pending_quizzes || 0}</p>
              </div>
              <FileText className="w-8 h-8 text-orange-200" />
            </div>
          </motion.div>
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
