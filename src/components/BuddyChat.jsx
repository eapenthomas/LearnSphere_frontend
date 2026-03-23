import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Send, Calendar, Video, Clock, CheckCircle, RefreshCw } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import ScheduleSessionModal from './ScheduleSessionModal';

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const BuddyChat = ({ buddy, courseId, courseName }) => {
    const { user } = useAuth();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sessions, setSessions] = useState([]);
    const [isScheduling, setIsScheduling] = useState(false);

    const messagesEndRef = useRef(null);

    // Fetch messages & sessions initially, then poll every 5s
    useEffect(() => {
        let isMtd = true;
        const loadData = async () => {
            if (!buddy || !courseId || !user) return;
            try {
                const [msgRes, sessRes] = await Promise.all([
                    axios.get(`${API}/api/study-buddy/messages/${courseId}/${buddy.buddy_id}`, { headers: { Authorization: `Bearer ${user.accessToken}` } }),
                    axios.get(`${API}/api/study-buddy/sessions/${courseId}`, { headers: { Authorization: `Bearer ${user.accessToken}` } })
                ]);
                if (isMtd) {
                    setMessages(msgRes.data || []);
                    // Filter sessions to only ones involving this buddy (simplification for UI)
                    setSessions(sessRes.data || []);
                    setLoading(false);
                }
            } catch (e) {
                console.error("Failed to load buddy data", e);
                if (isMtd) setLoading(false);
            }
        };

        loadData();
        const interval = setInterval(loadData, 15000); // Polling every 15s to reduce DB load

        return () => {
            isMtd = false;
            clearInterval(interval);
        };
    }, [buddy, courseId, user]);

    useEffect(() => {
        // Auto-scroll to bottom of chat
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        try {
            const originalMsg = newMessage;
            setNewMessage('');
            // Optimistic update
            const newMsgObj = {
                id: 'temp-' + Date.now(),
                sender_id: user.id,
                receiver_id: buddy.buddy_id,
                content: originalMsg,
                created_at: new Date().toISOString()
            };
            setMessages(prev => [...prev, newMsgObj]);

            await axios.post(`${API}/api/study-buddy/message`, {
                receiver_id: buddy.buddy_id,
                course_id: courseId,
                content: originalMsg
            }, { headers: { Authorization: `Bearer ${user.accessToken}` } });

        } catch (e) {
            console.error("Failed to send", e);
            alert("Failed to send message. Please try again.");
            // Ideally rollback optimistic update here
        }
    };

    const handleSessionCreated = () => {
        setIsScheduling(false);
        // Data will reload via polling soon anyway, but can trigger immediate reload here
    };

    if (loading && messages.length === 0) {
        return <div className="h-full flex items-center justify-center bg-gray-50 rounded-2xl border border-gray-200"><RefreshCw className="w-8 h-8 text-indigo-400 animate-spin" /></div>;
    }

    return (
        <div className="h-full flex flex-col bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            {/* Header */}
            <div className="h-16 px-6 bg-indigo-50 border-b border-indigo-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-md">
                        {buddy.buddy_name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <h2 className="font-bold text-gray-900">{buddy.buddy_name}</h2>
                        <p className="text-xs text-indigo-600 font-medium">Study Buddy in {courseName}</p>
                    </div>
                </div>
                <button
                    onClick={() => setIsScheduling(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-indigo-200 text-indigo-700 text-sm font-semibold rounded-lg hover:bg-indigo-50 transition-colors shadow-sm"
                >
                    <Calendar className="w-4 h-4" /> Schedule Session
                </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50">

                {/* Upcoming Sessions Widget */}
                {sessions.length > 0 && (
                    <div className="mb-6 bg-white border border-indigo-100 rounded-xl p-4 shadow-sm flex flex-col gap-3">
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                            <Video className="w-3.5 h-3.5" /> Upcoming Sessions
                        </h4>
                        {sessions.map(s => (
                            <div key={s.id} className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between bg-indigo-50/50 rounded-lg p-3 border border-indigo-50">
                                <div>
                                    <p className="font-semibold text-gray-800 text-sm">{s.topic || 'Study Session'}</p>
                                    <div className="flex gap-4 mt-1 text-xs text-gray-500">
                                        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {new Date(s.start_time).toLocaleString(undefined, { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                                        <span>{str_pad(s.duration_minutes)} mins</span>
                                    </div>
                                </div>
                                {s.meeting_link && (
                                    <a href={s.meeting_link} target="_blank" rel="noopener noreferrer" className="shrink-0 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-md transition-colors text-center shadow-sm">
                                        Join Meeting
                                    </a>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* Messages List */}
                <div className="flex flex-col gap-4">
                    {messages.length === 0 ? (
                        <p className="text-center text-gray-400 text-sm italic my-10">Say hi to {buddy.buddy_name} to start studying together!</p>
                    ) : (
                        messages.map(msg => {
                            const isMe = msg.sender_id === user.id;
                            return (
                                <div key={msg.id} className={`flex max-w-[80%] ${isMe ? 'self-end' : 'self-start'}`}>
                                    <div className={`px-4 py-2.5 rounded-2xl ${isMe
                                            ? 'bg-indigo-50 border border-indigo-100 text-gray-900 rounded-tr-sm shadow-sm'
                                            : 'bg-white border border-gray-200 text-gray-800 rounded-tl-sm shadow-sm'
                                        }`}>
                                        <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                                        <p className={`text-[10px] mt-1.5 text-right ${isMe ? 'text-indigo-400' : 'text-gray-400'}`}>
                                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>
                            );
                        })
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-gray-200">
                <form onSubmit={handleSendMessage} className="flex gap-3">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder={`Message ${buddy.buddy_name}...`}
                        className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-300 focus:border-transparent transition-all outline-none"
                    />
                    <button
                        type="submit"
                        disabled={!newMessage.trim()}
                        className="w-11 h-11 flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-xl transition-colors shadow-sm"
                    >
                        <Send className="w-5 h-5 ml-1" />
                    </button>
                </form>
            </div>

            {/* Scheduling Modal */}
            {isScheduling && (
                <ScheduleSessionModal
                    buddy={buddy}
                    courseId={courseId}
                    onClose={() => setIsScheduling(false)}
                    onSuccess={handleSessionCreated}
                />
            )}
        </div>
    );
};

// Simple padded string for minutes
const str_pad = (n) => String(n).padStart(2, '0');

export default BuddyChat;
