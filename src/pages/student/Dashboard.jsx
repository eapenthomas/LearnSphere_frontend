import React from 'react';
import { motion } from 'framer-motion';
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

  const stats = [
    {
      title: 'Enrolled Courses',
      value: '4',
      change: '+2',
      icon: BookOpen,
      color: 'from-blue-500 to-blue-600'
    },
    {
      title: 'Completed Assignments',
      value: '12',
      change: '+3',
      icon: CheckCircle,
      color: 'from-green-500 to-green-600'
    },
    {
      title: 'Quiz Average',
      value: '87%',
      change: '+5%',
      icon: Target,
      color: 'from-purple-500 to-purple-600'
    }
  ];

  const recentCourses = [
    {
      id: 1,
      title: 'React Fundamentals',
      instructor: 'John Smith',
      progress: 75,
      nextLesson: 'State Management',
      thumbnail: null
    },
    {
      id: 2,
      title: 'JavaScript Advanced',
      instructor: 'Sarah Johnson',
      progress: 45,
      nextLesson: 'Async Programming',
      thumbnail: null
    },
    {
      id: 3,
      title: 'Node.js Backend',
      instructor: 'Mike Chen',
      progress: 20,
      nextLesson: 'Express Setup',
      thumbnail: null
    }
  ];

  const upcomingDeadlines = [
    {
      title: 'React Assignment #3',
      course: 'React Fundamentals',
      dueDate: 'Tomorrow',
      type: 'assignment'
    },
    {
      title: 'JavaScript Quiz',
      course: 'JavaScript Advanced',
      dueDate: 'Dec 28',
      type: 'quiz'
    },
    {
      title: 'Node.js Project',
      course: 'Node.js Backend',
      dueDate: 'Dec 30',
      type: 'project'
    }
  ];

  // Get username from user data
  const username = user?.fullName?.split(' ')[0] || user?.email?.split('@')[0] || 'Student';

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
                  Welcome back, {username}! 🎓
                </h1>
                <p className="text-base text-white/90 mb-4 font-medium">
                  Ready to continue your learning journey? You're doing great!
                </p>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <BookOpen className="w-5 h-5" />
                    <span className="font-semibold">4 Active Courses</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-5 h-5" />
                    <span className="font-semibold">87% Average Score</span>
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white shadow rounded-xl p-4 border border-gray-200 hover:shadow-lg transition-all duration-300 group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 bg-gradient-to-br ${stat.color} rounded-xl group-hover:scale-110 transition-transform duration-300`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <span className={`text-sm font-bold ${stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                  {stat.change}
                </span>
              </div>
              <h3 className="text-2xl font-extrabold text-gray-800 mb-1">{stat.value}</h3>
              <p className="text-sm text-gray-600 font-medium">{stat.title}</p>
            </motion.div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Continue Learning */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white shadow rounded-xl p-4 border border-gray-200 hover:shadow-lg transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Continue Learning
                </h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.location.href = '/mycourses'}
                >
                  View All
                </Button>
              </div>
              <div className="space-y-4">
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
            className="card p-6 hover:shadow-xl transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-extrabold text-gray-800 tracking-tight">
                Upcoming Deadlines
              </h2>
              <Clock className="w-5 h-5 text-gray-400" />
            </div>
            <div className="space-y-4">
              {upcomingDeadlines.map((deadline, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all duration-300 cursor-pointer group"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-bold text-gray-800 text-sm">
                      {deadline.title}
                    </h3>
                    <span className="text-xs text-red-600 font-bold bg-red-50 px-2 py-1 rounded-full">
                      {deadline.dueDate}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 font-medium">
                    {deadline.course}
                  </p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-xs text-gray-400 capitalize">
                      {deadline.type}
                    </span>
                    <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all duration-300" />
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-6 hover:shadow-xl transition-all duration-300"
        >
          <h2 className="text-xl font-extrabold text-gray-800 tracking-tight mb-6">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-center space-y-2 hover:bg-blue-50 hover:border-blue-300"
              onClick={() => window.location.href = '/allcourses'}
            >
              <BookOpen className="w-6 h-6 text-blue-600" />
              <span className="font-semibold">Browse Courses</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-center space-y-2 hover:bg-green-50 hover:border-green-300"
              onClick={() => window.location.href = '/assignments'}
            >
              <CheckCircle className="w-6 h-6 text-green-600" />
              <span className="font-semibold">Assignments</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-center space-y-2 hover:bg-purple-50 hover:border-purple-300"
              onClick={() => window.location.href = '/quizzes'}
            >
              <Target className="w-6 h-6 text-purple-600" />
              <span className="font-semibold">Take Quiz</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-center space-y-2 hover:bg-yellow-50 hover:border-yellow-300"
              onClick={() => window.location.href = '/forum'}
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
