import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext.jsx';
import { Toaster } from 'react-hot-toast';
import LandingPage from './pages/LandingPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import ForgotPasswordPage from './pages/ForgotPasswordPage.jsx';
import AuthCallback from './pages/AuthCallback.jsx';
import StudentDashboard from './pages/student/Dashboard.jsx';
import StudentAllCourses from './pages/student/AllCourses.jsx';
import StudentMyCourses from './pages/student/MyCourses.jsx';
import TeacherDashboard from './pages/teacher/Dashboard.jsx';
import TeacherMyCourses from './pages/teacher/MyCourses.jsx';
import AdminDashboard from './pages/admin/Dashboard.jsx';
import TeacherApprovals from './pages/admin/TeacherApprovals.jsx';
import UserManagement from './pages/admin/UserManagement.jsx';
import ActivityLogs from './pages/admin/ActivityLogs.jsx';
import EmailNotifications from './pages/admin/EmailNotifications.jsx';
import DatabaseTest from './pages/DatabaseTest.jsx';
import ProfilePage from './pages/ProfilePage.jsx';

import ProtectedRoute from './components/ProtectedRoute.jsx';

// Component to handle root class changes based on route
const AppContent = () => {
    const location = useLocation();

    useEffect(() => {
        const root = document.getElementById('root');
        if (location.pathname === '/dashboard' || location.pathname === '/profile') {
            root.className = 'dashboard-root';
        } else {
            root.className = 'page-root';
        }
    }, [location.pathname]);

    return (
        <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route
                path="/dashboard"
                element={
                    <ProtectedRoute>
                        <StudentDashboard />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/allcourses"
                element={
                    <ProtectedRoute>
                        <StudentAllCourses />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/mycourses"
                element={
                    <ProtectedRoute>
                        <StudentMyCourses />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/teacher/dashboard"
                element={
                    <ProtectedRoute>
                        <TeacherDashboard />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/teacher/courses"
                element={
                    <ProtectedRoute>
                        <TeacherMyCourses />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/database-test"
                element={
                    <ProtectedRoute>
                        <DatabaseTest />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/admin/dashboard"
                element={
                    <ProtectedRoute>
                        <AdminDashboard />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/admin/approvals"
                element={
                    <ProtectedRoute>
                        <TeacherApprovals />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/admin/users"
                element={
                    <ProtectedRoute>
                        <UserManagement />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/admin/activity"
                element={
                    <ProtectedRoute>
                        <ActivityLogs />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/admin/emails"
                element={
                    <ProtectedRoute>
                        <EmailNotifications />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/profile"
                element={
                    <ProtectedRoute>
                        <ProfilePage />
                    </ProtectedRoute>
                }
            />
        </Routes>
    );
};

function App() {
    return (
        <AuthProvider>
            <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                <AppContent />
                <Toaster
                    position="top-center"
                    toastOptions={{
                        duration: 4000,
                        style: {
                            background: '#363636',
                            color: '#fff',
                        },
                    }}
                />
            </Router>
        </AuthProvider>
    );
}

export default App; 