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
  UserCheck,
  Trophy,
  Sparkles,
  LineChart
} from 'lucide-react';

// Import chart components
import {
  LineChart as RechartsLineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const Dashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [realTimeMode, setRealTimeMode] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState('connected');
  const [selectedTimeRange, setSelectedTimeRange] = useState('7d');

  useEffect(() => {
    if (user?.id) {
      fetchDashboardData();
      
      // Set up auto-refresh every 30 seconds for real-time updates
      const interval = setInterval(() => {
        if (realTimeMode) {
          fetchDashboardData(true);
        }
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [user, realTimeMode, selectedTimeRange]);

  const fetchDashboardData = async (silent = false) => {
    try {
      if (!silent) {
        setLoading(true);
        setIsRefreshing(true);
      }
      
      console.log('🔄 Fetching enhanced teacher dashboard data with batch queries...');
      setConnectionStatus('connecting');
      
      const teacherId = user?.id || localStorage.getItem('userId') || 'default-teacher-id';
      
      // Use a single optimized API endpoint that fetches all data in batch
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/api/teacher/dashboard/batch/${teacherId}?timeRange=${selectedTimeRange}`, 
        {
          headers: { 
            'Cache-Control': 'no-cache', 
            'Pragma': 'no-cache',
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Batch dashboard data loaded:', data);
        console.log('📊 Stats from API:', data.stats);
        console.log('📈 Enrollment trends from API:', data.enrollment_trends);
        console.log('📊 Course performance from API:', data.course_performance);
        
        // Transform the batch API response
        const transformedData = {
          stats: data.stats || {
            total_courses: 0,
            total_students: 0,
            active_assignments: 0,
            pending_quizzes: 0,
          },
          analytics: data.analytics || {
            totalStudents: 0,
            activeCourses: 0,
            totalAssignments: 0,
            averageGrade: 0,
            enrollmentTrends: [],
            coursePerformanceData: [],
            recentActivity: []
          },
          courses: data.courses || [],
          recent_activity: data.recent_activity || [],
          enrollment_trends: data.enrollment_trends || [],
          course_performance: data.course_performance || []
        };
        
        setDashboardData(transformedData);
        setLastUpdated(new Date());
        setConnectionStatus('connected');
        
        if (!silent) {
          toast.success('Dashboard updated with latest analytics', {
            icon: '📊',
            duration: 2000
          });
        }
      } else {
        // Fallback to individual API calls if batch endpoint doesn't exist
        console.log('Batch endpoint not available, using individual calls...');
        await fetchIndividualAPIs(teacherId, silent);
      }
      
    } catch (error) {
      console.error('❌ Error fetching enhanced dashboard data:', error);
      setConnectionStatus('error');
      
      if (!silent) {
        toast.error('Failed to load dashboard analytics', {
          icon: '⚠️',
          duration: 3000
        });
      }
      
      // Set comprehensive fallback data
      setDashboardData({
        stats: { total_courses: 0, total_students: 0, active_assignments: 0, pending_quizzes: 0 },
        analytics: { totalStudents: 0, activeCourses: 0, totalAssignments: 0, averageGrade: 0, enrollmentTrends: [], coursePerformanceData: [], recentActivity: [] },
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

  const fetchIndividualAPIs = async (teacherId, silent) => {
    try {
      // Fetch data from multiple endpoints in parallel for better performance
      const [statsResponse, analyticsResponse] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/api/teacher/dashboard/stats/${teacherId}`, {
          headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' }
        }),
        fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/api/teacher/analytics/${teacherId}`, {
          headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' }
        })
      ]);
      
      if (statsResponse.ok && analyticsResponse.ok) {
        const [statsData, analyticsData] = await Promise.all([
          statsResponse.json(),
          analyticsResponse.json()
        ]);
        
        console.log('✅ Individual API data loaded:', { statsData, analyticsData });
        
        // Transform and combine data
        const transformedData = {
          stats: statsData.data?.stats || {
            total_courses: 0,
            total_students: 0,
            active_assignments: 0,
            pending_quizzes: 0,
          },
          analytics: analyticsData || {
            totalStudents: 0,
            activeCourses: 0,
            totalAssignments: 0,
            averageGrade: 0,
            enrollmentTrends: [],
            coursePerformanceData: [],
            recentActivity: []
          },
          courses: statsData.data?.courses || [],
          recent_activity: statsData.data?.recent_activity || [],
          enrollment_trends: statsData.data?.enrollment_trends || [],
          course_performance: statsData.data?.course_performance || []
        };
        
        setDashboardData(transformedData);
        setLastUpdated(new Date());
        setConnectionStatus('connected');
        
        if (!silent) {
          toast.success('Dashboard updated with latest analytics', {
            icon: '📊',
            duration: 2000
          });
        }
      } else {
        throw new Error(`API error: ${statsResponse.status}`);
      }
    } catch (error) {
      console.error('❌ Error in individual API calls:', error);
      throw error;
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
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading Analytics Dashboard</h3>
            <p className="text-gray-600">Fetching comprehensive teaching insights...</p>
          </motion.div>
        </div>
      </TeacherDashboardLayout>
    );
  }

  const stats = dashboardData?.stats || {};
  const analytics = dashboardData?.analytics || {};
  const recentActivity = dashboardData?.recent_activity || [];
  const enrollmentTrends = dashboardData?.enrollment_trends || analytics.enrollmentTrends || [];
  const coursePerformance = dashboardData?.course_performance || analytics.coursePerformanceData || [];

  // Chart data preparation with proper fallbacks
  const enrollmentChartData = enrollmentTrends.length > 0 ? enrollmentTrends.map((trend, index) => ({
    name: trend.date || trend.name || `Day ${index + 1}`,
    enrollments: trend.enrollments || 0,
    activeStudents: trend.activeStudents || trend.active_students || 0,
    completionRate: Math.round((trend.activeStudents || trend.active_students || 0) / Math.max(trend.enrollments || 1, 1) * 100)
  })) : [
    { name: 'Mon', enrollments: 0, activeStudents: 0, completionRate: 0 },
    { name: 'Tue', enrollments: 0, activeStudents: 0, completionRate: 0 },
    { name: 'Wed', enrollments: 0, activeStudents: 0, completionRate: 0 },
    { name: 'Thu', enrollments: 0, activeStudents: 0, completionRate: 0 },
    { name: 'Fri', enrollments: 0, activeStudents: 0, completionRate: 0 },
    { name: 'Sat', enrollments: 0, activeStudents: 0, completionRate: 0 },
    { name: 'Sun', enrollments: 0, activeStudents: 0, completionRate: 0 }
  ];

  const performanceChartData = coursePerformance.length > 0 ? coursePerformance.map((course, index) => {
    const courseName = course.course_title || course.course || `Course ${index + 1}`;
    const students = Number(course.students || course.enrollment_count || 0);
    const avgScore = Number(course.avgScore || course.completion_rate || 0);
    
    return {
      name: courseName.length > 15 ? courseName.substring(0, 15) + '...' : courseName,
      students: students,
      avgScore: avgScore,
      grade: avgScore >= 90 ? 'A' : avgScore >= 80 ? 'B' : avgScore >= 70 ? 'C' : 'D'
    };
  }) : [
    { name: 'No Courses', students: 0, avgScore: 0, grade: 'N/A' }
  ];

  // Debug logging
  console.log('🔍 Dashboard Debug Info:');
  console.log('📊 Stats:', stats);
  console.log('📈 Enrollment trends raw:', enrollmentTrends);
  console.log('📈 Enrollment chart data:', enrollmentChartData);
  console.log('📊 Course performance raw:', coursePerformance);
  console.log('📊 Performance chart data:', performanceChartData);
  console.log('🔍 Raw dashboard data:', dashboardData);
  
  // Validate data and show warnings
  if (stats.total_courses === 0) {
    console.warn('⚠️ No courses found for teacher');
  }
  if (enrollmentTrends.length === 0) {
    console.warn('⚠️ No enrollment trends data');
  }
  if (coursePerformance.length === 0) {
    console.warn('⚠️ No course performance data');
  }


  return (
    <TeacherDashboardLayout>
      <div className="space-y-8">
        {/* Enhanced Professional Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-3xl shadow-2xl p-8 text-white relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-6 lg:space-y-0">
              <div className="flex items-center space-x-6">
                <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm">
                  <BarChart3 className="w-10 h-10" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold mb-2">Analytics Dashboard</h1>
                  <p className="text-indigo-100 text-lg">Welcome back, {user?.name || 'Teacher'}!</p>
                  {lastUpdated && (
                    <p className="text-sm text-indigo-200 mt-2 flex items-center">
                      <Clock className="w-4 h-4 mr-2" />
                      Last updated: {lastUpdated.toLocaleTimeString()}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                {/* Time Range Selector */}
                <div className="flex items-center space-x-2 bg-white/20 rounded-lg p-2">
                  {['7d', '30d', '90d'].map((range) => (
                    <button
                      key={range}
                      onClick={() => setSelectedTimeRange(range)}
                      className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${
                        selectedTimeRange === range
                          ? 'bg-white text-indigo-600'
                          : 'text-white hover:bg-white/20'
                      }`}
                    >
                      {range}
                    </button>
                  ))}
                </div>
                
                {/* Connection Status */}
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${
                    connectionStatus === 'connected' ? 'bg-green-400' :
                    connectionStatus === 'connecting' ? 'bg-yellow-400 animate-pulse' :
                    'bg-red-400'
                  }`}></div>
                  <span className="text-sm font-medium">
                    {connectionStatus === 'connected' ? 'Live Data' :
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
          </div>
        </motion.div>

        {/* Enhanced Stats Cards with Animations */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -4, scale: 1.02 }}
            className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-10 translate-x-10"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium mb-1">Total Courses</p>
                  <p className="text-4xl font-bold">{stats.total_courses || 0}</p>
                  <div className="flex items-center mt-2">
                    <TrendingUp className="w-4 h-4 text-blue-200 mr-1" />
                    <span className="text-xs text-blue-200">Active</span>
                  </div>
                </div>
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                  <BookOpen className="w-8 h-8 text-blue-200" />
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            whileHover={{ y: -4, scale: 1.02 }}
            className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-10 translate-x-10"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-100 text-sm font-medium mb-1">Total Students</p>
                  <p className="text-4xl font-bold">{stats.total_students || 0}</p>
                  <div className="flex items-center mt-2">
                    <UserCheck className="w-4 h-4 text-emerald-200 mr-1" />
                    <span className="text-xs text-emerald-200">Enrolled</span>
                  </div>
                </div>
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                  <Users className="w-8 h-8 text-emerald-200" />
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            whileHover={{ y: -4, scale: 1.02 }}
            className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-10 translate-x-10"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium mb-1">Assignments</p>
                  <p className="text-4xl font-bold">{stats.active_assignments || 0}</p>
                  <div className="flex items-center mt-2">
                    <Target className="w-4 h-4 text-purple-200 mr-1" />
                    <span className="text-xs text-purple-200">Active</span>
                  </div>
                </div>
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                  <ClipboardList className="w-8 h-8 text-purple-200" />
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            whileHover={{ y: -4, scale: 1.02 }}
            className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-10 translate-x-10"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-medium mb-1">Avg Grade</p>
                  <p className="text-4xl font-bold">{analytics.averageGrade || 0}%</p>
                  <div className="flex items-center mt-2">
                    <Award className="w-4 h-4 text-orange-200 mr-1" />
                    <span className="text-xs text-orange-200">Overall</span>
                  </div>
                </div>
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                  <Trophy className="w-8 h-8 text-orange-200" />
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Interactive Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Enrollment Trends Chart */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <LineChart className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Enrollment Trends</h3>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span>Enrollments</span>
                <div className="w-3 h-3 bg-green-500 rounded-full ml-4"></div>
                <span>Active Students</span>
              </div>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={enrollmentChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" stroke="#666" />
                  <YAxis stroke="#666" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e5e7eb', 
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }} 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="enrollments" 
                    stackId="1" 
                    stroke="#3B82F6" 
                    fill="#3B82F6" 
                    fillOpacity={0.6}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="activeStudents" 
                    stackId="2" 
                    stroke="#10B981" 
                    fill="#10B981" 
                    fillOpacity={0.6}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Course Performance Chart */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <BarChart3 className="w-5 h-5 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Course Performance</h3>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <span>Students</span>
                <div className="w-3 h-3 bg-orange-500 rounded-full ml-4"></div>
                <span>Avg Score</span>
              </div>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={performanceChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" stroke="#666" />
                  <YAxis yAxisId="left" stroke="#666" />
                  <YAxis yAxisId="right" orientation="right" stroke="#666" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e5e7eb', 
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }} 
                  />
                  <Bar yAxisId="left" dataKey="students" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                  <Bar yAxisId="right" dataKey="avgScore" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>


        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8"
        >
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Quick Actions</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -4, scale: 1.02 }}
              className="group"
            >
              <Link
                to="/teacher/courses/create"
                className="block p-6 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl text-white hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <div className="flex items-center space-x-4">
                  <BookOpen className="w-8 h-8" />
                  <div>
                    <h3 className="font-bold text-lg">Create Course</h3>
                    <p className="text-blue-100 text-sm">Add new course</p>
                  </div>
                </div>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              whileHover={{ y: -4, scale: 1.02 }}
              className="group"
            >
              <Link
                to="/teacher/assignments"
                className="block p-6 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl text-white hover:from-emerald-600 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <div className="flex items-center space-x-4">
                  <ClipboardList className="w-8 h-8" />
                  <div>
                    <h3 className="font-bold text-lg">Create Assignment</h3>
                    <p className="text-emerald-100 text-sm">Add new assignment</p>
                  </div>
                </div>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              whileHover={{ y: -4, scale: 1.02 }}
              className="group"
            >
              <Link
                to="/teacher/quizzes"
                className="block p-6 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl text-white hover:from-purple-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <div className="flex items-center space-x-4">
                  <FileText className="w-8 h-8" />
                  <div>
                    <h3 className="font-bold text-lg">Create Quiz</h3>
                    <p className="text-purple-100 text-sm">Add new quiz</p>
                  </div>
                </div>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              whileHover={{ y: -4, scale: 1.02 }}
              className="group"
            >
              <Link
                to="/teacher/reports"
                className="block p-6 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl text-white hover:from-orange-600 hover:to-orange-700 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <div className="flex items-center space-x-4">
                  <BarChart3 className="w-8 h-8" />
                  <div>
                    <h3 className="font-bold text-lg">View Reports</h3>
                    <p className="text-orange-100 text-sm">Analytics & insights</p>
                  </div>
                </div>
              </Link>
            </motion.div>
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6"
        >
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-green-100 rounded-lg">
              <Activity className="w-5 h-5 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
          </div>
          
          <div className="space-y-4">
            {recentActivity.slice(0, 6).map((activity, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center space-x-4 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl hover:from-gray-100 hover:to-gray-200 transition-all duration-200"
              >
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <Activity className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900">{activity.message}</p>
                  <p className="text-xs text-gray-500 flex items-center">
                    <Clock className="w-3 h-3 mr-1" />
                    {activity.time}
                  </p>
                </div>
                <div className="text-right">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </TeacherDashboardLayout>
  );
};

export default Dashboard;