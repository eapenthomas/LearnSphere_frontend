import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { supabase } from '../utils/supabaseClient.js';
import { toast } from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext.jsx';
import {
  User,
  Mail,
  Phone,
  UserCheck,
  Save,
  AlertCircle,
  CheckCircle,
  Loader
} from 'lucide-react';

// Validation schema
const profileSchema = yup.object().shape({
  phone: yup
    .string()
    .matches(/^[6-9]\d{9}$/, 'Phone number must be exactly 10 digits and start with 6, 7, 8, or 9')
    .nullable()
    .transform((value, originalValue) => originalValue === '' ? null : value)
});

const ProfileInformation = ({ profileData, onUpdate }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
    watch
  } = useForm({
    resolver: yupResolver(profileSchema),
    defaultValues: {
      full_name: profileData?.full_name || '',
      phone: profileData?.phone || ''
    },
    mode: 'onChange'
  });

  // Watch form values for real-time validation feedback
  const watchedValues = watch();

  // Reset form when profileData changes
  React.useEffect(() => {
    if (profileData) {
      reset({
        phone: profileData.phone || ''
      });
    }
  }, [profileData, reset]);

  const onSubmit = async (data) => {
    setLoading(true);

    try {
      console.log('Updating profile with data:', data);

      // First try to update the existing profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          phone: data.phone || null
        })
        .eq('id', user.id);

      // If update fails because profile doesn't exist, create it
      if (updateError && updateError.code === 'PGRST116') {
        console.log('Profile not found, creating new profile...');

        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            email: user.email,
            full_name: profileData?.full_name || user.fullName || 'User',
            role: user.role || 'student',
            phone: data.phone || null
          });

        if (insertError) {
          console.error('Profile creation error:', insertError);
          toast.error('Failed to create profile. Please try again.');
          return;
        }

        toast.success('Profile created and updated successfully!');
      } else if (updateError) {
        console.error('Profile update error:', updateError);
        toast.error('Failed to update profile. Please try again.');
        return;
      } else {
        toast.success('Profile updated successfully!');
      }

      // Update local state
      onUpdate(data);

      // Reset form dirty state
      reset(data);

    } catch (err) {
      console.error('Profile update error:', err);
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    reset({
      phone: profileData?.phone || ''
    });
  };

  return (
    <div className="card p-6 hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-gray-50 border border-gray-100">
      {/* Card Header */}
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg">
          <User className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-800">Profile Information</h2>
          <p className="text-sm text-gray-600">Update your personal details and preferences</p>
        </div>
      </div>

      {/* Profile Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Full Name Field */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Full Name
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={profileData?.full_name || ''}
              readOnly
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
              placeholder="Full name"
            />
          </div>
          <p className="mt-2 text-xs text-gray-500">
            Name cannot be changed. Contact support if you need to update your name.
          </p>
        </div>

        {/* Email Field (Read-only) */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="email"
              value={profileData?.email || ''}
              readOnly
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
              placeholder="Email address"
            />
          </div>
          <p className="mt-2 text-xs text-gray-500">
            Email cannot be changed. Contact support if you need to update your email.
          </p>
        </div>

        {/* Role Field (Read-only) */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Role
          </label>
          <div className="relative">
            <UserCheck className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={profileData?.role || 'student'}
              readOnly
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed capitalize"
              placeholder="Role"
            />
          </div>
          <p className="mt-2 text-xs text-gray-500">
            Role is assigned by administrators and cannot be changed.
          </p>
        </div>

        {/* Phone Number Field */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Phone Number
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="tel"
              {...register('phone')}
              className={`
                w-full pl-10 pr-4 py-3 border rounded-lg transition-all duration-200
                focus:outline-none focus:ring-2 focus:border-transparent bg-white text-gray-800
                ${errors.phone 
                  ? 'border-red-300 focus:ring-red-400' 
                  : 'border-gray-200 focus:ring-blue-400'
                }
              `}
              placeholder="Enter your phone number (10 digits)"
            />
            {errors.phone && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <AlertCircle className="w-5 h-5 text-red-500" />
              </div>
            )}
          </div>
          {errors.phone && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-2 text-sm text-red-600 flex items-center space-x-1"
            >
              <AlertCircle className="w-4 h-4" />
              <span>{errors.phone.message}</span>
            </motion.p>
          )}
          <p className="mt-2 text-xs text-gray-500">
            Phone number must be exactly 10 digits and start with 6, 7, 8, or 9.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3 pt-6 border-t border-gray-200">
          <motion.button
            type="submit"
            disabled={loading || !isDirty || Object.keys(errors).length > 0}
            whileHover={{ scale: !loading ? 1.02 : 1 }}
            whileTap={{ scale: !loading ? 0.98 : 1 }}
            className={`
              flex-1 flex items-center justify-center space-x-2 py-3 px-6 rounded-lg font-semibold
              transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2
              ${loading || !isDirty || Object.keys(errors).length > 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl focus:ring-blue-500'
              }
            `}
          >
            {loading ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                <span>Save Changes</span>
              </>
            )}
          </motion.button>

          {isDirty && (
            <motion.button
              type="button"
              onClick={handleReset}
              disabled={loading}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200 font-semibold focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              Reset
            </motion.button>
          )}
        </div>
      </form>
    </div>
  );
};

export default ProfileInformation;
