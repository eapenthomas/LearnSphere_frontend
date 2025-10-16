import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';
import TeacherDashboardLayout from '../../layouts/TeacherDashboardLayout.jsx';
import { toast } from 'react-hot-toast';
import {
  BookOpen,
  Users,
  Clock,
  Star,
  Search,
  Filter,
  ChevronDown,
  ArrowUpNarrowWide,
  ArrowDownNarrowWide,
  GraduationCap,
  User,
  CalendarDays,
  DollarSign,
  Tag,
  RefreshCw
} from 'lucide-react';

const TeacherAllCourses = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalStudentsEnrolled: 0,
    averageRating: 0,
    mostPopularCategory: 'Programming',
  });

  useEffect(() => {
    fetchAllCourses();
  }, []);

  useEffect(() => {
    // Filter and sort courses when dependencies change
    const filtered = courses
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
    
    setFilteredCourses(filtered);
  }, [courses, searchTerm, filterCategory, sortBy]);

  const fetchAllCourses = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch all courses from Supabase with instructor information
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseKey) {
        throw new Error('Supabase configuration missing');
      }

      // Fetch courses with instructor profiles
      const coursesResponse = await fetch(`${supabaseUrl}/rest/v1/courses?select=*,profiles!courses_teacher_id_fkey(*)`, {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!coursesResponse.ok) {
        throw new Error(`Failed to fetch courses: ${coursesResponse.status}`);
      }

      const coursesData = await coursesResponse.json();
      console.log('Fetched courses from Supabase:', coursesData);

      // Fetch enrollment counts for each course
      const enrollmentsResponse = await fetch(`${supabaseUrl}/rest/v1/enrollments?select=course_id`, {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json'
        }
      });

      const enrollmentsData = enrollmentsResponse.ok ? await enrollmentsResponse.json() : [];
      
      // Process courses data
      const processedCourses = coursesData.map(course => ({
        id: course.id,
        title: course.title || 'Untitled Course',
        description: course.description || 'No description available',
        instructor: course.profiles?.full_name || 'Unknown Teacher',
        instructor_id: course.teacher_id,
        category: course.category || 'General',
        duration: course.duration || 'Not specified',
        level: course.level || 'Beginner',
        students_enrolled: enrollmentsData.filter(e => e.course_id === course.id).length,
        rating: course.rating || 0,
        total_ratings: course.total_ratings || 0,
        created_at: course.created_at || new Date().toISOString(),
        thumbnail: course.thumbnail_url || null,
        status: course.status || 'active'
      }));

      setCourses(processedCourses);
      
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
        Object.keys(categoryCount).reduce((a, b) => categoryCount[a] > categoryCount[b] ? a : b) : 'General';
      
      setStats({
        totalCourses: processedCourses.length,
        totalStudentsEnrolled: totalStudents,
        averageRating: Math.round(averageRating * 10) / 10,
        mostPopularCategory: mostPopularCategory,
      });
      
    } catch (error) {
      console.error('Error fetching all courses:', error);
      setError('Failed to load courses. Please try again later.');
      
      // Fallback to sample data
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
          thumbnail: 'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=400&h=200&fit=crop&crop=center',
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
          thumbnail: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=400&h=200&fit=crop&crop=center',
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
          thumbnail: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&h=200&fit=crop&crop=center',
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
          thumbnail: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=400&h=200&fit=crop&crop=center',
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
          thumbnail: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&h=200&fit=crop&crop=center',
          status: 'active'
        }
      ];
      
      setCourses(sampleCourses);
      
      // Calculate stats for sample data
      const totalStudents = sampleCourses.reduce((sum, course) => sum + course.students_enrolled, 0);
      const totalRatings = sampleCourses.reduce((sum, course) => sum + course.total_ratings, 0);
      const averageRating = totalRatings > 0 ? sampleCourses.reduce((sum, course) => sum + (course.rating * course.total_ratings), 0) / totalRatings : 0;
      
      const categoryCount = {};
      sampleCourses.forEach(course => {
        categoryCount[course.category] = (categoryCount[course.category] || 0) + course.students_enrolled;
      });
      const mostPopularCategory = Object.keys(categoryCount).length > 0 ? 
        Object.keys(categoryCount).reduce((a, b) => categoryCount[a] > categoryCount[b] ? a : b) : 'Programming';
      
      setStats({
        totalCourses: sampleCourses.length,
        totalStudentsEnrolled: totalStudents,
        averageRating: Math.round(averageRating * 10) / 10,
        mostPopularCategory: mostPopularCategory,
      });
    } finally {
      setLoading(false);
    }
  };

  const getLevelColor = (level) => {
    switch (level.toLowerCase()) {
      case 'beginner':
        return 'bg-green-100 text-green-700';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-700';
      case 'advanced':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const categories = ['all', ...new Set(courses.map(course => course.category))];

  if (loading && courses.length === 0) {
    return (
      <TeacherDashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mx-auto mb-3"></div>
            <p className="text-gray-600 text-sm">Loading all courses...</p>
          </div>
        </div>
      </TeacherDashboardLayout>
    );
  }

  return (
    <TeacherDashboardLayout>
      <div className="space-y-2 p-2">
        {/* Header and Stats */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm p-2 border border-gray-200"
        >
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-lg shadow-md">
              <GraduationCap className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-lg font-bold text-gray-800">All Courses</h1>
          </div>
          <p className="text-xs text-gray-600 mb-2">Explore all courses available on LearnSphere, created by various instructors.</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
            <div className="bg-blue-50 rounded-lg p-2 flex items-center justify-between">
              <div>
                <p className="text-xs text-blue-700 font-medium">Total Courses</p>
                <p className="text-lg font-bold text-blue-800">{stats.totalCourses}</p>
              </div>
              <BookOpen className="w-4 h-4 text-blue-500" />
            </div>
            <div className="bg-green-50 rounded-lg p-2 flex items-center justify-between">
              <div>
                <p className="text-xs text-green-700 font-medium">Total Students</p>
                <p className="text-lg font-bold text-green-800">{stats.totalStudentsEnrolled}</p>
              </div>
              <Users className="w-4 h-4 text-green-500" />
            </div>
            <div className="bg-yellow-50 rounded-lg p-2 flex items-center justify-between">
              <div>
                <p className="text-xs text-yellow-700 font-medium">Average Rating</p>
                <p className="text-lg font-bold text-yellow-800">{stats.averageRating.toFixed(1)} <Star className="w-3 h-3 inline-block text-yellow-500" /></p>
              </div>
              <Star className="w-4 h-4 text-yellow-500" />
            </div>
            <div className="bg-purple-50 rounded-lg p-2 flex items-center justify-between">
              <div>
                <p className="text-xs text-purple-700 font-medium">Top Category</p>
                <p className="text-lg font-bold text-purple-800">{stats.mostPopularCategory}</p>
              </div>
              <Tag className="w-4 h-4 text-purple-500" />
            </div>
          </div>
        </motion.div>

        {/* Search and Filter */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-sm p-2 border border-gray-200 flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2"
        >
          <div className="relative flex-1 w-full">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search courses or instructors..."
              className="input-field pl-7 py-2 text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="relative w-full sm:w-auto">
            <Filter className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-400" />
            <select
              className="form-select pl-7 py-2 text-sm"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="all">All Categories</option>
              {categories.filter(cat => cat !== 'all').map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
          </div>

          <div className="relative w-full sm:w-auto">
            <select
              className="form-select pl-3 py-2 text-sm"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="recent">Most Recent</option>
              <option value="popular">Most Popular</option>
              <option value="rating">Highest Rated</option>
              <option value="title">Alphabetical</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
          </div>

          <button
            onClick={() => fetchAllCourses()}
            className="btn-ghost p-2 rounded-md flex items-center space-x-1 text-sm"
            title="Refresh Courses"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Refresh</span>
          </button>
        </motion.div>

        {/* Course Grid */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2"
        >
          {filteredCourses.length > 0 ? (
            filteredCourses.map((course) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ y: -2, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' }}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col"
              >
                <div className="relative aspect-video bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  {course.thumbnail ? (
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center text-white">
                      <BookOpen className="w-8 h-8 mx-auto mb-1" />
                      <p className="text-xs font-medium">{course.category}</p>
                    </div>
                  )}
                </div>

                <div className="p-2 flex-1 flex flex-col">
                  <h3 className="text-sm font-semibold text-gray-800 mb-1 line-clamp-2">{course.title}</h3>
                  <p className="text-xs text-gray-600 mb-1 flex-1 line-clamp-2">{course.description}</p>
                  
                  <div className="flex items-center text-xs text-gray-500 mb-1">
                    <User className="w-3 h-3 mr-1" />
                    <span>{course.instructor}</span>
                  </div>
                  
                  <div className="flex items-center text-xs text-gray-500 mb-1">
                    <Tag className="w-3 h-3 mr-1" />
                    <span>{course.category}</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-gray-700 mt-auto pt-1 border-t border-gray-100">
                    <div className="flex items-center space-x-1">
                      <Star className="w-3 h-3 text-yellow-500" />
                      <span>{course.rating.toFixed(1)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Users className="w-3 h-3 text-blue-500" />
                      <span>{course.students_enrolled}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-3 h-3 text-gray-500" />
                      <span>{course.duration}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="col-span-full text-center p-6 text-gray-500">
              <BookOpen className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No courses found matching your criteria.</p>
            </div>
          )}
        </motion.div>
      </div>
    </TeacherDashboardLayout>
  );
};

export default TeacherAllCourses;
