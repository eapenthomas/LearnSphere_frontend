import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext.jsx';
import LandingPage from './pages/LandingPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import StudentDashboard from './pages/StudentDashboard.jsx';
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
            <Route
                path="/dashboard"
                element={
                    <ProtectedRoute>
                        <StudentDashboard />
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
            </Router>
        </AuthProvider>
    );
}

export default App; 