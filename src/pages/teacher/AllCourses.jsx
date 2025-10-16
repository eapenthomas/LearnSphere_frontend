import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext.jsx';
import TeacherDashboardLayout from '../../layouts/TeacherDashboardLayout.jsx';
import {
  BookOpen,
  Users,
  Clock,
  Star,
  Search,
  Filter,
  Eye,
  Calendar,
  User,
  GraduationCap,
  TrendingUp,
  Award,
  ChevronRight,
  RefreshCw,
  AlertCircle
} from 'lucide-react';

const TeacherAllCourses = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [error, setError] = useState(null);

  // Fetch all courses from all teachers
  const fetchAllCourses = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/api/courses/all`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch courses');
      }

      const data = await response.json();
      console.log('📚 All courses data:', data);
      setCourses(data.courses || []);
    } catch (error) {
      console.error('❌ Error fetching all courses:', error);
      setError('Failed to load courses. Please try again.');
      
      // Fallback sample data for testing
      const sampleCourses = [
        {
          id: 1,
          title: 'Advanced JavaScript Programming',
          description: 'Master advanced JavaScript concepts including ES6+, async programming, and modern frameworks.',
          instructor: 'Dr. Sarah Johnson',
          instructor_id: 2,
          category: 'Programming',
          duration: '12 weeks',
          level: 'Advanced',
          students_enrolled: 45,
          rating: 4.8,
          total_ratings: 120,
          created_at: '2024-01-15',
          thumbnail: null,
          status: 'active'
        },
        {
          id: 2,
          title: 'Machine Learning Fundamentals',
          description: 'Introduction to machine learning algorithms, data preprocessing, and model evaluation.',
          instructor: 'Prof. Michael Chen',
          instructor_id: 3,
          category: 'Data Science',
          duration: '16 weeks',
          level: 'Intermediate',
          students_enrolled: 38,
          rating: 4.6,
          total_ratings: 95,
          created_at: '2024-01-10',
          thumbnail: null,
          status: 'active'
        },
        {
          id: 3,
          title: 'Web Development Bootcamp',
          description: 'Complete web development course covering HTML, CSS, JavaScript, and React.',
          instructor: 'Ms. Emily Rodriguez',
          instructor_id: 4,
          category: 'Web Development',
          duration: '20 weeks',
          level: 'Beginner',
          students_enrolled: 62,
          rating: 4.9,
          total_ratings: 150,
          created_at: '2024-01-05',
          thumbnail: null,
          status: 'active'
        },
        {
          id: 4,
          title: 'Database Design & Management',
          description: 'Learn database design principles, SQL, and database optimization techniques.',
          instructor: 'Dr. Robert Kim',
          instructor_id: 5,
          category: 'Database',
          duration: '10 weeks',
          level: 'Intermediate',
          students_enrolled: 28,
          rating: 4.7,
          total_ratings: 75,
          created_at: '2024-01-20',
          thumbnail: null,
          status: 'active'
        },
        {
          id: 5,
          title: 'Mobile App Development',
          description: 'Build mobile applications using React Native and modern development practices.',
          instructor: 'Mr. David Wilson',
          instructor_id: 6,
          category: 'Mobile Development',
          duration: '14 weeks',
          level: 'Intermediate',
          students_enrolled: 41,
          rating: 4.5,
          total_ratings: 88,
          created_at: '2024-01-12',
          thumbnail: null,
          status: 'active'
        }
      ];
      
      setCourses(sampleCourses);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllCourses();
  }, []);

  // Filter and sort courses
  const filteredCourses = courses
    .filter(course => {
      const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           course.instructor.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = filterCategory === 'all' || course.category === filterCategory;
      
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          return new Date(b.created_at) - new Date(a.created_at);
        case 'popular':
          return b.students_enrolled - a.students_enrolled;
        case 'rating':
          return b.rating - a.rating;
        case 'title':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

  const categories = ['all', ...new Set(courses.map(course => course.category))];

  const getLevelColor = (level) => {
    switch (level.toLowerCase()) {
      case 'beginner':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category.toLowerCase()) {
      case 'programming':
        return '💻';
      case 'data science':
        return '📊';
      case 'web development':
        return '🌐';
      case 'database':
        return '🗄️';
      case 'mobile development':
        return '📱';
      default:
        return '📚';
    }
  };

  if (loading) {
    return (
      <TeacherDashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading all courses...</p>
          </div>
        </div>
      </TeacherDashboardLayout>
    );
  }

  return (
    <TeacherDashboardLayout>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div className="mb-4 lg:mb-0">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">All Courses</h1>
            <p className="text-gray-600">
              Explore courses from all teachers across the platform
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={fetchAllCourses}
              disabled={loading}
              className="btn-primary px-4 py-2 rounded-lg transition-all duration-300 flex items-center space-x-2 font-medium"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-4 text-white"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Total Courses</p>
                <p className="text-2xl font-bold">{courses.length}</p>
              </div>
              <BookOpen className="w-8 h-8 text-blue-200" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-4 text-white"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Total Students</p>
                <p className="text-2xl font-bold">
                  {courses.reduce((sum, course) => sum + course.students_enrolled, 0)}
                </p>
              </div>
              <Users className="w-8 h-8 text-green-200" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-4 text-white"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Avg Rating</p>
                <p className="text-2xl font-bold">
                  {(courses.reduce((sum, course) => sum + course.rating, 0) / courses.length).toFixed(1)}
                </p>
              </div>
              <Star className="w-8 h-8 text-purple-200" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-4 text-white"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium">Categories</p>
                <p className="text-2xl font-bold">{categories.length - 1}</p>
              </div>
              <GraduationCap className="w-8 h-8 text-orange-200" />
            </div>
          </motion.div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search courses, instructors, or topics..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category === 'all' ? 'All Categories' : category}
                    </option>
                  ))}
                </select>
              </div>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="recent">Most Recent</option>
                <option value="popular">Most Popular</option>
                <option value="rating">Highest Rated</option>
                <option value="title">Alphabetical</option>
              </select>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCourses.map((course, index) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 overflow-hidden"
            >
              {/* Course Thumbnail */}
              <div className="h-48 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                {course.thumbnail ? (
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center text-white">
                    <div className="text-4xl mb-2">{getCategoryIcon(course.category)}</div>
                    <p className="text-sm font-medium">{course.category}</p>
                  </div>
                )}
              </div>

              {/* Course Content */}
              <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                    {course.title}
                  </h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLevelColor(course.level)}`}>
                    {course.level}
                  </span>
                </div>

                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {course.description}
                </p>

                {/* Instructor */}
                <div className="flex items-center space-x-2 mb-3">
                  <User className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-700 font-medium">
                    {course.instructor}
                  </span>
                </div>

                {/* Course Stats */}
                <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                  <div className="flex items-center space-x-1">
                    <Users className="w-4 h-4" />
                    <span>{course.students_enrolled} students</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>{course.duration}</span>
                  </div>
                </div>

                {/* Rating */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="text-sm font-medium text-gray-900">
                      {course.rating}
                    </span>
                    <span className="text-sm text-gray-500">
                      ({course.total_ratings} reviews)
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">
                    Created {new Date(course.created_at).toLocaleDateString()}
                  </div>
                </div>

                {/* Action Button */}
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2">
                  <Eye className="w-4 h-4" />
                  <span>View Details</span>
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* No Results */}
        {filteredCourses.length === 0 && !loading && (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No courses found</h3>
            <p className="text-gray-600">
              Try adjusting your search terms or filters to find more courses.
            </p>
          </div>
        )}
      </div>
    </TeacherDashboardLayout>
  );
};

export default TeacherAllCourses;
