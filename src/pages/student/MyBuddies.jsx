import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext.jsx';
import StudentDashboardLayout from '../../components/DashboardLayout.jsx';
import BuddyChat from '../../components/BuddyChat.jsx';
import axios from 'axios';
import {
    Users, BookOpen, Clock, CheckCircle, XCircle, RefreshCw, MessageCircle, AlertCircle
} from 'lucide-react';

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const MyBuddies = () => {
    const { user } = useAuth();
    const [courses, setCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState('');
    const [connections, setConnections] = useState([]);
    const [loading, setLoading] = useState(false);
    const [coursesLoading, setCoursesLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeChatBuddy, setActiveChatBuddy] = useState(null);

    // Fetch enrolled courses for dropdown
    useEffect(() => {
        if (!user?.id) return;
        setCoursesLoading(true);
        axios.get(`${API}/api/peer-match/courses/${user.id}`, {
            headers: { Authorization: `Bearer ${user.accessToken}` },
        })
            .then(r => {
                setCourses(r.data || []);
                if (r.data?.length) setSelectedCourse(r.data[0].id);
            })
            .catch(() => setError('Could not load your enrolled courses.'))
            .finally(() => setCoursesLoading(false));
    }, [user]);

    const loadConnections = useCallback(async () => {
        if (!selectedCourse || !user?.id) return;
        setLoading(true);
        setError('');
        try {
            const res = await axios.get(`${API}/api/study-buddy/connections/${selectedCourse}`, {
                headers: { Authorization: `Bearer ${user.accessToken}` },
            });
            setConnections(res.data || []);
        } catch (e) {
            setError(e.response?.data?.detail || 'Failed to load connections.');
        } finally {
            setLoading(false);
        }
    }, [selectedCourse, user]);

    useEffect(() => {
        loadConnections();
        // Clear active chat if course changes
        setActiveChatBuddy(null);
    }, [loadConnections]);

    const handleRespond = async (requestId, action) => {
        try {
            await axios.post(`${API}/api/study-buddy/request/${requestId}/respond`,
                { action },
                { headers: { Authorization: `Bearer ${user.accessToken}` } }
            );
            loadConnections(); // Reload list
        } catch (e) {
            alert(e.response?.data?.detail || `Failed to ${action} request.`);
        }
    };

    const pendingReceived = connections.filter(c => c.status === 'pending' && !c.is_sender);
    const pendingSent = connections.filter(c => c.status === 'pending' && c.is_sender);
    const activeBuddies = connections.filter(c => c.status === 'accepted');

    return (
        <StudentDashboardLayout>
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-extrabold text-gray-900 font-serif mb-2">My Study Buddies</h1>
                        <p className="text-gray-500">Manage your study partner connections and chat.</p>
                    </div>
                    {/* Course picker */}
                    <div className="w-64">
                        {coursesLoading ? (
                            <div className="h-10 bg-gray-100 rounded-lg animate-pulse" />
                        ) : (
                            <select
                                value={selectedCourse}
                                onChange={e => setSelectedCourse(e.target.value)}
                                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-800 shadow-sm focus:ring-2 focus:ring-indigo-300 focus:border-transparent transition"
                            >
                                {courses.length === 0
                                    ? <option value="">No enrolled courses</option>
                                    : courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)
                                }
                            </select>
                        )}
                    </div>
                </div>

                {error && (
                    <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm mb-6">
                        <AlertCircle className="w-5 h-5 flex-shrink-0" /> {error}
                    </div>
                )}

                {loading && connections.length === 0 ? (
                    <div className="flex justify-center py-20"><RefreshCw className="w-8 h-8 text-indigo-400 animate-spin" /></div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left column: Lists */}
                        <div className="lg:col-span-1 space-y-8">

                            {/* Pending Received */}
                            {pendingReceived.length > 0 && (
                                <div className="bg-white rounded-2xl border border-amber-100 shadow-sm overflow-hidden">
                                    <div className="bg-amber-50 px-5 py-3 border-b border-amber-100">
                                        <h3 className="font-semibold text-amber-800 flex items-center gap-2">
                                            <Clock className="w-4 h-4" /> Action Required
                                        </h3>
                                    </div>
                                    <div className="divide-y divide-gray-100">
                                        {pendingReceived.map(c => (
                                            <div key={c.request_id} className="p-5 flex flex-col gap-3">
                                                <div className="flex items-center gap-3">
                                                    {c.buddy_avatar ? (
                                                        <img src={c.buddy_avatar} alt="avatar" className="w-10 h-10 rounded-full object-cover" />
                                                    ) : (
                                                        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                                                            {c.buddy_name.charAt(0)}
                                                        </div>
                                                    )}
                                                    <div>
                                                        <p className="font-semibold text-gray-900">{c.buddy_name}</p>
                                                        <p className="text-xs text-gray-500">Wants to be your study buddy</p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button onClick={() => handleRespond(c.request_id, 'accept')} className="flex-1 py-1.5 bg-green-50 text-green-700 hover:bg-green-100 rounded-lg text-sm font-medium flex items-center justify-center gap-1 transition-colors">
                                                        <CheckCircle className="w-4 h-4" /> Accept
                                                    </button>
                                                    <button onClick={() => handleRespond(c.request_id, 'reject')} className="flex-1 py-1.5 bg-red-50 text-red-700 hover:bg-red-100 rounded-lg text-sm font-medium flex items-center justify-center gap-1 transition-colors">
                                                        <XCircle className="w-4 h-4" /> Decline
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Active Buddies */}
                            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                                <div className="bg-gray-50 px-5 py-3 border-b border-gray-200">
                                    <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                                        <Users className="w-4 h-4" /> Active Buddies ({activeBuddies.length})
                                    </h3>
                                </div>
                                {activeBuddies.length === 0 ? (
                                    <div className="p-8 text-center text-gray-500 text-sm">
                                        No active study buddies in this course yet. Go to <a href="/student/peer-match" className="text-indigo-600 hover:underline">Study Buddy Finder</a> to connect!
                                    </div>
                                ) : (
                                    <div className="divide-y divide-gray-100">
                                        {activeBuddies.map(c => (
                                            <div
                                                key={c.request_id}
                                                onClick={() => setActiveChatBuddy(c)}
                                                className={`p-4 flex items-center justify-between cursor-pointer transition-colors ${activeChatBuddy?.buddy_id === c.buddy_id ? 'bg-indigo-50' : 'hover:bg-gray-50'}`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    {c.buddy_avatar ? (
                                                        <img src={c.buddy_avatar} alt="avatar" className="w-10 h-10 rounded-full object-cover border border-gray-200" />
                                                    ) : (
                                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold shadow-sm">
                                                            {c.buddy_name.charAt(0)}
                                                        </div>
                                                    )}
                                                    <p className="font-semibold text-gray-900">{c.buddy_name}</p>
                                                </div>
                                                <MessageCircle className={`w-5 h-5 ${activeChatBuddy?.buddy_id === c.buddy_id ? 'text-indigo-600' : 'text-gray-300'}`} />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Pending Sent */}
                            {pendingSent.length > 0 && (
                                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden opacity-75">
                                    <div className="bg-gray-50 px-5 py-3 border-b border-gray-200">
                                        <h3 className="font-semibold text-gray-600 text-sm flex items-center gap-2">
                                            <Clock className="w-4 h-4" /> Sent Requests (Pending)
                                        </h3>
                                    </div>
                                    <div className="divide-y divide-gray-100">
                                        {pendingSent.map(c => (
                                            <div key={c.request_id} className="p-3 px-5 flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-xs font-bold">
                                                    {c.buddy_name.charAt(0)}
                                                </div>
                                                <p className="text-sm text-gray-600 flex-1">{c.buddy_name}</p>
                                                <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">Waiting</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                        </div>

                        {/* Right column: Chat / Details */}
                        <div className="lg:col-span-2 h-[600px]">
                            {activeChatBuddy ? (
                                <BuddyChat
                                    buddy={activeChatBuddy}
                                    courseId={selectedCourse}
                                    courseName={courses.find(c => c.id === selectedCourse)?.title}
                                />
                            ) : (
                                <div className="h-full bg-gray-50 rounded-2xl border border-gray-200 border-dashed flex flex-col items-center justify-center text-gray-400 p-8 text-center">
                                    <MessageCircle className="w-16 h-16 text-gray-300 mb-4" />
                                    <h3 className="text-lg font-medium text-gray-600 mb-2">Select a Buddy to Chat</h3>
                                    <p className="text-sm max-w-sm">
                                        Click on an active study buddy from the list on the left to start messaging and scheduling sessions.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </StudentDashboardLayout>
    );
};

export default MyBuddies;
