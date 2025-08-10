import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext.jsx';
import DashboardLayout from '../../components/DashboardLayout.jsx';
import { enrollmentOperations } from '../../utils/supabaseClient.js';
import { toast } from 'react-hot-toast';
import {
  BookOpen,
  Search,
  Grid3X3,
  List,
  Loader,
  User,
  Calendar,
  Play,
  CheckCircle,
  Clock,
  BarChart3,
  Award,
  Eye,
  BookmarkCheck
} from 'lucide-react';

const StudentMyCourses = () => {
  const { user } = useAuth();
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid');

  useEffect(() => {
    if (user?.id) {
      fetchEnrolledCourses();
    }
  }, [user?.id]);

  const fetchEnrolledCourses = async () => {
    try {
      setLoading(true);
      console.log('Fetching enrolled courses for student:', user.id);
      
      const enrollments = await enrollmentOperations.getEnrolledCourses(user.id);
      console.log('Enrolled courses fetched:', enrollments);
      
      setEnrolledCourses(enrollments);
    } catch (error) {
      console.error('Error fetching enrolled courses:', error);
      toast.error('Failed to load your courses');
    } finally {
      setLoading(false);
    }
  };

  const handleContinueLearning = (courseId) => {
    // Navigate to course content page
    console.log('Continue learning course:', courseId);
    toast.info('Course content page coming soon!');
  };

  const filteredCourses = enrolledCourses.filter(enrollment =>
    enrollment.courses?.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (enrollment.courses?.description && enrollment.courses.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (enrollment.courses?.profiles?.full_name && enrollment.courses.profiles.full_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getProgressColor = (progress) => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 50) return 'bg-yellow-500';
    return 'bg-blue-500';
  };

  const getStatusBadge = (status, progress) => {
    if (status === 'completed') {
      return 'px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700';
    }
    if (progress === 0) {
      return 'px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700';
    }
    return 'px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700';
  };

  const getStatusText = (status, progress) => {
    if (status === 'completed') return 'Completed';
    if (progress === 0) return 'Not Started';
    return 'In Progress';
  };

  const EnrolledCourseCard = ({ enrollment }) => {
    const course = enrollment.courses;
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -5, scale: 1.02 }}
        className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group"
      >
        {/* Thumbnail */}
        <div className="relative aspect-video bg-gradient-to-br from-indigo-100 to-blue-100 overflow-hidden">
          {course?.thumbnail_url ? (
            <img
              src={course.thumbnail_url}
              alt={course.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <BookOpen className="w-12 h-12 text-indigo-400" />
            </div>
          )}
          
          {/* Status Badge */}
          <div className="absolute top-3 left-3">
            <span className={getStatusBadge(enrollment.status, enrollment.progress)}>
              {getStatusText(enrollment.status, enrollment.progress)}
            </span>
          </div>

          {/* Progress Badge */}
          <div className="absolute top-3 right-3">
            <div className="bg-white/90 backdrop-blur-sm rounded-full px-3 py-1">
              <span className="text-xs font-bold text-gray-700">
                {enrollment.progress}%
              </span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Title */}
          <h3 className="text-lg font-semibold text-indigo-700 mb-2 line-clamp-2 group-hover:text-indigo-800 transition-colors">
            {course?.title}
          </h3>

          {/* Teacher */}
          <div className="flex items-center space-x-2 mb-3">
            <User className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600 font-medium">
              {course?.profiles?.full_name || 'Unknown Teacher'}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Progress</span>
              <span className="text-sm text-gray-500">{enrollment.progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(enrollment.progress)}`}
                style={{ width: `${enrollment.progress}%` }}
              ></div>
            </div>
          </div>

          {/* Description */}
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
            {course?.description || 'No description available'}
          </p>

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <div className="flex items-center space-x-4 text-xs text-gray-500">
              <div className="flex items-center space-x-1">
                <Calendar className="w-3 h-3" />
                <span>Enrolled {formatDate(enrollment.enrolled_at)}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="w-3 h-3" />
                <span>Last activity today</span>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => console.log('View course details:', course?.id)}
                className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                title="Course Details"
              >
                <Eye className="w-4 h-4" />
              </button>
              
              <button
                onClick={() => handleContinueLearning(course?.id)}
                className="px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2"
              >
                {enrollment.progress === 0 ? (
                  <>
                    <Play className="w-4 h-4" />
                    <span>Start</span>
                  </>
                ) : enrollment.status === 'completed' ? (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    <span>Review</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    <span>Continue</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen student-page-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
            <div className="mb-4 lg:mb-0">
              <h1 className="text-heading-xl font-bold mb-2 font-serif" style={{color: '#000000'}}>My Courses</h1>
              <p className="text-body-lg" style={{color: '#000000'}}>
                Continue your learning journey. You're enrolled in {filteredCourses.length} course{filteredCourses.length !== 1 ? 's' : ''}.
              </p>
            </div>

            <button
              onClick={fetchEnrolledCourses}
              disabled={loading}
              className="btn-primary px-4 py-3 border-2 border-border-primary rounded-lg transition-all duration-300 flex items-center space-x-2 font-medium"
            >
              <Loader className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>

          {/* Stats Row */}
          {!loading && enrolledCourses.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-lg p-6"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-blue-100 rounded-xl">
                    <BookOpen className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800">{enrolledCourses.length}</h3>
                    <p className="text-sm text-gray-600">Enrolled Courses</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-2xl shadow-lg p-6"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-green-100 rounded-xl">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800">
                      {enrolledCourses.filter(e => e.status === 'completed').length}
                    </h3>
                    <p className="text-sm text-gray-600">Completed</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-2xl shadow-lg p-6"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-yellow-100 rounded-xl">
                    <BarChart3 className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800">
                      {Math.round(enrolledCourses.reduce((acc, e) => acc + e.progress, 0) / enrolledCourses.length) || 0}%
                    </h3>
                    <p className="text-sm text-gray-600">Avg Progress</p>
                  </div>
                </div>
              </motion.div>
            </div>
          )}

          {/* Search and Filters */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              {/* Search */}
              <div className="relative flex-1 lg:max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search your courses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500"
                />
              </div>

              {/* View Mode Toggle */}
              <div className="flex items-center bg-gray-100 rounded-xl p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    viewMode === 'grid' 
                      ? 'bg-white shadow-sm text-indigo-600' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Grid3X3 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    viewMode === 'list' 
                      ? 'bg-white shadow-sm text-indigo-600' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader className="w-8 h-8 text-indigo-500 animate-spin" />
              <span className="ml-3 text-gray-600">Loading your courses...</span>
            </div>
          ) : filteredCourses.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12"
            >
              <BookmarkCheck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                {searchTerm ? 'No courses found' : 'No enrolled courses yet'}
              </h3>
              <p className="text-gray-500 mb-6">
                {searchTerm 
                  ? 'Try adjusting your search criteria'
                  : 'Browse all courses to find something interesting to learn'
                }
              </p>
              {!searchTerm && (
                <button
                  onClick={() => window.location.href = '/allcourses'}
                  className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
                >
                  Browse All Courses
                </button>
              )}
            </motion.div>
          ) : (
            <div className={`grid gap-6 ${
              viewMode === 'grid' 
                ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
                : 'grid-cols-1'
            }`}>
              {filteredCourses.map((enrollment, index) => (
                <motion.div
                  key={enrollment.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <EnrolledCourseCard enrollment={enrollment} />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StudentMyCourses;
