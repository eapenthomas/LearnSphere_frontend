import React, { useState } from 'react';
import { testUsers, testCourses, testAssignments, testQuizzes, testForumPosts, testNotifications, testAIResponses } from '../data/testData';
import { useAuth } from '../contexts/AuthContext';

const TestDashboard = () => {
  const { user, login, register } = useAuth();
  const [selectedUser, setSelectedUser] = useState(null);
  const [testResults, setTestResults] = useState({});

  const runTest = async (testName, testFunction) => {
    try {
      console.log(`Running test: ${testName}`);
      const result = await testFunction();
      setTestResults(prev => ({
        ...prev,
        [testName]: { status: 'success', result }
      }));
      return result;
    } catch (error) {
      console.error(`Test failed: ${testName}`, error);
      setTestResults(prev => ({
        ...prev,
        [testName]: { status: 'failed', error: error.message }
      }));
      return null;
    }
  };

  const testLogin = async (userType) => {
    const userData = testUsers[userType];
    const result = await login(userData.email, userData.password);
    return result;
  };

  const testRegistration = async () => {
    const newUser = {
      email: "newuser@test.com",
      password: "password123",
      full_name: "New Test User",
      role: "student"
    };
    const result = await register(newUser.email, newUser.password, newUser.full_name, newUser.role);
    return result;
  };

  const testEmailCheck = async () => {
    const response = await fetch('/api/auth/check-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@learnsphere.com' })
    });
    return await response.json();
  };

  const testCoursesAPI = async () => {
    const response = await fetch('/api/test/courses');
    return await response.json();
  };

  const testAITutor = async () => {
    const response = await fetch('/api/test/ai-tutor');
    return await response.json();
  };

  const testQuizGeneration = async () => {
    const response = await fetch('/api/test/quiz-generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic: 'Python Programming' })
    });
    return await response.json();
  };

  const runAllTests = async () => {
    setTestResults({});
    
    // Test authentication
    await runTest('Email Check', testEmailCheck);
    await runTest('Student Login', () => testLogin('student'));
    await runTest('Teacher Login', () => testLogin('teacher'));
    await runTest('Admin Login', () => testLogin('admin'));
    await runTest('Registration', testRegistration);
    
    // Test course features
    await runTest('Courses API', testCoursesAPI);
    await runTest('AI Tutor', testAITutor);
    await runTest('Quiz Generation', testQuizGeneration);
  };

  const TestResult = ({ testName, result }) => {
    if (!result) return null;
    
    return (
      <div className={`p-3 rounded-lg border ${
        result.status === 'success' 
          ? 'bg-green-50 border-green-200 text-green-800' 
          : 'bg-red-50 border-red-200 text-red-800'
      }`}>
        <div className="font-semibold">{testName}</div>
        <div className="text-sm">
          {result.status === 'success' ? '✅ Passed' : '❌ Failed'}
        </div>
        {result.error && (
          <div className="text-xs mt-1 text-red-600">{result.error}</div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            🧪 LearnSphere Test Dashboard
          </h1>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* User Selection */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-3">Test Users</h3>
              {Object.entries(testUsers).map(([type, userData]) => (
                <div key={type} className="mb-2">
                  <button
                    onClick={() => setSelectedUser(userData)}
                    className={`w-full text-left p-2 rounded ${
                      selectedUser?.id === userData.id 
                        ? 'bg-blue-200' 
                        : 'bg-white hover:bg-blue-100'
                    }`}
                  >
                    <div className="font-medium">{userData.full_name}</div>
                    <div className="text-sm text-gray-600">{userData.email}</div>
                    <div className="text-xs text-gray-500 capitalize">{userData.role}</div>
                  </button>
                </div>
              ))}
            </div>

            {/* Current User */}
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold text-green-900 mb-3">Current Session</h3>
              {user ? (
                <div className="bg-white p-3 rounded border">
                  <div className="font-medium text-green-800">{user.full_name}</div>
                  <div className="text-sm text-gray-600">{user.email}</div>
                  <div className="text-xs text-gray-500 capitalize">{user.role}</div>
                </div>
              ) : (
                <div className="text-gray-500 text-sm">Not logged in</div>
              )}
            </div>

            {/* Test Controls */}
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="font-semibold text-purple-900 mb-3">Test Controls</h3>
              <button
                onClick={runAllTests}
                className="w-full bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 mb-2"
              >
                🚀 Run All Tests
              </button>
              <button
                onClick={() => setTestResults({})}
                className="w-full bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
              >
                Clear Results
              </button>
            </div>
          </div>

          {/* Test Results */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Test Results</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(testResults).map(([testName, result]) => (
                <TestResult key={testName} testName={testName} result={result} />
              ))}
            </div>
          </div>

          {/* Sample Data Display */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Courses */}
            <div className="bg-white border rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Sample Courses</h3>
              <div className="space-y-2">
                {testCourses.slice(0, 2).map(course => (
                  <div key={course.id} className="border rounded p-3">
                    <div className="font-medium">{course.title}</div>
                    <div className="text-sm text-gray-600">{course.instructor}</div>
                    <div className="text-xs text-gray-500">{course.category} • {course.level}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Notifications */}
            <div className="bg-white border rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Sample Notifications</h3>
              <div className="space-y-2">
                {testNotifications.slice(0, 2).map(notif => (
                  <div key={notif.id} className="border rounded p-3">
                    <div className="font-medium">{notif.title}</div>
                    <div className="text-sm text-gray-600">{notif.message}</div>
                    <div className="text-xs text-gray-500 capitalize">{notif.type}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button
              onClick={() => runTest('Email Check', testEmailCheck)}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Check Email
            </button>
            <button
              onClick={() => runTest('Courses API', testCoursesAPI)}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Load Courses
            </button>
            <button
              onClick={() => runTest('AI Tutor', testAITutor)}
              className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
            >
              AI Tutor
            </button>
            <button
              onClick={() => runTest('Quiz Generation', testQuizGeneration)}
              className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600"
            >
              Generate Quiz
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestDashboard;
