import React, { useState, useCallback, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext.jsx';
import Input from '../components/Input.jsx';
import Button from '../components/Button.jsx';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import {
  BookOpen,
  Eye,
  EyeOff,
  User,
  Mail,
  Lock,
  GraduationCap,
  ArrowRight,
  AlertCircle,
  CheckCircle,
  Shield,
  Zap
} from 'lucide-react';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    confirm_password: '',
    role: 'student'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Real-time validation states
  const [validationErrors, setValidationErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [emailChecking, setEmailChecking] = useState(false);
  const [emailCheckTimeout, setEmailCheckTimeout] = useState(null);

  // API base URL
  const API_BASE_URL = 'http://localhost:8000';

  // Email availability check function
  const checkEmailAvailability = useCallback(async (email) => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return; // Don't check if email format is invalid
    }

    try {
      setEmailChecking(true);
      const response = await axios.post(`${API_BASE_URL}/check-email`, {
        email: email
      });

      if (response.data.exists) {
        setValidationErrors(prev => ({
          ...prev,
          email: 'This email is already registered. Please use a different email or try logging in.'
        }));
      } else {
        // Clear email error if it was about email existence
        setValidationErrors(prev => {
          const newErrors = { ...prev };
          if (newErrors.email && newErrors.email.includes('already registered')) {
            delete newErrors.email;
          }
          return newErrors;
        });
      }
    } catch (error) {
      console.error('Email check failed:', error);
      // Don't show error to user for email check failures
    } finally {
      setEmailChecking(false);
    }
  }, [API_BASE_URL]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (emailCheckTimeout) {
        clearTimeout(emailCheckTimeout);
      }
    };
  }, [emailCheckTimeout]);

  // Real-time validation functions
  const validateField = (name, value) => {
    const errors = {};

    switch (name) {
      case 'full_name':
        if (!value.trim()) {
          errors.full_name = 'Full name is required';
        } else if (value.trim().length < 2) {
          errors.full_name = 'Name must be at least 2 characters long';
        } else if (/\d/.test(value)) {
          errors.full_name = 'Name cannot contain numbers';
        } else if (!/^[a-zA-Z\s'-]+$/.test(value)) {
          errors.full_name = 'Name can only contain letters, spaces, hyphens, and apostrophes';
        }
        break;

      case 'email':
        if (!value.trim()) {
          errors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          errors.email = 'Please enter a valid email address';
        } else {
          // Schedule email availability check with debounce
          if (emailCheckTimeout) {
            clearTimeout(emailCheckTimeout);
          }
          const timeout = setTimeout(() => {
            checkEmailAvailability(value);
          }, 800); // 800ms debounce
          setEmailCheckTimeout(timeout);
        }
        break;

      case 'password':
        if (!value) {
          errors.password = 'Password is required';
        } else if (value.length < 8) {
          errors.password = 'Password must be at least 8 characters long';
        } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
          errors.password = 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
        }
        break;

      case 'confirm_password':
        if (!value) {
          errors.confirm_password = 'Please confirm your password';
        } else if (value !== formData.password) {
          errors.confirm_password = 'Passwords do not match';
        }
        break;

      default:
        break;
    }

    return errors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value
    });

    // Mark field as touched
    setTouched({
      ...touched,
      [name]: true
    });

    // Validate field in real-time
    const fieldErrors = validateField(name, value);
    setValidationErrors({
      ...validationErrors,
      ...fieldErrors,
      // Clear error if field is now valid
      ...(Object.keys(fieldErrors).length === 0 && { [name]: undefined })
    });

    // Clear general error
    setError('');
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;

    // Mark field as touched on blur
    setTouched({
      ...touched,
      [name]: true
    });

    // Validate field on blur
    const fieldErrors = validateField(name, value);
    setValidationErrors({
      ...validationErrors,
      ...fieldErrors,
      // Clear error if field is now valid
      ...(Object.keys(fieldErrors).length === 0 && { [name]: undefined })
    });
  };

  const validateForm = () => {
    // Validate all fields
    const allErrors = {};
    Object.keys(formData).forEach(field => {
      if (field !== 'role') {
        const fieldErrors = validateField(field, formData[field]);
        Object.assign(allErrors, fieldErrors);
      }
    });

    // Special case for confirm_password validation
    if (formData.confirm_password !== formData.password) {
      allErrors.confirm_password = 'Passwords do not match';
    }

    setValidationErrors(allErrors);

    // Mark all fields as touched
    const allTouched = {};
    Object.keys(formData).forEach(field => {
      allTouched[field] = true;
    });
    setTouched(allTouched);

    return Object.keys(allErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');

    const { confirm_password, ...registerData } = formData;

    const result = await register(registerData);

    if (result.success) {
      if (formData.role === 'teacher') {
        // Teacher registration requires approval
        toast.success('Registration successful! Your account is pending admin approval. You will receive an email notification once approved.');
        navigate('/login');
      } else {
        // Student registration is immediate
        navigate('/dashboard');
      }
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  const benefits = [
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Fast Setup",
      description: "Get started in minutes"
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Secure",
      description: "Your data is protected"
    },
    {
      icon: <CheckCircle className="w-6 h-6" />,
      title: "Free Access",
      description: "No hidden fees"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center page-container">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-16 mobile-grid"
      >
        {/* Left Side - Registration Form */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-col justify-center lg:w-full lg:max-w-lg xl:max-w-xl mx-auto order-2 lg:order-1"
        >
          {/* Logo and Title */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex justify-center mb-6"
            >
              <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl hover:scale-110 transition-transform duration-300">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-3xl font-extrabold text-gray-800 tracking-tight mb-3"
            >
              Join LearnSphere
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="text-gray-600 font-medium"
            >
              Start your learning journey today
            </motion.p>
          </div>

          {/* Registration Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="bg-white rounded-2xl shadow-lg border border-gray-100 mobile-padding sm:p-8 lg:p-10 hover:shadow-xl transition-all duration-300 w-full"
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Full Name Input */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                    validationErrors.full_name && touched.full_name
                      ? 'text-red-400'
                      : formData.full_name && !validationErrors.full_name && touched.full_name
                      ? 'text-green-400'
                      : 'text-gray-400'
                  }`} />
                  <input
                    type="text"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Enter your full name"
                    required
                    className={`w-full pl-10 pr-10 py-3 border rounded-lg focus:ring-2 focus:border-transparent transition-all duration-200 bg-white text-gray-800 ${
                      validationErrors.full_name && touched.full_name
                        ? 'border-red-300 focus:ring-red-400'
                        : formData.full_name && !validationErrors.full_name && touched.full_name
                        ? 'border-green-300 focus:ring-green-400'
                        : 'border-gray-200 focus:ring-blue-400'
                    }`}
                  />
                  {/* Validation Icon */}
                  {touched.full_name && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      {validationErrors.full_name ? (
                        <AlertCircle className="w-5 h-5 text-red-400" />
                      ) : formData.full_name ? (
                        <CheckCircle className="w-5 h-5 text-green-400" />
                      ) : null}
                    </div>
                  )}
                </div>
                {/* Error Message */}
                {validationErrors.full_name && touched.full_name && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-2 text-sm text-red-600 flex items-center"
                  >
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {validationErrors.full_name}
                  </motion.p>
                )}
                {/* Success Message */}
                {!validationErrors.full_name && formData.full_name && touched.full_name && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-2 text-sm text-green-600 flex items-center"
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Name looks good!
                  </motion.p>
                )}
              </div>

              {/* Email Input */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                    validationErrors.email && touched.email
                      ? 'text-red-400'
                      : formData.email && !validationErrors.email && touched.email
                      ? 'text-green-400'
                      : 'text-gray-400'
                  }`} />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Enter your email"
                    required
                    className={`w-full pl-10 pr-10 py-3 border rounded-lg focus:ring-2 focus:border-transparent transition-all duration-200 bg-white text-gray-800 ${
                      validationErrors.email && touched.email
                        ? 'border-red-300 focus:ring-red-400'
                        : formData.email && !validationErrors.email && touched.email
                        ? 'border-green-300 focus:ring-green-400'
                        : 'border-gray-200 focus:ring-blue-400'
                    }`}
                  />
                  {/* Validation Icon */}
                  {touched.email && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      {emailChecking ? (
                        <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                      ) : validationErrors.email ? (
                        <AlertCircle className="w-5 h-5 text-red-400" />
                      ) : formData.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) ? (
                        <CheckCircle className="w-5 h-5 text-green-400" />
                      ) : null}
                    </div>
                  )}
                </div>
                {/* Error Message */}
                {validationErrors.email && touched.email && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-2 text-sm text-red-600 flex items-center"
                  >
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {validationErrors.email}
                  </motion.p>
                )}
                {/* Success Message */}
                {!validationErrors.email && formData.email && touched.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) && !emailChecking && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-2 text-sm text-green-600 flex items-center"
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Email is available!
                  </motion.p>
                )}
                {/* Checking Message */}
                {emailChecking && formData.email && touched.email && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-2 text-sm text-blue-600 flex items-center"
                  >
                    <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-1" />
                    Checking email availability...
                  </motion.p>
                )}
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                    validationErrors.password && touched.password
                      ? 'text-red-400'
                      : formData.password && !validationErrors.password && touched.password
                      ? 'text-green-400'
                      : 'text-gray-400'
                  }`} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Create a password"
                    required
                    className={`w-full pl-10 pr-20 py-3 border rounded-lg focus:ring-2 focus:border-transparent transition-all duration-200 bg-white text-gray-800 ${
                      validationErrors.password && touched.password
                        ? 'border-red-300 focus:ring-red-400'
                        : formData.password && !validationErrors.password && touched.password
                        ? 'border-green-300 focus:ring-green-400'
                        : 'border-gray-200 focus:ring-blue-400'
                    }`}
                  />
                  {/* Validation Icon */}
                  {touched.password && (
                    <div className="absolute right-12 top-1/2 transform -translate-y-1/2">
                      {validationErrors.password ? (
                        <AlertCircle className="w-5 h-5 text-red-400" />
                      ) : formData.password ? (
                        <CheckCircle className="w-5 h-5 text-green-400" />
                      ) : null}
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {/* Error Message */}
                {validationErrors.password && touched.password && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-2 text-sm text-red-600 flex items-center"
                  >
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {validationErrors.password}
                  </motion.p>
                )}
                {/* Success Message */}
                {!validationErrors.password && formData.password && touched.password && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-2 text-sm text-green-600 flex items-center"
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Password strength is good!
                  </motion.p>
                )}
              </div>

              {/* Confirm Password Input */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                    validationErrors.confirm_password && touched.confirm_password
                      ? 'text-red-400'
                      : formData.confirm_password && !validationErrors.confirm_password && touched.confirm_password
                      ? 'text-green-400'
                      : 'text-gray-400'
                  }`} />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirm_password"
                    value={formData.confirm_password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Confirm your password"
                    required
                    className={`w-full pl-10 pr-20 py-3 border rounded-lg focus:ring-2 focus:border-transparent transition-all duration-200 bg-white text-gray-800 ${
                      validationErrors.confirm_password && touched.confirm_password
                        ? 'border-red-300 focus:ring-red-400'
                        : formData.confirm_password && !validationErrors.confirm_password && touched.confirm_password
                        ? 'border-green-300 focus:ring-green-400'
                        : 'border-gray-200 focus:ring-blue-400'
                    }`}
                  />
                  {/* Validation Icon */}
                  {touched.confirm_password && (
                    <div className="absolute right-12 top-1/2 transform -translate-y-1/2">
                      {validationErrors.confirm_password ? (
                        <AlertCircle className="w-5 h-5 text-red-400" />
                      ) : formData.confirm_password ? (
                        <CheckCircle className="w-5 h-5 text-green-400" />
                      ) : null}
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {/* Error Message */}
                {validationErrors.confirm_password && touched.confirm_password && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-2 text-sm text-red-600 flex items-center"
                  >
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {validationErrors.confirm_password}
                  </motion.p>
                )}
                {/* Success Message */}
                {!validationErrors.confirm_password && formData.confirm_password && touched.confirm_password && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-2 text-sm text-green-600 flex items-center"
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Passwords match!
                  </motion.p>
                )}
              </div>

              {/* Role Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  I am a
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <label className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <input
                      type="radio"
                      name="role"
                      value="student"
                      checked={formData.role === 'student'}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <div className={`w-4 h-4 border-2 rounded-full mr-3 flex items-center justify-center ${formData.role === 'student' ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                      }`}>
                      {formData.role === 'student' && <div className="w-2 h-2 bg-white rounded-full"></div>}
                    </div>
                    <div className="flex items-center">
                      <GraduationCap className="w-5 h-5 text-gray-600 mr-2" />
                      <span className="font-medium text-gray-700">Student</span>
                    </div>
                  </label>
                  <label className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <input
                      type="radio"
                      name="role"
                      value="teacher"
                      checked={formData.role === 'teacher'}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <div className={`w-4 h-4 border-2 rounded-full mr-3 flex items-center justify-center ${formData.role === 'teacher' ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                      }`}>
                      {formData.role === 'teacher' && <div className="w-2 h-2 bg-white rounded-full"></div>}
                    </div>
                    <div className="flex items-center">
                      <BookOpen className="w-5 h-5 text-gray-600 mr-2" />
                      <span className="font-medium text-gray-700">Teacher</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg"
                >
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  <span className="text-sm text-red-600 font-medium">{error}</span>
                </motion.div>
              )}

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={loading || emailChecking || Object.keys(validationErrors).some(key => validationErrors[key])}
                whileHover={{ scale: loading || emailChecking || Object.keys(validationErrors).some(key => validationErrors[key]) ? 1 : 1.02 }}
                whileTap={{ scale: loading || emailChecking || Object.keys(validationErrors).some(key => validationErrors[key]) ? 1 : 0.98 }}
                className={`btn-primary w-full ${loading || emailChecking ? 'btn-loading' : ''}`}
              >
                {loading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Creating account...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <span>Create Account</span>
                    <ArrowRight className="w-5 h-5" />
                  </div>
                )}
              </motion.button>
            </form>

            {/* Sign In Link */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="mt-6 text-center"
            >
              <p className="text-gray-600">
                Already have an account?{' '}
                <Link to="/login" className="text-blue-600 hover:text-blue-700 font-semibold transition-colors">
                  Sign in here
                </Link>
              </p>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Right Side - Benefits */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col justify-center lg:w-full lg:max-w-lg xl:max-w-xl mx-auto order-1 lg:order-2"
        >
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 mobile-padding sm:p-8 lg:p-10 hover:shadow-xl transition-all duration-300 w-full">
            <h2 className="text-2xl font-extrabold text-gray-800 mb-6">
              Why Choose LearnSphere?
            </h2>
            <div className="space-y-6">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={benefit.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 hover:scale-105 transition-all duration-300"
                >
                  <div className="p-2 bg-blue-100 rounded-lg">
                    {benefit.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-1">{benefit.title}</h3>
                    <p className="text-gray-600 text-sm">{benefit.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default RegisterPage; 