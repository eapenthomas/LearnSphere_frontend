import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';

const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();

    // Debug logging (remove in production)
    console.log('ProtectedRoute - Loading:', loading, 'User:', user);

    if (loading) {
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
        return <Navigate to="/login" replace />;
    }

    console.log('ProtectedRoute - User authenticated, rendering children');
    return children;
};

export default ProtectedRoute; 