import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext.jsx';
import TeacherDashboardLayout from '../../layouts/TeacherDashboardLayout.jsx';
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
  Zap,
  FileText,
  ClipboardList,
  MessageSquare,
  Plus,
  Eye,
  Edit,
  AlertTriangle,
  GraduationCap,
  BarChart3
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';

const TeacherDashboard = () => {
  const { user } = useAuth();

  // Real-time state management
  const [stats, setStats] = useState([
    {
      title: 'Total Courses Created',
      value: '0',
      change: 'Loading...',
      icon: BookOpen,
      color: 'from-blue-500 to-blue-600'
    },
    {
      title: 'Assignments to Grade',
      value: '0',
      change: 'Loading...',
      icon: ClipboardList,
      color: 'from-orange-500 to-orange-600'
    },
    {
      title: 'Total Students',
      value: '0',
      change: 'Loading...',
      icon: Users,
      color: 'from-green-500 to-green-600'
    }
  ]);

  const [loading, setLoading] = useState(true);
  const [recentCourses, setRecentCourses] = useState([]);
  const [pendingSubmissions, setPendingSubmissions] = useState([]);

  // Fetch real-time data
  useEffect(() => {
    if (user?.id) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchTeacherStats(),
        fetchRecentCourses(),
        fetchPendingSubmissions()
      ]);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeacherStats = async () => {
    try {
      // Fetch courses
      const coursesResponse = await fetch(`http://localhost:8000/api/courses/teacher/${user.id}`);
      const courses = coursesResponse.ok ? await coursesResponse.json() : [];

      // Fetch assignments
      const assignmentsResponse = await fetch(`http://localhost:8000/api/assignments/teacher/${user.id}`);
      const assignments = assignmentsResponse.ok ? await assignmentsResponse.json() : [];

      // Calculate pending submissions
      let totalPendingSubmissions = 0;
      let totalStudents = 0;

      for (const assignment of assignments) {
        const submissionsResponse = await fetch(`http://localhost:8000/api/assignments/submissions/${assignment.id}?teacher_id=${user.id}`);
        if (submissionsResponse.ok) {
          const submissions = await submissionsResponse.json();
          totalPendingSubmissions += submissions.filter(s => s.status !== 'reviewed').length;
        }
        totalStudents += assignment.total_students || 0;
      }

      // Update stats
      setStats([
        {
          title: 'Total Courses Created',
          value: courses.length.toString(),
          change: `${courses.filter(c => c.status === 'active').length} active`,
          icon: BookOpen,
          color: 'from-blue-500 to-blue-600'
        },
        {
          title: 'Assignments to Grade',
          value: totalPendingSubmissions.toString(),
          change: `${assignments.length} total assignments`,
          icon: ClipboardList,
          color: 'from-orange-500 to-orange-600'
        },
        {
          title: 'Total Students',
          value: totalStudents.toString(),
          change: 'Across all courses',
          icon: Users,
          color: 'from-green-500 to-green-600'
        }
      ]);
    } catch (error) {
      console.error('Error fetching teacher stats:', error);
    }
  };

  const fetchRecentCourses = async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/courses/teacher/${user.id}`);
      if (response.ok) {
        const courses = await response.json();
        // Get the most recent 3 courses
        const recent = courses.slice(0, 3).map(course => ({
          id: course.id,
          title: course.title,
          students: course.enrollment_count || 0,
          status: course.status,
          lastActivity: 'Recently updated'
        }));
        setRecentCourses(recent);
      }
    } catch (error) {
      console.error('Error fetching recent courses:', error);
    }
  };

  const fetchPendingSubmissions = async () => {
    try {
      const assignmentsResponse = await fetch(`http://localhost:8000/api/assignments/teacher/${user.id}`);
      if (assignmentsResponse.ok) {
        const assignments = await assignmentsResponse.json();
        const pending = [];

        for (const assignment of assignments.slice(0, 3)) {
          const submissionsResponse = await fetch(`http://localhost:8000/api/assignments/submissions/${assignment.id}?teacher_id=${user.id}`);
          if (submissionsResponse.ok) {
            const submissions = await submissionsResponse.json();
            const pendingCount = submissions.filter(s => s.status !== 'reviewed').length;
            if (pendingCount > 0) {
              pending.push({
                assignment: assignment.title,
                course: assignment.course_title,
                count: pendingCount,
                dueDate: new Date(assignment.due_date).toLocaleDateString()
              });
            }
          }
        }

        setPendingSubmissions(pending);
      }
    } catch (error) {
      console.error('Error fetching pending submissions:', error);
    }
  };

  // Average student scores over time
  const performanceData = [
    { name: 'Week 1', average: 78, target: 85 },
    { name: 'Week 2', average: 82, target: 85 },
    { name: 'Week 3', average: 85, target: 85 },
    { name: 'Week 4', average: 88, target: 85 },
    { name: 'Week 5', average: 84, target: 85 },
    { name: 'Week 6', average: 90, target: 85 }
  ];

  // Course-wise student performance
  const coursePerformanceData = [
    { course: 'React Basics', students: 45, avgScore: 88 },
    { course: 'JavaScript', students: 38, avgScore: 82 },
    { course: 'Node.js', students: 32, avgScore: 85 },
    { course: 'Python', students: 28, avgScore: 90 },
    { course: 'HTML/CSS', students: 52, avgScore: 92 }
  ];

  const upcomingDeadlines = [
    {
      title: 'React Quiz - Final Assessment',
      course: 'React Fundamentals',
      dueDate: 'Tomorrow',
      type: 'quiz',
      priority: 'high',
      submissions: 28,
      total: 45
    },
    {
      title: 'JavaScript Assignment - DOM Manipulation',
      course: 'JavaScript Basics',
      dueDate: 'Dec 28',
      type: 'assignment',
      priority: 'medium',
      submissions: 15,
      total: 38
    },
    {
      title: 'Node.js Project Submission',
      course: 'Backend Development',
      dueDate: 'Dec 30',
      type: 'project',
      priority: 'low',
      submissions: 8,
      total: 32
    }
  ];

  const recentActivity = [
    {
      type: 'submission',
      title: 'New Assignment Submission',
      description: 'Sarah Johnson submitted React Components Assignment',
      time: '5 minutes ago',
      icon: CheckCircle,
      color: 'text-green-500'
    },
    {
      type: 'question',
      title: 'New Doubt Forum Question',
      description: 'Mike Chen asked about useState hooks in React',
      time: '15 minutes ago',
      icon: MessageSquare,
      color: 'text-blue-500'
    },
    {
      type: 'quiz',
      title: 'Quiz Completed',
      description: 'Emma Davis completed JavaScript Basics Quiz with 95%',
      time: '1 hour ago',
      icon: Star,
      color: 'text-yellow-500'
    },
    {
      type: 'submission',
      title: 'Late Submission Alert',
      description: 'John Smith submitted assignment 2 days late',
      time: '2 hours ago',
      icon: AlertTriangle,
      color: 'text-red-500'
    }
  ];

  const quickActions = [
    {
      title: 'Create Course',
      description: 'Start a new course for your students',
      icon: BookOpen,
      color: 'from-blue-500 to-blue-600',
      action: () => window.location.href = '/teacher/courses'
    },
    {
      title: 'Add Quiz',
      description: 'Create a new quiz or assessment',
      icon: FileText,
      color: 'from-green-500 to-green-600',
      action: () => console.log('Add quiz')
    },
    {
      title: 'Post Assignment',
      description: 'Assign new tasks to students',
      icon: ClipboardList,
      color: 'from-purple-500 to-purple-600',
      action: () => console.log('Post assignment')
    }
  ];

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-500 bg-red-50';
      case 'medium': return 'text-yellow-500 bg-yellow-50';
      case 'low': return 'text-green-500 bg-green-50';
      default: return 'text-gray-500 bg-gray-50';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'quiz': return FileText;
      case 'assignment': return ClipboardList;
      case 'project': return Target;
      default: return FileText;
    }
  };

  // Get username from user data
  const username = user?.fullName?.split(' ')[0] || user?.email?.split('@')[0] || 'Teacher';

  return (
    <TeacherDashboardLayout>
      <div className="space-y-6 teacher-page-bg min-h-screen p-6">
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
                <h1 className="text-3xl font-semibold text-white mb-2">
                  Welcome back, {username}! 👨‍🏫
                </h1>
                <p className="text-base text-white mb-4">
                  Ready to inspire and educate your students? You have great impact on their learning journey!
                </p>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Users className="w-5 h-5" />
                    <span className="font-semibold">143 Active Students</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-5 h-5" />
                    <span className="font-semibold">88% Avg Performance</span>
                  </div>
                </div>
              </div>
              <div className="hidden md:block">
                <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center">
                  <GraduationCap className="w-12 h-12 text-white" />
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
              className="teacher-course-card rounded-xl p-6 transition-all duration-300 group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 bg-gradient-to-br ${stat.color} rounded-xl group-hover:scale-110 transition-transform duration-300`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <span className={`text-sm font-bold ${stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                  {stat.change}
                </span>
              </div>
              <h3 className="text-2xl font-extrabold mb-1" style={{color: '#000000'}}>{stat.value}</h3>
              <p className="text-sm font-medium" style={{color: '#000000'}}>{stat.title}</p>
            </motion.div>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Average Student Scores Chart */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="card p-6 hover:shadow-xl transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-extrabold tracking-tight" style={{color: '#000000'}}>
                Average Student Scores
              </h2>
              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="font-medium" style={{color: '#000000'}}>Average</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                  <span className="font-medium" style={{color: '#000000'}}>Target</span>
                </div>
              </div>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={performanceData}>
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
                  <Line
                    type="monotone"
                    dataKey="average"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    dot={{ fill: '#3b82f6', strokeWidth: 2, r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="target"
                    stroke="#9ca3af"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Course Performance Chart */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="card p-6 hover:shadow-xl transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-extrabold text-gray-800 tracking-tight">
                Course Performance
              </h2>
              <BarChart3 className="w-5 h-5 text-gray-400" />
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={coursePerformanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="course" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: 'none',
                      borderRadius: '12px',
                      boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                    }}
                  />
                  <Bar dataKey="avgScore" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>
      </div>
    </TeacherDashboardLayout>
  );
};

export default TeacherDashboard;
