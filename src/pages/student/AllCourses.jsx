import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext.jsx';
import DashboardLayout from '../../components/DashboardLayout.jsx';
import { enrollmentOperations } from '../../utils/supabaseClient.js';
import { toast } from 'react-hot-toast';
import {
  BookOpen,
  Search,
  Filter,
  Grid3X3,
  List,
  Loader,
  User,
  Calendar,
  Users,
  CheckCircle,
  Plus,
  Eye,
  Clock
} from 'lucide-react';

const StudentAllCourses = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [enrollingCourses, setEnrollingCourses] = useState(new Set());

  useEffect(() => {
    if (user?.id) {
      fetchAllCourses();
    }
  }, [user?.id]);

  const fetchAllCourses = async () => {
    try {
      setLoading(true);
      console.log('Fetching all courses...');
      
      const allCourses = await enrollmentOperations.getAllCourses();
      console.log('All courses fetched:', allCourses);
      
      // Check enrollment status for each course
      const coursesWithEnrollment = await Promise.all(
        allCourses.map(async (course) => {
          try {
            const enrollment = await enrollmentOperations.checkEnrollment(user.id, course.id);
            return {
              ...course,
              isEnrolled: !!enrollment,
              enrollment: enrollment
            };
          } catch (error) {
            console.log('No enrollment found for course:', course.id);
            return {
              ...course,
              isEnrolled: false,
              enrollment: null
            };
          }
        })
      );
      
      setCourses(coursesWithEnrollment);
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast.error('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (courseId) => {
    try {
      setEnrollingCourses(prev => new Set([...prev, courseId]));
      
      await enrollmentOperations.enrollInCourse(user.id, courseId);
      
      // Update the course in the list
      setCourses(prev => prev.map(course => 
        course.id === courseId 
          ? { ...course, isEnrolled: true }
          : course
      ));
      
      toast.success('Successfully enrolled in course!');
    } catch (error) {
      console.error('Error enrolling in course:', error);
      toast.error('Failed to enroll in course');
    } finally {
      setEnrollingCourses(prev => {
        const newSet = new Set(prev);
        newSet.delete(courseId);
        return newSet;
      });
    }
  };

  const handleUnenroll = async (courseId) => {
    try {
      await enrollmentOperations.unenrollFromCourse(user.id, courseId);
      
      // Update the course in the list
      setCourses(prev => prev.map(course => 
        course.id === courseId 
          ? { ...course, isEnrolled: false, enrollment: null }
          : course
      ));
      
      toast.success('Successfully unenrolled from course');
    } catch (error) {
      console.error('Error unenrolling from course:', error);
      toast.error('Failed to unenroll from course');
    }
  };

  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (course.description && course.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (course.profiles?.full_name && course.profiles.full_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const CourseCard = ({ course }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5, scale: 1.02 }}
      className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group"
    >
      {/* Thumbnail */}
      <div className="relative aspect-video bg-gradient-to-br from-indigo-100 to-blue-100 overflow-hidden">
        {course.thumbnail_url ? (
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
        
        {/* Enrollment Status Badge */}
        <div className="absolute top-3 left-3">
          {course.isEnrolled ? (
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
              Enrolled
            </span>
          ) : (
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
              Available
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Title */}
        <h3 className="text-lg font-semibold text-indigo-700 mb-2 line-clamp-2 group-hover:text-indigo-800 transition-colors">
          {course.title}
        </h3>

        {/* Teacher */}
        <div className="flex items-center space-x-2 mb-3">
          <User className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-600 font-medium">
            {course.profiles?.full_name || 'Unknown Teacher'}
          </span>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-600 mb-4 line-clamp-3">
          {course.description || 'No description available'}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center space-x-4 text-xs text-gray-500">
            <div className="flex items-center space-x-1">
              <Calendar className="w-3 h-3" />
              <span>{formatDate(course.created_at)}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Users className="w-3 h-3" />
              <span>0 students</span>
            </div>
          </div>
          
          {/* Action Button */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => console.log('View course:', course.id)}
              className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
              title="View Course"
            >
              <Eye className="w-4 h-4" />
            </button>
            
            {course.isEnrolled ? (
              <button
                onClick={() => handleUnenroll(course.id)}
                className="px-4 py-2 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg text-sm font-medium transition-colors"
              >
                Unenroll
              </button>
            ) : (
              <button
                onClick={() => handleEnroll(course.id)}
                disabled={enrollingCourses.has(course.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2 ${
                  enrollingCourses.has(course.id)
                    ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                }`}
              >
                {enrollingCourses.has(course.id) ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    <span>Enrolling...</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    <span>Enroll</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
            <div className="mb-4 lg:mb-0">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">All Courses</h1>
              <p className="text-gray-600">
                Discover and enroll in courses. {filteredCourses.length} course{filteredCourses.length !== 1 ? 's' : ''} available.
              </p>
            </div>
            
            <button
              onClick={fetchAllCourses}
              disabled={loading}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200 flex items-center space-x-2"
            >
              <Loader className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>

          {/* Search and Filters */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              {/* Search */}
              <div className="relative flex-1 lg:max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search courses, teachers..."
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
              <span className="ml-3 text-gray-600">Loading courses...</span>
            </div>
          ) : filteredCourses.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12"
            >
              <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                {searchTerm ? 'No courses found' : 'No courses available'}
              </h3>
              <p className="text-gray-500 mb-6">
                {searchTerm 
                  ? 'Try adjusting your search criteria'
                  : 'Check back later for new courses'
                }
              </p>
            </motion.div>
          ) : (
            <div className={`grid gap-6 ${
              viewMode === 'grid' 
                ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
                : 'grid-cols-1'
            }`}>
              {filteredCourses.map((course, index) => (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <CourseCard course={course} />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StudentAllCourses;
