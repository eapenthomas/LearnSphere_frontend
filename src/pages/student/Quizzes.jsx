import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext.jsx';
import DashboardLayout from '../../components/DashboardLayout.jsx';
import { toast } from 'react-hot-toast';
import {
  BookOpen,
  Clock,
  Award,
  Calendar,
  FileText,
  Play,
  CheckCircle,
  AlertCircle,
  Timer,
  Target,
  TrendingUp
} from 'lucide-react';

const StudentQuizzes = () => {
  const { user } = useAuth();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, available, completed

  useEffect(() => {
    fetchQuizzes();
  }, [user]);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:8000/api/quizzes/student/${user.id}/available`);
      const data = await response.json();
      
      if (data.success) {
        setQuizzes(data.data);
      } else {
        toast.error('Failed to load quizzes');
      }
    } catch (error) {
      console.error('Error fetching quizzes:', error);
      toast.error('Failed to load quizzes');
    } finally {
      setLoading(false);
    }
  };

  const filteredQuizzes = quizzes.filter(quiz => {
    if (filter === 'available') return !quiz.is_submitted;
    if (filter === 'completed') return quiz.is_submitted;
    return true;
  });

  const getQuizStatus = (quiz) => {
    if (quiz.is_submitted) {
      return { status: 'completed', color: 'text-emerald-600 bg-emerald-50', icon: CheckCircle };
    }
    
    const now = new Date();
    const endTime = quiz.end_time ? new Date(quiz.end_time) : null;
    const startTime = quiz.start_time ? new Date(quiz.start_time) : null;
    
    if (startTime && now < startTime) {
      return { status: 'upcoming', color: 'text-blue-600 bg-blue-50', icon: Clock };
    }
    
    if (endTime && now > endTime) {
      return { status: 'expired', color: 'text-red-600 bg-red-50', icon: AlertCircle };
    }
    
    return { status: 'available', color: 'text-green-600 bg-green-50', icon: Play };
  };

  const handleStartQuiz = (quizId) => {
    window.location.href = `/student/quiz/${quizId}/take`;
  };

  const QuizCard = ({ quiz }) => {
    const statusInfo = getQuizStatus(quiz);
    const StatusIcon = statusInfo.icon;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden"
      >
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                {quiz.title}
              </h3>
              <div className="flex items-center space-x-4 text-sm text-gray-700 mb-3">
                <div className="flex items-center space-x-1">
                  <BookOpen className="w-4 h-4" />
                  <span>{quiz.courses?.title}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <FileText className="w-4 h-4" />
                  <span>{quiz.questions?.length || 0} Questions</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Award className="w-4 h-4" />
                  <span>{quiz.total_marks} Marks</span>
                </div>
              </div>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <Timer className="w-4 h-4" />
                  <span>{quiz.duration_minutes} min</span>
                </div>
                {quiz.start_time && (
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>Starts: {new Date(quiz.start_time).toLocaleDateString()}</span>
                  </div>
                )}
                {quiz.end_time && (
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>Ends: {new Date(quiz.end_time).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center space-x-1 ${statusInfo.color}`}>
              <StatusIcon className="w-3 h-3" />
              <span className="capitalize">{statusInfo.status}</span>
            </div>
          </div>

          {quiz.description && (
            <p className="text-gray-700 text-sm mb-4 line-clamp-2">
              {quiz.description}
            </p>
          )}

          {quiz.instructions && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-blue-800">
                <strong>Instructions:</strong> {quiz.instructions}
              </p>
            </div>
          )}

          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <div className="text-sm text-gray-600">
              {quiz.is_submitted ? (
                <span className="flex items-center space-x-1 text-emerald-600">
                  <CheckCircle className="w-4 h-4" />
                  <span>Completed</span>
                </span>
              ) : (
                <span>Ready to take</span>
              )}
            </div>

            <div className="flex items-center space-x-2">
              {!quiz.is_submitted && statusInfo.status === 'available' && (
                <button
                  onClick={() => handleStartQuiz(quiz.id)}
                  className="btn-primary"
                >
                  <Play className="w-4 h-4" />
                  <span>Start Quiz</span>
                </button>
              )}
              
              {quiz.is_submitted && (
                <button
                  onClick={() => window.location.href = `/student/quiz/${quiz.id}/result`}
                  className="btn-secondary"
                >
                  <TrendingUp className="w-4 h-4" />
                  <span>View Result</span>
                </button>
              )}
              
              {statusInfo.status === 'upcoming' && (
                <span className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm">
                  Not Started Yet
                </span>
              )}
              
              {statusInfo.status === 'expired' && !quiz.is_submitted && (
                <span className="px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm">
                  Expired
                </span>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg p-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex items-center space-x-4 mb-4">
                <div className="p-3 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl">
                  <FileText className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-extrabold text-gray-900">My Quizzes</h1>
                  <p className="text-lg text-gray-700">Take quizzes from your enrolled courses</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2 bg-purple-50 px-4 py-2 rounded-lg">
                  <FileText className="w-5 h-5 text-purple-600" />
                  <span className="font-semibold text-purple-700">
                    {quizzes.length} Total Quiz{quizzes.length !== 1 ? 'es' : ''}
                  </span>
                </div>
                <div className="flex items-center space-x-2 bg-green-50 px-4 py-2 rounded-lg">
                  <Play className="w-5 h-5 text-green-600" />
                  <span className="font-semibold text-green-700">
                    {quizzes.filter(q => !q.is_submitted).length} Available
                  </span>
                </div>
                <div className="flex items-center space-x-2 bg-emerald-50 px-4 py-2 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                  <span className="font-semibold text-emerald-700">
                    {quizzes.filter(q => q.is_submitted).length} Completed
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Filter Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-lg p-6"
        >
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setFilter('all')}
              className={filter === 'all' ? 'btn-primary' : 'btn-ghost'}
            >
              All Quizzes ({quizzes.length})
            </button>
            <button
              onClick={() => setFilter('available')}
              className={filter === 'available' ? 'btn-success' : 'btn-ghost'}
            >
              Available ({quizzes.filter(q => !q.is_submitted).length})
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={filter === 'completed' ? 'btn-secondary' : 'btn-ghost'}
            >
              Completed ({quizzes.filter(q => q.is_submitted).length})
            </button>
          </div>
        </motion.div>

        {/* Quiz Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          </div>
        ) : filteredQuizzes.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12 bg-white rounded-2xl shadow-lg"
          >
            <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              {filter === 'all' ? 'No quizzes available' : 
               filter === 'available' ? 'No available quizzes' : 'No completed quizzes'}
            </h3>
            <p className="text-gray-600 mb-6">
              {filter === 'all' ? 'Enroll in courses to see quizzes' :
               filter === 'available' ? 'All quizzes have been completed or are not yet available' :
               'You haven\'t completed any quizzes yet'}
            </p>
          </motion.div>
        ) : (
          <div className="grid gap-6 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
            {filteredQuizzes.map((quiz, index) => (
              <motion.div
                key={quiz.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.05 }}
              >
                <QuizCard quiz={quiz} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default StudentQuizzes;
