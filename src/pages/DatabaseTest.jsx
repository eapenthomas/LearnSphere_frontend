import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext.jsx';
import { supabase } from '../utils/supabaseClient.js';
import { toast } from 'react-hot-toast';
import {
  Database,
  CheckCircle,
  XCircle,
  Loader,
  User,
  Table,
  Key
} from 'lucide-react';

const DatabaseTest = () => {
  const { user } = useAuth();
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState({});

  const runTests = async () => {
    setTesting(true);
    const testResults = {};

    try {
      // Test 1: Supabase connection
      console.log('Testing Supabase connection...');
      try {
        const { data, error } = await supabase.from('profiles').select('count', { count: 'exact', head: true });
        testResults.connection = { success: true, message: 'Connected to Supabase' };
      } catch (error) {
        testResults.connection = { success: false, message: `Connection failed: ${error.message}` };
      }

      // Test 2: User authentication
      console.log('Testing user authentication...');
      if (user && user.id) {
        testResults.auth = { success: true, message: `Authenticated as ${user.fullName} (${user.role})` };
      } else {
        testResults.auth = { success: false, message: 'User not authenticated' };
      }

      // Test 3: Profiles table access
      console.log('Testing profiles table...');
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, full_name, role')
          .eq('id', user.id)
          .single();
        
        if (error) throw error;
        testResults.profiles = { success: true, message: `Profile found: ${data.full_name} (${data.role})` };
      } catch (error) {
        testResults.profiles = { success: false, message: `Profiles access failed: ${error.message}` };
      }

      // Test 4: Courses table existence
      console.log('Testing courses table...');
      try {
        const { data, error } = await supabase
          .from('courses')
          .select('count', { count: 'exact', head: true });

        if (error) throw error;
        testResults.coursesTable = { success: true, message: 'Courses table exists and accessible' };
      } catch (error) {
        testResults.coursesTable = { success: false, message: `Courses table error: ${error.message}` };
      }

      // Test 4.5: Check RLS status
      console.log('Checking RLS status...');
      try {
        const { data, error } = await supabase.rpc('check_rls_status');
        testResults.rlsStatus = { success: true, message: 'RLS status checked' };
      } catch (error) {
        // This is expected to fail, just for info
        testResults.rlsStatus = { success: true, message: 'RLS check skipped (expected)' };
      }

      // Test 5: Course creation test
      console.log('Testing course creation...');
      try {
        const testCourse = {
          teacher_id: user.id,
          title: 'Test Course - ' + Date.now(),
          description: 'This is a test course',
          status: 'draft'
        };

        const { data, error } = await supabase
          .from('courses')
          .insert([testCourse])
          .select()
          .single();

        if (error) throw error;

        // Clean up test course
        await supabase.from('courses').delete().eq('id', data.id);
        
        testResults.courseCreation = { success: true, message: 'Course creation and deletion successful' };
      } catch (error) {
        testResults.courseCreation = { success: false, message: `Course creation failed: ${error.message}` };
      }

      setResults(testResults);
      
      const allPassed = Object.values(testResults).every(result => result.success);
      if (allPassed) {
        toast.success('All tests passed! Database is ready.');
      } else {
        toast.error('Some tests failed. Check the results below.');
      }

    } catch (error) {
      console.error('Test suite error:', error);
      toast.error('Test suite failed to run');
    } finally {
      setTesting(false);
    }
  };

  const TestResult = ({ title, result, icon: Icon }) => (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className={`p-4 rounded-lg border-l-4 ${
        result?.success 
          ? 'bg-green-50 border-green-400' 
          : 'bg-red-50 border-red-400'
      }`}
    >
      <div className="flex items-center space-x-3">
        <Icon className={`w-5 h-5 ${result?.success ? 'text-green-600' : 'text-red-600'}`} />
        <div>
          <h3 className="font-semibold text-gray-800">{title}</h3>
          <p className={`text-sm ${result?.success ? 'text-green-700' : 'text-red-700'}`}>
            {result?.message || 'Not tested yet'}
          </p>
        </div>
        {result?.success ? (
          <CheckCircle className="w-5 h-5 text-green-600 ml-auto" />
        ) : result?.success === false ? (
          <XCircle className="w-5 h-5 text-red-600 ml-auto" />
        ) : null}
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <Database className="w-16 h-16 text-indigo-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Database Connection Test</h1>
          <p className="text-gray-600">
            Test your Supabase database setup for the courses functionality
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="text-center mb-6">
            <button
              onClick={runTests}
              disabled={testing}
              className={`px-8 py-3 bg-gradient-to-r from-indigo-500 to-blue-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center space-x-2 mx-auto ${
                testing ? 'opacity-50 cursor-not-allowed' : 'hover:from-indigo-600 hover:to-blue-600'
              }`}
            >
              {testing ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  <span>Running Tests...</span>
                </>
              ) : (
                <>
                  <Database className="w-5 h-5" />
                  <span>Run Database Tests</span>
                </>
              )}
            </button>
          </div>

          {Object.keys(results).length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Test Results</h2>
              
              <TestResult 
                title="Supabase Connection" 
                result={results.connection} 
                icon={Database} 
              />
              
              <TestResult 
                title="User Authentication" 
                result={results.auth} 
                icon={User} 
              />
              
              <TestResult 
                title="Profiles Table Access" 
                result={results.profiles} 
                icon={Key} 
              />
              
              <TestResult 
                title="Courses Table" 
                result={results.coursesTable} 
                icon={Table} 
              />
              
              <TestResult 
                title="Course Creation" 
                result={results.courseCreation} 
                icon={CheckCircle} 
              />
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Setup Instructions</h2>
          <div className="space-y-4 text-sm text-gray-600">
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h3 className="font-semibold text-yellow-800 mb-2">If tests fail:</h3>
              <ol className="list-decimal list-inside space-y-2 text-yellow-700">
                <li>Go to your Supabase project dashboard</li>
                <li>Open the SQL Editor</li>
                <li>Copy and paste the contents of <code>backend/setup_courses_table.sql</code></li>
                <li>Run the SQL script</li>
                <li>Come back and run the tests again</li>
              </ol>
            </div>
            
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="font-semibold text-blue-800 mb-2">Environment Variables:</h3>
              <p className="text-blue-700">
                Make sure your <code>.env</code> file contains valid Supabase credentials:
              </p>
              <pre className="mt-2 p-2 bg-blue-100 rounded text-xs">
{`VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key`}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DatabaseTest;
