import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { motion } from 'framer-motion';
import { BookOpen, Loader } from 'lucide-react';
import { supabase } from '../utils/supabaseClient.js';

const AuthCallback = () => {
  const navigate = useNavigate();
  const { user, setUser, setLoading } = useAuth();

  useEffect(() => {
    // Set a timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      console.error('AuthCallback - Timeout reached, redirecting to login');
      navigate('/login?error=timeout');
    }, 30000); // 30 second timeout

    const handleAuthCallback = async () => {
      try {
        console.log('AuthCallback - Processing Google auth callback...');

        // Get the session from Supabase
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error('AuthCallback - Session error:', error);
          navigate('/login?error=auth_failed');
          return;
        }

        if (!session) {
          console.log('AuthCallback - No session found, checking if user already loaded');
          // If user is already loaded from context, redirect them
          if (user) {
            redirectUser(user);
            return;
          }
          navigate('/login?error=no_session');
          return;
        }

        console.log('AuthCallback - Session found:', session.user.email);

        // Get user profile from database
        let { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        // If profile doesn't exist, create one for new Google users
        if (profileError && profileError.code === 'PGRST116') {
          console.log('AuthCallback - Profile not found, creating new profile for Google user');

          // Extract name from Google user metadata
          const fullName = session.user.user_metadata?.full_name ||
                          session.user.user_metadata?.name ||
                          session.user.email?.split('@')[0] ||
                          'User';

          console.log('AuthCallback - Creating profile with data:', {
            id: session.user.id,
            email: session.user.email,
            full_name: fullName,
            role: 'student'
          });

          // Create new profile with default role as student
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert({
              id: session.user.id,
              email: session.user.email,
              full_name: fullName,
              role: 'student', // Default role for Google users
              approval_status: 'approved',
              is_active: true,
              created_at: new Date().toISOString()
            })
            .select()
            .single();

          if (createError) {
            console.error('AuthCallback - Error creating profile:', createError);
            console.error('AuthCallback - Create error details:', {
              message: createError.message,
              code: createError.code,
              details: createError.details,
              hint: createError.hint
            });
            
            // If profile creation fails, still try to proceed with basic user data
            console.log('AuthCallback - Profile creation failed, proceeding with basic user data');
            profile = {
              id: session.user.id,
              email: session.user.email,
              full_name: fullName,
              role: 'student',
              approval_status: 'approved',
              is_active: true
            };
          } else {
            profile = newProfile;
            console.log('AuthCallback - New profile created:', profile);
          }
        } else if (profileError) {
          console.error('AuthCallback - Profile error:', profileError);
          console.error('AuthCallback - Profile error details:', {
            message: profileError.message,
            code: profileError.code,
            details: profileError.details,
            hint: profileError.hint
          });
          
          // If we can't fetch profile, create a basic one
          console.log('AuthCallback - Profile fetch failed, creating basic profile data');
          const fullName = session.user.user_metadata?.full_name ||
                          session.user.user_metadata?.name ||
                          session.user.email?.split('@')[0] ||
                          'User';
          
          profile = {
            id: session.user.id,
            email: session.user.email,
            full_name: fullName,
            role: 'student',
            approval_status: 'approved',
            is_active: true
          };
        }

        console.log('AuthCallback - Profile found:', profile);

        // Create user object
        const userObj = {
          id: session.user.id,
          email: session.user.email,
          accessToken: session.access_token,
          role: profile.role,
          fullName: profile.full_name,
          approvalStatus: profile.approval_status,
          isActive: profile.is_active
        };

        // Set user in context
        setUser(userObj);

        // Store session in localStorage for persistence
        localStorage.setItem('learnsphere_user', JSON.stringify({
          id: session.user.id,
          email: session.user.email,
          fullName: profile.full_name,
          role: profile.role,
          approvalStatus: profile.approval_status,
          isActive: profile.is_active
        }));
        localStorage.setItem('learnsphere_token', session.access_token);

        // Redirect user
        redirectUser(userObj);

      } catch (error) {
        console.error('AuthCallback - Unexpected error:', error);
        navigate('/login?error=unexpected_error');
      } finally {
        setLoading(false);
        clearTimeout(timeoutId); // Clear timeout on completion
      }
    };

    const redirectUser = (userData) => {
      console.log('AuthCallback - Redirecting user with role:', userData.role);

      // Check if account is disabled
      if (!userData.isActive) {
        console.log('AuthCallback - User account is disabled');
        navigate('/login?error=account_disabled');
        return;
      }

      // Check teacher approval status
      if (userData.role === 'teacher' && userData.approvalStatus !== 'approved') {
        console.log('AuthCallback - Teacher not approved, will show approval screen');
        navigate('/teacher/dashboard'); // ProtectedRoute will handle approval screen
        return;
      }

      // Redirect based on role
      if (userData.role === 'admin') {
        console.log('AuthCallback - Redirecting admin to admin dashboard');
        navigate('/admin/dashboard');
      } else if (userData.role === 'teacher') {
        console.log('AuthCallback - Redirecting teacher to teacher dashboard');
        navigate('/teacher/dashboard');
      } else {
        console.log('AuthCallback - Redirecting student to student dashboard');
        navigate('/dashboard');
      }
    };

    // If user is already loaded, redirect immediately
    if (user) {
      redirectUser(user);
    } else {
      // Otherwise, handle the auth callback
      handleAuthCallback();
    }

    // Cleanup function to clear timeout
    return () => {
      clearTimeout(timeoutId);
    };
  }, [user, navigate, setUser, setLoading]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <div className="flex items-center justify-center mb-6">
          <div className="p-4 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl">
            <BookOpen className="w-12 h-12 text-white" />
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          Welcome to LearnSphere!
        </h1>
        
        <p className="text-gray-600 mb-8">
          Setting up your account...
        </p>
        
        <div className="flex items-center justify-center">
          <Loader className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
      </motion.div>
    </div>
  );
};

export default AuthCallback;
