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
      className="course-card rounded-2xl transition-all duration-300 overflow-hidden group"
    >
      {/* Thumbnail */}
      <div className="relative aspect-video bg-gradient-to-br from-primary-100 to-secondary-100 overflow-hidden">
        {course.thumbnail_url ? (
          <img
            src={course.thumbnail_url}
            alt={course.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <BookOpen className="w-12 h-12 text-primary-500" />
          </div>
        )}

        {/* Enrollment Status Badge */}
        <div className="absolute top-3 left-3">
          {course.isEnrolled ? (
            <span className="status-enrolled px-3 py-1 rounded-full text-xs font-semibold">
              Enrolled
            </span>
          ) : (
            <span className="status-available px-3 py-1 rounded-full text-xs font-semibold">
              Available
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Title */}
        <h3 className="text-lg font-semibold mb-2 line-clamp-2 transition-colors" style={{color: '#000000'}}>
          {course.title}
        </h3>

        {/* Teacher */}
        <div className="flex items-center space-x-2 mb-3">
          <User className="w-4 h-4" style={{color: '#000000'}} />
          <span className="text-sm font-medium" style={{color: '#000000'}}>
            {course.profiles?.full_name || 'Unknown Teacher'}
          </span>
        </div>

        {/* Description */}
        <p className="text-sm mb-4 line-clamp-3" style={{color: '#000000'}}>
          {course.description || 'No description available'}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t student-border">
          <div className="flex items-center space-x-4 text-xs" style={{color: '#000000'}}>
            <div className="flex items-center space-x-1">
              <Calendar className="w-3 h-3" style={{color: '#000000'}} />
              <span>{formatDate(course.created_at)}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Users className="w-3 h-3" style={{color: '#000000'}} />
              <span>0 students</span>
            </div>
          </div>

          {/* Action Button */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => console.log('View course:', course.id)}
              className="p-2 hover:bg-primary-50 rounded-lg transition-colors"
              title="View Course"
              style={{color: '#000000'}}
            >
              <Eye className="w-4 h-4" />
            </button>

            {course.isEnrolled ? (
              <button
                onClick={() => handleUnenroll(course.id)}
                className="btn-unenroll px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Unenroll
              </button>
            ) : (
              <button
                onClick={() => handleEnroll(course.id)}
                disabled={enrollingCourses.has(course.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2 ${
                  enrollingCourses.has(course.id)
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'btn-enroll'
                }`}
                style={enrollingCourses.has(course.id) ? {color: '#000000'} : {}}
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
      <div className="min-h-screen student-page-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
            <div className="mb-4 lg:mb-0">
              <h1 className="text-heading-xl font-bold mb-2 font-serif" style={{color: '#000000'}}>All Courses</h1>
              <p className="text-body-lg" style={{color: '#000000'}}>
                Discover and enroll in courses. {filteredCourses.length} course{filteredCourses.length !== 1 ? 's' : ''} available.
              </p>
            </div>

            <button
              onClick={fetchAllCourses}
              disabled={loading}
              className="btn-primary px-4 py-3 border-2 border-border-primary rounded-lg transition-all duration-300 flex items-center space-x-2 font-medium"
            >
              <Loader className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>

          {/* Search and Filters */}
          <div className="student-card-bg rounded-lg shadow-elegant p-6 mb-8 border border-border-primary">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              {/* Search */}
              <div className="relative flex-1 lg:max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{color: '#000000'}} />
                <input
                  type="text"
                  placeholder="Search courses, teachers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200"
                  style={{color: '#000000', backgroundColor: '#ffffff'}}
                />
              </div>

              {/* View Mode Toggle */}
              <div className="flex items-center bg-background-tertiary rounded-lg p-1 border border-border-primary">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-all duration-300 ${
                    viewMode === 'grid'
                      ? 'bg-background-secondary shadow-elegant'
                      : 'hover:bg-gray-100'
                  }`}
                  style={{color: '#000000'}}
                >
                  <Grid3X3 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-all duration-300 ${
                    viewMode === 'list'
                      ? 'bg-background-secondary shadow-elegant'
                      : 'hover:bg-gray-100'
                  }`}
                  style={{color: '#000000'}}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader className="w-8 h-8 text-primary-500 animate-spin" />
              <span className="ml-3" style={{color: '#000000'}}>Loading courses...</span>
            </div>
          ) : filteredCourses.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12"
            >
              <BookOpen className="w-16 h-16 text-border-primary mx-auto mb-4" style={{color: '#000000'}} />
              <h3 className="text-heading-md font-semibold mb-2" style={{color: '#000000'}}>
                {searchTerm ? 'No courses found' : 'No courses available'}
              </h3>
              <p className="text-body-lg mb-6" style={{color: '#000000'}}>
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
