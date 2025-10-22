import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext.jsx';
import DashboardLayout from '../components/DashboardLayout.jsx';
import ProfileInformation from '../components/ProfileInformation.jsx';
import PasswordUpdate from '../components/PasswordUpdate.jsx';
import LoadingSkeleton from '../components/LoadingSkeleton.jsx';
import { supabase } from '../utils/supabaseClient.js';
import { toast, Toaster } from 'react-hot-toast';
import {
  UserCheck,
  ChevronRight,
  Home,
  User,
  Lock,
  Shield,
  Settings,
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
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  Activity,
  Bell
} from 'lucide-react';

const ProfilePage = () => {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profileStats, setProfileStats] = useState({
    coursesEnrolled: 0,
    coursesCompleted: 0,
    assignmentsSubmitted: 0,
    quizzesTaken: 0,
    averageScore: 0,
    studyStreak: 0,
    certificatesEarned: 0
  });

  // Immediately set fallback data if user is available
  useEffect(() => {
    if (user && !profileData) {
      console.log('Setting immediate fallback profile data');
      setProfileData({
        id: user.id,
        full_name: user.fullName || '',
        email: user.email || '',
        role: user.role || 'student',
        phone: '',
        bio: '',
        location: '',
        joinDate: new Date().toISOString()
      });
      setLoading(false);
    }
  }, [user, profileData]);

  // Fetch profile statistics
  useEffect(() => {
    const fetchProfileStats = async () => {
      if (!user?.id) return;

      try {
        // Fetch enrolled courses count
        const { data: enrollments } = await supabase
          .from('enrollments')
          .select('course_id')
          .eq('student_id', user.id)
          .eq('status', 'active');

        // Fetch completed courses count
        const { data: completions } = await supabase
          .from('course_completions')
          .select('course_id')
          .eq('student_id', user.id);

        // Fetch assignment submissions count
        const { data: assignments } = await supabase
          .from('assignment_submissions')
          .select('id')
          .eq('student_id', user.id);

        // Fetch quiz submissions count
        const { data: quizzes } = await supabase
          .from('quiz_submissions')
          .select('id')
          .eq('student_id', user.id);

        // Fetch certificates count
        const { data: certificates } = await supabase
          .from('course_certificates')
          .select('id')
          .eq('student_id', user.id);

        // Calculate average score
        const { data: scores } = await supabase
          .from('assignment_submissions')
          .select('score')
          .eq('student_id', user.id)
          .not('score', 'is', null);

        const avgScore = scores && scores.length > 0 
          ? Math.round(scores.reduce((sum, s) => sum + (s.score || 0), 0) / scores.length)
          : 0;

        setProfileStats({
          coursesEnrolled: enrollments?.length || 0,
          coursesCompleted: completions?.length || 0,
          assignmentsSubmitted: assignments?.length || 0,
          quizzesTaken: quizzes?.length || 0,
          averageScore: avgScore,
          studyStreak: Math.floor(Math.random() * 30) + 1, // Mock data for now
          certificatesEarned: certificates?.length || 0
        });
      } catch (err) {
        console.log('Error fetching profile stats:', err);
      }
    };

    fetchProfileStats();
  }, [user]);

  // Try to enhance profile data from database (optional)
  useEffect(() => {
    const enhanceProfileData = async () => {
      if (!user?.id || !profileData) {
        return;
      }

      try {
        console.log('Trying to enhance profile data from database');

        // Check if Supabase is configured
        if (!supabaseUrl || !supabaseAnonKey) {
          console.log('Supabase not configured, skipping database fetch');
          return;
        }

        // Try to fetch additional data from database
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (!error && data) {
          console.log('Enhanced profile data from database:', data);
          setProfileData(prev => ({
            ...prev,
            ...data,
            email: user.email || data.email // Keep auth email as primary
          }));
          setError(null);
        } else {
          console.log('Database profile not found, keeping session data');
        }
      } catch (err) {
        console.log('Database enhancement failed, keeping session data:', err);
      }
    };

    // Only try to enhance after initial data is set
    if (profileData && !error) {
      enhanceProfileData();
    }
  }, [user, profileData]);

  const handleProfileUpdate = (updatedData) => {
    setProfileData(prev => ({ ...prev, ...updatedData }));
  };

  if (loading) {
    return (
      <DashboardLayout>
        <LoadingSkeleton />
      </DashboardLayout>
    );
  }

  // If no profile data and not loading, something went wrong
  if (!profileData) {
    console.error('No profile data available and not loading');
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-blue-800 mb-2">Unable to Load Profile</h2>
            <p className="text-gray-600 mb-4">There was an issue loading your profile data.</p>
            <button
              onClick={() => window.location.reload()}
              className="btn-primary"
            >
              Retry
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

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-200 rounded-lg p-4"
          >
            <p className="text-red-600 font-medium">{error}</p>
          </motion.div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mobile-grid">
          {/* Profile Information Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <ProfileInformation 
              profileData={profileData}
              onUpdate={handleProfileUpdate}
            />
          </motion.div>

          {/* Password Update Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <PasswordUpdate />
          </motion.div>
        </div>

    return (
    <DashboardLayout>
      <Toaster position="top-right" />
      
      {/* Professional Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 rounded-2xl mb-8"
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-black/10">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent transform -skew-y-1"></div>
        </div>
        
        <div className="relative p-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center space-y-6 lg:space-y-0 lg:space-x-8">
            {/* Profile Avatar */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
              className="relative"
            >
              <div className="w-32 h-32 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-4 border-white/30 shadow-2xl">
                <User className="w-16 h-16 text-white" />
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="absolute -bottom-2 -right-2 bg-white text-blue-600 p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Camera className="w-5 h-5" />
              </motion.button>
            </motion.div>

            {/* Profile Info */}
            <div className="flex-1 text-white">
              <motion.h1
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="text-3xl font-bold mb-2"
              >
                {profileData.full_name || 'Student'}
              </motion.h1>
              
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="flex flex-wrap items-center space-x-6 text-white/90 mb-4"
              >
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4" />
                  <span>{profileData.email}</span>
                </div>
                {profileData.phone && (
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4" />
                    <span>{profileData.phone}</span>
                  </div>
                )}
                <div className="flex items-center space-x-2">
                  <GraduationCap className="w-4 h-4" />
                  <span className="capitalize">{profileData.role}</span>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex flex-wrap gap-3"
              >
                <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium">
                  <Clock className="w-4 h-4 inline mr-2" />
                  Member since {new Date(profileData.joinDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                </div>
                <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium">
                  <Activity className="w-4 h-4 inline mr-2" />
                  {profileStats.studyStreak} day streak
                </div>
              </motion.div>
            </div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-col space-y-3"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center space-x-2"
              >
                <Edit3 className="w-4 h-4" />
                <span>Edit Profile</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-lg font-semibold border border-white/30 hover:bg-white/30 transition-all duration-200 flex items-center space-x-2"
              >
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </motion.button>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Profile Statistics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
      >
        {[
          { 
            label: 'Courses Enrolled', 
            value: profileStats.coursesEnrolled, 
            icon: BookOpen, 
            color: 'from-blue-500 to-blue-600',
            bgColor: 'bg-blue-50',
            iconColor: 'text-blue-600'
          },
          { 
            label: 'Courses Completed', 
            value: profileStats.coursesCompleted, 
            icon: CheckCircle, 
            color: 'from-green-500 to-green-600',
            bgColor: 'bg-green-50',
            iconColor: 'text-green-600'
          },
          { 
            label: 'Assignments', 
            value: profileStats.assignmentsSubmitted, 
            icon: Target, 
            color: 'from-purple-500 to-purple-600',
            bgColor: 'bg-purple-50',
            iconColor: 'text-purple-600'
          },
          { 
            label: 'Average Score', 
            value: `${profileStats.averageScore}%`, 
            icon: TrendingUp, 
            color: 'from-orange-500 to-orange-600',
            bgColor: 'bg-orange-50',
            iconColor: 'text-orange-600'
          }
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8 + index * 0.1 }}
            whileHover={{ scale: 1.05, y: -5 }}
            className={`${stat.bgColor} p-6 rounded-xl border border-gray-100 hover:shadow-lg transition-all duration-300`}
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

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6"
        >
          <p className="text-red-600 font-medium">{error}</p>
        </motion.div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mobile-grid">
        {/* Profile Information Card */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.9 }}
        >
          <ProfileInformation 
            profileData={profileData}
            onUpdate={handleProfileUpdate}
          />
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
    </DashboardLayout>
  );
};

export default ProfilePage;
