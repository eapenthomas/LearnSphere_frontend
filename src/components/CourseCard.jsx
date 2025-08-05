import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Edit,
  Trash2,
  Calendar,
  Users,
  Eye,
  MoreVertical,
  BookOpen,
  Clock
} from 'lucide-react';

const CourseCard = ({ course, onEdit, onDelete, onView }) => {
  const [showMenu, setShowMenu] = useState(false);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status) => {
    const baseClasses = "px-3 py-1 rounded-full text-xs font-semibold";
    
    switch (status) {
      case 'active':
        return `${baseClasses} bg-blue-100 text-blue-700`;
      case 'draft':
        return `${baseClasses} bg-yellow-100 text-yellow-700`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-700`;
    }
  };

  const truncateText = (text, maxLength = 120) => {
    if (!text) return '';
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5, scale: 1.02 }}
      className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group"
    >
      {/* Thumbnail */}
      <div className="relative aspect-video bg-gradient-to-br from-indigo-100 to-blue-100 overflow-hidden">
        {course.thumbnail_url ? (
          <img
            src={course.thumbnail_url}
            alt={course.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <BookOpen className="w-12 h-12 text-indigo-400" />
          </div>
        )}
        
        {/* Status Badge */}
        <div className="absolute top-3 left-3">
          <span className={getStatusBadge(course.status)}>
            {course.status === 'active' ? 'Active' : 'Draft'}
          </span>
        </div>

        {/* Action Menu */}
        <div className="absolute top-3 right-3">
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-md hover:bg-white transition-colors duration-200"
            >
              <MoreVertical className="w-4 h-4 text-gray-600" />
            </button>

            {showMenu && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-10"
              >
                <button
                  onClick={() => {
                    onView(course);
                    setShowMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2 transition-colors"
                >
                  <Eye className="w-4 h-4 text-gray-500" />
                  <span>View Course</span>
                </button>
                <button
                  onClick={() => {
                    onEdit(course);
                    setShowMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2 transition-colors"
                >
                  <Edit className="w-4 h-4 text-blue-500" />
                  <span>Edit Course</span>
                </button>
                <button
                  onClick={() => {
                    onDelete(course);
                    setShowMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2 transition-colors"
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                  <span>Delete Course</span>
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Title */}
        <h3 className="text-lg font-semibold text-indigo-700 mb-2 line-clamp-2 group-hover:text-indigo-800 transition-colors">
          {course.title}
        </h3>

        {/* Description */}
        <p className="text-sm text-indigo-900/80 mb-4 line-clamp-3">
          {truncateText(course.description) || 'No description provided'}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center space-x-4 text-xs text-gray-500">
            <div className="flex items-center space-x-1">
              <Calendar className="w-3 h-3" />
              <span>{formatDate(course.created_at)}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Users className="w-3 h-3" />
              <span>0 students</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-1 text-xs text-gray-500">
            <Clock className="w-3 h-3" />
            <span>Updated {formatDate(course.created_at)}</span>
          </div>
        </div>
      </div>

      {/* Click outside to close menu */}
      {showMenu && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setShowMenu(false)}
        />
      )}
    </motion.div>
  );
};

export default CourseCard;
