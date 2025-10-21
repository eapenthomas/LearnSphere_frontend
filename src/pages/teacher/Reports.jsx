import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext.jsx';
import TeacherDashboardLayout from '../../layouts/TeacherDashboardLayout.jsx';
import { toast } from 'react-hot-toast';
import {
  BarChart3,
  TrendingUp,
  Users,
  BookOpen,
  Award,
  Calendar,
  Download,
  Filter,
  RefreshCw,
  PieChart,
  Target,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

const TeacherReports = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState({
    overview: {},
    courseStats: [],
    studentPerformance: [],
    assignmentStats: [],
    quizStats: [],
    monthlyProgress: []
  });
  const [selectedTimeframe, setSelectedTimeframe] = useState('month');
  const [selectedCourse, setSelectedCourse] = useState('all');
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    if (user?.id) {
      fetchReportData();
      fetchCourses();
    }
  }, [user, selectedTimeframe, selectedCourse]);

  const fetchCourses = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/api/courses/teacher/${user.id}`);
      if (response.ok) {
        const data = await response.json();
        setCourses(data.courses || []);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const fetchReportData = async () => {
    try {
      setLoading(true);
      
      // Fetch overview statistics
      const overviewResponse = await fetch(
        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/api/teacher/reports/overview?teacher_id=${user.id}&timeframe=${selectedTimeframe}&course_id=${selectedCourse}`
      );
      
      if (overviewResponse.ok) {
        const overview = await overviewResponse.json();
        
        // Fetch detailed course statistics
        const courseStatsResponse = await fetch(
          `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/api/teacher/reports/course-stats?teacher_id=${user.id}&timeframe=${selectedTimeframe}`
        );
        
        const courseStats = courseStatsResponse.ok ? await courseStatsResponse.json() : [];
        
        // Fetch student performance data
        const studentPerformanceResponse = await fetch(
          `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/api/teacher/reports/student-performance?teacher_id=${user.id}&course_id=${selectedCourse}`
        );
        
        const studentPerformance = studentPerformanceResponse.ok ? await studentPerformanceResponse.json() : [];
        
        setReportData({
          overview,
          courseStats,
          studentPerformance,
          assignmentStats: overview.assignmentStats || [],
          quizStats: overview.quizStats || [],
          monthlyProgress: overview.monthlyProgress || []
        });
      } else {
        // Fallback with mock data for development
        setReportData({
          overview: {
            totalStudents: 45,
            totalCourses: 3,
            totalAssignments: 12,
            totalQuizzes: 8,
            averageGrade: 85.2,
            completionRate: 78.5,
            activeStudents: 38,
            pendingGrading: 7
          },
          courseStats: [
            { name: 'JavaScript Fundamentals', students: 18, completion: 85, avgGrade: 87.3 },
            { name: 'React Development', students: 15, completion: 72, avgGrade: 82.1 },
            { name: 'Full Stack Web Dev', students: 12, completion: 90, avgGrade: 89.5 }
          ],
          studentPerformance: [
            { name: 'John Doe', course: 'JavaScript', assignments: 8, quizzes: 5, avgGrade: 92 },
            { name: 'Jane Smith', course: 'React', assignments: 6, quizzes: 4, avgGrade: 88 },
            { name: 'Mike Johnson', course: 'Full Stack', assignments: 7, quizzes: 3, avgGrade: 85 }
          ],
          assignmentStats: [
            { title: 'JS Variables', submissions: 18, avgScore: 85, maxScore: 100 },
            { title: 'React Components', submissions: 15, avgScore: 78, maxScore: 100 },
            { title: 'API Integration', submissions: 12, avgScore: 92, maxScore: 100 }
          ],
          quizStats: [
            { title: 'JS Basics Quiz', attempts: 18, avgScore: 82, maxScore: 100 },
            { title: 'React Hooks Quiz', attempts: 15, avgScore: 76, maxScore: 100 }
          ],
          monthlyProgress: [
            { month: 'Jan', assignments: 45, quizzes: 32, avgGrade: 82 },
            { month: 'Feb', assignments: 52, quizzes: 38, avgGrade: 85 },
            { month: 'Mar', assignments: 48, quizzes: 35, avgGrade: 87 }
          ]
        });
      }
    } catch (error) {
      console.error('Error fetching report data:', error);
      toast.error('Failed to load report data');
    } finally {
      setLoading(false);
    }
  };

  const exportReport = async () => {
    try {
      // Create a comprehensive PDF report using browser's print functionality
      const printWindow = window.open('', '_blank');
      const reportDate = new Date().toLocaleDateString();
      const reportTime = new Date().toLocaleTimeString();
      
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Teacher Performance Report</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              margin: 20px;
              color: #333;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 3px solid #2563eb;
              padding-bottom: 20px;
            }
            .section {
              margin-bottom: 30px;
              page-break-inside: avoid;
            }
            .section-title {
              font-size: 18px;
              font-weight: bold;
              color: #2563eb;
              margin-bottom: 15px;
              border-bottom: 2px solid #e5e7eb;
              padding-bottom: 5px;
            }
            .stats-grid {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 20px;
              margin-bottom: 20px;
            }
            .stat-card {
              border: 1px solid #d1d5db;
              border-radius: 8px;
              padding: 15px;
              background-color: #f9fafb;
            }
            .stat-title {
              font-size: 14px;
              color: #6b7280;
              margin-bottom: 5px;
            }
            .stat-value {
              font-size: 24px;
              font-weight: bold;
              color: #111827;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 20px;
            }
            th, td {
              border: 1px solid #d1d5db;
              padding: 12px;
              text-align: left;
            }
            th {
              background-color: #f3f4f6;
              font-weight: bold;
              color: #374151;
            }
            .grade-excellent { color: #059669; font-weight: bold; }
            .grade-good { color: #2563eb; font-weight: bold; }
            .grade-average { color: #d97706; font-weight: bold; }
            .grade-poor { color: #dc2626; font-weight: bold; }
            .footer {
              margin-top: 40px;
              text-align: center;
              font-size: 12px;
              color: #6b7280;
              border-top: 1px solid #d1d5db;
              padding-top: 20px;
            }
            @media print {
              body { margin: 15px; }
              .section { page-break-inside: avoid; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Teacher Performance Report</h1>
            <p><strong>Teacher:</strong> ${user?.name || 'Unknown Teacher'}</p>
            <p><strong>Generated:</strong> ${reportDate} at ${reportTime}</p>
            <p><strong>Timeframe:</strong> ${selectedTimeframe} | <strong>Course:</strong> ${selectedCourse === 'all' ? 'All Courses' : courses.find(c => c.id === selectedCourse)?.title || 'Selected Course'}</p>
          </div>

          <div class="section">
            <div class="section-title">Overview Statistics</div>
            <div class="stats-grid">
              <div class="stat-card">
                <div class="stat-title">Total Students</div>
                <div class="stat-value">${reportData.overview.totalStudents || 0}</div>
              </div>
              <div class="stat-card">
                <div class="stat-title">Courses Teaching</div>
                <div class="stat-value">${reportData.overview.totalCourses || 0}</div>
              </div>
              <div class="stat-card">
                <div class="stat-title">Average Grade</div>
                <div class="stat-value">${reportData.overview.averageGrade || 0}%</div>
              </div>
              <div class="stat-card">
                <div class="stat-title">Completion Rate</div>
                <div class="stat-value">${reportData.overview.completionRate || 0}%</div>
              </div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Course Performance</div>
            <table>
              <thead>
                <tr>
                  <th>Course Name</th>
                  <th>Students</th>
                  <th>Completion Rate</th>
                  <th>Average Grade</th>
                </tr>
              </thead>
              <tbody>
                ${reportData.courseStats.map(course => `
                  <tr>
                    <td>${course.name}</td>
                    <td>${course.students}</td>
                    <td>${course.completion}%</td>
                    <td class="${course.avgGrade >= 90 ? 'grade-excellent' : course.avgGrade >= 80 ? 'grade-good' : course.avgGrade >= 70 ? 'grade-average' : 'grade-poor'}">${course.avgGrade}%</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          <div class="section">
            <div class="section-title">Student Performance Details</div>
            <table>
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th>Course</th>
                  <th>Assignments Completed</th>
                  <th>Quizzes Taken</th>
                  <th>Average Grade</th>
                </tr>
              </thead>
              <tbody>
                ${reportData.studentPerformance.map(student => `
                  <tr>
                    <td>${student.name}</td>
                    <td>${student.course}</td>
                    <td>${student.assignments}</td>
                    <td>${student.quizzes}</td>
                    <td class="${student.avgGrade >= 90 ? 'grade-excellent' : student.avgGrade >= 80 ? 'grade-good' : student.avgGrade >= 70 ? 'grade-average' : 'grade-poor'}">${student.avgGrade}%</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          <div class="section">
            <div class="section-title">Assignment Performance</div>
            <table>
              <thead>
                <tr>
                  <th>Assignment Title</th>
                  <th>Submissions</th>
                  <th>Average Score</th>
                  <th>Max Score</th>
                </tr>
              </thead>
              <tbody>
                ${reportData.assignmentStats.map(assignment => `
                  <tr>
                    <td>${assignment.title}</td>
                    <td>${assignment.submissions}</td>
                    <td>${assignment.avgScore}</td>
                    <td>${assignment.maxScore}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          <div class="section">
            <div class="section-title">Quiz Performance</div>
            <table>
              <thead>
                <tr>
                  <th>Quiz Title</th>
                  <th>Attempts</th>
                  <th>Average Score</th>
                  <th>Max Score</th>
                </tr>
              </thead>
              <tbody>
                ${reportData.quizStats.map(quiz => `
                  <tr>
                    <td>${quiz.title}</td>
                    <td>${quiz.attempts}</td>
                    <td>${quiz.avgScore}</td>
                    <td>${quiz.maxScore}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          <div class="footer">
            <p>Generated by LearnSphere Teacher Reports System</p>
            <p>This report contains comprehensive performance analytics for teaching effectiveness</p>
          </div>
        </body>
        </html>
      `);
      
      printWindow.document.close();
      
      // Wait for content to load, then trigger print dialog
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);
      
      toast.success('PDF report generated successfully!');
    } catch (error) {
      console.error('Error generating PDF report:', error);
      toast.error('Failed to generate PDF report');
    }
  };

  const StatCard = ({ title, value, subtitle, icon: Icon, color, trend }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {subtitle && (
            <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>
        <div className={`p-3 rounded-xl ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
      {trend && (
        <div className="mt-4 flex items-center">
          <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
          <span className="text-sm text-green-600 font-medium">{trend}% from last month</span>
        </div>
      )}
    </motion.div>
  );

  const BarChart = ({ data, title, xKey, yKey, color = '#3b82f6' }) => (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="space-y-3">
        {data.map((item, index) => (
          <div key={index} className="flex items-center">
            <div className="w-24 text-sm text-gray-600 truncate">{item[xKey]}</div>
            <div className="flex-1 mx-3">
              <div className="bg-gray-200 rounded-full h-3">
                <div
                  className="h-3 rounded-full transition-all duration-500"
                  style={{
                    width: `${(item[yKey] / Math.max(...data.map(d => d[yKey]))) * 100}%`,
                    backgroundColor: color
                  }}
                />
              </div>
            </div>
            <div className="w-12 text-sm font-medium text-gray-900 text-right">
              {typeof item[yKey] === 'number' ? item[yKey].toFixed(1) : item[yKey]}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  if (loading) {
    return (
      <TeacherDashboardLayout>
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
          <span className="text-lg font-medium text-gray-700">Loading reports...</span>
        </div>
      </div>
      </TeacherDashboardLayout>
    );
  }

  return (
    <TeacherDashboardLayout>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Teaching Reports</h1>
            <p className="text-gray-600">Comprehensive analytics and insights for your courses</p>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Timeframe Filter */}
            <select
              value={selectedTimeframe}
              onChange={(e) => setSelectedTimeframe(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
              <option value="year">This Year</option>
            </select>
            
            {/* Course Filter */}
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Courses</option>
              {courses.map(course => (
                <option key={course.id} value={course.id}>{course.title}</option>
              ))}
            </select>
            
            <button
              onClick={exportReport}
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Export Report</span>
            </button>
            
            <button
              onClick={fetchReportData}
              className="flex items-center space-x-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Students"
            value={reportData.overview.totalStudents || 0}
            subtitle={`${reportData.overview.activeStudents || 0} active`}
            icon={Users}
            color="bg-blue-500"
            trend={12}
          />
          <StatCard
            title="Courses Teaching"
            value={reportData.overview.totalCourses || 0}
            subtitle={`${reportData.overview.totalAssignments || 0} assignments`}
            icon={BookOpen}
            color="bg-green-500"
            trend={8}
          />
          <StatCard
            title="Average Grade"
            value={`${reportData.overview.averageGrade || 0}%`}
            subtitle={`${reportData.overview.completionRate || 0}% completion`}
            icon={Award}
            color="bg-purple-500"
            trend={5}
          />
          <StatCard
            title="Pending Grading"
            value={reportData.overview.pendingGrading || 0}
            subtitle="submissions to review"
            icon={Clock}
            color="bg-orange-500"
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <BarChart
            data={reportData.courseStats}
            title="Course Performance"
            xKey="name"
            yKey="avgGrade"
            color="#10b981"
          />
          
          <BarChart
            data={reportData.assignmentStats}
            title="Assignment Performance"
            xKey="title"
            yKey="avgScore"
            color="#3b82f6"
          />
        </div>

        {/* Student Performance Table */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 mb-8">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Top Performing Students</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assignments</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quizzes</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Grade</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reportData.studentPerformance.slice(0, 10).map((student, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{student.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{student.course}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{student.assignments}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{student.quizzes}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-medium ${
                        student.avgGrade >= 90 ? 'text-green-600' :
                        student.avgGrade >= 80 ? 'text-blue-600' :
                        student.avgGrade >= 70 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {student.avgGrade}%
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </TeacherDashboardLayout>
    );
};

export default TeacherReports;
