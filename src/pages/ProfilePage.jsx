import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Toaster, toast } from 'react-hot-toast';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  GraduationCap, 
  Activity, 
  Bell,
  Home,
  ChevronRight,
  UserCheck,
  Award,
  BookOpen,
  Calendar,
  Target,
  TrendingUp,
  Star,
  Clock,
  CheckCircle,
  Camera,
  Edit3,
  Shield,
  Lock,
  Settings
} from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout.jsx';
import ProfileInformation from '../components/ProfileInformation.jsx';
import PasswordUpdate from '../components/PasswordUpdate.jsx';

const ProfilePage = () => {
  const [profileData, setProfileData] = useState({
    full_name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1 (555) 123-4567',
    bio: 'Passionate learner and technology enthusiast',
    location: 'San Francisco, CA',
    joinDate: 'January 2024',
    avatar: null
  });

  const [profileStats, setProfileStats] = useState({
    coursesEnrolled: 0,
    coursesCompleted: 0,
    assignmentsSubmitted: 0,
    quizzesTaken: 0,
    averageScore: 0,
    certificatesEarned: 0,
    studyStreak: 7
  });

  useEffect(() => {
    // Fetch profile data from Supabase
    const fetchProfileData = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/api/profile`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setProfileData(prev => ({
            ...prev,
            ...data,
            bio: data.bio || 'Passionate learner and technology enthusiast',
            location: data.location || 'San Francisco, CA',
            joinDate: data.created_at ? new Date(data.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'January 2024'
          }));
        }
      } catch (error) {
        console.error('Error fetching profile data:', error);
      }
    };

    // Fetch profile statistics
    const fetchProfileStats = async () => {
      try {
        const userId = localStorage.getItem('user_id');
        if (!userId) return;

        // Fetch courses enrolled
        const coursesResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/api/courses/student/${userId}/enrolled`);
        const coursesData = coursesResponse.ok ? await coursesResponse.json() : [];
        
        // Fetch assignments submitted
        const assignmentsResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/api/assignments/student/${userId}/submissions`);
        const assignmentsData = assignmentsResponse.ok ? await assignmentsResponse.json() : [];
        
        // Fetch quizzes taken
        const quizzesResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/api/quiz/student/${userId}/submissions`);
        const quizzesData = quizzesResponse.ok ? await quizzesResponse.json() : [];

        setProfileStats({
          coursesEnrolled: coursesData.length || 0,
          coursesCompleted: coursesData.filter(course => course.completed).length || 0,
          assignmentsSubmitted: assignmentsData.length || 0,
          quizzesTaken: quizzesData.length || 0,
          averageScore: quizzesData.length > 0 ? Math.round(quizzesData.reduce((sum, quiz) => sum + (quiz.score || 0), 0) / quizzesData.length) : 0,
          certificatesEarned: coursesData.filter(course => course.completed).length || 0,
          studyStreak: 7 // Mock data for now
        });
      } catch (error) {
        console.error('Error fetching profile stats:', error);
      }
    };

    fetchProfileData();
    fetchProfileStats();
  }, []);

  if (!profileData) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Profile Not Found</h2>
            <p className="text-gray-600 mb-6">We couldn't load your profile information.</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#fff',
            color: '#374151',
            boxShadow: '0 10px 25px -3px rgba(255, 255, 255, 0.1), 0 4px 6px -2px rgba(255, 255, 255, 0.05)',
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
            padding: '16px',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
      
      <div className="space-y-6">
        {/* Breadcrumb Navigation */}
        <motion.nav
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center space-x-2 text-sm text-gray-600"
        >
          <Home className="w-4 h-4" />
          <span>Dashboard</span>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-800 font-medium">Profile & Settings</span>
        </motion.nav>

        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center space-x-4"
        >
          <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl">
            <UserCheck className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-black tracking-tight">
              Profile & Settings
            </h1>
            <p className="text-black font-medium">
              Manage your account information and security settings
            </p>
          </div>
        </motion.div>

        {/* Profile Header with Gradient Background */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 p-8 text-white shadow-2xl"
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-black/10">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent transform -skew-y-1"></div>
          </div>
          
          <div className="relative p-8">
            <div className="flex flex-col lg:flex-row items-start lg:items-center space-y-6 lg:space-y-0 lg:space-x-8">
              {/* Avatar Section */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                className="relative"
              >
                <div className="w-32 h-32 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-4 border-white/30 shadow-2xl">
                  {profileData.avatar ? (
                    <img 
                      src={profileData.avatar} 
                      alt="Profile" 
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-16 h-16 text-white/80" />
                  )}
                </div>
                <button className="absolute -bottom-2 -right-2 bg-white text-blue-600 p-2 rounded-full shadow-lg hover:bg-blue-50 transition-colors">
                  <Camera className="w-4 h-4" />
                </button>
              </motion.div>

              {/* Profile Info */}
              <div className="flex-1 text-white">
                <motion.h2 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-4xl font-bold mb-2"
                >
                  {profileData.full_name}
                </motion.h2>
                
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                  className="space-y-2 mb-6"
                >
                  <div className="flex items-center space-x-2">
                    <Mail className="w-5 h-5 text-white/80" />
                    <span className="text-white/90">{profileData.email}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="w-5 h-5 text-white/80" />
                    <span className="text-white/90">{profileData.phone}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-5 h-5 text-white/80" />
                    <span className="text-white/90">{profileData.location}</span>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 }}
                  className="flex flex-wrap gap-3"
                >
                  <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium">
                    <GraduationCap className="w-4 h-4 inline mr-2" />
                    Student
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium">
                    <Calendar className="w-4 h-4 inline mr-2" />
                    Joined {profileData.joinDate}
                  </div>
                </motion.div>
              </div>

              {/* Quick Actions */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 }}
                className="flex flex-col space-y-3"
              >
                <button className="bg-white/20 backdrop-blur-sm px-6 py-3 rounded-lg text-white font-medium hover:bg-white/30 transition-colors flex items-center space-x-2">
                  <Edit3 className="w-4 h-4" />
                  <span>Edit Profile</span>
                </button>
                <button className="bg-white/20 backdrop-blur-sm px-6 py-3 rounded-lg text-white font-medium hover:bg-white/30 transition-colors flex items-center space-x-2">
                  <Settings className="w-4 h-4" />
                  <span>Settings</span>
                </button>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Profile Statistics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {[
            { label: 'Courses Enrolled', value: profileStats.coursesEnrolled, icon: BookOpen, color: 'from-blue-500 to-blue-600' },
            { label: 'Courses Completed', value: profileStats.coursesCompleted, icon: CheckCircle, color: 'from-green-500 to-green-600' },
            { label: 'Assignments', value: profileStats.assignmentsSubmitted, icon: Target, color: 'from-purple-500 to-purple-600' },
            { label: 'Study Streak', value: `${profileStats.studyStreak} days`, icon: TrendingUp, color: 'from-orange-500 to-orange-600' }
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.9 + index * 0.1 }}
              className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg bg-gradient-to-r ${stat.color}`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-800">{stat.value}</div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mobile-grid">
          {/* Profile Information Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.0 }}
          >
            <ProfileInformation />
          </motion.div>

          {/* Password Update Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.0 }}
          >
            <PasswordUpdate />
          </motion.div>
        </div>

        {/* Additional Settings Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6"
        >
          {/* Account Security */}
          <div className="card p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-green-100 rounded-lg">
                <Shield className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Account Security</h3>
                <p className="text-sm text-white">Manage your account security settings</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Lock className="w-5 h-5 text-gray-600" />
                  <div>
                    <div className="font-medium text-gray-800">Password</div>
                    <div className="text-sm text-gray-600">Last updated 30 days ago</div>
                  </div>
                </div>
                <button className="text-blue-600 hover:text-blue-700 font-medium">
                  Change
                </button>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <UserCheck className="w-5 h-5 text-gray-600" />
                  <div>
                    <div className="font-medium text-gray-800">Two-Factor Authentication</div>
                    <div className="text-sm text-gray-600">Add an extra layer of security</div>
                  </div>
                </div>
                <button className="text-blue-600 hover:text-blue-700 font-medium">
                  Enable
                </button>
              </div>
            </div>
          </div>

          {/* Learning Preferences */}
          <div className="card p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Settings className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Learning Preferences</h3>
                <p className="text-sm text-white">Customize your learning experience</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Bell className="w-5 h-5 text-gray-600" />
                  <div>
                    <div className="font-medium text-gray-800">Notifications</div>
                    <div className="text-sm text-gray-600">Manage your notification preferences</div>
                  </div>
                </div>
                <button className="text-blue-600 hover:text-blue-700 font-medium">
                  Configure
                </button>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-gray-600" />
                  <div>
                    <div className="font-medium text-gray-800">Study Schedule</div>
                    <div className="text-sm text-gray-600">Set your preferred study times</div>
                  </div>
                </div>
                <button className="text-blue-600 hover:text-blue-700 font-medium">
                  Set Up
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default ProfilePage;