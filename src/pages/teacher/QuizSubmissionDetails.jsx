import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext.jsx';
import TeacherDashboardLayout from '../../layouts/TeacherDashboardLayout.jsx';
import { toast } from 'react-hot-toast';
import {
  ArrowLeft,
  User,
  Mail,
  Clock,
  Calendar,
  Award,
  CheckCircle,
  XCircle,
  FileText,
  BarChart3,
  Target,
  TrendingUp,
  BookOpen,
  Download,
  RefreshCw
} from 'lucide-react';

const QuizSubmissionDetails = () => {
  const { quizId, submissionId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [submission, setSubmission] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [student, setStudent] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubmissionDetails();
  }, [quizId, submissionId]);

  const fetchSubmissionDetails = async () => {
    try {
      setLoading(true);
      
      // Fetch submission details with all related data
      const [submissionResponse, quizResponse] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/api/quizzes/submission/${submissionId}`),
        fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/api/quizzes/${quizId}`)
      ]);

      if (submissionResponse.ok) {
        const submissionData = await submissionResponse.json();
        setSubmission(submissionData);
        setAnswers(submissionData.answers || []);
        
        // Fetch student details
        if (submissionData.student_id) {
          const studentResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/api/admin/users/${submissionData.student_id}`);
          if (studentResponse.ok) {
            const studentData = await studentResponse.json();
            setStudent(studentData);
          }
        }
      }

      if (quizResponse.ok) {
        const quizData = await quizResponse.json();
        if (quizData.success) {
          setQuiz(quizData.data);
        }
      }

    } catch (error) {
      console.error('Error fetching submission details:', error);
      toast.error('Failed to load submission details');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score, total) => {
    const percentage = (score / total) * 100;
    if (percentage >= 80) return 'text-green-600 bg-green-50';
    if (percentage >= 60) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getGrade = (score, total) => {
    const percentage = (score / total) * 100;
    if (percentage >= 90) return 'A+';
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B+';
    if (percentage >= 60) return 'B';
    if (percentage >= 50) return 'C+';
    if (percentage >= 40) return 'C';
    if (percentage >= 30) return 'D';
    return 'F';
  };

  const formatTime = (minutes) => {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  if (loading) {
    return (
      <TeacherDashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </div>
      </TeacherDashboardLayout>
    );
  }

  if (!submission || !quiz) {
    return (
      <TeacherDashboardLayout>
        <div className="text-center py-12">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Submission Not Found</h3>
          <p className="text-gray-600 mb-4">The requested submission could not be found.</p>
          <button
            onClick={() => navigate(`/teacher/quiz/${quizId}/submissions`)}
            className="btn-primary"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Submissions
          </button>
        </div>
      </TeacherDashboardLayout>
    );
  }

  return (
    <TeacherDashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate(`/teacher/quiz/${quizId}/submissions`)}
              className="btn-ghost flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Submissions</span>
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Submission Details</h1>
              <p className="text-gray-600">{quiz.title}</p>
            </div>
          </div>
          
          <button
            onClick={fetchSubmissionDetails}
            className="btn-outline flex items-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
        </div>

        {/* Student Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
              <User className="w-5 h-5" />
              <span>Student Information</span>
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="text-sm font-medium text-gray-500">Student Name</label>
              <p className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                <User className="w-4 h-4" />
                <span>{student?.full_name || 'Unknown Student'}</span>
              </p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-500">Email</label>
              <p className="text-lg text-gray-900 flex items-center space-x-2">
                <Mail className="w-4 h-4" />
                <span>{student?.email || submission.student_id}</span>
              </p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-500">Student ID</label>
              <p className="text-lg text-gray-900 font-mono text-sm">
                {submission.student_id}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Submission Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6"
        >
          {/* Score */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Final Score</p>
                <p className="text-2xl font-bold text-gray-900">
                  {submission.score}/{submission.total_marks || quiz.total_marks}
                </p>
                <p className={`text-sm font-medium ${getScoreColor(submission.score, submission.total_marks || quiz.total_marks)} px-2 py-1 rounded-full inline-block mt-1`}>
                  {Math.round((submission.score / (submission.total_marks || quiz.total_marks)) * 100)}%
                </p>
              </div>
              <Award className="w-8 h-8 text-purple-600" />
            </div>
          </div>

          {/* Grade */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Grade</p>
                <p className="text-2xl font-bold text-gray-900">
                  {getGrade(submission.score, submission.total_marks || quiz.total_marks)}
                </p>
              </div>
              <Target className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          {/* Time Taken */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Time Taken</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatTime(submission.time_taken_minutes || 0)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  of {quiz.duration_minutes} min allowed
                </p>
              </div>
              <Clock className="w-8 h-8 text-green-600" />
            </div>
          </div>

          {/* Submitted At */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Submitted</p>
                <p className="text-lg font-bold text-gray-900">
                  {new Date(submission.submitted_at).toLocaleDateString()}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(submission.submitted_at).toLocaleTimeString()}
                </p>
              </div>
              <Calendar className="w-8 h-8 text-orange-600" />
            </div>
          </div>
        </motion.div>

        {/* Quiz Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
            <BookOpen className="w-5 h-5" />
            <span>Quiz Information</span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="text-sm font-medium text-gray-500">Quiz Title</label>
              <p className="text-lg font-semibold text-gray-900">{quiz.title}</p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-500">Course</label>
              <p className="text-lg text-gray-900">{quiz.courses?.title || 'N/A'}</p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-500">Total Questions</label>
              <p className="text-lg text-gray-900">{quiz.questions?.length || answers.length} questions</p>
            </div>
          </div>
          
          {quiz.description && (
            <div className="mt-4">
              <label className="text-sm font-medium text-gray-500">Description</label>
              <p className="text-gray-900 mt-1">{quiz.description}</p>
            </div>
          )}
        </motion.div>

        {/* Detailed Answers */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center space-x-2">
            <FileText className="w-5 h-5" />
            <span>Question-by-Question Analysis</span>
          </h2>
          
          <div className="space-y-6">
            {answers.map((answer, index) => (
              <div key={answer.question_id || index} className="border border-gray-200 rounded-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="bg-purple-100 text-purple-800 text-sm font-medium px-3 py-1 rounded-full">
                        Question {index + 1}
                      </span>
                      <span className="text-sm text-gray-500">
                        {answer.marks || 1} mark{answer.marks !== 1 ? 's' : ''}
                      </span>
                      {answer.is_correct ? (
                        <span className="bg-green-100 text-green-800 text-sm font-medium px-2 py-1 rounded-full flex items-center space-x-1">
                          <CheckCircle className="w-3 h-3" />
                          <span>Correct</span>
                        </span>
                      ) : (
                        <span className="bg-red-100 text-red-800 text-sm font-medium px-2 py-1 rounded-full flex items-center space-x-1">
                          <XCircle className="w-3 h-3" />
                          <span>Incorrect</span>
                        </span>
                      )}
                    </div>
                    
                    <h3 className="text-lg font-medium text-gray-900 mb-3">
                      {answer.question_text || 'Question text not available'}
                    </h3>
                    
                    {answer.question_type === 'mcq' && answer.options && (
                      <div className="space-y-2 mb-4">
                        {answer.options.map((option, optionIndex) => (
                          <div
                            key={optionIndex}
                            className={`p-3 rounded-lg border ${
                              answer.student_answer === option
                                ? answer.is_correct
                                  ? 'bg-green-50 border-green-200 text-green-800'
                                  : 'bg-red-50 border-red-200 text-red-800'
                                : answer.correct_answer === option
                                ? 'bg-green-50 border-green-200 text-green-800'
                                : 'bg-gray-50 border-gray-200 text-gray-700'
                            }`}
                          >
                            <div className="flex items-center space-x-2">
                              <span className="font-medium">{String.fromCharCode(65 + optionIndex)}.</span>
                              <span>{option}</span>
                              {answer.correct_answer === option && (
                                <CheckCircle className="w-4 h-4 text-green-600 ml-auto" />
                              )}
                              {answer.student_answer === option && answer.student_answer !== answer.correct_answer && (
                                <XCircle className="w-4 h-4 text-red-600 ml-auto" />
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {answer.question_type !== 'mcq' && (
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm font-medium text-gray-500">Student's Answer:</label>
                          <p className="text-gray-900 p-3 bg-gray-50 rounded-lg">
                            {answer.student_answer || 'No answer provided'}
                          </p>
                        </div>
                        
                        {answer.correct_answer && (
                          <div>
                            <label className="text-sm font-medium text-gray-500">Correct Answer:</label>
                            <p className="text-gray-900 p-3 bg-green-50 rounded-lg">
                              {answer.correct_answer}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Performance Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center space-x-2">
            <BarChart3 className="w-5 h-5" />
            <span>Performance Summary</span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {answers.filter(a => a.is_correct).length}
              </div>
              <div className="text-sm text-gray-500">Correct Answers</div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600 mb-2">
                {answers.filter(a => !a.is_correct).length}
              </div>
              <div className="text-sm text-gray-500">Incorrect Answers</div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {Math.round((answers.filter(a => a.is_correct).length / answers.length) * 100)}%
              </div>
              <div className="text-sm text-gray-500">Accuracy Rate</div>
            </div>
          </div>
        </motion.div>
      </div>
    </TeacherDashboardLayout>
  );
};

export default QuizSubmissionDetails;
