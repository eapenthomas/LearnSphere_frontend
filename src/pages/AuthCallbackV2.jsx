import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { motion } from 'framer-motion';
import { BookOpen, Loader, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '../utils/supabaseClient.js';

const AuthCallbackV2 = () => {
  const navigate = useNavigate();
  const { setUser, setLoading } = useAuth();
  const [status, setStatus] = useState('processing'); // processing, success, error
  const [message, setMessage] = useState('Setting up your account...');
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    let timeoutId = null;

    // Set a timeout to prevent infinite loading
    timeoutId = setTimeout(() => {
      if (isMounted && status === 'processing') {
        console.error('❌ AuthCallback - Timeout reached (30s)');
        setStatus('error');
        setError('Authentication timeout. Please try again.');
        setTimeout(() => navigate('/login?error=timeout'), 2000);
      }
    }, 30000); // 30 second timeout

    const handleAuthCallback = async () => {
      try {
        console.log('🚀 AuthCallbackV2 - Starting Google auth callback processing...');
        setMessage('Verifying your Google account...');

        // Step 1: Get the session from Supabase
        console.log('📡 Fetching session from Supabase...');
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          console.error('❌ Session error:', sessionError);
          throw new Error(`Session error: ${sessionError.message}`);
        }

        if (!session) {
          console.error('❌ No session found');
          throw new Error('No session found. Please try logging in again.');
        }

        console.log('✅ Session found for:', session.user.email);
        setMessage('Loading your profile...');

        // Step 2: Try to fetch user profile
        console.log('📡 Fetching user profile from database...');
        let profile = null;
        let retryCount = 0;
        const maxRetries = 3;

        while (!profile && retryCount < maxRetries) {
          try {
            const { data: profileData, error: profileError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .maybeSingle();

            if (profileError) {
              console.warn(`⚠️ Profile fetch attempt ${retryCount + 1} failed:`, profileError);
              if (retryCount < maxRetries - 1) {
                await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retry
                retryCount++;
                continue;
              }
            }

            profile = profileData;
            break;
          } catch (fetchError) {
            console.error(`❌ Profile fetch error (attempt ${retryCount + 1}):`, fetchError);
            if (retryCount < maxRetries - 1) {
              await new Promise(resolve => setTimeout(resolve, 1000));
              retryCount++;
            } else {
              throw fetchError;
            }
          }
        }

        // Step 3: Create profile if it doesn't exist
        if (!profile) {
          console.log('📝 Profile not found, creating new profile...');
          setMessage('Creating your LearnSphere account...');

          const fullName = 
            session.user.user_metadata?.full_name ||
            session.user.user_metadata?.name ||
            session.user.email?.split('@')[0] ||
            'User';

          const newProfileData = {
            id: session.user.id,
            email: session.user.email,
            full_name: fullName,
            role: 'student', // Default role for Google users
            approval_status: 'approved',
            is_active: true
          };

          try {
            const { data: createdProfile, error: createError } = await supabase
              .from('profiles')
              .insert(newProfileData)
              .select()
              .single();

            if (createError) {
              console.error('❌ Profile creation error:', createError);
              // Profile might have been created by database trigger, try fetching again
              const { data: retryProfile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single();
              
              profile = retryProfile || newProfileData; // Use fetched or fallback to new data
            } else {
              profile = createdProfile;
              console.log('✅ New profile created successfully');
            }
          } catch (createError) {
            console.error('❌ Failed to create profile:', createError);
            // Use fallback profile data
            profile = newProfileData;
          }
        } else {
          console.log('✅ Profile found:', profile.email);
        }

        // Step 4: Validate account status
        if (!profile.is_active) {
          throw new Error('Your account has been disabled. Please contact support.');
        }

        if (profile.role === 'teacher' && profile.approval_status !== 'approved') {
          console.log('⏳ Teacher account pending approval');
          setMessage('Your teacher account is pending approval...');
          // Still allow login but will show approval screen
        }

        // Step 5: Create user object
        const userObj = {
          id: session.user.id,
          email: session.user.email,
          accessToken: session.access_token,
          role: profile.role || 'student',
          fullName: profile.full_name || session.user.email?.split('@')[0] || 'User',
          approvalStatus: profile.approval_status || 'approved',
          isActive: profile.is_active !== false
        };

        console.log('👤 User object created:', { ...userObj, accessToken: '***' });

        // Step 6: Store in context and localStorage
        setUser(userObj);
        
        localStorage.setItem('learnsphere_user', JSON.stringify({
          id: userObj.id,
          email: userObj.email,
          fullName: userObj.fullName,
          role: userObj.role,
          approvalStatus: userObj.approvalStatus,
          isActive: userObj.isActive
        }));
        localStorage.setItem('learnsphere_token', session.access_token);

        console.log('✅ User data stored successfully');
        
        // Step 7: Show success and redirect
        setStatus('success');
        setMessage('Welcome to LearnSphere!');
        
        setTimeout(() => {
          if (!isMounted) return;
          
          // Redirect based on role
          if (userObj.role === 'admin') {
            console.log('🔄 Redirecting to admin dashboard');
            navigate('/admin/dashboard');
          } else if (userObj.role === 'teacher') {
            console.log('🔄 Redirecting to teacher dashboard');
            navigate('/teacher/dashboard');
          } else {
            console.log('🔄 Redirecting to student dashboard');
            navigate('/dashboard');
          }
        }, 1500);

      } catch (error) {
        console.error('❌ AuthCallbackV2 - Error:', error);
        
        if (!isMounted) return;
        
        setStatus('error');
        setError(error.message || 'An unexpected error occurred');
        setMessage('Authentication failed');
        
        setTimeout(() => {
          if (isMounted) {
            navigate('/login?error=auth_failed');
          }
        }, 3000);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    handleAuthCallback();

    // Cleanup function
    return () => {
      isMounted = false;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [navigate, setUser, setLoading]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center max-w-md w-full"
      >
        <div className="flex items-center justify-center mb-6">
          <div className={`p-4 rounded-2xl ${
            status === 'success' 
              ? 'bg-gradient-to-r from-green-500 to-green-600'
              : status === 'error'
              ? 'bg-gradient-to-r from-red-500 to-red-600'
              : 'bg-gradient-to-r from-blue-500 to-blue-600'
          }`}>
            {status === 'success' ? (
              <CheckCircle className="w-12 h-12 text-white" />
            ) : status === 'error' ? (
              <AlertCircle className="w-12 h-12 text-white" />
            ) : (
              <BookOpen className="w-12 h-12 text-white" />
            )}
          </div>
        </div>
        
        <h1 className={`text-2xl font-bold mb-4 ${
          status === 'error' ? 'text-red-700' : 'text-gray-800'
        }`}>
          {status === 'success' 
            ? 'Success!' 
            : status === 'error'
            ? 'Authentication Failed'
            : 'Welcome to LearnSphere!'}
        </h1>
        
        <p className="text-gray-600 mb-8">
          {message}
        </p>
        
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}
        
        <div className="flex items-center justify-center">
          {status === 'processing' && (
            <Loader className="w-8 h-8 text-blue-500 animate-spin" />
          )}
        </div>

        {status === 'error' && (
          <p className="text-sm text-gray-500 mt-4">
            Redirecting to login page...
          </p>
        )}
      </motion.div>
    </div>
  );
};

export default AuthCallbackV2;

