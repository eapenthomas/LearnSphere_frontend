import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import TeacherApprovalCheck from './TeacherApprovalCheck.jsx';

const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();

    // Enhanced debug logging
    console.log('ProtectedRoute - Loading:', loading, 'User:', user);
    console.log('ProtectedRoute - LocalStorage user:', localStorage.getItem('learnsphere_user'));
    console.log('ProtectedRoute - LocalStorage token:', !!localStorage.getItem('learnsphere_token'));

    if (loading) {
        console.log('ProtectedRoute - Still loading, showing spinner');
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-gray-600 font-medium">Loading your dashboard...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        console.log('ProtectedRoute - No user found, redirecting to login');
        console.log('ProtectedRoute - Current path:', window.location.pathname);
        return <Navigate to="/login" replace />;
    }

    // Check if user account is disabled
    if (user.isActive === false) {
        console.log('ProtectedRoute - User account is disabled');
        return <Navigate to="/login" replace />;
    }

    // Check teacher approval status
    if (user.role === 'teacher' && user.approvalStatus !== 'approved') {
        console.log('ProtectedRoute - Teacher not approved, showing approval check');
        return <TeacherApprovalCheck />;
    }

    console.log('ProtectedRoute - User authenticated and approved, rendering children');
    return children;
};

export default ProtectedRoute; 