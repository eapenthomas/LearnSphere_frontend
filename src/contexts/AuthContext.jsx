import React, { createContext, useContext, useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import axios from 'axios';

const AuthContext = createContext();

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Warn if environment variables are not set
if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('⚠️ Supabase environment variables not found. Please create a .env file with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
}

const supabase = createClient(
    supabaseUrl || 'https://placeholder.supabase.co',
    supabaseAnonKey || 'placeholder_key'
);

const API_BASE_URL = 'http://localhost:8000';

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [initialized, setInitialized] = useState(false);

    // Function to fetch user profile from Supabase
    const fetchUserProfile = async (userId) => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (error) {
                console.error('Error fetching user profile:', error);
                return null;
            }

            return data;
        } catch (error) {
            console.error('Error fetching user profile:', error);
            return null;
        }
    };

    // Function to validate stored session
    const validateStoredSession = () => {
        try {
            const storedUser = localStorage.getItem('learnsphere_user');
            const storedToken = localStorage.getItem('learnsphere_token');

            if (!storedUser || !storedToken) {
                return null;
            }

            const userData = JSON.parse(storedUser);

            // Basic validation
            if (!userData.id || !userData.email) {
                console.log('Invalid stored user data, clearing session');
                localStorage.removeItem('learnsphere_user');
                localStorage.removeItem('learnsphere_token');
                return null;
            }

            return { userData, token: storedToken };
        } catch (error) {
            console.error('Error validating stored session:', error);
            localStorage.removeItem('learnsphere_user');
            localStorage.removeItem('learnsphere_token');
            return null;
        }
    };

    useEffect(() => {
        // Initialize authentication state
        const initializeAuth = () => {
            console.log('AuthContext - Initializing authentication...');

            try {
                // Check localStorage for stored session
                const storedUser = localStorage.getItem('learnsphere_user');
                const storedToken = localStorage.getItem('learnsphere_token');

                console.log('AuthContext - Stored user exists:', !!storedUser);
                console.log('AuthContext - Stored token exists:', !!storedToken);

                if (storedUser && storedToken) {
                    console.log('AuthContext - Restoring session from localStorage');
                    const userData = JSON.parse(storedUser);

                    // Validate stored data
                    if (userData.id && userData.email) {
                        // Force admin role for specific email
                        const finalRole = userData.email === 'eapentkadamapuzha@gmail.com' ? 'admin' : (userData.role || 'student');

                        setUser({
                            id: userData.id,
                            email: userData.email,
                            accessToken: storedToken,
                            fullName: userData.fullName || 'User',
                            role: finalRole,
                            approvalStatus: userData.approvalStatus || 'approved',
                            isActive: userData.isActive !== undefined ? userData.isActive : true
                        });
                        console.log('AuthContext - Session restored for:', userData.fullName, 'Role:', finalRole);
                    } else {
                        console.log('AuthContext - Invalid stored data, clearing...');
                        localStorage.removeItem('learnsphere_user');
                        localStorage.removeItem('learnsphere_token');
                    }
                } else {
                    console.log('AuthContext - No stored session found');
                }
            } catch (error) {
                console.error('AuthContext - Error during initialization:', error);
                // Clear corrupted data
                localStorage.removeItem('learnsphere_user');
                localStorage.removeItem('learnsphere_token');
            } finally {
                console.log('AuthContext - Initialization complete');
                setInitialized(true);
                setLoading(false);
            }
        };

        // Run initialization immediately
        initializeAuth();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                console.log('AuthContext - Auth state change:', event);
                if (event === 'SIGNED_IN' && session) {
                    // Fetch user profile from profiles table
                    const profile = await fetchUserProfile(session.user.id);

                    const userData = {
                        id: session.user.id,
                        email: session.user.email,
                        accessToken: session.access_token,
                        fullName: profile?.full_name || session.user.email?.split('@')[0] || 'User',
                        role: profile?.role || 'student'
                    };

                    setUser(userData);

                    // Store in localStorage for persistence
                    localStorage.setItem('learnsphere_user', JSON.stringify({
                        id: userData.id,
                        email: userData.email,
                        fullName: userData.fullName,
                        role: userData.role
                    }));
                    localStorage.setItem('learnsphere_token', userData.accessToken);
                } else if (event === 'SIGNED_OUT') {
                    setUser(null);
                    localStorage.removeItem('learnsphere_user');
                    localStorage.removeItem('learnsphere_token');
                }
            }
        );

        return () => subscription.unsubscribe();
    }, []);

    // Set up real-time subscription for profile updates
    useEffect(() => {
        if (!user?.id) return;

        console.log('AuthContext - Setting up profile subscription for user:', user.id);

        const profileSubscription = supabase
            .channel(`profile-${user.id}`)
            .on('postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'profiles',
                    filter: `id=eq.${user.id}`
                },
                (payload) => {
                    console.log('AuthContext - Profile updated, refreshing user data:', payload);
                    // Refresh user data when profile is updated
                    refreshUserData();
                }
            )
            .subscribe();

        return () => {
            console.log('AuthContext - Cleaning up profile subscription');
            profileSubscription.unsubscribe();
        };
    }, [user?.id]);

    const register = async (userData) => {
        console.log('AuthContext - Starting registration for:', userData.email);
        try {
            const response = await axios.post(`${API_BASE_URL}/register`, userData);
            const { access_token, user_id, role, full_name } = response.data;
            console.log('AuthContext - Registration successful, setting user data');

            // Force admin role for specific email
            const finalRole = userData.email === 'eapentkadamapuzha@gmail.com' ? 'admin' : role;

            const userObj = {
                id: user_id,
                email: userData.email,
                accessToken: access_token,
                role: finalRole,
                fullName: full_name,
                approvalStatus: response.data.approval_status,
                isActive: response.data.is_active
            };

            setUser(userObj);

            // Store session in localStorage for persistence
            localStorage.setItem('learnsphere_user', JSON.stringify({
                id: user_id,
                email: userData.email,
                fullName: full_name,
                role: finalRole,
                approvalStatus: response.data.approval_status,
                isActive: response.data.is_active
            }));
            localStorage.setItem('learnsphere_token', access_token);

            // Ensure loading is set to false after successful registration
            console.log('AuthContext - Setting loading to false after registration');
            setLoading(false);

            return { success: true, data: response.data };
        } catch (error) {
            console.error('AuthContext - Registration error:', error);
            // Also set loading to false on error
            setLoading(false);
            return {
                success: false,
                error: error.response?.data?.detail || 'Registration failed'
            };
        }
    };

    const login = async (credentials) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/login`, credentials);
            const { access_token, user_id, role, full_name } = response.data;

            // Force admin role for specific email
            const finalRole = credentials.email === 'eapentkadamapuzha@gmail.com' ? 'admin' : role;

            const userObj = {
                id: user_id,
                email: credentials.email,
                accessToken: access_token,
                role: finalRole,
                fullName: full_name,
                approvalStatus: response.data.approval_status,
                isActive: response.data.is_active
            };

            setUser(userObj);

            // Store session in localStorage for persistence
            localStorage.setItem('learnsphere_user', JSON.stringify({
                id: user_id,
                email: credentials.email,
                fullName: full_name,
                role: finalRole,
                approvalStatus: response.data.approval_status,
                isActive: response.data.is_active
            }));
            localStorage.setItem('learnsphere_token', access_token);

            // Ensure loading is set to false after successful login
            setLoading(false);

            return { success: true, data: response.data };
        } catch (error) {
            // Also set loading to false on error
            setLoading(false);
            return {
                success: false,
                error: error.response?.data?.detail || 'Login failed'
            };
        }
    };

    const loginWithGoogle = async () => {
        try {
            // Check if Supabase is properly configured
            if (!supabaseUrl || supabaseUrl === 'https://placeholder.supabase.co') {
                return {
                    success: false,
                    error: 'Supabase not configured. Please set up your VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in the .env file.'
                };
            }

            const { data: { url } } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`
                }
            });

            window.location.href = url;
        } catch (error) {
            console.error('Google login error:', error);
            return { success: false, error: 'Google login failed' };
        }
    };

    const logout = async () => {
        console.log('AuthContext - Starting logout process...');
        try {
            // Clear user state immediately for better UX
            setUser(null);
            setLoading(false);

            // Try to sign out from Supabase (in case there's a session)
            try {
                await supabase.auth.signOut();
                console.log('AuthContext - Supabase signout successful');
            } catch (supabaseError) {
                console.log('AuthContext - No Supabase session to sign out from:', supabaseError.message);
                // This is expected for backend API users, so we don't treat it as an error
            }

            // Clear any stored tokens or session data
            localStorage.removeItem('access_token');
            localStorage.removeItem('user_data');
            localStorage.removeItem('learnsphere_user');
            localStorage.removeItem('learnsphere_token');
            sessionStorage.clear();

            console.log('AuthContext - Logout completed successfully');
            return { success: true };
        } catch (error) {
            console.error('AuthContext - Logout error:', error);
            // Even if there's an error, we still want to clear the user state
            setUser(null);
            setLoading(false);
            return { success: false, error: 'Logout completed with warnings' };
        }
    };

    const refreshUserData = async () => {
        if (!user?.id) return;

        try {
            console.log('AuthContext - Refreshing user data for:', user.id);

            // Fetch fresh user profile from database
            const { data: profile, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            if (error) {
                console.error('AuthContext - Error refreshing user data:', error);
                return;
            }

            console.log('AuthContext - Fresh profile data:', profile);

            // Update user object with fresh data
            const updatedUser = {
                ...user,
                role: profile.role,
                fullName: profile.full_name,
                approvalStatus: profile.approval_status,
                isActive: profile.is_active
            };

            setUser(updatedUser);

            // Update localStorage with fresh data
            localStorage.setItem('learnsphere_user', JSON.stringify({
                id: updatedUser.id,
                email: updatedUser.email,
                fullName: updatedUser.fullName,
                role: updatedUser.role,
                approvalStatus: updatedUser.approvalStatus,
                isActive: updatedUser.isActive
            }));

            console.log('AuthContext - User data refreshed successfully');
            return updatedUser;
        } catch (error) {
            console.error('AuthContext - Exception refreshing user data:', error);
        }
    };

    const value = {
        user,
        loading,
        register,
        login,
        loginWithGoogle,
        logout,
        refreshUserData
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}; 