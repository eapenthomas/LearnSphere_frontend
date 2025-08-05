import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext.jsx';
import TeacherDashboardLayout from '../../layouts/TeacherDashboardLayout.jsx';
import CourseCard from '../../components/CourseCard.jsx';
import CourseFormModal from '../../components/CourseFormModal.jsx';
import { courseOperations } from '../../utils/supabaseClient.js';
import { toast } from 'react-hot-toast';
import {
  Plus,
  BookOpen,
  Search,
  Filter,
  Grid3X3,
  List,
  Loader,
  AlertCircle,
  Trash2,
  Eye
} from 'lucide-react';

const TeacherMyCourses = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  // Fetch courses on component mount
  useEffect(() => {
    if (user?.id) {
      fetchCourses();
      const cleanup = setupRealTimeSubscription();
      
      // Cleanup subscription on unmount
      return cleanup;
    }
  }, [user?.id]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      console.log('Fetching courses for user:', user.id);
      
      // Test Supabase connection first
      const { data: testData, error: testError } = await courseOperations.supabase
        .from('courses')
        .select('count', { count: 'exact', head: true });
      
      if (testError) {
        console.error('Supabase connection test failed:', testError);
        toast.error('Database connection failed. Please check if the courses table exists.');
        return;
      }
      
      console.log('Supabase connection successful');
      const data = await courseOperations.fetchTeacherCourses(user.id);
      setCourses(data || []);
      console.log('Fetched courses:', data);
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast.error(`Failed to load courses: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const setupRealTimeSubscription = () => {
    console.log('Setting up real-time subscription for user:', user.id);
    
    const subscription = courseOperations.subscribeToChanges(user.id, (payload) => {
      console.log('Real-time update received:', payload);
      
      switch (payload.eventType) {
        case 'INSERT':
          console.log('Real-time INSERT - Adding new course:', payload.new);
          setCourses(prev => {
            // Check if course already exists to avoid duplicates
            const exists = prev.find(course => course.id === payload.new.id);
            if (!exists) {
              console.log('Course added via real-time');
              return [payload.new, ...prev];
            }
            console.log('Course already exists, skipping duplicate');
            return prev;
          });
          break;
        case 'UPDATE':
          console.log('Real-time UPDATE - Updating course:', payload.new);
          setCourses(prev => {
            const updated = prev.map(course => 
              course.id === payload.new.id ? payload.new : course
            );
            console.log('Course updated via real-time');
            return updated;
          });
          break;
        case 'DELETE':
          console.log('Real-time DELETE - Deleting course:', payload.old);
          setCourses(prev => {
            const filtered = prev.filter(course => course.id !== payload.old.id);
            console.log('Course deleted via real-time, remaining:', filtered.length);
            return filtered;
          });
          break;
        default:
          console.log('Unknown real-time event:', payload.eventType);
      }
    });

    return () => {
      console.log('Unsubscribing from real-time updates');
      subscription.unsubscribe();
    };
  };

  const handleCreateCourse = async (formData) => {
    try {
      setFormLoading(true);
      
      console.log('Creating course with form data:', formData);
      console.log('Current user:', user);
      
      let thumbnailUrl = null;
      
      // Upload thumbnail if provided
      if (formData.thumbnailFile) {
        console.log('Uploading thumbnail...');
        const tempId = Date.now().toString();
        thumbnailUrl = await courseOperations.uploadThumbnail(formData.thumbnailFile, tempId);
        console.log('Thumbnail uploaded:', thumbnailUrl);
      }

      const courseData = {
        teacher_id: user.id,
        title: formData.title,
        description: formData.description || null,
        thumbnail_url: thumbnailUrl,
        status: formData.status
      };

      console.log('Final course data:', courseData);
      const newCourse = await courseOperations.createCourse(courseData);
      console.log('Course created:', newCourse);
      
      // Manually add to state if real-time doesn't work
      setCourses(prev => [newCourse, ...prev]);
      
      setShowCreateModal(false);
      toast.success('Course created successfully!');
    } catch (error) {
      console.error('Error creating course:', error);
      
      // Check for specific RLS error
      if (error.message.includes('row-level security policy')) {
        toast.error('Database permission error. Please run the RLS fix script.');
        console.error('RLS Policy Error - Run backend/fix_rls_policies.sql in Supabase');
      } else {
        toast.error(`Failed to create course: ${error.message}`);
      }
    } finally {
      setFormLoading(false);
    }
  };

  const handleEditCourse = async (formData) => {
    try {
      setFormLoading(true);
      
      console.log('Updating course:', selectedCourse.id, 'with data:', formData);
      
      let thumbnailUrl = selectedCourse.thumbnail_url;
      
      // Upload new thumbnail if provided
      if (formData.thumbnailFile) {
        console.log('Uploading new thumbnail...');
        thumbnailUrl = await courseOperations.uploadThumbnail(formData.thumbnailFile, selectedCourse.id);
        console.log('New thumbnail URL:', thumbnailUrl);
      }

      const updates = {
        title: formData.title,
        description: formData.description || null,
        thumbnail_url: thumbnailUrl,
        status: formData.status
      };

      console.log('Sending updates:', updates);
      const updatedCourse = await courseOperations.updateCourse(selectedCourse.id, updates);
      console.log('Course updated:', updatedCourse);
      
      // Immediately update local state (fallback if real-time doesn't work)
      setCourses(prev => prev.map(course => 
        course.id === selectedCourse.id ? updatedCourse : course
      ));
      
      setShowEditModal(false);
      setSelectedCourse(null);
      toast.success('Course updated successfully!');
    } catch (error) {
      console.error('Error updating course:', error);
      toast.error('Failed to update course');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteCourse = async () => {
    try {
      console.log('Deleting course:', selectedCourse.id);
      
      // Store the course ID for immediate UI update
      const courseIdToDelete = selectedCourse.id;
      
      // Delete from database
      await courseOperations.deleteCourse(courseIdToDelete);
      
      // Immediately update local state (fallback if real-time doesn't work)
      setCourses(prev => {
        const updated = prev.filter(course => course.id !== courseIdToDelete);
        console.log('Updated courses after delete:', updated.length);
        return updated;
      });
      
      setShowDeleteModal(false);
      setSelectedCourse(null);
      toast.success('Course deleted successfully!');
    } catch (error) {
      console.error('Error deleting course:', error);
      toast.error('Failed to delete course');
    }
  };

  const handleViewCourse = (course) => {
    // Navigate to course details page
    console.log('View course:', course);
    toast.info('Course details page coming soon!');
  };

  // Filter courses based on search and status
  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (course.description && course.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || course.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusCount = (status) => {
    return courses.filter(course => status === 'all' || course.status === status).length;
  };

  return (
    <TeacherDashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
            <div className="mb-4 lg:mb-0">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">My Courses</h1>
              <p className="text-gray-600">
                Manage and organize your courses. You have {courses.length} course{courses.length !== 1 ? 's' : ''} total.
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={fetchCourses}
                disabled={loading}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200 flex items-center space-x-2"
              >
                <Loader className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
              
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-gradient-to-r from-indigo-500 to-blue-500 text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl hover:from-indigo-600 hover:to-blue-600 transition-all duration-300 flex items-center space-x-2"
              >
                <Plus className="w-5 h-5" />
                <span>Create Course</span>
              </button>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              {/* Search */}
              <div className="relative flex-1 lg:max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search courses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500"
                />
              </div>

              <div className="flex items-center space-x-4">
                {/* Status Filter */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all duration-200 text-gray-900"
                >
                  <option value="all">All Courses ({getStatusCount('all')})</option>
                  <option value="active">Active ({getStatusCount('active')})</option>
                  <option value="draft">Draft ({getStatusCount('draft')})</option>
                </select>

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
                {searchTerm || statusFilter !== 'all' ? 'No courses found' : 'No courses yet'}
              </h3>
              <p className="text-gray-500 mb-6">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Try adjusting your search or filter criteria'
                  : 'Create your first course to get started'
                }
              </p>
              {!searchTerm && statusFilter === 'all' && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-gradient-to-r from-indigo-500 to-blue-500 text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Create Your First Course
                </button>
              )}
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
                  <CourseCard
                    course={course}
                    onEdit={(course) => {
                      setSelectedCourse(course);
                      setShowEditModal(true);
                    }}
                    onDelete={(course) => {
                      setSelectedCourse(course);
                      setShowDeleteModal(true);
                    }}
                    onView={handleViewCourse}
                  />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <CourseFormModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateCourse}
        loading={formLoading}
      />

      <CourseFormModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedCourse(null);
        }}
        onSubmit={handleEditCourse}
        course={selectedCourse}
        loading={formLoading}
      />

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6"
            >
              <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mx-auto mb-4">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              
              <h3 className="text-lg font-semibold text-gray-800 text-center mb-2">
                Delete Course
              </h3>
              
              <p className="text-gray-600 text-center mb-6">
                Are you sure you want to delete "{selectedCourse?.title}"? This action cannot be undone.
              </p>
              
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedCourse(null);
                  }}
                  className="flex-1 px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteCourse}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-colors flex items-center justify-center space-x-2"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </TeacherDashboardLayout>
  );
};

export default TeacherMyCourses;
