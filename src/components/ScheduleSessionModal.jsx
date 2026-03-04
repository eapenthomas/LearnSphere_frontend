import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, Link as LinkIcon, X, Send } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const ScheduleSessionModal = ({ buddy, courseId, onClose, onSuccess }) => {
    const { user } = useAuth();
    const [topic, setTopic] = useState('');
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [duration, setDuration] = useState('60');
    const [meetingLink, setMeetingLink] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!date || !time) {
            setError('Date and time are required.');
            return;
        }

        // Combine date and time
        const start_time = new Date(`${date}T${time}`).toISOString();

        setLoading(true);
        try {
            await axios.post(`${API}/api/study-buddy/session`, {
                course_id: courseId,
                topic: topic || 'Study Session',
                start_time,
                duration_minutes: parseInt(duration),
                meeting_link: meetingLink || null,
                participant_ids: [buddy.buddy_id]
            }, { headers: { Authorization: `Bearer ${user.accessToken}` } });

            if (onSuccess) onSuccess();
            onClose();
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to schedule session.');
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col"
            >
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-indigo-500" />
                        Schedule with {buddy.buddy_name.split(' ')[0]}
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6">
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100">
                            {error}
                        </div>
                    )}

                    <form id="schedule-form" onSubmit={handleSubmit} className="space-y-4">

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Topic or Goal (Optional)</label>
                            <input
                                type="text"
                                value={topic}
                                onChange={e => setTopic(e.target.value)}
                                placeholder="e.g. Preparing for Midterm"
                                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-300 focus:border-transparent outline-none transition"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> Date</label>
                                <input
                                    type="date"
                                    required
                                    value={date}
                                    onChange={e => setDate(e.target.value)}
                                    // Set min date to today
                                    min={new Date().toISOString().split('T')[0]}
                                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-300 focus:border-transparent outline-none transition"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Time</label>
                                <input
                                    type="time"
                                    required
                                    value={time}
                                    onChange={e => setTime(e.target.value)}
                                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-300 focus:border-transparent outline-none transition"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-1">
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Duration</label>
                                <select
                                    value={duration}
                                    onChange={e => setDuration(e.target.value)}
                                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-300 focus:border-transparent outline-none transition"
                                >
                                    <option value="30">30 minutes</option>
                                    <option value="60">1 hour</option>
                                    <option value="90">1.5 hours</option>
                                    <option value="120">2 hours</option>
                                </select>
                            </div>
                        </div>

                        <div className="pt-2">
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5"><LinkIcon className="w-3.5 h-3.5" /> Meeting Link</label>
                            <p className="text-xs text-gray-500 mb-2 leading-relaxed">
                                Paste your Google Meet, Zoom, or Teams link here so your buddy knows where to join.
                            </p>
                            <input
                                type="url"
                                value={meetingLink}
                                onChange={e => setMeetingLink(e.target.value)}
                                placeholder="https://meet.google.com/..."
                                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-300 focus:border-transparent outline-none transition"
                            />
                        </div>

                    </form>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={loading}
                        className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        form="schedule-form"
                        disabled={loading || !date || !time}
                        className="flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Scheduling...' : <><Send className="w-4 h-4" /> Schedule</>}
                    </button>
                </div>

            </motion.div>
        </div>
    );
};

export default ScheduleSessionModal;
