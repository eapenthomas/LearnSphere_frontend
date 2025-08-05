import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext.jsx';
import DashboardLayout from '../components/DashboardLayout.jsx';
import LogoutButton from '../components/LogoutButton.jsx';
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
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

const StudentDashboard = () => {
  const { user } = useAuth();

  const stats = [
    {
      title: 'Total Courses Enrolled',
      value: '12',
      change: '+2',
      icon: BookOpen,
      color: 'from-blue-500 to-blue-600'
    },
    {
      title: 'Quizzes Completed',
      value: '45',
      change: '+8',
      icon: CheckCircle,
      color: 'from-green-500 to-green-600'
    },
    {
      title: 'Assignments Pending',
      value: '3',
      change: '-1',
      icon: Clock,
      color: 'from-orange-500 to-orange-600'
    }
  ];

  const chartData = [
    { name: 'Mon', score: 85, target: 90 },
    { name: 'Tue', score: 92, target: 90 },
    { name: 'Wed', score: 78, target: 90 },
    { name: 'Thu', score: 95, target: 90 },
    { name: 'Fri', score: 88, target: 90 },
    { name: 'Sat', score: 91, target: 90 },
    { name: 'Sun', score: 87, target: 90 }
  ];

  const upcomingDeadlines = [
    {
      title: 'React Fundamentals Quiz',
      course: 'Web Development',
      dueDate: 'Today',
      priority: 'high',
      progress: 75
    },
    {
      title: 'Database Design Assignment',
      course: 'Computer Science',
      dueDate: 'Tomorrow',
      priority: 'medium',
      progress: 45
    },
    {
      title: 'Machine Learning Project',
      course: 'Data Science',
      dueDate: 'Dec 15',
      priority: 'low',
      progress: 20
    }
  ];

  const continueLearning = [
    {
      title: 'Advanced JavaScript',
      instructor: 'Dr. Sarah Johnson',
      progress: 65,
      thumbnail: 'JS',
      category: 'Programming'
    },
    {
      title: 'UI/UX Design Principles',
      instructor: 'Prof. Mike Chen',
      progress: 42,
      thumbnail: 'UX',
      category: 'Design'
    },
    {
      title: 'Data Structures & Algorithms',
      instructor: 'Dr. Emily Rodriguez',
      progress: 78,
      thumbnail: 'DS',
      category: 'Computer Science'
    }
  ];

  const recentAchievements = [
    {
      title: 'Perfect Score',
      description: 'Scored 100% on JavaScript Basics',
      icon: Star,
      color: 'text-yellow-500'
    },
    {
      title: 'Study Streak',
      description: '7 days of consistent learning',
      icon: Zap,
      color: 'text-blue-500'
    },
    {
      title: 'Course Completion',
      description: 'Finished React Fundamentals',
      icon: CheckCircle,
      color: 'text-green-500'
    }
  ];

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-500 bg-red-50';
      case 'medium': return 'text-yellow-500 bg-yellow-50';
      case 'low': return 'text-green-500 bg-green-50';
      default: return 'text-white-500 bg-white-50';
    }
  };

  // Get username from Supabase user data
  const username = user?.fullName || user?.email?.split('@')[0] || 'Student';

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-500 to-blue-600 p-6 text-white hover:shadow-xl transition-all duration-300"
        >
          <div className="absolute inset-0 bg-white/10"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl md:text-3xl font-extrabold mb-2 tracking-tight">
                  Welcome back, {username}! 👋
                </h1>
                <p className="text-base text-white/90 mb-4 font-medium">
                  Ready to continue your learning journey? You're making great progress!
                </p>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-4 h-4" />
                    <span className="text-sm font-medium">+15% this week</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Target className="w-4 h-4" />
                    <span className="text-sm font-medium">85% of monthly goal</span>
                  </div>
                </div>
              </div>
              <div className="hidden md:flex flex-col items-end space-y-4">
                <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:scale-110 transition-transform duration-300">
                  <BookOpen className="w-12 h-12 text-white" />
                </div>
                {/* Quick Actions */}
                <div className="flex items-center space-x-2">
                  <LogoutButton
                    variant="ghost"
                    size="sm"
                    className="bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 hover:text-white border border-white/30"
                    showText={false}
                  />
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 mobile-grid">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="stats-card group hover:shadow-2xl hover:scale-105 transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 bg-gradient-to-br ${stat.color} rounded-xl group-hover:scale-110 transition-transform duration-300`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <span className={`text-sm font-bold ${stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                  {stat.change}
                </span>
              </div>
              <h3 className="text-2xl font-extrabold text-white-800 mb-1">
                {stat.value}
              </h3>
              <p className="text-white-600 text-sm font-medium">
                {stat.title}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6 mobile-grid">
          {/* Performance Chart */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2 card p-6 hover:shadow-xl transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-extrabold text-white-800 tracking-tight">
                Quiz Scores Over Time
              </h2>
              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-white-600 font-medium">Your Score</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-white-300 rounded-full"></div>
                  <span className="text-white-600 font-medium">Target</span>
                </div>
              </div>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
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
                  <Area
                    type="monotone"
                    dataKey="score"
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    fillOpacity={0.1}
                    strokeWidth={3}
                  />
                  <Line
                    type="monotone"
                    dataKey="target"
                    stroke="#9ca3af"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Upcoming Deadlines */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="card p-6 hover:shadow-xl transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-extrabold text-white-800 tracking-tight">
                Upcoming Deadlines
              </h2>
              <Calendar className="w-5 h-5 text-white-400" />
            </div>
            <div className="space-y-4">
              {upcomingDeadlines.map((deadline, index) => (
                <motion.div
                  key={deadline.title}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 bg-white-50 rounded-lg hover:bg-white-100 hover:scale-105 transition-all duration-300 cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="font-bold text-white-800 text-sm">
                        {deadline.title}
                      </h3>
                      <p className="text-xs text-white-500 font-medium">
                        {deadline.course}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${getPriorityColor(deadline.priority)}`}>
                      {deadline.dueDate}
                    </span>
                  </div>
                  <div className="mb-2">
                    <div className="flex items-center justify-between text-xs text-white-500 mb-1">
                      <span className="font-medium">Progress</span>
                      <span className="font-bold">{deadline.progress}%</span>
                    </div>
                    <div className="w-full bg-white-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${deadline.progress}%` }}
                      ></div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Continue Learning & Achievements */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 mobile-grid">
          {/* Continue Learning */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card p-6 hover:shadow-xl transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-extrabold text-white-800 tracking-tight">
                Continue Learning
              </h2>
              <ArrowRight className="w-5 h-5 text-white-400" />
            </div>
            <div className="space-y-4">
              {continueLearning.map((course, index) => (
                <motion.div
                  key={course.title}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center space-x-4 p-4 bg-white-50 rounded-lg hover:bg-white-100 hover:scale-105 transition-all duration-300 cursor-pointer group"
                >
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold group-hover:scale-110 transition-transform duration-300">
                    {course.thumbnail}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-white-800 text-sm">
                      {course.title}
                    </h3>
                    <p className="text-xs text-white-500 font-medium">
                      {course.instructor} • {course.category}
                    </p>
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-xs text-white-500 mb-1">
                        <span className="font-medium">Progress</span>
                        <span className="font-bold">{course.progress}%</span>
                      </div>
                      <div className="w-full bg-white-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${course.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  <Play className="w-5 h-5 text-white-400 group-hover:text-blue-500 group-hover:scale-110 transition-all duration-300" />
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Recent Achievements */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card p-6 hover:shadow-xl transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-extrabold text-white-800 tracking-tight">
                Recent Achievements
              </h2>
              <Award className="w-5 h-5 text-white-400" />  
            </div>
            <div className="space-y-4">
              {recentAchievements.map((achievement, index) => (
                <motion.div
                  key={achievement.title}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center space-x-4 p-4 bg-gradient-to-r from-white-50 to-white-100 rounded-lg hover:bg-gradient-to-r hover:from-white-100 hover:to-white-200 hover:scale-105 transition-all duration-300"
                >
                  <div className="p-3 bg-white rounded-lg shadow-sm hover:scale-110 transition-transform duration-300">
                    <achievement.icon className={`w-6 h-6 ${achievement.color}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-white-800 text-sm">
                      {achievement.title}
                    </h3>
                    <p className="text-xs text-white-500 font-medium">
                      {achievement.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StudentDashboard; 