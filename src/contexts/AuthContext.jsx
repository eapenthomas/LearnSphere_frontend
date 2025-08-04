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

    useEffect(() => {
        // Check for existing session
        const checkSession = async () => {
            console.log('AuthContext - Checking for existing session...');
            try {
                const { data: { session } } = await supabase.auth.getSession();
                console.log('AuthContext - Session found:', !!session);
                if (session) {
                    // Fetch user profile from profiles table
                    const profile = await fetchUserProfile(session.user.id);
                    console.log('AuthContext - Profile fetched:', profile);

                    setUser({
                        id: session.user.id,
                        email: session.user.email,
                        accessToken: session.access_token,
                        fullName: profile?.full_name || session.user.email?.split('@')[0] || 'User',
                        role: profile?.role || 'student'
                    });
                } else {
                    console.log('AuthContext - No session found');
                }
            } catch (error) {
                console.error('Error checking session:', error);
            } finally {
                console.log('AuthContext - Setting loading to false');
                setLoading(false);
            }
        };

        checkSession();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                if (event === 'SIGNED_IN' && session) {
                    // Fetch user profile from profiles table
                    const profile = await fetchUserProfile(session.user.id);

                    setUser({
                        id: session.user.id,
                        email: session.user.email,
                        accessToken: session.access_token,
                        fullName: profile?.full_name || session.user.email?.split('@')[0] || 'User',
                        role: profile?.role || 'student'
                    });
                } else if (event === 'SIGNED_OUT') {
                    setUser(null);
                }
            }
        );

        return () => subscription.unsubscribe();
    }, []);

    const register = async (userData) => {
        console.log('AuthContext - Starting registration for:', userData.email);
        try {
            const response = await axios.post(`${API_BASE_URL}/register`, userData);
            const { access_token, user_id, role, full_name } = response.data;
            console.log('AuthContext - Registration successful, setting user data');

            setUser({
                id: user_id,
                email: userData.email,
                accessToken: access_token,
                role,
                fullName: full_name
            });

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

            setUser({
                id: user_id,
                email: credentials.email,
                accessToken: access_token,
                role,
                fullName: full_name
            });

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
                    redirectTo: `${window.location.origin}/dashboard`
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

    const value = {
        user,
        loading,
        register,
        login,
        loginWithGoogle,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}; 