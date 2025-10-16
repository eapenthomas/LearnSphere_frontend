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

  const fetchAllCourses = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch data directly from Supabase
      const supabaseUrl = 'https://ffspaottcgyalpagbxvx.supabase.co';
      const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZmc3Bhb3R0Y2d5YWxwYWdieHZ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQyMDAyNzQsImV4cCI6MjA2OTc3NjI3NH0.eFhKNCnQtQz3WX4Rtz3Z0-51HFXL50b8iDFtszitVVE';
      
      // Fetch all courses with instructor info
      const coursesResponse = await fetch(`${supabaseUrl}/rest/v1/courses?select=*,profiles!courses_teacher_id_fkey(full_name)&status=eq.active`, {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
        },
      });
      
      const coursesData = await coursesResponse.json();
      
      // Fetch enrollments for all courses
      const courseIds = coursesData.map(course => course.id);
      const enrollmentsResponse = await fetch(`${supabaseUrl}/rest/v1/enrollments?course_id=in.(${courseIds.join(',')})&select=*`, {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
        },
      });
      
      const enrollments = await enrollmentsResponse.json();
      
      // Process courses data
      const processedCourses = coursesData.map(course => {
        const courseEnrollments = enrollments.filter(enrollment => enrollment.course_id === course.id);
        return {
          id: course.id,
          title: course.title,
          description: course.description,
          instructor: course.profiles?.full_name || 'Unknown Instructor',
          instructor_id: course.teacher_id,
          category: course.category || 'General',
          duration: '8 weeks', // Default duration
          level: 'Intermediate', // Default level
          students_enrolled: courseEnrollments.length,
          rating: 4.5, // Default rating
          total_ratings: Math.floor(courseEnrollments.length * 0.3), // Estimate
          created_at: course.created_at,
          thumbnail: course.thumbnail_url,
          status: course.status
        };
      });
      
      console.log('All courses data:', processedCourses);
      setCourses(processedCourses);
      setFilteredCourses(processedCourses);
      setCategories(['All', ...new Set(processedCourses.map(course => course.category))]);
      
      // Calculate stats
      const totalStudents = processedCourses.reduce((sum, course) => sum + course.students_enrolled, 0);
      const totalRatings = processedCourses.reduce((sum, course) => sum + course.total_ratings, 0);
      const averageRating = totalRatings > 0 ? processedCourses.reduce((sum, course) => sum + (course.rating * course.total_ratings), 0) / totalRatings : 0;
      
      // Find most popular category
      const categoryCount = {};
      processedCourses.forEach(course => {
        categoryCount[course.category] = (categoryCount[course.category] || 0) + course.students_enrolled;
      });
      const mostPopularCategory = Object.keys(categoryCount).length > 0 ? 
        Object.keys(categoryCount).reduce((a, b) => categoryCount[a] > categoryCount[b] ? a : b) : 'N/A';
      
      setStats({
        totalCourses: processedCourses.length,
        totalStudentsEnrolled: totalStudents,
        averageRating: Math.round(averageRating * 10) / 10,
        mostPopularCategory: mostPopularCategory,
      });
      
    } catch (error) {
      console.error('Error fetching all courses:', error);
      setError('Failed to load courses. Please try again.');
      
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
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mx-auto mb-3"></div>
            <p className="text-gray-600">Loading all courses...</p>
          </div>
        </div>
      </TeacherDashboardLayout>
    );
  }

  return (
    <TeacherDashboardLayout>
      <div className="space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div className="mb-3 lg:mb-0">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">All Courses</h1>
            <p className="text-gray-600 text-sm">
              Explore courses from all teachers across the platform
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={fetchAllCourses}
              disabled={loading}
              className="btn-primary px-3 py-2 rounded-lg transition-all duration-300 flex items-center space-x-2 font-medium text-sm"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-3 text-white"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-xs font-medium">Total Courses</p>
                <p className="text-xl font-bold">{courses.length}</p>
              </div>
              <BookOpen className="w-6 h-6 text-blue-200" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-3 text-white"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-xs font-medium">Total Students</p>
                <p className="text-xl font-bold">
                  {courses.reduce((sum, course) => sum + course.students_enrolled, 0)}
                </p>
              </div>
              <Users className="w-6 h-6 text-green-200" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-3 text-white"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-xs font-medium">Avg Rating</p>
                <p className="text-xl font-bold">
                  {(courses.reduce((sum, course) => sum + course.rating, 0) / courses.length).toFixed(1)}
                </p>
              </div>
              <Star className="w-6 h-6 text-purple-200" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-3 text-white"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-xs font-medium">Categories</p>
                <p className="text-xl font-bold">{categories.length - 1}</p>
              </div>
              <GraduationCap className="w-6 h-6 text-orange-200" />
            </div>
          </motion.div>
        </div>

        <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-200">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-3 lg:space-y-0 lg:space-x-3">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search courses, instructors, or topics..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
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
                className="px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              >
                <option value="recent">Most Recent</option>
                <option value="popular">Most Popular</option>
                <option value="rating">Highest Rated</option>
                <option value="title">Alphabetical</option>
              </select>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-red-500" />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredCourses.map((course, index) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300 overflow-hidden"
            >
              <div className="h-36 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                {course.thumbnail ? (
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center text-white">
                    <div className="text-3xl mb-1">{getCategoryIcon(course.category)}</div>
                    <p className="text-xs font-medium">{course.category}</p>
                  </div>
                )}
              </div>

              <div className="p-3">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-base font-semibold text-gray-900 line-clamp-2">
                    {course.title}
                  </h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLevelColor(course.level)}`}>
                    {course.level}
                  </span>
                </div>

                <p className="text-gray-600 text-xs mb-3 line-clamp-2">
                  {course.description}
                </p>

                <div className="flex items-center space-x-2 mb-2">
                  <User className="w-3 h-3 text-gray-500" />
                  <span className="text-xs text-gray-700 font-medium">
                    {course.instructor}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs text-gray-600 mb-3">
                  <div className="flex items-center space-x-1">
                    <Users className="w-3 h-3" />
                    <span>{course.students_enrolled} students</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="w-3 h-3" />
                    <span>{course.duration}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-1">
                    <Star className="w-3 h-3 text-yellow-500 fill-current" />
                    <span className="text-xs font-medium text-gray-900">
                      {course.rating}
                    </span>
                    <span className="text-xs text-gray-500">
                      ({course.total_ratings})
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(course.created_at).toLocaleDateString()}
                  </div>
                </div>

                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-1 text-sm">
                  <Eye className="w-3 h-3" />
                  <span>View Details</span>
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredCourses.length === 0 && !loading && (
          <div className="text-center py-8">
            <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <h3 className="text-base font-medium text-gray-900 mb-1">No courses found</h3>
            <p className="text-gray-600 text-sm">
              Try adjusting your search terms or filters to find more courses.
            </p>
          </div>
        )}
      </div>
    </TeacherDashboardLayout>
  );
};

export default TeacherAllCourses;
