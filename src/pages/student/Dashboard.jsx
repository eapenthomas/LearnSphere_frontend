import React, { useState, useEffect } from "react";
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';
import DashboardLayout from '../../components/DashboardLayout.jsx';
import Button from '../../components/Button.jsx';
import {
  BookOpen,
  Calendar,
  TrendingUp,
  Award,
  Clock,
  Play,
  CheckCircle,
  Star,
  ArrowRight,
  Users,
  Target,
  Zap
} from 'lucide-react';

const StudentDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Real-time state management
  const [stats, setStats] = useState([
    {
      title: 'Enrolled Courses',
      value: '0',
      change: 'Loading...',
      icon: BookOpen,
      color: 'from-blue-500 to-blue-600'
    },
    {
      title: 'Completed Assignments',
      value: '0',
      change: 'Loading...',
      icon: CheckCircle,
      color: 'from-green-500 to-green-600'
    },
    {
      title: 'Quiz Average',
      value: '0%',
      change: 'Loading...',
      icon: Target,
      color: 'from-purple-500 to-purple-600'
    }
  ]);

  const [loading, setLoading] = useState(true);
  const [recentCourses, setRecentCourses] = useState([]);
  const [upcomingAssignments, setUpcomingAssignments] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [cachedData, setCachedData] = useState({});
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Fetch real-time data
  useEffect(() => {
    if (user?.id) {
      fetchDashboardData();
    }
  }, [user]);

  // Listen for real-time updates
  useEffect(() => {
    const handleProgressUpdate = () => {
      console.log('🔄 Progress updated, refreshing dashboard...');
      if (user?.id) {
        fetchDashboardData();
      }
    };

    const handleMaterialCompleted = () => {
      console.log('📚 Material completed, updating dashboard...');
      if (user?.id) {
        fetchDashboardData();
      }
    };

    const handleAssignmentSubmitted = () => {
      console.log('📝 Assignment submitted, updating dashboard...');
      if (user?.id) {
        fetchDashboardData();
      }
    };

    // Listen for multiple event types
    window.addEventListener('progressUpdated', handleProgressUpdate);
    window.addEventListener('materialCompleted', handleMaterialCompleted);
    window.addEventListener('assignmentSubmitted', handleAssignmentSubmitted);

    return () => {
      window.removeEventListener('progressUpdated', handleProgressUpdate);
      window.removeEventListener('materialCompleted', handleMaterialCompleted);
      window.removeEventListener('assignmentSubmitted', handleAssignmentSubmitted);
    };
  }, [user]);

  // Auto-refresh every 15 seconds for real-time updates
  useEffect(() => {
    if (user?.id) {
      const interval = setInterval(() => {
        console.log('🔄 Auto-refreshing student dashboard...');
        fetchDashboardData();
      }, 15000); // Update every 15 seconds

      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchDashboardData = async (forceRefresh = false) => {
    try {
      // Skip loading state for background refreshes unless it's initial load
      if (isInitialLoad || forceRefresh) {
        setLoading(true);
      }

      // Check cache validity (5 minutes for non-critical data)
      const cacheKey = `student_dashboard_${user.id}`;
      const cacheTime = 5 * 60 * 1000; // 5 minutes
      const now = Date.now();
      
      if (!forceRefresh && cachedData[cacheKey] && (now - cachedData[cacheKey].timestamp) < cacheTime) {
        console.log('📦 Using cached dashboard data');
        setStats(cachedData[cacheKey].stats);
        setRecentCourses(cachedData[cacheKey].recentCourses);
        setUpcomingAssignments(cachedData[cacheKey].upcomingAssignments);
        setLoading(false);
        setIsInitialLoad(false);
        return;
      }

      // Fetch all data in parallel with optimized endpoints
      const [statsData, coursesData, assignmentsData] = await Promise.allSettled([
        fetchOptimizedStats(),
        fetchRecentCourses(),
        fetchUpcomingAssignments()
      ]);

      // Safely resolve results and update cache
      const resolvedStats = (statsData.status === 'fulfilled' && Array.isArray(statsData.value?.stats))
        ? statsData.value.stats
        : stats;

      const resolvedRecentCourses = (coursesData.status === 'fulfilled' && Array.isArray(coursesData.value))
        ? coursesData.value
        : recentCourses;

      const resolvedUpcomingAssignments = (assignmentsData.status === 'fulfilled' && Array.isArray(assignmentsData.value))
        ? assignmentsData.value
        : upcomingAssignments;

      const newCacheData = {
        timestamp: now,
        stats: resolvedStats,
        recentCourses: resolvedRecentCourses,
        upcomingAssignments: resolvedUpcomingAssignments
      };
      
      setCachedData(prev => ({ ...prev, [cacheKey]: newCacheData }));

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
      setLastUpdated(new Date().toLocaleTimeString());
      setIsInitialLoad(false);
    }
  };

  const fetchOptimizedStats = async () => {
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseKey) throw new Error('Supabase env not configured');

      // First, get enrolled courses to determine course IDs
      const enrollmentsRes = await fetch(`${supabaseUrl}/rest/v1/enrollments?select=course_id,progress,materials_completed,total_materials&student_id=eq.${user.id}&status=eq.active`, {
        headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` }
      });
      
      const enrollments = enrollmentsRes.ok ? await enrollmentsRes.json() : [];
      const courseIds = enrollments.map(e => e.course_id).join(',');

      // Now fetch other data in parallel
      const [courseProgressRes, assignmentsRes, submissionsRes] = await Promise.all([
        // Get course progress data
        fetch(`${supabaseUrl}/rest/v1/course_progress?select=course_id,progress,materials_completed,total_materials&student_id=eq.${user.id}`, {
          headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` }
        }),
        // Get all assignments for enrolled courses
        fetch(courseIds ? `${supabaseUrl}/rest/v1/assignments?select=id&course_id=in.(${courseIds})` : `${supabaseUrl}/rest/v1/assignments?select=id&course_id=eq.null`, {
          headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` }
        }),
        // Get assignment submissions
        fetch(`${supabaseUrl}/rest/v1/assignment_submissions?select=assignment_id,status&student_id=eq.${user.id}`, {
          headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` }
        })
      ]);

      const courseProgress = courseProgressRes.ok ? await courseProgressRes.json() : [];
      const assignments = assignmentsRes.ok ? await assignmentsRes.json() : [];
      const submissions = submissionsRes.ok ? await submissionsRes.json() : [];

      // Calculate enrolled courses count
      const enrolledCount = enrollments.length;

      // Calculate course progress and materials
      let totalMaterialsCompleted = 0;
      let totalMaterials = 0;
      let totalProgress = 0;

      // Use enrollment data first, then fallback to course_progress table
      if (enrollments.length > 0) {
        enrollments.forEach(enrollment => {
          const materialsCompleted = enrollment.materials_completed || 0;
          const totalCourseMaterials = enrollment.total_materials || 0;
          const progress = enrollment.progress || 0;
          
          totalMaterialsCompleted += materialsCompleted;
          totalMaterials += totalCourseMaterials;
          totalProgress += progress;
        });
      } else if (courseProgress.length > 0) {
        courseProgress.forEach(progress => {
          const materialsCompleted = progress.materials_completed || 0;
          const totalCourseMaterials = progress.total_materials || 0;
          const progressValue = progress.progress || 0;
          
          totalMaterialsCompleted += materialsCompleted;
          totalMaterials += totalCourseMaterials;
          totalProgress += progressValue;
        });
      }

      const averageProgress = enrolledCount > 0 ? Math.round(totalProgress / enrolledCount) : 0;

      // Calculate assignment progress
      const totalAssignments = assignments.length;
      const completedAssignments = submissions.filter(s => {
        const status = (s.status || '').toLowerCase();
        return status === 'submitted' || status === 'graded' || status === 'reviewed';
      }).length;
      const assignmentPercentage = totalAssignments > 0 ? Math.round((completedAssignments / totalAssignments) * 100) : 0;

      const nextStats = [
        {
          title: 'Enrolled Courses',
          value: enrolledCount.toString(),
          change: `${enrolledCount} active`,
          icon: BookOpen,
          color: 'from-blue-500 to-blue-600'
        },
        {
          title: 'Course Progress',
          value: `${averageProgress}%`,
          change: `${totalMaterialsCompleted}/${totalMaterials} materials`,
          icon: TrendingUp,
          color: 'from-green-500 to-green-600'
        },
        {
          title: 'Assignment Progress',
          value: `${assignmentPercentage}%`,
          change: `${completedAssignments}/${totalAssignments} completed`,
          icon: Target,
          color: 'from-purple-500 to-purple-600'
        }
      ];

      setStats(nextStats);

      return { stats: nextStats };
    } catch (error) {
      console.error('Error fetching enrollment stats:', error);
      return { stats };
    }
  };

  const fetchRecentCourses = async () => {
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      if (!supabaseUrl || !supabaseKey) throw new Error('Supabase env not configured');

      // Join enrollments -> courses -> profiles using PostgREST embedded selects
      const url = `${supabaseUrl}/rest/v1/enrollments?select=course_id,progress,updated_at,courses(id,title,teacher_id,thumbnail_url,profiles!courses_teacher_id_fkey(full_name))&student_id=eq.${user.id}&order=updated_at.desc&limit=3`;
      const response = await fetch(url, { headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` } });

      const rows = response.ok ? await response.json() : [];
      const recent = rows.map(row => ({
        id: row.course_id,
        title: row.courses?.title || 'Unknown Course',
        instructor: row.courses?.profiles?.full_name || 'Unknown Teacher',
        progress: row.progress || 0,
        nextLesson: 'Continue Learning',
        thumbnail: row.courses?.thumbnail_url || null
      }));

      setRecentCourses(recent);
      return recent;
    } catch (error) {
      console.error('Error fetching recent courses:', error);
      return recentCourses;
    }
  };

  const fetchUpcomingAssignments = async () => {
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      if (!supabaseUrl || !supabaseKey) throw new Error('Supabase env not configured');

      // Get next upcoming assignments for student's enrolled courses
      const assignmentsUrl = `${supabaseUrl}/rest/v1/assignments?select=id,title,due_date,course_id,courses(title)&order=due_date.asc&due_date=gt.${new Date().toISOString()}`;
      const response = await fetch(assignmentsUrl, { headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` } });
      const rows = response.ok ? await response.json() : [];

      // Fetch student's submitted/graded assignment submissions to exclude from deadlines
      const submissionsUrl = `${supabaseUrl}/rest/v1/assignment_submissions?select=assignment_id,status&student_id=eq.${user.id}`;
      const submissionsRes = await fetch(submissionsUrl, { headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` } });
      const submissionsRows = submissionsRes.ok ? await submissionsRes.json() : [];
      const submittedAssignmentIds = new Set(
        submissionsRows
          .filter(s => {
            const status = (s.status || '').toLowerCase();
            return status === 'submitted' || status === 'graded';
          })
          .map(s => s.assignment_id)
      );

      const filtered = rows.filter(a => !submittedAssignmentIds.has(a.id));

      const upcoming = filtered.slice(0, 5).map(a => ({
        title: a.title,
        course: a.courses?.title || 'Unknown Course',
        dueDate: new Date(a.due_date).toLocaleDateString(),
        type: 'assignment',
        daysUntil: Math.ceil((new Date(a.due_date) - new Date()) / (1000 * 60 * 60 * 24))
      }));

      setUpcomingAssignments(upcoming);
      return upcoming;
    } catch (error) {
      console.error('❌ Error fetching upcoming assignments (Supabase):', error);
      return upcomingAssignments;
    }
  };

  // Static data removed - now using dynamic data from state

  // Get username from user data
  const username = user?.fullName?.split(' ')[0] || user?.email?.split('@')[0] || 'Student';

  return (
    <DashboardLayout>
      <div className="space-y-2 student-page-bg min-h-screen p-2">
        {/* Dashboard Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary-500 to-primary-600 p-2 text-white hover:shadow-xl transition-all duration-300"
        >
          <div className="absolute inset-0 bg-white/10"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-lg md:text-xl font-bold mb-1 tracking-tight font-serif text-white">
                  Dashboard
                </h1>
                <p className="text-sm text-white/90 mb-2 font-medium">
                  Track your learning progress and upcoming tasks
                </p>
                {lastUpdated && (
                  <p className="text-xs text-white/70 mb-2 flex items-center">
                    <Zap className="w-3 h-3 mr-1 text-yellow-300" />
                    Last updated: {lastUpdated} (Real-time)
                  </p>
                )}
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <BookOpen className="w-5 h-5" />
                    <span className="font-semibold">{stats[0]?.value || 0} Active Courses</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-5 h-5" />
                    <span className="font-semibold">{stats[1]?.value || '0%'} Average Progress</span>
                  </div>
                </div>
              </div>
              <div className="hidden md:block">
                <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center">
                  <Award className="w-12 h-12 text-white" />
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="course-card rounded-xl p-3 transition-all duration-300 group"
            >
              <div className="flex items-center justify-between mb-2">
                <div className={`p-2 bg-gradient-to-br ${stat.color} rounded-xl group-hover:scale-110 transition-transform duration-300`}>
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
                <span className={`text-body-sm font-bold ${(typeof stat.change === 'string' && stat.change.startsWith('+')) ? 'text-success-600' : 'text-error-600'}`}>
                  {typeof stat.change === 'string' ? stat.change : ''}
                </span>
              </div>
              <h3 className="text-heading-lg font-bold mb-1" style={{color: '#000000'}}>{stat.value}</h3>
              <p className="text-body-md font-medium" style={{color: '#000000'}}>{stat.title}</p>
            </motion.div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          {/* Continue Learning */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="course-card rounded-xl p-3 transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-heading-md font-semibold" style={{color: '#ffffffff'}}>
                  Continue Learning
                </h2>
                <button
                  onClick={() => navigate('/mycourses')}
                  className="btn-primary px-4 py-2 text-sm rounded-lg"
                >
                  View All
                </button>
              </div>
              <div className="space-y-2">
                {recentCourses.map((course, index) => (
                  <motion.div
                    key={course.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all duration-300 cursor-pointer group"
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-100 to-blue-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <BookOpen className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-800 text-sm">
                        {course.title}
                      </h3>
                      <p className="text-xs text-gray-500 font-medium">
                        {course.instructor} • Next: {course.nextLesson}
                      </p>
                      <div className="mt-2">
                        <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                          <span className="font-medium">Progress</span>
                          <span className="font-bold">{course.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${course.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    >
                      <Play className="w-4 h-4 mr-1" />
                      Continue
                    </Button>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Upcoming Deadlines */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="card p-3 hover:shadow-xl transition-all duration-300 bg-white dark:bg-slate-800 text-gray-800 dark:text-gray-100"
          >
            <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">
                    Upcoming Deadlines
                  </h2>
              <Clock className="w-4 h-4 text-gray-400" />
            </div>
            <div className="space-y-2">
              {loading ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">Loading assignments...</p>
                </div>
              ) : upcomingAssignments.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-700 dark:text-gray-300 font-medium">No upcoming deadlines</p>
                </div>
              ) : (
                upcomingAssignments.map((deadline, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 1, x: 0 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-2 bg-white dark:bg-gray-800 rounded-lg border-l-4 border-red-500 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
                  onClick={() => navigate(deadline.type === 'quiz' ? '/student/quizzes' : '/assignments')}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 dark:text-white text-base">
                        {deadline.title}
                      </h3>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={`text-sm px-3 py-1 rounded-full font-bold ${
                          deadline.type === 'quiz' ? 'bg-purple-500 text-white' : 'bg-blue-500 text-white'
                        }`}>
                          {deadline.type === 'quiz' ? 'Quiz' : 'Assignment'}
                        </span>
                        {deadline.daysUntil <= 1 && (
                          <span className="text-sm bg-red-500 text-white px-3 py-1 rounded-full font-bold">
                            {deadline.daysUntil === 0 ? 'Due Today' : 'Due Tomorrow'}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="text-sm text-white font-bold bg-red-600 px-3 py-1 rounded-full">
                      {deadline.dueDate}
                    </span>
                  </div>
                  <p className="text-sm text-gray-800 dark:text-gray-200 font-bold">
                    {deadline.course}
                  </p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-sm text-gray-700 dark:text-gray-300 capitalize font-bold">
                      {deadline.type}
                    </span>
                    <ArrowRight className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                  </div>
                </motion.div>
                ))
              )}
            </div>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-6 hover:shadow-xl transition-all duration-300 bg-white dark:bg-slate-800 text-gray-800 dark:text-gray-100"

        >
          <h2 className="text-xl font-extrabold text-gray-800 tracking-tight mb-6">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-center space-y-2 hover:bg-blue-50 hover:border-blue-300"
              onClick={() => navigate('/allcourses')}
            >
              <BookOpen className="w-6 h-6 text-blue-600" />
              <span className="font-semibold">Browse Courses</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-center space-y-2 hover:bg-green-50 hover:border-green-300"
              onClick={() => navigate('/assignments')}
            >
              <CheckCircle className="w-6 h-6 text-green-600" />
              <span className="font-semibold">Assignments</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-center space-y-2 hover:bg-purple-50 hover:border-purple-300"
              onClick={() => navigate('/student/quizzes')}
            >
              <Target className="w-6 h-6 text-purple-600" />
              <span className="font-semibold">Take Quiz</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-center space-y-2 hover:bg-yellow-50 hover:border-yellow-300"
              onClick={() => navigate('/forum')}
            >
              <Zap className="w-6 h-6 text-yellow-600" />
              <span className="font-semibold">Ask Doubt</span>
            </Button>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default StudentDashboard;
