import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext.jsx';
import {
  BookOpen,
  Home,
  GraduationCap,
  Calendar,
  BarChart3,
  Settings,
  Bell,
  Search,
  Menu,
  X,
  User,
  LogOut,
  ChevronDown,
  FileText,
  HelpCircle,
  Target,
  UserCheck
} from 'lucide-react';

const DashboardLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'My Courses', href: '/courses', icon: GraduationCap },
    { name: 'Assignments', href: '/assignments', icon: FileText },
    { name: 'Quizzes', href: '/quizzes', icon: Target },
    { name: 'Doubt Forum', href: '/forum', icon: HelpCircle },
    { name: 'Calendar', href: '/calendar', icon: Calendar },
    { name: 'Reports', href: '/reports', icon: BarChart3 },
    { name: 'Profile & Settings', href: '/profile', icon: UserCheck },
  ];

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-gray-600/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-gray-200 lg:static lg:z-auto ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-extrabold text-gray-800 tracking-tight">LearnSphere</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <nav className="mt-8 px-6 flex-1">
          <div className="space-y-3">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`sidebar-item group ${isActive ? 'active' : 'text-gray-700 hover:text-gray-800'
                    }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-bold">{item.name}</span>
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute right-0 w-1 h-8 bg-gradient-to-b from-blue-500 to-blue-600 rounded-l-full"
                    />
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* User Profile Section */}
        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-200">
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center space-x-3 w-full p-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-bold text-gray-800 truncate">
                  {user?.fullName || user?.email || 'User'}
                </p>
                <p className="text-xs text-gray-500 capitalize font-medium">
                  {user?.role || 'Student'}
                </p>
              </div>
              <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${userMenuOpen ? 'rotate-180' : ''
                }`} />
            </button>

            <AnimatePresence>
              {userMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden"
                >
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-3 w-full p-3 hover:bg-gray-50 transition-colors text-left"
                  >
                    <LogOut className="w-4 h-4 text-gray-600" />
                    <span className="text-sm font-bold text-gray-700">Logout</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navigation */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Menu className="w-5 h-5 text-gray-600" />
              </button>
              <h1 className="text-xl font-extrabold text-gray-800 tracking-tight">
                {navigation.find(item => item.href === location.pathname)?.name || 'Dashboard'}
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              {/* Welcome Message */}
              <div className="hidden md:block">
                <p className="text-sm text-gray-600">
                  Welcome back, <span className="font-semibold text-gray-800">
                    {user?.fullName?.split(' ')[0] || user?.email?.split('@')[0] || 'Student'}
                  </span>!
                </p>
              </div>

              {/* Search */}
              <div className="relative hidden sm:block">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search courses, assignments..."
                  className="w-64 pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200"
                />
              </div>

              {/* Notifications */}
              <button className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors">
                <Bell className="w-5 h-5 text-gray-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              {/* User Profile Picture/Initials */}
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                  {user?.fullName ? user.fullName.split(' ').map(n => n[0]).join('').toUpperCase() :
                    user?.email ? user.email[0].toUpperCase() : 'U'}
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-semibold text-gray-800">
                    {user?.fullName || user?.email || 'User'}
                  </p>
                </div>
              </div>

              {/* User Menu (Mobile) */}
              <div className="lg:hidden relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${userMenuOpen ? 'rotate-180' : ''
                    }`} />
                </button>

                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-50"
                    >
                      <div className="p-3 border-b border-gray-200">
                        <p className="text-sm font-bold text-gray-800">
                          {user?.fullName || user?.email || 'User'}
                        </p>
                        <p className="text-xs text-gray-500 capitalize font-medium">
                          {user?.role || 'Student'}
                        </p>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="flex items-center space-x-3 w-full p-3 hover:bg-gray-50 transition-colors text-left"
                      >
                        <LogOut className="w-4 h-4 text-gray-600" />
                        <span className="text-sm font-bold text-gray-700">Logout</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-gray-50 overflow-y-auto h-screen">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-7xl mx-auto"
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout; 